import { FORTUNE_TONE_RULES, FORTUNE_TONE_SYSTEM } from "./tone";
import { bangkokDayKey } from "./dream-reading";
import type { FortuneProfilePayload } from "./fortune-profile-db";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const TIMEOUT_MS = 18_000;

/** Daily consult questions (Bangkok day) — one user turn = one question */
export const CONSULT_DAILY_SESSIONS = 3;
export const CONSULT_MAX_USER_TURNS = 1;
export const CONSULT_MAX_INPUT = 280;

export { bangkokDayKey };

export type ConsultMessage = {
  role: "user" | "assistant";
  content: string;
};

export function parseConsultMessages(raw: string): ConsultMessage[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const row = item as Record<string, unknown>;
        const role = row.role === "assistant" ? "assistant" : row.role === "user" ? "user" : null;
        const content = typeof row.content === "string" ? row.content.trim() : "";
        if (!role || !content) return null;
        return { role, content } as ConsultMessage;
      })
      .filter((item): item is ConsultMessage => Boolean(item));
  } catch {
    return [];
  }
}

function genderLabel(gender: string, note?: string | null) {
  if (gender === "female") return "หญิง";
  if (gender === "male") return "ชาย";
  if (gender === "other") return note?.trim() || "ระบุเอง";
  if (gender === "unspecified") return "ไม่ระบุ";
  return "";
}

export function buildConsultPerson(profile: FortuneProfilePayload | null) {
  if (!profile) return null;
  return {
    nickname: profile.nickname,
    birthDate: profile.birthDate,
    birthPlace: profile.birthPlace || undefined,
    gender: genderLabel(profile.gender, profile.genderNote) || undefined,
    focus: profile.focus || undefined,
  };
}

export async function generateConsultReply(opts: {
  messages: ConsultMessage[];
  profile: FortuneProfilePayload | null;
}): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const person = buildConsultPerson(opts.profile);

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
        max_tokens: 420,
        messages: [
          {
            role: "system",
            content: [
              FORTUNE_TONE_SYSTEM,
              "คุณคือ「แม่มั่งมี」คุยปรึกษาแบบแชทสั้น อบอุ่น จริงใจ",
              "ตอบภาษาไทย 2-5 ประโยค ไม่ยาวเกิน",
              "ห้าม markdown ห้ามลิสต์ยาว",
              "ถามกลับได้สั้น ๆ ถ้ายังไม่ชัด",
              "เป็นความเชื่อประกอบ ไม่แพทย์ ไม่การเงินมืออาชีพ",
              person
                ? `ข้อมูลผู้คุย: ${JSON.stringify(person)}`
                : "ยังไม่มีโปรไฟล์ละเอียด คุยทั่วไปได้",
              ...FORTUNE_TONE_RULES,
            ].join("\n"),
          },
          ...opts.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      }),
    });

    if (!response.ok) {
      console.error("OpenAI consult failed:", response.status);
      return null;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch (err) {
    console.error("OpenAI consult error:", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
