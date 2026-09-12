import type { FortuneTone } from "@/lib/fortune/analyze";
import type {
  FaceAspectCopy,
  FaceAspectId,
  FaceReadingPack,
  FaceReadingResult,
  FaceShapeCopy,
  FaceShapeId,
  HandNatureCopy,
  HandNatureId,
  PalmLineCopy,
  PalmLineId,
  PalmReadingPack,
  PalmReadingResult,
} from "@/lib/fortune/scan/types";
import { SCAN_TONE_RULES, SCAN_TONE_SYSTEM } from "@/lib/fortune/tone";
import { pickPalmLineCopy } from "@/lib/fortune/content/face-palm-library";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const TIMEOUT_MS = 25_000;

const FACE_SHAPES: FaceShapeId[] = ["oval", "long", "heart", "square"];
const FACE_ASPECTS: FaceAspectId[] = ["work", "love", "image"];
const TONES: FortuneTone[] = ["high", "mid", "low"];
const NATURES: HandNatureId[] = ["earth", "air", "fire", "water"];
const LINES: PalmLineId[] = ["life", "heart", "head"];

function asText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

/** AI sometimes returns the disclaimer as the whole line body — reject it. */
function isMetaDisclaimer(value: string) {
  const t = value.trim();
  if (!t) return true;
  if (t.length < 24 && t.includes("แนวทาง")) return true;
  return /ใช้เป็นแนวทาง/.test(t) && /คำตัดสิน|ประกอบการตัดสินใจ/.test(t) && t.length < 48;
}

function asLineText(value: unknown, fallback: string) {
  const t = asText(value, "");
  if (!t || isMetaDisclaimer(t)) return fallback;
  return t;
}

function asTone(value: unknown, fallback: FortuneTone = "mid"): FortuneTone {
  return TONES.includes(value as FortuneTone)
    ? (value as FortuneTone)
    : fallback;
}

function asStringList(value: unknown, max = 4): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asText(item))
    .filter(Boolean)
    .slice(0, max);
}

function coerceFacePack(raw: unknown): FaceReadingPack | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const shape = FACE_SHAPES.includes(data.shape as FaceShapeId)
    ? (data.shape as FaceShapeId)
    : null;
  if (!shape) return null;

  const shapeTone = asTone(data.shapeTone);
  const shapeCopyRaw =
    data.shapeCopy && typeof data.shapeCopy === "object"
      ? (data.shapeCopy as Record<string, unknown>)
      : null;
  if (!shapeCopyRaw) return null;

  const shapeCopy: FaceShapeCopy = {
    title: asText(shapeCopyRaw.title, "ลักษณะใบหน้า"),
    blurb: asText(shapeCopyRaw.blurb, "อ่านจากใบหน้าของคุณ"),
    body: asText(shapeCopyRaw.body, "ใบหน้าบอกจังหวะและบุคลิกที่ใช่กับตัวคุณ"),
    strengths: asStringList(shapeCopyRaw.strengths, 4),
    watch: asText(shapeCopyRaw.watch, "อย่าเร่งเกินจังหวะตัวเอง"),
    advice: asText(shapeCopyRaw.advice, "ใช้จุดแข็งที่มีอยู่แล้วให้ชัดขึ้น"),
  };
  if (shapeCopy.strengths.length === 0) {
    shapeCopy.strengths = ["เป็นตัวเองชัด", "อ่านคนเก่ง", "ยืดหยุ่นได้"];
  }

  const aspectsRaw = Array.isArray(data.aspects) ? data.aspects : [];
  const aspects: FaceReadingPack["aspects"] = FACE_ASPECTS.map((id) => {
    const row = aspectsRaw.find(
      (item) =>
        item &&
        typeof item === "object" &&
        (item as Record<string, unknown>).id === id
    ) as Record<string, unknown> | undefined;
    const copyRaw =
      row?.copy && typeof row.copy === "object"
        ? (row.copy as Record<string, unknown>)
        : {};
    const copy: FaceAspectCopy = {
      title: asText(copyRaw.title, id === "work" ? "การงาน" : id === "love" ? "ความรัก" : "ภาพลักษณ์"),
      blurb: asText(copyRaw.blurb, "แนวโน้มจากใบหน้า"),
      body: asText(copyRaw.body, "ใช้เป็นแนวทางประกอบการตัดสินใจ"),
      highlights: asStringList(copyRaw.highlights, 3),
    };
    if (copy.highlights.length === 0) {
      copy.highlights = ["โฟกัสเรื่องสำคัญ", "รักษาจังหวะ", "สื่อสารชัด"];
    }
    return { id, copy };
  });

  const aspectTones = Object.fromEntries(
    FACE_ASPECTS.map((id) => [id, shapeTone])
  ) as Record<FaceAspectId, FortuneTone>;

  const result: FaceReadingResult = {
    shape,
    shapeTone,
    aspects: aspectTones,
    metrics: {
      ratio: 0.85,
      topBottom: 1,
      fill: 0.7,
      clarity: 82,
    },
  };

  return {
    result,
    shapeLabel: asText(data.shapeLabel, shapeCopy.title),
    shapeCopy,
    aspects,
  };
}

