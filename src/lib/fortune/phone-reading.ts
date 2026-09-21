import { FORTUNE_TONE_RULES, FORTUNE_TONE_SYSTEM } from "./tone";
import { bangkokDayKey } from "./dream-reading";
import type { FortuneProfilePayload } from "./fortune-profile-db";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const TIMEOUT_MS = 20_000;

/** Monday YYYY-MM-DD in Asia/Bangkok — one phone ask per week */
export function bangkokWeekKey(d = new Date()) {
  const dayKey = bangkokDayKey(d);
  const noon = new Date(`${dayKey}T12:00:00+07:00`);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    weekday: "short",
  }).format(d);
  const map: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  const offset = map[weekday] ?? 0;
  const monday = new Date(noon.getTime() - offset * 86_400_000);
  return bangkokDayKey(monday);
}

export function msUntilNextBangkokWeek(now = Date.now()) {
  const weekKey = bangkokWeekKey(new Date(now));
  const mondayStart = new Date(`${weekKey}T00:00:00+07:00`).getTime();
  return Math.max(0, mondayStart + 7 * 86_400_000 - now);
}

export type PhonePairMeaning = {
  pair: string;
  meaning: string;
};

export type PhoneAspects = {
  work: string;
  money: string;
  love: string;
  social: string;
};

export type PhoneBirthFit = {
  /** หนุน | กลาง | ตีกับ */
  verdict: string;
  detail: string;
};

export type PhoneReading = {
  title: string;
  /** คะแนน 55–92 */
  score: number;
  scoreLabel: string;
  /** สรุปสั้น เช่น หนุนการเจรจา… */
  summary: string;
  /** เบอร์นี้ส่งผลกับชีวิตยังไง */
  meaning: string;
  pairs: PhonePairMeaning[];
  aspects: PhoneAspects;
  strengths: string[];
  cautions: string[];
  tailDigits: string;
  tailMeaning: string;
  repeated: string;
  repeatedMeaning: string;
  usageAdvice: string;
  birthFit: PhoneBirthFit;
  closing: string;
};

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

function asScore(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(55, Math.min(92, Math.round(n)));
}

function genderLabel(gender: string, note?: string | null) {
  if (gender === "female") return "หญิง";
  if (gender === "male") return "ชาย";
  if (gender === "other") return note?.trim() || "ระบุเอง";
  if (gender === "unspecified") return "ไม่ระบุ";
  return "";
}

function focusLabel(focus?: string | null) {
  if (focus === "work") return "งาน";
  if (focus === "money") return "การเงิน";
  if (focus === "love") return "ความรัก";
  if (focus === "health") return "สุขภาพ";
  if (focus === "life") return "ชีวิตโดยรวม";
  return "";
}

export function buildPhoneProfileContext(profile: FortuneProfilePayload) {
  return {
    nickname: profile.nickname,
    realName: profile.realName || undefined,
    birthDate: profile.birthDate,
    birthTime: profile.birthTime || undefined,
    birthPlace: profile.birthPlace || undefined,
    gender: genderLabel(profile.gender, profile.genderNote),
    focus: focusLabel(profile.focus) || undefined,
  };
}

