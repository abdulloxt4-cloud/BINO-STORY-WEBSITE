import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const binoLeadsTable = pgTable("bino_leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertBinoLeadSchema = createInsertSchema(binoLeadsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertBinoLead = z.infer<typeof insertBinoLeadSchema>;
export type BinoLead = typeof binoLeadsTable.$inferSelect;
