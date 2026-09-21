import { FORTUNE_TONE_RULES, FORTUNE_TONE_SYSTEM } from "./tone";
import { bangkokDayKey } from "./dream-reading";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const TIMEOUT_MS = 12_000;

export type PhoneReading = {
  title: string;
  meaning: string;
  energy: string;
  doToday: string;
  holdOff: string;
  closing: string;
  highlights: string[];
};

export { bangkokDayKey };

/** Keep digits only; Thai mobile usually 10 digits starting with 0 */
export function normalizePhoneInput(raw: string) {
  const trimmed = raw.trim();
  let digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("66") && digits.length >= 11) {
    digits = `0${digits.slice(2)}`;
  }
  return digits;
}

export function formatPhoneDisplay(digits: string) {
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return digits;
}

export function isValidThaiMobile(digits: string) {
  return /^0[689]\d{8}$/.test(digits);
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function coercePhoneReading(raw: unknown): PhoneReading | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const title = asText(data.title);
  const meaning = asText(data.meaning);
  const energy = asText(data.energy);
  const doToday = asText(data.doToday);
  const holdOff = asText(data.holdOff);
  const closing = asText(data.closing);
  const highlights = (Array.isArray(data.highlights) ? data.highlights : [])
    .map(asText)
    .filter(Boolean)
    .slice(0, 4);

  if (
    !title ||
    !meaning ||
    !energy ||
    !doToday ||
    !holdOff ||
    !closing ||
    highlights.length < 2
  ) {
    return null;
  }

  return { title, meaning, energy, doToday, holdOff, closing, highlights };
}

export function parsePhoneReading(raw: string): PhoneReading | null {
  try {
    return coercePhoneReading(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function generatePhoneReading(
  phone: string,
): Promise<PhoneReading | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const display = formatPhoneDisplay(phone);

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
                "วิเคราะห์เบอร์มือถือไทยแบบตำราแม่มั่งมี สั้น ผูกกับตัวเลขในเบอร์จริง เป็นความเชื่อประกอบ ไม่การันตี ไม่ใช่คำทำนายหวย",
              phone: display,
              digits: phone.split(""),
              schema: {
                title: "ชื่อสั้น เช่น พลังคุ้มครอง · จังหวะชะลอ",
                meaning: "2-3 ประโยค อ่านพลังรวมของเบอร์ มีทั้งมุมที่ใช้ได้และมุมที่ควรระวัง",
                energy: "1 ประโยค สรุปโทนพลังหลักของเบอร์",
                doToday: "1 ประโยค สิ่งที่เหมาะจะทำวันนี้เมื่อใช้เบอร์นี้",
                holdOff: "1 ประโยค จุดที่ควรระวังหรือชะลอ",
                closing: "1 ประโยคให้จำ",
                highlights: [
                  "เลขเด่น 1 ตัวหรือคู่สั้น เช่น 8 หรือ 62",
                  "เลขเด่นอีกตัว",
                ],
              },
              rules: [
                "ห้าม markdown",
                "ต้องอ้างอิงเลขที่มีในเบอร์จริงเท่านั้น",
                "ห้ามสร้างเลขหวยหรือชุดสุ่มที่ไม่เกี่ยวกับเบอร์",
                "อย่าบอกว่าการันตีถูกหรือรวย",
                "อย่าชวนให้ลงเงินก้อนใหญ่",
                "อย่าเพิ่ง → ใช้คำว่า ควรระวัง หรือ ชะลอ",
                ...FORTUNE_TONE_RULES,
              ],
            }),
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("OpenAI phone failed:", response.status);
      return null;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return null;
    return coercePhoneReading(JSON.parse(content));
  } catch (err) {
    console.error("OpenAI phone error:", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
