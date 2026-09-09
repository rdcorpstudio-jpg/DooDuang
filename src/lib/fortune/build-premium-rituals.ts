import {
  analyzeFortune,
  type FortuneAnalyzeInput,
  type FortuneTone,
} from "@/lib/fortune/analyze";
import {
  AUSPICIOUS_ACTIVITIES,
  AUSPICIOUS_ANSWER,
  DAILY_BLESSINGS,
  NIGHT_MODE,
  YEAR_THEME,
  type AuspiciousActivityId,
} from "@/lib/fortune/content/premium-rituals-th";

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

export type PremiumRitualsPack = {
  dayTone: FortuneTone;
  year: (typeof YEAR_THEME)[FortuneTone];
  yearNumber: number;
  blessing: string;
  night: (typeof NIGHT_MODE)[FortuneTone];
  activities: typeof AUSPICIOUS_ACTIVITIES;
};

export function buildPremiumRitualsPack(
  input: FortuneAnalyzeInput
): PremiumRitualsPack {
  const analysis = analyzeFortune(input);
  const asOf = input.asOf ?? new Date();
  const yearNumber = asOf.getFullYear() + 543;
  const blessIdx =
    hashSeed(`${analysis.seed}|bless|${analysis.asOfIso}`) %
    DAILY_BLESSINGS.length;

  return {
    dayTone: analysis.dayTone,
    year: YEAR_THEME[analysis.yearTone],
    yearNumber,
    blessing: DAILY_BLESSINGS[blessIdx]!,
    night: NIGHT_MODE[analysis.dayTone],
    activities: AUSPICIOUS_ACTIVITIES,
  };
}

export function answerAuspicious(
  activityId: AuspiciousActivityId,
  input: FortuneAnalyzeInput
) {
  const analysis = analyzeFortune(input);
  // Soft bias activity with seed so same day feels stable
  const h = hashSeed(`${analysis.seed}|act|${activityId}`);
  const shift = (h % 3) - 1; // -1,0,1
  let score = analysis.dayScore + shift;
  if (activityId === "rest" && analysis.dayTone === "low") score += 2;
  if (activityId === "talk" && analysis.dayTone === "high") score += 1;
  score = Math.max(1, Math.min(12, score));
  const tone: FortuneTone =
    score >= 9 ? "high" : score >= 5 ? "mid" : "low";
  return {
    ...AUSPICIOUS_ANSWER[activityId][tone],
    tone,
    score,
    activity: AUSPICIOUS_ACTIVITIES.find((a) => a.id === activityId)!,
  };
}
