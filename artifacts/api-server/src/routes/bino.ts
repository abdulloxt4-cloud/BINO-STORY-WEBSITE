import OpenAI from "openai";
import { Router, type IRouter } from "express";
import { db, binoLeadsTable } from "@workspace/db";
import {
  CreateBinoChatMessageBody,
  CreateBinoChatMessageResponse,
  CreateBinoLeadBody,
  CreateBinoLeadResponse,
  GetBinoSiteConfigResponse,
} from "@workspace/api-zod";
import { binoConfig } from "../lib/bino-config";

const router: IRouter = Router();

router.get("/bino/site-config", (_req, res): void => {
  res.json(GetBinoSiteConfigResponse.parse(binoConfig));
});

router.post("/bino/leads", async (req, res): Promise<void> => {
  const parsed = CreateBinoLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [lead] = await db.insert(binoLeadsTable).values(parsed.data).returning();
  if (!lead) {
    res.status(500).json({ error: "Unable to save the request." });
    return;
  }

  res.status(201).json(
    CreateBinoLeadResponse.parse({
      id: lead.id,
      createdAt: lead.createdAt.toISOString(),
    }),
  );
});

router.post("/bino/chat", async (req, res): Promise<void> => {
  const parsed = CreateBinoChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "The assistant is not configured." });
    return;
  }

  try {
    const client = new OpenAI({ apiKey });
    const messages = [
      { role: "system" as const, content: binoConfig.assistant.systemPrompt },
      ...(parsed.data.history ?? []).map((turn) => ({
        role: turn.role,
        content: turn.content,
      })),
      { role: "user" as const, content: parsed.data.message },
    ];

    const completion = await client.chat.completions.create({
      model: binoConfig.assistant.model,
      max_completion_tokens: 8192,
      messages,
    });
    const reply = completion.choices[0]?.message.content?.trim();

    if (!reply) {
      res.status(502).json({ error: "The assistant returned an empty reply." });
      return;
    }

    res.json(CreateBinoChatMessageResponse.parse({ reply }));
  } catch (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : undefined;
    req.log.error({ status }, "BINO assistant request failed");
    res.status(502).json({ error: "The assistant could not answer right now." });
  }
});

export default router;
