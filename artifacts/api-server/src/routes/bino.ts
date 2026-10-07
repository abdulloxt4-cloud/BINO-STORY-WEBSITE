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

type Language = "uz" | "ru" | "en";

router.get("/bino/site-config", (_req, res): void => {
  res.json(GetBinoSiteConfigResponse.parse(binoConfig));
});

router.post("/bino/leads", async (req, res): Promise<void> => {
  const parsed = CreateBinoLeadBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [lead] = await db
    .insert(binoLeadsTable)
    .values(parsed.data)
    .returning();

  if (!lead) {
    res.status(500).json({ error: "Unable to save the request." });
    return;
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken) {
    req.log.error("TELEGRAM_BOT_TOKEN is missing");
  }

  if (!chatId) {
    req.log.error("TELEGRAM_CHAT_ID is missing");
  }

  if (botToken && chatId) {
    try {
      const telegramMessage = [
        "🔔 Yangi BINO STROY so‘rovi",
        "",
        `👤 Ism: ${parsed.data.name}`,
        `📞 Telefon: ${parsed.data.phone}`,
        `💬 Xabar: ${parsed.data.message}`,
      ].join("\n");

      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: telegramMessage,
          }),
        },
      );

      if (!telegramResponse.ok) {
        const errorText = await telegramResponse.text();

        req.log.error(
          {
            status: telegramResponse.status,
            response: errorText,
          },
          "Telegram API request failed",
        );
      } else {
        req.log.info("Telegram notification sent successfully");
      }
    } catch (error) {
      req.log.error({ error }, "Telegram notification failed");
    }
  }

  res.status(201).json(
    CreateBinoLeadResponse.parse({
      id: lead.id,
      createdAt: lead.createdAt.toISOString(),
    }),
  );
});

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ʻ’‘`]/g, "'")
    .replace(/[.,!?;:()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(message: string, words: string[]): boolean {
  return words.some((word) => message.includes(word));
}

function detectLanguage(message: string): Language {
  const text = normalize(message);

  if (/[а-яё]/i.test(message)) {
    return "ru";
  }

  const englishWords = [
    "hello",
    "hi",
    "hey",
    "what",
    "where",
    "how",
    "price",
    "cost",
    "waterproofing",
    "company",
    "contact",
    "phone",
    "number",
    "pool",
    "roof",
    "foundation",
    "basement",
    "bathroom",
    "kitchen",
    "layer",
    "order",
    "buy",
    "thanks",
    "thank you",
    "bye",
    "goodbye",
  ];

  if (hasAny(text, englishWords)) {
    return "en";
  }

  return "uz";
}

const answers = {
  unknown: {
    uz: "Savolingizni biroz to‘liqroq yozib yuboring. Masalan: “Gidroizolyatsiya nima?”, “Basseyn uchun ishlaydimi?”, “Narxi qancha?” yoki “Telefon raqamingizni bering” deb so‘rashingiz mumkin.",
    ru: "Пожалуйста, напишите ваш вопрос подробнее. Например: «Что такое гидроизоляция?», «Подходит ли для бассейна?», «Сколько стоит?» или «Дайте номер телефона».",
    en: "Please write your question in more detail. For example: “What is waterproofing?”, “Can it be used for a swimming pool?”, “How much does it cost?” or “What is your phone number?”",
  },

  short: {
    uz: "Savolingizni to‘liqroq yozib yuboring. Masalan: “Gidroizolyatsiya nima?” yoki “Basseyn uchun ishlaydimi?”",
    ru: "Пожалуйста, напишите вопрос подробнее. Например: «Что такое гидроизоляция?» или «Подходит ли она для бассейна?»",
    en: "Please write your question in more detail. For example: “What is waterproofing?” or “Can it be used for a swimming pool?”",
  },

  greeting: {
    uz: "Assalomu alaykum! Men BINO STROY yordamchisiman. Gidroizolyatsiya, mahsulotlarimiz, qo‘llanilish joylari, narx va aloqa haqida savol berishingiz mumkin.",
    ru: "Здравствуйте! Я помощник BINO STROY. Вы можете спросить меня о гидроизоляции, нашей продукции, областях применения, ценах и контактах.",
    en: "Hello! I am the BINO STROY assistant. You can ask me about waterproofing, our products, applications, prices and contact information.",
  },

  waterproofing: {
    uz: "Gidroizolyatsiya — bino va konstruksiyalarni suv hamda namlik ta’siridan himoya qilish usuli. U fundament, tom, podval, hammom, basseyn va boshqa namlik tushadigan joylarda konstruksiyaning uzoq xizmat qilishiga yordam beradi.",
    ru: "Гидроизоляция — это защита зданий и конструкций от воды и влаги. Она применяется для фундаментов, крыш, подвалов, ванных комнат, бассейнов и других мест, подверженных воздействию влаги.",
    en: "Waterproofing is a method of protecting buildings and structures from water and moisture. It is commonly used for foundations, roofs, basements, bathrooms, swimming pools and other areas exposed to moisture.",
  },

  company: {
    uz: "BINO STROY gidroizolyatsiya yo‘nalishida faoliyat yuritadi. Kompaniya bu sohada 20 yillik tajribaga ega va turli qurilish obyektlari uchun gidroizolyatsiya yechimlarini taklif qiladi.",
    ru: "BINO STROY работает в сфере гидроизоляции. Компания имеет 20-летний опыт и предлагает решения по гидроизоляции для различных строительных объектов.",
    en: "BINO STROY specializes in waterproofing. The company has 20 years of experience and provides waterproofing solutions for different types of construction projects.",
  },

  applications: {
    uz: "BINO gidroizolyatsiya materiallari fundament, tekis tom va terassalar, hammom va oshxonalar, podval va parkinglar, basseynlar hamda suv rezervuarlarida qo‘llanilishi mumkin.",
    ru: "Гидроизоляционные материалы BINO могут применяться для фундаментов, плоских крыш и террас, ванных комнат и кухонь, подвалов и паркингов, бассейнов и резервуаров для воды.",
    en: "BINO waterproofing materials can be used for foundations, flat roofs and terraces, bathrooms and kitchens, basements and parking structures, swimming pools and water tanks.",
  },

  pool: {
    uz: "Ha, BINO gidroizolyatsiya materiallari basseyn va suv bilan aloqada bo‘ladigan konstruksiyalarda qo‘llanilishi mumkin.",
    ru: "Да, гидроизоляционные материалы BINO могут применяться для бассейнов и конструкций, контактирующих с водой.",
    en: "Yes. BINO waterproofing materials can be used for swimming pools and structures that come into contact with water.",
  },

  foundation: {
    uz: "Ha, gidroizolyatsiya fundament va poydevorni yer namligi hamda suv ta’siridan himoya qilishda qo‘llaniladi.",
    ru: "Да, гидроизоляция применяется для защиты фундамента от грунтовой влаги и воздействия воды.",
    en: "Yes. Waterproofing is used to protect foundations from ground moisture and water.",
  },

  roof: {
    uz: "BINO gidroizolyatsiya materiallari tekis tom va terassalarni suv hamda namlikdan himoya qilish uchun qo‘llanilishi mumkin.",
    ru: "Гидроизоляционные материалы BINO могут применяться для защиты плоских крыш и террас от воды и влаги.",
    en: "BINO waterproofing materials can be used to protect flat roofs and terraces from water and moisture.",
  },

  basement: {
    uz: "Gidroizolyatsiya podval va parking kabi yer osti qismlarini namlik va suv ta’siridan himoya qilishda muhim hisoblanadi.",
    ru: "Гидроизоляция важна для защиты подвалов, паркингов и других подземных частей здания от воды и влаги.",
    en: "Waterproofing is important for protecting basements, parking structures and other underground areas from water and moisture.",
  },

  bathroom: {
    uz: "Gidroizolyatsiya hammom, vanna va oshxona kabi namlik ko‘p bo‘ladigan joylarda suvning konstruksiyaga o‘tishini kamaytirish uchun ishlatiladi.",
    ru: "Гидроизоляция применяется в ванных комнатах, кухнях и других влажных помещениях для защиты конструкций от проникновения воды.",
    en: "Waterproofing is used in bathrooms, kitchens and other wet areas to help prevent water from penetrating the structure.",
  },

  layers: {
    uz: "BINO rulonli gidroizolyatsiya materiali 5 qatlamli tuzilishga ega: himoya qatlami, yuqori bitum-polimer qatlami, mustahkamlovchi asos, pastki bitum-polimer yopishqoq qatlami va montaj uchun pastki plyonka.",
    ru: "Рулонный гидроизоляционный материал BINO имеет 5-слойную структуру: защитный верхний слой, верхний битумно-полимерный слой, армирующую основу, нижний битумно-полимерный клеевой слой и нижнюю монтажную плёнку.",
    en: "BINO roll waterproofing material has a 5-layer structure: a protective top layer, upper bitumen-polymer layer, reinforcing base, lower bitumen-polymer adhesive layer and bottom installation film.",
  },

  price: {
    uz: "Narx mahsulot turi, kerakli miqdor va loyiha hajmiga bog‘liq. Aniq narx uchun BINO STROY bilan bog‘laning: +998 93 123 02 02 yoki +998 97 333 04 02.",
    ru: "Цена зависит от типа материала, необходимого количества и объёма проекта. Для уточнения цены свяжитесь с BINO STROY: +998 93 123 02 02 или +998 97 333 04 02.",
    en: "The price depends on the product type, required quantity and project size. For an exact price, contact BINO STROY at +998 93 123 02 02 or +998 97 333 04 02.",
  },

  contact: {
    uz: "BINO STROY bilan bog‘lanish uchun: +998 93 123 02 02 yoki +998 97 333 04 02.",
    ru: "Связаться с BINO STROY можно по телефонам: +998 93 123 02 02 или +998 97 333 04 02.",
    en: "You can contact BINO STROY at +998 93 123 02 02 or +998 97 333 04 02.",
  },

  order: {
    uz: "Buyurtma yoki mahsulot bo‘yicha batafsil ma’lumot olish uchun +998 93 123 02 02 yoki +998 97 333 04 02 raqamlariga murojaat qilishingiz mumkin.",
    ru: "Для оформления заказа или получения подробной информации о продукции свяжитесь с нами по телефонам +998 93 123 02 02 или +998 97 333 04 02.",
    en: "For orders or more information about our products, contact us at +998 93 123 02 02 or +998 97 333 04 02.",
  },

  thanks: {
    uz: "Arzimaydi! BINO STROY bo‘yicha yana savolingiz bo‘lsa, bemalol yozishingiz mumkin.",
    ru: "Пожалуйста! Если у вас есть другие вопросы о BINO STROY, можете написать мне.",
    en: "You're welcome! If you have any other questions about BINO STROY, feel free to ask.",
  },

  goodbye: {
    uz: "Xayr! BINO STROY xizmatlariga qiziqishingiz uchun rahmat.",
    ru: "До свидания! Спасибо за интерес к BINO STROY.",
    en: "Goodbye! Thank you for your interest in BINO STROY.",
  },
};

router.post("/bino/chat", async (req, res): Promise<void> => {
  const parsed = CreateBinoChatMessageBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const message = normalize(parsed.data.message);
  const language = detectLanguage(parsed.data.message);

  let reply = answers.unknown[language];

  if (message.length <= 1) {
    reply = answers.short[language];
  } else if (
    hasAny(message, [
      "salom",
      "assalom",
      "assalomu",
      "hello",
      "hi",
      "hey",
      "привет",
      "здравствуйте",
      "добрый день",
    ])
  ) {
    reply = answers.greeting[language];
  } else if (
    hasAny(message, [
      "gidroizolyatsiya nima",
      "gidroizolatsiya nima",
      "gidroizlatsiya nima",
      "gidroizlatsiya nma",
      "gidro izolatsiya nima",
      "gidroizolyatsiya ozi nima",
      "gidroizlatsiya ozi nima",
      "gidroizolyatsiya o'zi nima",
      "gidroizlatsiya o'zi nima",
      "what is waterproofing",
      "waterproofing",
      "что такое гидроизоляция",
      "что такое гидроизоляцию",
      "гидроизоляция что",
    ])
  ) {
    reply = answers.waterproofing[language];
  } else if (
    hasAny(message, [
      "bino stroy",
      "bino haqida",
      "kompaniya",
      "kompaniya haqida",
      "sizlar kimsiz",
      "nima qilasiz",
      "company",
      "about company",
      "who are you",
      "компания",
      "о компании",
      "кто вы",
    ])
  ) {
    reply = answers.company[language];
  } else if (
    hasAny(message, [
      "qayerda ishlatiladi",
      "qayerga ishlatiladi",
      "qayerlarda ishlatiladi",
      "qayerda ishlatsa",
      "nima uchun ishlatiladi",
      "qayerga kerak",
      "ishlatish joylari",
      "where used",
      "where can",
      "applications",
      "where is it used",
      "где используется",
      "где применяют",
      "где применяется",
      "для чего",
    ])
  ) {
    reply = answers.applications[language];
  } else if (
    hasAny(message, [
      "basseyn",
      "basseynga",
      "basseynda",
      "hovuz",
      "hovuzga",
      "pool",
      "swimming pool",
      "бассейн",
      "бассейна",
      "для бассейна",
    ])
  ) {
    reply = answers.pool[language];
  } else if (
    hasAny(message, [
      "fundament",
      "poydevor",
      "foundation",
      "фундамент",
      "фундамента",
    ])
  ) {
    reply = answers.foundation[language];
  } else if (
    hasAny(message, [
      "tom",
      "tomga",
      "tom uchun",
      "roof",
      "terrace",
      "terrasa",
      "крыша",
      "кровля",
      "терраса",
    ])
  ) {
    reply = answers.roof[language];
  } else if (
    hasAny(message, [
      "podval",
      "parking",
      "yerto'la",
      "yertola",
      "basement",
      "подвал",
      "паркинг",
    ])
  ) {
    reply = answers.basement[language];
  } else if (
    hasAny(message, [
      "hammom",
      "vanna",
      "oshxona",
      "bathroom",
      "kitchen",
      "ванная",
      "ванна",
      "кухня",
    ])
  ) {
    reply = answers.bathroom[language];
  } else if (
    hasAny(message, [
      "qatlam",
      "qatlamli",
      "necha qatlam",
      "5 qatlam",
      "layer",
      "layers",
      "how many layers",
      "слой",
      "слоев",
      "сколько слоев",
    ])
  ) {
    reply = answers.layers[language];
  } else if (
    hasAny(message, [
      "narx",
      "narxi",
      "qancha",
      "qancha turadi",
      "pul",
      "price",
      "cost",
      "how much",
      "цена",
      "стоимость",
      "сколько стоит",
    ])
  ) {
    reply = answers.price[language];
  } else if (
    hasAny(message, [
      "telefon",
      "nomer",
      "raqam",
      "aloqa",
      "bog'lan",
      "boglan",
      "kontakt",
      "phone",
      "contact",
      "number",
      "phone number",
      "телефон",
      "номер",
      "контакт",
      "связаться",
    ])
  ) {
    reply = answers.contact[language];
  } else if (
    hasAny(message, [
      "buyurtma",
      "zakaz",
      "sotib olish",
      "olmoqchiman",
      "order",
      "buy",
      "purchase",
      "заказ",
      "купить",
      "заказать",
    ])
  ) {
    reply = answers.order[language];
  } else if (
    hasAny(message, [
      "rahmat",
      "raxmat",
      "thanks",
      "thank you",
      "спасибо",
      "благодарю",
    ])
  ) {
    reply = answers.thanks[language];
  } else if (
    hasAny(message, [
      "xayr",
      "hayr",
      "bye",
      "goodbye",
      "пока",
      "до свидания",
    ])
  ) {
    reply = answers.goodbye[language];
  }

  res.json(
    CreateBinoChatMessageResponse.parse({
      reply,
    }),
  );
});

export default router;