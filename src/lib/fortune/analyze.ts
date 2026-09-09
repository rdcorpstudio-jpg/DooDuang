import { getZodiacByBirthDate, type ZodiacInfo, type ZodiacSign } from "@/lib/fortune/zodiac";

/** What the user wants to focus on right now */
export type FortuneFocus =
  | "life"
  | "work"
  | "money"
  | "love"
  | "health";

export type FortuneTone = "high" | "mid" | "low";

export type FortuneAspectId = "work" | "money" | "love" | "health";

export interface FortuneAnalyzeInput {
  birthDate: string; // YYYY-MM-DD
  nickname?: string;
  gender?: string;
  /** Optional HH:mm — improves day-part / rising flavor (premium) */
  birthTime?: string;
  /** Optional birth province/city (premium) */
  birthPlace?: string;
  /** Optional focus topic */
  focus?: FortuneFocus;
  /** Analysis date (defaults to today local) */
  asOf?: Date;
}

export interface FortuneAspectScore {
  id: FortuneAspectId;
  score: number; // 1–12
  tone: FortuneTone;
}

export interface FortuneAnalysis {
  asOfIso: string;
  zodiac: ZodiacInfo;
  /** Overall day score 1–12 */
  dayScore: number;
  dayTone: FortuneTone;
  aspects: FortuneAspectScore[];
  monthScore: number;
  monthTone: FortuneTone;
  yearScore: number;
  yearTone: FortuneTone;
  focus: FortuneFocus;
  /** Stable pick index 0–99 for variant selection in content banks */
  variant: number;
  seed: string;
}

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

function clampScore(n: number) {
  return Math.max(1, Math.min(12, Math.round(n)));
}

export function scoreToTone(score: number): FortuneTone {
  if (score >= 9) return "high";
  if (score >= 5) return "mid";
  return "low";
}

function localIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseBirthParts(birthDate: string) {
  const [y, m, d] = birthDate.split("-").map(Number);
  return {
    year: y || 2000,
    month: m || 1,
    day: d || 1,
  };
}

function birthTimeBias(birthTime?: string) {
  if (!birthTime || !/^\d{1,2}:\d{2}$/.test(birthTime)) return 0;
  const [hh] = birthTime.split(":").map(Number);
  const h = hh ?? 12;
  // Night births lean introspective (−), morning lean initiative (+)
  if (h >= 5 && h < 11) return 1;
  if (h >= 11 && h < 17) return 0;
  if (h >= 17 && h < 21) return -0.5;
  return -1;
}

const FOCUS_ASPECT_BOOST: Record<FortuneFocus, FortuneAspectId | null> = {
  life: null,
  work: "work",
  money: "money",
  love: "love",
  health: "health",
};

/**
 * Deterministic fortune analysis from user profile + date.
 * Same inputs → same scores (stable for content bank lookup).
 */
export function analyzeFortune(input: FortuneAnalyzeInput): FortuneAnalysis {
  const asOf = input.asOf ?? new Date();
  const asOfIso = localIsoDate(asOf);
  const zodiac = getZodiacByBirthDate(input.birthDate);
  const birth = parseBirthParts(input.birthDate);
  const focus: FortuneFocus = input.focus ?? "life";
  const timeBias = birthTimeBias(input.birthTime);

  const seed = [
    input.birthDate,
    input.birthTime ?? "",
    input.birthPlace ?? "",
    input.nickname ?? "",
    input.gender ?? "",
    focus,
    asOfIso,
  ].join("|");

  const base = hashSeed(seed);
  const dayPart = hashSeed(`${seed}|day`);
  const monthPart = hashSeed(`${seed}|month|${asOf.getFullYear()}-${asOf.getMonth()}`);
  const yearPart = hashSeed(`${seed}|year|${asOf.getFullYear()}`);
  const placeBias = input.birthPlace?.trim()
    ? (hashSeed(`place|${input.birthPlace.trim()}`) % 3) * 0.35 - 0.35
    : 0;

  // Blend calendar rhythm + birth signature + optional birth-time / place bias
  const dayRaw =
    4 +
    (dayPart % 9) +
    ((birth.day + asOf.getDate()) % 3) +
    timeBias +
    placeBias +
    (zodiac.element === "ไฟ" ? 0.5 : zodiac.element === "น้ำ" ? -0.3 : 0);
  const dayScore = clampScore(dayRaw);
  const monthScore = clampScore(4 + (monthPart % 9) + (birth.month % 3) * 0.4);
  const yearScore = clampScore(4 + (yearPart % 9) + (birth.year % 7) * 0.15);

  const aspectIds: FortuneAspectId[] = ["work", "money", "love", "health"];
  const aspects: FortuneAspectScore[] = aspectIds.map((id, i) => {
    let s =
      3 +
      (hashSeed(`${seed}|asp|${id}`) % 10) +
      ((dayScore - 6) * 0.25) +
      timeBias * 0.35;
    const boost = FOCUS_ASPECT_BOOST[focus];
    if (boost === id) s += 1.25;
    // slight rotation so aspects aren't identical
    s += ((i + asOf.getDay()) % 3) * 0.2;
    const score = clampScore(s);
    return { id, score, tone: scoreToTone(score) };
  });

  return {
    asOfIso,
    zodiac,
    dayScore,
    dayTone: scoreToTone(dayScore),
    aspects,
    monthScore,
    monthTone: scoreToTone(monthScore),
    yearScore,
    yearTone: scoreToTone(yearScore),
    focus,
    variant: base % 100,
    seed,
  };
}

export function getAspect(
  analysis: FortuneAnalysis,
  id: FortuneAspectId
): FortuneAspectScore {
  return analysis.aspects.find((a) => a.id === id) ?? {
    id,
    score: analysis.dayScore,
    tone: analysis.dayTone,
  };
}

export type { ZodiacSign };
