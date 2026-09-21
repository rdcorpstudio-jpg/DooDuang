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

const PLACEHOLDER_NUM =
  /^(012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210|000|111|222|333|444|555|666|777|888|999)$/;

/** Thai dream-lottery digit hints — bias only, not a guarantee map */
const SYMBOL_DIGITS: Array<{ re: RegExp; digits: number[] }> = [
  { re: /งู|serpent|snake/i, digits: [5, 2, 8] },
  { re: /น้ำ|ฝน|ทะเล|แม่น้ำ|ว่ายน้ำ/i, digits: [2, 5, 9] },
  { re: /หมา|สุนัข|dog/i, digits: [7, 2, 4] },
  { re: /แมว|cat/i, digits: [3, 9, 5] },
  { re: /ช้าง|elephant/i, digits: [9, 1, 5] },
  { re: /นก|บิน|ปีก/i, digits: [1, 6, 8] },
  { re: /ปลา|fish/i, digits: [2, 8, 4] },
  { re: /เงิน|ทอง|เพชร|ของมีค่า/i, digits: [8, 6, 9] },
  { re: /บ้าน|ห้อง|ตึก|อาคาร/i, digits: [4, 1, 7] },
  { re: /รถ|มอไซ|เครื่องบิน|เดินทาง/i, digits: [4, 7, 2] },
  { re: /คนตาย|ศพ|ผี|วัด|พระ/i, digits: [1, 5, 9] },
  { re: /ท้อง|คลอด|เด็ก|ทารก/i, digits: [2, 5, 8] },
  { re: /ฟัน|เลือด|เจ็บ|ป่วย/i, digits: [3, 6, 9] },
  { re: /ไฟ|เผา|ควัน/i, digits: [5, 7, 9] },
];

export function bangkokDayKey(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

function padDigits(n: number, width: number) {
  return String(Math.abs(n) % 10 ** width).padStart(width, "0");
}

function isPlaceholderNum(value: string) {
  return PLACEHOLDER_NUM.test(value);
}

function uniquePad(width: number, seeds: number[], used: Set<string>): string {
  for (let i = 0; i < seeds.length + 12; i++) {
    const base = seeds[i % seeds.length] ?? 0;
    const n = padDigits(base + i * 17 + i * i * 3, width);
    if (!isPlaceholderNum(n) && !used.has(n)) {
      used.add(n);
      return n;
    }
  }
  const fallback = padDigits(hashSeed([...used].join("|") + width), width);
  used.add(fallback);
  return fallback;
}

/** Deterministic lucky set from dream text — never 123/456-style placeholders */
export function numbersFromDream(
  dream: string,
  dayKey = bangkokDayKey(),
): Omit<DreamNumbers, "why"> {
  const text = dream.trim();
  const pool: number[] = [];
  for (const row of SYMBOL_DIGITS) {
    if (row.re.test(text)) pool.push(...row.digits);
  }
  const h = hashSeed(`${dayKey}|${text.toLowerCase()}`);
  const seeds = [
    h,
    hashSeed(`${dayKey}|${text}|b`),
    hashSeed(`${dayKey}|${text}|c`),
    hashSeed(`${dayKey}|${text}|d`),
    ...(pool.length
      ? [
          pool[0]! * 111 + pool[1 % pool.length]! * 13 + (h % 97),
          pool[1 % pool.length]! * 101 + pool[2 % pool.length]! * 19 + (h % 53),
          pool[0]! * 100 + pool[1 % pool.length]! * 10 + pool[2 % pool.length]!,
          pool[2 % pool.length]! * 100 + pool[0]! * 10 + pool[1 % pool.length]!,
        ]
      : []),
  ];
  const used = new Set<string>();
  const main = uniquePad(2, seeds, used);
  const secondary = uniquePad(2, seeds.slice(1), used);
  const t1 = uniquePad(3, seeds.slice(2), used);
  const t2 = uniquePad(3, seeds.slice(3), used);
  return { main, secondary, triples: [t1, t2] };
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
  dayKey = bangkokDayKey(),
): Promise<DreamReading | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const fixed = numbersFromDream(dream, dayKey);
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
                "ตีความฝันภาษาไทยแบบตำราแม่มั่งมี สั้น เฉพาะสิ่งที่เขาเล่า แล้วอธิบายเลขเด็ดชุดที่ระบบกำหนดให้ ให้ผูกกับสัญลักษณ์ในฝัน เป็นความเชื่อประกอบ ไม่การันตี",
              dream,
              fixedNumbers: fixed,
              schema: {
                title: "ชื่อสั้น เช่น งูกัด · สัญญาณให้ชะลอ",
                meaning: "2-3 ประโยค มีทั้งมุมที่ใช้ได้และมุมที่ควรระวัง",
                doToday: "1 ประโยค สิ่งที่เหมาะจะทำวันนี้",
                holdOff: "1 ประโยค จุดที่ควรระวังหรือชะลอ",
                closing: "1 ประโยคให้จำ",
                numbers: {
                  main: fixed.main,
                  secondary: fixed.secondary,
                  triples: fixed.triples,
                  why: "1 ประโยค เลขชุดนี้โยงกับสัญลักษณ์ในฝันยังไง",
                },
              },
              rules: [
                "ห้าม markdown",
                "ต้องใช้เลขใน fixedNumbers เท่านั้น ห้าม invent เลขใหม่",
                "ห้ามใช้เลขเรียงเช่น 123 456 789",
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
    const parsed = coerceDreamReading(JSON.parse(content));
    if (!parsed) return null;

    // Always pin server-side numbers so placeholders never ship
    return {
      ...parsed,
      numbers: {
        ...fixed,
        why: parsed.numbers.why,
      },
    };
  } catch (err) {
    console.error("OpenAI dream error:", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Replace placeholder lucky numbers (123/456…) on older saved readings */
export function repairDreamNumbers(
  dream: string,
  reading: DreamReading,
  dayKey = bangkokDayKey(),
): DreamReading {
  const nums = [
    reading.numbers.main,
    reading.numbers.secondary,
    ...reading.numbers.triples,
  ];
  if (!nums.some((n) => isPlaceholderNum(n))) return reading;
  const fixed = numbersFromDream(dream, dayKey);
  return {
    ...reading,
    numbers: {
      ...fixed,
      why: reading.numbers.why,
    },
  };
}
