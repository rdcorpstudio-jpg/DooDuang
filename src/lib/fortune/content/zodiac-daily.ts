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

/** ดวงรายวันตามราศี × โทน — จากคลัง DooDuang-fortune-library-th */
export const ZODIAC_DAILY_BANK = library.zodiacDaily as Record<
  ZodiacSign,
  Record<FortuneTone, ZodiacDailyCopy>
>;

export function pickZodiacDaily(
  sign: ZodiacSign,
  tone: FortuneTone
): ZodiacDailyCopy {
  return ZODIAC_DAILY_BANK[sign][tone];
}
