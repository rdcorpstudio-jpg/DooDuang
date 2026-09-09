import {
  analyzeFortune,
  scoreToTone,
  type FortuneAnalyzeInput,
  type FortuneTone,
} from "@/lib/fortune/analyze";
import { getZodiacByBirthDate } from "@/lib/fortune/zodiac";
import {
  COUPLE_BANK,
  OUTLOOK_BANK,
  SCAN_FOLLOWUP,
  SELF_MAP_BANK,
  WEEK_TIP_BANK,
  type CoupleCopy,
  type OutlookDayCopy,
  type SelfMapCopy,
  type WeekDayCopy,
} from "@/lib/fortune/content/premium-value-th";

export type WeekStatus = "good" | "steady" | "rest";

export type PremiumOutlookDay = {
  iso: string;
  offset: 0 | 1 | 2;
  label: string;
  shortDate: string;
  tone: FortuneTone;
  score: number;
  copy: OutlookDayCopy;
};

export type PremiumWeekDay = {
  iso: string;
  weekdayShort: string;
  status: WeekStatus;
  tone: FortuneTone;
  score: number;
  copy: WeekDayCopy;
};

export type PremiumCouplePack = {
  tone: FortuneTone;
  score: number;
  youSign: string;
  partnerSign: string;
  copy: CoupleCopy;
};

export type PremiumValuePack = {
  outlook: PremiumOutlookDay[];
  selfMap: {
    tone: FortuneTone;
    title: string;
    copy: SelfMapCopy;
  };
  week: PremiumWeekDay[];
  scanFollowup: typeof SCAN_FOLLOWUP;
};

const TH_WEEKDAY = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"] as const;

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function isoLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function shortThaiDate(d: Date) {
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function toneToWeekStatus(tone: FortuneTone): WeekStatus {
  if (tone === "high") return "good";
  if (tone === "low") return "rest";
  return "steady";
}

/** Premium-only value pack: 3-day, self-map, week strip */
export function buildPremiumValuePack(
  input: FortuneAnalyzeInput
): PremiumValuePack {
  const base = input.asOf ? new Date(input.asOf) : new Date();
  const todayAnalysis = analyzeFortune({ ...input, asOf: base });

  const outlookLabels = ["วันนี้", "พรุ่งนี้", "มะรืน"] as const;
  const outlook = ([0, 1, 2] as const).map((offset) => {
    const day = addDays(base, offset);
    const analysis = analyzeFortune({ ...input, asOf: day });
    return {
      iso: isoLocal(day),
      offset,
      label: outlookLabels[offset],
      shortDate: shortThaiDate(day),
      tone: analysis.dayTone,
      score: analysis.dayScore,
      copy: OUTLOOK_BANK[analysis.dayTone],
    };
  });

  const week = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(base, i);
    const analysis = analyzeFortune({ ...input, asOf: day });
    const status = toneToWeekStatus(analysis.dayTone);
    return {
      iso: isoLocal(day),
      weekdayShort: TH_WEEKDAY[day.getDay()]!,
      status,
      tone: analysis.dayTone,
      score: analysis.dayScore,
      copy: WEEK_TIP_BANK[status],
    };
  });

  return {
    outlook,
    selfMap: {
      tone: todayAnalysis.dayTone,
      title: `แผนที่ตัวเอง · ${todayAnalysis.zodiac.thaiName}`,
      copy: SELF_MAP_BANK[todayAnalysis.dayTone],
    },
    week,
    scanFollowup: SCAN_FOLLOWUP,
  };
}

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

/** Compatibility from two birth dates — visual score + tone bank */
export function buildCouplePack(
  yourBirthDate: string,
  partnerBirthDate: string
): PremiumCouplePack {
  const you = getZodiacByBirthDate(yourBirthDate);
  const partner = getZodiacByBirthDate(partnerBirthDate);
  const h = hashSeed(`${yourBirthDate}|${partnerBirthDate}|couple`);
  const order = [
    "aries",
    "taurus",
    "gemini",
    "cancer",
    "leo",
    "virgo",
    "libra",
    "scorpio",
    "sagittarius",
    "capricorn",
    "aquarius",
    "pisces",
  ] as const;
  const yi = order.indexOf(you.id);
  const pi = order.indexOf(partner.id);
  const dist = Math.abs(yi - pi);
  const ring = Math.min(dist, 12 - dist);
  const base = 10 - ring * 1.4 + ((h % 30) - 15) / 10;
  const score = Math.max(1, Math.min(12, Math.round(base)));
  const tone = scoreToTone(score);

  return {
    tone,
    score,
    youSign: you.thaiName,
    partnerSign: partner.thaiName,
    copy: COUPLE_BANK[tone],
  };
}

export const PARTNER_BIRTH_KEY = "dooduang-partner-birth";

export function readPartnerBirth(): string | null {
  try {
    const v = sessionStorage.getItem(PARTNER_BIRTH_KEY);
    return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
  } catch {
    return null;
  }
}

export function writePartnerBirth(iso: string) {
  try {
    sessionStorage.setItem(PARTNER_BIRTH_KEY, iso);
  } catch {
    /* ignore */
  }
}
