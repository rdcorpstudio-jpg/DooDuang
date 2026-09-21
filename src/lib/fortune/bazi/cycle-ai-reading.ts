import { FORTUNE_TONE_RULES, FORTUNE_TONE_SYSTEM } from "@/lib/fortune/tone";
import type { FortuneProfilePayload } from "@/lib/fortune/fortune-profile-db";
import type { BaziCycleFacts } from "@/lib/fortune/bazi/cycle-facts";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const TIMEOUT_MS = 28_000;

export type BaziCycleAspect = {
  key: "work" | "money" | "love" | "health" | "change";
  label: string;
  tone: "เด่น" | "ระวัง" | "ปกติ";
  body: string;
};

export type BaziCycleReading = {
  /** Hero — วัยจร + ปีจร อ่านร่วมกัน */
  headline: string;
  combo: string;
  luck: {
    ageLabel: string;
    pillar: string;
    theme: string;
    body: string;
  } | null;
  annual: {
    year: number;
    pillar: string;
    theme: string;
    body: string;
    impact: string;
  };
  aspects: BaziCycleAspect[];
  suit: string[];
  watch: string[];
};

const ASPECT_LABEL: Record<BaziCycleAspect["key"], string> = {
  work: "งาน",
  money: "เงิน",
  love: "ความสัมพันธ์",
  health: "การใช้ชีวิต",
  change: "การเปลี่ยนแปลง",
};

function genderLabel(gender: string, note?: string | null) {
  if (gender === "female") return "หญิง";
  if (gender === "male") return "ชาย";
  if (gender === "other") return note?.trim() || "ระบุเอง";
  if (gender === "unspecified") return "ไม่ระบุ";
  return "";
}

export function parseBaziCycleReading(raw: string): BaziCycleReading | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Record<string, unknown>;
    if (typeof o.headline !== "string" || typeof o.combo !== "string") return null;
    if (!o.annual || typeof o.annual !== "object") return null;
    const annual = o.annual as Record<string, unknown>;
    if (
      typeof annual.year !== "number" ||
      typeof annual.pillar !== "string" ||
      typeof annual.theme !== "string" ||
      typeof annual.body !== "string" ||
      typeof annual.impact !== "string"
    ) {
      return null;
    }

    let luck: BaziCycleReading["luck"] = null;
    if (o.luck && typeof o.luck === "object") {
      const l = o.luck as Record<string, unknown>;
      if (
        typeof l.ageLabel === "string" &&
        typeof l.pillar === "string" &&
        typeof l.theme === "string" &&
        typeof l.body === "string"
      ) {
        luck = {
          ageLabel: l.ageLabel.trim(),
          pillar: l.pillar.trim(),
          theme: l.theme.trim(),
          body: l.body.trim(),
        };
      }
    }

    const aspectsRaw = Array.isArray(o.aspects) ? o.aspects : [];
    const aspects: BaziCycleAspect[] = aspectsRaw
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const a = item as Record<string, unknown>;
        const key = a.key as BaziCycleAspect["key"];
        if (!(key in ASPECT_LABEL)) return null;
        const tone =
          a.tone === "เด่น" || a.tone === "ระวัง" || a.tone === "ปกติ"
            ? a.tone
            : "ปกติ";
        const body = typeof a.body === "string" ? a.body.trim() : "";
        if (!body) return null;
        return {
          key,
          label:
            typeof a.label === "string" && a.label.trim()
              ? a.label.trim()
              : ASPECT_LABEL[key],
          tone,
          body,
        };
      })
      .filter((x): x is BaziCycleAspect => Boolean(x))
      .slice(0, 5);

    if (aspects.length < 2) return null;

    const suit = Array.isArray(o.suit)
      ? o.suit
          .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
          .map((s) => s.trim())
          .slice(0, 4)
      : [];
    const watch = Array.isArray(o.watch)
      ? o.watch
          .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
          .map((s) => s.trim())
          .slice(0, 4)
      : [];

    if (suit.length < 1 || watch.length < 1) return null;

    return {
      headline: o.headline.trim(),
      combo: o.combo.trim(),
      luck,
      annual: {
        year: annual.year,
        pillar: annual.pillar.trim(),
        theme: annual.theme.trim(),
        body: annual.body.trim(),
        impact: annual.impact.trim(),
      },
      aspects,
      suit,
      watch,
    };
  } catch {
    return null;
  }
}