function coercePalmPack(raw: unknown): PalmReadingPack | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const nature = NATURES.includes(data.nature as HandNatureId)
    ? (data.nature as HandNatureId)
    : null;
  if (!nature) return null;

  const natureCopyRaw =
    data.natureCopy && typeof data.natureCopy === "object"
      ? (data.natureCopy as Record<string, unknown>)
      : null;
  if (!natureCopyRaw) return null;

  const natureCopy: HandNatureCopy = {
    personality: asText(natureCopyRaw.personality, "บุคลิกจากฝ่ามือ"),
    strength: asText(natureCopyRaw.strength, "จุดแข็งที่ควรใช้"),
    shadow: asText(natureCopyRaw.shadow, "จุดที่ควรระวัง"),
    advice: asText(natureCopyRaw.advice, "จัดจังหวะแรงและพักให้สมดุล"),
  };

  const linesRaw = Array.isArray(data.lines) ? data.lines : [];
  const lines: PalmReadingPack["lines"] = LINES.map((id) => {
    const row = linesRaw.find(
      (item) =>
        item &&
        typeof item === "object" &&
        (item as Record<string, unknown>).id === id
    ) as Record<string, unknown> | undefined;
    const copyRaw =
      row?.copy && typeof row.copy === "object"
        ? (row.copy as Record<string, unknown>)
        : {};
    const labelDefault =
      id === "life" ? "เส้นชีวิต" : id === "heart" ? "เส้นหัวใจ" : "เส้นสมอง";
    const lib = pickPalmLineCopy(id, "mid");
    const copy: PalmLineCopy = {
      title: asLineText(copyRaw.title, lib.title),
      blurb: asLineText(copyRaw.blurb, lib.blurb),
      body: asLineText(copyRaw.body, lib.body),
      meaning: asLineText(copyRaw.meaning, lib.meaning),
      advice: asLineText(copyRaw.advice, lib.advice),
    };
    return {
      id,
      label: asText(row?.label, labelDefault),
      copy,
    };
  });

  const result: PalmReadingResult = {
    nature,
    lines: Object.fromEntries(LINES.map((id) => [id, "mid" as FortuneTone])) as Record<
      PalmLineId,
      FortuneTone
    >,
    metrics: {
      ratio: 0.7,
      lineDensity: 0.55,
      fill: 0.65,
      clarity: 80,
    },
  };

  return {
    result,
    natureLabel: asText(data.natureLabel, natureCopy.personality),
    natureCopy,
    lines,
  };
}

