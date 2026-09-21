import { FORTUNE_TONE_RULES, FORTUNE_TONE_SYSTEM } from "./tone";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const TIMEOUT_MS = 12_000;

export type DreamNumbers = {
  main: string;
  secondary: string;
  triples: string[];
  why: string;
};

export type DreamReading = {
  title: string;
  meaning: string;
  doToday: string;
  holdOff: string;
  closing: string;
  numbers: DreamNumbers;
};

export function bangkokDayKey(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function twoDigits(value: unknown) {
  const digits = asText(value).replace(/\D/g, "");
  return digits.length >= 2 ? digits.slice(0, 2) : null;
}

function threeDigits(value: unknown) {
  const digits = asText(value).replace(/\D/g, "");
  return digits.length >= 3 ? digits.slice(0, 3) : null;
}

export function coerceDreamReading(raw: unknown): DreamReading | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const numbers =
    data.numbers && typeof data.numbers === "object"
      ? (data.numbers as Record<string, unknown>)
      : null;
  const main = twoDigits(numbers?.main);
  const secondary = twoDigits(numbers?.secondary);
  const triples = (Array.isArray(numbers?.triples) ? numbers.triples : [])
    .map(threeDigits)
    .filter((item): item is string => Boolean(item))
    .slice(0, 3);

  const title = asText(data.title);
  const meaning = asText(data.meaning);
  const doToday = asText(data.doToday);
  const holdOff = asText(data.holdOff);
  const closing = asText(data.closing);
  const why = asText(numbers?.why);

  if (
    !title ||
    !meaning ||
    !doToday ||
    !holdOff ||
    !closing ||
    !main ||
    !secondary ||
    triples.length < 2 ||
    !why
  ) {
    return null;
  }

  return {
    title,
    meaning,
    doToday,
    holdOff,
    closing,
    numbers: { main, secondary, triples, why },
  };
}

export function parseDreamReading(raw: string): DreamReading | null {
  try {
    return coerceDreamReading(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function generateDreamReading(
  dream: string,
): Promise<DreamReading | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

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
        temperature: 0.7,
        max_tokens: 700,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: FORTUNE_TONE_SYSTEM },
          {
            role: "user",
            content: JSON.stringify({
              instruction:
                "ตีความฝันภาษาไทยแบบตำราแม่มั่งมี สั้น เฉพาะสิ่งที่เขาเล่า แล้วให้เลขเด็ดที่ผูกกับสัญลักษณ์ในฝัน เป็นความเชื่อประกอบ ไม่การันตี",
              dream,
              schema: {
                title: "ชื่อสั้น เช่น งูกัด · สัญญาณให้ชะลอ",
                meaning: "2-3 ประโยค มีทั้งมุมที่ใช้ได้และมุมที่ควรระวัง",
                doToday: "1 ประโยค สิ่งที่เหมาะจะทำวันนี้",
                holdOff: "1 ประโยค จุดที่ควรระวังหรือชะลอ",
                closing: "1 ประโยคให้จำ",
                numbers: {
                  main: "เลข 2 หลัก",
                  secondary: "เลข 2 หลักอีกตัว คนละชุดกับ main",
                  triples: ["เลข 3 หลัก", "เลข 3 หลัก"],
                  why: "1 ประโยค เลขนี้มาจากสัญลักษณ์ในฝันยังไง",
                },
              },
              rules: [
                "ห้าม markdown",
                "เลขต้องเป็นตัวเลขล้วน",
                "อย่าบอกว่าการันตีถูก",
                "อย่าชวนให้ลงเงินก้อนใหญ่",
                ...FORTUNE_TONE_RULES,
              ],
            }),
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("OpenAI dream failed:", response.status);
      return null;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return null;
    return coerceDreamReading(JSON.parse(content));
  } catch (err) {
    console.error("OpenAI dream error:", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