export async function generateBaziCycleReading(opts: {
  facts: BaziCycleFacts;
  profile: FortuneProfilePayload | null;
}): Promise<BaziCycleReading | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const person = opts.profile
    ? {
        nickname: opts.profile.nickname,
        birthDate: opts.profile.birthDate,
        gender: genderLabel(opts.profile.gender, opts.profile.genderNote) || undefined,
        focus: opts.profile.focus || undefined,
      }
    : null;

  const system = `${FORTUNE_TONE_SYSTEM}

คุณคือแม่มั่งมี อ่านปาจื้อแบบ “ดวงจรช่วงนี้” ให้คนทั่วไปใช้ชีวิตได้
ห้ามท่วมด้วยศัพท์จีน ห้ามวินิจฉัยโรค ห้ามการันตีรวย/ได้คู่
ศัพท์จีนใช้ได้เฉพาะชื่อเสา (เช่น 甲申) ในฟิลด์ pillar เท่านั้น — ในประโยคเล่าให้เป็นภาษาคน
ตอบ JSON เท่านั้น ตาม schema ที่กำหนด`;

  const user = {
    task: "เขียนคำอ่านดวงจร (วัยจร + ปีจร) แบบปาจื้อจริง แต่ภาษาคน",
    person,
    facts: opts.facts,
    rules: [
      ...FORTUNE_TONE_RULES,
      "headline = ประโยคสั้นจับใจว่าช่วงชีวิตใหญ่ + ปีนี้หนุน/เร่ง/ตีตรงไหน",
      "combo = พระเอกของการ์ด อ่านวัยจรกับปีจรร่วมกัน 3–5 ประโยค",
      "luck.body = สรุปธีม 10 ปีว่าชีวิตเน้นอะไร ไม่แปลตัวอักษรอย่างเดียว",
      "annual.impact = จุดกระทบปีนี้เป็นภาษาคน (เปลี่ยนงาน/สภาพแวดล้อม/ความสัมพันธ์ ฯลฯ) อิง hits ถ้ามี",
      "aspects เลือก 2 ด้าน tone=เด่น และ 1 ด้าน tone=ระวัง เป็นหลัก (รวม 3 ด้านพอ หรือเพิ่มปกติได้อีก 1–2)",
      "suit / watch = ข้อใช้ชีวิตสั้น ๆ ที่ทำได้จริง",
      "อายุใน luck.ageLabel ปัดเป็นจำนวนเต็ม เช่น 24–34 ปี",
    ],
    schema: {
      headline: "string",
      combo: "string",
      luck: {
        ageLabel: "24–34 ปี",
        pillar: "甲申",
        theme: "string",
        body: "string",
      },
      annual: {
        year: opts.facts.annualYear,
        pillar: opts.facts.annual.pillar,
        theme: "string",
        body: "string",
        impact: "string",
      },
      aspects: [
        {
          key: "work|money|love|health|change",
          label: "งาน|เงิน|ความสัมพันธ์|การใช้ชีวิต|การเปลี่ยนแปลง",
          tone: "เด่น|ระวัง|ปกติ",
          body: "string",
        },
      ],
      suit: ["string"],
      watch: ["string"],
    },
  };

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
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: JSON.stringify(user) },
        ],
      }),
    });
    if (!response.ok) {
      console.error("OpenAI bazi-cycle failed:", response.status);
      return null;
    }
    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim() ?? "";
    return parseBaziCycleReading(content);
  } catch (err) {
    console.error("OpenAI bazi-cycle error:", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
