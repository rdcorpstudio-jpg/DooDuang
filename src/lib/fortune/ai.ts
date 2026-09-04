import type { FortuneProfile } from "./engine";
import type { ReadingType } from "./zodiac";
import { READING_OPTIONS } from "./zodiac";
import type { ExtendedFortuneResult, FortuneSection, FortuneTab } from "./extended";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const TIMEOUT_MS = 8_000;

const TAB_LABELS: Record<ReadingType, [string, string, string]> = {
  career: ["พลังการงาน", "โอกาส", "เป้าหมาย"],
  love: ["แกนหัวใจ", "พลังอารมณ์", "ทิศทางความรัก"],
  money: ["แกนการเงิน", "โชคลาภ & โอกาส", "ทิศทางความมั่งคั่ง"],
  overall: ["แกนชีวิต", "พลังจักรวาล", "เส้นทางอนาคต"],
  daily: ["พลังวันนี้", "อารมณ์ & พลังงาน", "ทิศทางวันนี้"],
  health: ["แกนสุขภาพ", "พลังกาย & ใจ", "ทิศทางสมดุล"],
  tarot: ["ไพ่แกนหลัก", "พลังปัจจุบัน", "ทิศทางอนาคต"],
};

const GENDER_TH: Record<string, string> = {
  female: "ผู้หญิง",
  male: "ผู้ชาย",
  other: "ไม่ระบุ",
};

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

function asText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asSections(value: unknown): FortuneSection[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const heading = asText(row.heading);
      const content = asText(row.content);
      if (!heading || !content) return null;
      const subtitle = asText(row.subtitle);
      return subtitle ? { heading, subtitle, content } : { heading, content };
    })
    .filter((item): item is FortuneSection => item !== null)
    .slice(0, 3);
}

function coerceFortune(raw: unknown, type: ReadingType): ExtendedFortuneResult | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const labels = TAB_LABELS[type] ?? TAB_LABELS.overall;
  const tabsRaw = Array.isArray(data.tabs) ? data.tabs : [];
  if (tabsRaw.length < 3) return null;

  const tabs: FortuneTab[] = labels.map((label, index) => {
    const tab = (tabsRaw[index] ?? {}) as Record<string, unknown>;
    const sections = asSections(tab.sections);
    return {
      id: asText(tab.id, `section-${index}`),
      label: asText(tab.label, label),
      heroTitle: asText(tab.heroTitle, label),
      sections,
      summary: asText(tab.summary),
    };
  });

  if (tabs.some((tab) => tab.sections.length < 2 || !tab.summary)) return null;

  const highlightsRaw = Array.isArray(data.highlights) ? data.highlights : [];
  const highlights = highlightsRaw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const label = asText(row.label);
      const value = asText(row.value);
      return label && value ? { label, value } : null;
    })
    .filter((item): item is { label: string; value: string } => item !== null)
    .slice(0, 4);

  const premiumRaw =
    data.premium && typeof data.premium === "object"
      ? (data.premium as Record<string, unknown>)
      : null;
  const premiumSections = asSections(premiumRaw?.sections);

  if (highlights.length < 3 || !premiumRaw || premiumSections.length < 2) return null;

  return {
    title: asText(data.title),
    preview: asText(data.preview),
    tabs,
    highlights,
    premium: {
      heroTitle: asText(premiumRaw.heroTitle, "บททำนายเชิงลึก"),
      teaser: asText(premiumRaw.teaser),
      sections: premiumSections,
      summary: asText(premiumRaw.summary),
    },
  };
}

export async function generateFortuneWithOpenAI(
  type: ReadingType,
  profile: FortuneProfile
): Promise<ExtendedFortuneResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const reading = READING_OPTIONS.find((option) => option.id === type);
  const labels = TAB_LABELS[type] ?? TAB_LABELS.overall;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        max_tokens: 1800,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "คุณเป็นนักพยากรณ์ชาวไทย โทนอบอุ่น จริงใจ ไม่ขู่ ไม่แพทย์ ไม่การเงินมืออาชีพ เป็นการบันเทิง ตอบเป็น JSON ตามสคีมาเท่านั้น",
          },
          {
            role: "user",
            content: JSON.stringify({
              instruction: `เขียนคำทำนายภาษาไทยสำหรับ${reading?.title ?? type} ของผู้ใช้คนนี้ ให้เฉพาะตัว ไม่ใช้ประโยคกลาง ๆ ซ้ำ`,
              profile: {
                nickname: profile.nickname,
                birthDate: profile.birthDate,
                gender: GENDER_TH[profile.gender] ?? profile.gender,
              },
              tabLabels: labels,
              schema: {
                title: "string สั้น",
                preview: "string 2 ประโยค",
                tabs: [
                  {
                    id: "section-0",
                    label: labels[0],
                    heroTitle: "string",
                    sections: [
                      { heading: "string", content: "2-3 ประโยค" },
                      { heading: "string", content: "2-3 ประโยค" },
                    ],
                    summary: "1 ประโยค",
                  },
                ],
                highlights: [{ label: "string", value: "string สั้น" }],
                premium: {
                  heroTitle: "string",
                  teaser: "1 ประโยค",
                  sections: [
                    { heading: "string", content: "2-3 ประโยค" },
                    { heading: "string", content: "2-3 ประโยค" },
                  ],
                  summary: "1 ประโยค",
                },
              },
              rules: [
                "ต้องมี tabs 3 อัน ตาม tabLabels",
                "แต่ละแท็บมี sections อย่างน้อย 2",
                "highlights อย่างน้อย 3",
                "เรียกชื่อเล่นในเนื้อหา",
                "ห้าม markdown",
              ],
            }),
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("OpenAI fortune failed:", response.status, await response.text());
      return null;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return null;

    return coerceFortune(JSON.parse(content), type);
  } catch (err) {
    console.error("OpenAI fortune error:", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