async function callOpenAIVision(params: {
  prompt: string;
  imageDataUrls: string[];
}): Promise<unknown | null> {
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
        max_tokens: 1600,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: SCAN_TONE_SYSTEM,
          },
          {
            role: "user",
            content: [
              { type: "text", text: params.prompt },
              ...params.imageDataUrls.map((url) => ({
                type: "image_url" as const,
                image_url: { url, detail: "low" as const },
              })),
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error(
        "OpenAI scan failed:",
        response.status,
        await response.text()
      );
      return null;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as unknown;
  } catch (err) {
    console.error("OpenAI scan error:", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function analyzeFaceWithOpenAI(
  imageDataUrls: string[]
): Promise<FaceReadingPack | null> {
  const raw = await callOpenAIVision({
    imageDataUrls,
    prompt: JSON.stringify({
      task: "วิเคราะห์โหงวเฮ้งจากรูปใบหน้า 2 มุม (ด้านหน้าและด้านข้าง) ภาษาไทย",
      images: [
        "รูปที่ 1 = ด้านหน้าของใบหน้า",
        "รูปที่ 2 = ด้านข้าง (โปรไฟล์) ของใบหน้า",
      ],
      schema: {
        shape: "oval | long | heart | square",
        shapeTone: "high | mid | low",
        shapeLabel: "ชื่อรูปหน้าภาษาไทย",
        shapeCopy: {
          title: "string",
          blurb: "1 ประโยค",
          body: "2-3 ประโยค",
          strengths: ["string", "string", "string"],
          watch: "1 ประโยค",
          advice: "1-2 ประโยค",
        },
        aspects: [
          {
            id: "work",
            copy: {
              title: "string",
              blurb: "string",
              body: "2 ประโยค",
              highlights: ["string", "string"],
            },
          },
          {
            id: "love",
            copy: {
              title: "string",
              blurb: "string",
              body: "2 ประโยค",
              highlights: ["string", "string"],
            },
          },
          {
            id: "image",
            copy: {
              title: "string",
              blurb: "string",
              body: "2 ประโยค",
              highlights: ["string", "string"],
            },
          },
        ],
      },
      rules: [
        "ต้องมี aspects ครบ work love image",
        "อ่านทั้งด้านหน้าและด้านข้างประกอบกัน อย่าใช้แค่มุมเดียว",
        "ห้าม markdown",
        "ถ้าเห็นไม่ชัด ให้ประเมินเท่าที่มองเห็นได้",
        ...SCAN_TONE_RULES,
      ],
    }),
  });
  return coerceFacePack(raw);
}

export async function analyzePalmWithOpenAI(
  imageDataUrl: string
): Promise<PalmReadingPack | null> {
  const raw = await callOpenAIVision({
    imageDataUrls: [imageDataUrl],
    prompt: JSON.stringify({
      task: "วิเคราะห์ลายมือจากรูปฝ่ามือ ภาษาไทย",
      schema: {
        nature: "earth | air | fire | water",
        natureLabel: "ชื่อธาตุมือภาษาไทย",
        natureCopy: {
          personality: "2 ประโยค",
          strength: "1-2 ประโยค",
          shadow: "1 ประโยค",
          advice: "1-2 ประโยค",
        },
        lines: [
          {
            id: "life",
            label: "เส้นชีวิต",
            copy: {
              title: "string",
              blurb: "string",
              body: "2 ประโยค",
              meaning: "1 ประโยค",
              advice: "1 ประโยค",
            },
          },
          {
            id: "heart",
            label: "เส้นหัวใจ",
            copy: {
              title: "string",
              blurb: "string",
              body: "2 ประโยค",
              meaning: "1 ประโยค",
              advice: "1 ประโยค",
            },
          },
          {
            id: "head",
            label: "เส้นสมอง",
            copy: {
              title: "string",
              blurb: "string",
              body: "2 ประโยค",
              meaning: "1 ประโยค",
              advice: "1 ประโยค",
            },
          },
        ],
      },
      rules: [
        "ต้องมี lines ครบ life heart head",
        "ห้าม markdown",
        "ถ้าเห็นไม่ชัด ให้ประเมินเท่าที่มองเห็นได้",
        "title/blurb/body/meaning/advice ต้องเป็นเนื้อหาเฉพาะเส้นนั้น ห้ามใส่ประโยค disclaimer เช่น ใช้เป็นแนวทาง ไม่ใช่คำตัดสิน",
        "แต่ละเส้นต้องต่างกัน ห้ามคัดลอกข้อความซ้ำทุกเส้น",
        ...SCAN_TONE_RULES,
      ],
    }),
  });
  return coercePalmPack(raw);
}

export function isOpenAIScanConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}