export function coercePhoneReading(raw: unknown): PhoneReading | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;

  const title = asText(data.title);
  const summary = asText(data.summary) || asText(data.energy);
  const meaning = asText(data.meaning);
  const score = asScore(data.score) ?? 72;
  const scoreLabel = asText(data.scoreLabel) || summary.slice(0, 40);
  const closing = asText(data.closing);
  const usageAdvice = asText(data.usageAdvice) || asText(data.doToday);
  const tailDigits = asText(data.tailDigits).replace(/\D/g, "").slice(-4);
  const tailMeaning = asText(data.tailMeaning);
  const repeated = asText(data.repeated);
  const repeatedMeaning = asText(data.repeatedMeaning);

  const aspectsRaw =
    data.aspects && typeof data.aspects === "object"
      ? (data.aspects as Record<string, unknown>)
      : null;
  const aspects: PhoneAspects = {
    work: asText(aspectsRaw?.work),
    money: asText(aspectsRaw?.money),
    love: asText(aspectsRaw?.love),
    social: asText(aspectsRaw?.social) || asText(aspectsRaw?.communication),
  };

  const pairs = (Array.isArray(data.pairs) ? data.pairs : [])
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const pair = asText(row.pair).replace(/\D/g, "").slice(0, 3);
      const pairMeaning = asText(row.meaning);
      if (pair.length < 2 || !pairMeaning) return null;
      return { pair, meaning: pairMeaning };
    })
    .filter((item): item is PhonePairMeaning => Boolean(item))
    .slice(0, 3);

  const strengths = (
    Array.isArray(data.strengths)
      ? data.strengths
      : Array.isArray(data.highlights)
        ? data.highlights
        : []
  )
    .map(asText)
    .filter(Boolean)
    .slice(0, 4);

  const cautions = (
    Array.isArray(data.cautions)
      ? data.cautions
      : asText(data.holdOff)
        ? [asText(data.holdOff)]
        : []
  )
    .map(asText)
    .filter(Boolean)
    .slice(0, 4);

  const birthRaw =
    data.birthFit && typeof data.birthFit === "object"
      ? (data.birthFit as Record<string, unknown>)
      : null;
  const birthFit: PhoneBirthFit = {
    verdict: asText(birthRaw?.verdict) || "กลาง",
    detail: asText(birthRaw?.detail),
  };

  if (
    !title ||
    !summary ||
    !meaning ||
    !closing ||
    !usageAdvice ||
    pairs.length < 1 ||
    !aspects.work ||
    !aspects.money ||
    !aspects.love ||
    !aspects.social ||
    strengths.length < 2 ||
    cautions.length < 1 ||
    !tailDigits ||
    !tailMeaning ||
    !repeated ||
    !repeatedMeaning ||
    !birthFit.detail
  ) {
    return null;
  }

  return {
    title,
    score,
    scoreLabel,
    summary,
    meaning,
    pairs,
    aspects,
    strengths,
    cautions,
    tailDigits,
    tailMeaning,
    repeated,
    repeatedMeaning,
    usageAdvice,
    birthFit,
    closing,
  };
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
  profile: FortuneProfilePayload,
): Promise<PhoneReading | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const display = formatPhoneDisplay(phone);
  const person = buildPhoneProfileContext(profile);
  const tail = phone.slice(-4);
  const digitCounts: Record<string, number> = {};
  for (const d of phone) {
    digitCounts[d] = (digitCounts[d] ?? 0) + 1;
  }

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
        temperature: 0.65,
        max_tokens: 1400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: FORTUNE_TONE_SYSTEM },
          {
            role: "user",
            content: JSON.stringify({
              instruction:
                "วิเคราะห์เบอร์มือถือไทยแบบตำราแม่มั่งมี ให้ผู้ใช้รู้ว่าเบอร์นี้ส่งผลกับชีวิตแบบไหน และควรใช้ยังไง ผูกกับโปรไฟล์คนจริง ไม่ใช่แค่บอกว่าดี/ไม่ดี ไม่ใช่หวย",
              phone: display,
              digits: phone.split(""),
              digitCounts,
              tailDigits: tail,
              person,
              schema: {
                title: "ชื่อสั้น เช่น พลังคุยเก่ง · จังหวะชะลอ",
                score: "ตัวเลข 55-92",
                scoreLabel: "สรุปสั้น 1 บรรทัด เช่น หนุนการเจรจาและการหาโอกาส",
                summary: "1 ประโยค สรุปภาพรวม",
                meaning: "2-3 ประโยค เบอร์นี้ส่งผลกับชีวิตยังไง",
                pairs: [
                  {
                    pair: "เลขคู่ที่มีในเบอร์ เช่น 24",
                    meaning: "อธิบายภาษาง่าย 1 ประโยค",
                  },
                ],
                aspects: {
                  work: "1 ประโยค งาน",
                  money: "1 ประโยค เงิน",
                  love: "1 ประโยค ความรัก",
                  social: "1 ประโยค การสื่อสาร/คนรอบตัว",
                },
                strengths: ["จุดแข็งสั้น ๆ", "จุดแข็งอีกข้อ"],
                cautions: ["จุดควรระวังสั้น ๆ", "ข้อระวังอีกข้อ"],
                tailDigits: tail,
                tailMeaning: "1 ประโยค พลังเลขท้าย",
                repeated: "เลขที่ซ้ำหรือเด่น เช่น เลข 5",
                repeatedMeaning: "1 ประโยค ความหมาย",
                usageAdvice:
                  "1-2 ประโยค แนะนำใช้เบอร์ยังไง งาน/ค้าขาย/ส่วนตัว/ควรแยกเบอร์ไหม",
                birthFit: {
                  verdict: "หนุน | กลาง | ตีกับ",
                  detail: "1-2 ประโยค เทียบกับวันเกิด/พื้นดวง",
                },
                closing: "1 ประโยคให้จำ",
              },
              rules: [
                "ห้าม markdown",
                "ต้องอ้างอิงเลขที่มีในเบอร์จริงเท่านั้น",
                "pairs ต้องเป็นเลขคู่ที่ปรากฏติดกันในเบอร์จริง อย่างน้อย 2 ชุด",
                "tailDigits ต้องตรงกับเลขท้ายเบอร์ที่ให้มา",
                "birthFit ต้องอิงวันเกิดและข้อมูล person ที่ให้มา",
                "อย่าบอกว่าการันตีรวยหรือโชคหวย",
                "อย่าชวนให้ลงเงินก้อนใหญ่",
                "โทนบาลานซ์ มีทั้งจุดใช้ได้และจุดระวัง",
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
    const parsed = coercePhoneReading(JSON.parse(content));
    if (!parsed) return null;
    return {
      ...parsed,
      tailDigits: parsed.tailDigits || tail,
    };
  } catch (err) {
    console.error("OpenAI phone error:", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
