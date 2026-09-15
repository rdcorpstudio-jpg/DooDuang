import type { FortuneTone } from "@/lib/fortune/analyze";
import type { ZodiacSign } from "@/lib/fortune/zodiac";
import library from "@/lib/fortune/content/fortune-library-th.json";

export type ZodiacDailyCopy = {
  vibe: string;
  doToday: string;
  watch: string;
  insight: string;
  evening: string;
  luckyHint: string;
};

/** Single pack or multi-variant bank (V00…Vn as array). */
export type ZodiacDailyToneBank = ZodiacDailyCopy | ZodiacDailyCopy[];

/** ดวงรายวันตามราศี × โทน — จากคลัง DooDuang-fortune-library-th */
export const ZODIAC_DAILY_BANK = library.zodiacDaily as Record<
  ZodiacSign,
  Record<FortuneTone, ZodiacDailyToneBank>
>;

function isZodiacDailyCopy(value: ZodiacDailyToneBank): value is ZodiacDailyCopy {
  return !Array.isArray(value) && typeof value?.vibe === "string";
}

/**
 * Pick daily zodiac copy.
 * If the tone bank is an array, use `variant % length` (stable per analyzeFortune seed/day).
 */
export function pickZodiacDaily(
  sign: ZodiacSign,
  tone: FortuneTone,
  variant = 0
): ZodiacDailyCopy {
  const entry = ZODIAC_DAILY_BANK[sign][tone];
  if (Array.isArray(entry)) {
    if (entry.length === 0) {
      throw new Error(`Empty zodiac daily bank: ${sign}/${tone}`);
    }
    return entry[((variant % entry.length) + entry.length) % entry.length]!;
  }
  if (isZodiacDailyCopy(entry)) return entry;
  throw new Error(`Invalid zodiac daily bank: ${sign}/${tone}`);
}

export function zodiacDailyVariantCount(sign: ZodiacSign, tone: FortuneTone): number {
  const entry = ZODIAC_DAILY_BANK[sign][tone];
  return Array.isArray(entry) ? entry.length : 1;
}
