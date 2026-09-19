import {
  analyzeFortune,
  scoreToTone,
  type FortuneAnalyzeInput,
  type FortuneTone,
} from "@/lib/fortune/analyze";
import { getZodiacByBirthDate } from "@/lib/fortune/zodiac";
import {
  OUTLOOK_BANK,
  SCAN_FOLLOWUP,
  SELF_MAP_BANK,
  WEEK_TIP_BANK,
  type CoupleCopy,
  type OutlookDayCopy,
  type SelfMapCopy,
  type WeekDayCopy,
} from "@/lib/fortune/content/premium-value-th";
import {
  COUPLE_DIMENSIONS,
  COUPLE_PROMPTS,
  COUPLE_ROLE_TIP,
  COUPLE_ROLES,
  COUPLE_TONE_SHELL,
  COUPLE_WEEK_TIP,
  ELEMENT_PAIR_COPY,
  elementPairKey,
  type CoupleDimensionId,
  type CoupleRoleId,
} from "@/lib/fortune/content/couple-th";

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

export type CoupleDimensionScore = {
  id: CoupleDimensionId;
  label: string;
  score: number;
};

export type PremiumCouplePack = {
  tone: FortuneTone;
  score: number;
  youSign: string;
  partnerSign: string;
  youElement: string;
  partnerElement: string;
  role: CoupleRoleId;
  roleLabel: string;
  dimensions: CoupleDimensionScore[];
  copy: CoupleCopy;
  prompts: [string, string, string];
  weekTip: string;
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
const ZODIAC_ORDER = [
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

function bangkokDayKey(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
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

function clampScore(n: number) {
  return Math.max(1, Math.min(12, Math.round(n)));
}

function dimScore(h: number, salt: number, base: number) {
  const wobble = ((h >> salt) % 21) / 10 - 1;
  return clampScore(base + wobble * 2.2);
}

/** Compatibility from two birth dates — dimensions + pair copy + role */
export function buildCouplePack(
  yourBirthDate: string,
  partnerBirthDate: string,
  role: CoupleRoleId = "lover"
): PremiumCouplePack {
  const you = getZodiacByBirthDate(yourBirthDate);
  const partner = getZodiacByBirthDate(partnerBirthDate);
  const h = hashSeed(`${yourBirthDate}|${partnerBirthDate}|couple|${role}`);
  const yi = ZODIAC_ORDER.indexOf(you.id);
  const pi = ZODIAC_ORDER.indexOf(partner.id);
  const dist = Math.abs(yi - pi);
  const ring = Math.min(dist, 12 - dist);
  const sameElement = you.element === partner.element ? 1.2 : 0;
  const base = 9.2 - ring * 1.15 + sameElement + ((h % 30) - 15) / 12;
  const score = clampScore(base);
  const tone = scoreToTone(score);
  const shell = COUPLE_TONE_SHELL[tone];
  const pair =
    ELEMENT_PAIR_COPY[elementPairKey(you.element, partner.element)] ??
    ELEMENT_PAIR_COPY["ดิน+ลม"]!;
  const roleMeta = COUPLE_ROLES.find((r) => r.id === role) ?? COUPLE_ROLES[0]!;

  const talk = dimScore(h, 3, base + 0.4);
  const trust = dimScore(h, 7, base - ring * 0.15);
  const rhythm = dimScore(h, 11, base - (sameElement ? 0.2 : 0.8));
  const ease = dimScore(h, 17, base - ring * 0.35);

  const dimensions: CoupleDimensionScore[] = COUPLE_DIMENSIONS.map((d) => {
    const value =
      d.id === "talk"
        ? talk
        : d.id === "trust"
          ? trust
          : d.id === "rhythm"
            ? rhythm
            : ease;
    return { id: d.id, label: d.label, score: value };
  });

  const weekTone = scoreToTone(
    clampScore(base + ((hashSeed(`${bangkokDayKey()}|${h}`) % 17) - 8) / 6)
  );

  return {
    tone,
    score,
    youSign: you.thaiName,
    partnerSign: partner.thaiName,
    youElement: you.element,
    partnerElement: partner.element,
    role,
    roleLabel: roleMeta.label,
    dimensions,
    copy: {
      vibeTitle: shell.vibeTitle,
      blurb: shell.blurb,
      together: pair.together,
      friction: pair.friction,
      tip: COUPLE_ROLE_TIP[role][tone],
    },
    prompts: COUPLE_PROMPTS[role],
    weekTip: COUPLE_WEEK_TIP[weekTone],
  };
}

export const PARTNER_BIRTH_KEY = "dooduang-partner-birth";
export const PARTNER_STATE_KEY = "dooduang-partner-state";

export type PartnerState = {
  birth: string;
  role: CoupleRoleId;
};

export function readPartnerBirth(): string | null {
  const state = readPartnerState();
  return state?.birth ?? null;
}

export function writePartnerBirth(iso: string) {
  const prev = readPartnerState();
  writePartnerState({
    birth: iso,
    role: prev?.role ?? "lover",
  });
}

export function readPartnerState(): PartnerState | null {
  try {
    const raw = sessionStorage.getItem(PARTNER_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PartnerState>;
      if (
        parsed.birth &&
        /^\d{4}-\d{2}-\d{2}$/.test(parsed.birth) &&
        parsed.role &&
        COUPLE_ROLES.some((r) => r.id === parsed.role)
      ) {
        return { birth: parsed.birth, role: parsed.role };
      }
    }
    const legacy = sessionStorage.getItem(PARTNER_BIRTH_KEY);
    if (legacy && /^\d{4}-\d{2}-\d{2}$/.test(legacy)) {
      return { birth: legacy, role: "lover" };
    }
    return null;
  } catch {
    return null;
  }
}

export function writePartnerState(state: PartnerState) {
  try {
    sessionStorage.setItem(PARTNER_STATE_KEY, JSON.stringify(state));
    sessionStorage.setItem(PARTNER_BIRTH_KEY, state.birth);
  } catch {
    /* ignore */
  }
}
