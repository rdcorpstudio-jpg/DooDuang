import {
  analyzeFortune,
  type FortuneAnalyzeInput,
  type FortuneAspectId,
} from "@/lib/fortune/analyze";
import { pickAspectCopy } from "@/lib/fortune/content/aspects-daily";
import { pickZodiacDaily } from "@/lib/fortune/content/zodiac-daily";
import {
  pickLuckyColors,
  pickLuckyNumbers,
  pickShirtForTone,
  pickZodiacDeep,
} from "@/lib/fortune/content/zodiac-deep";

const ASPECT_UI: Record<
  FortuneAspectId,
  { domainId: "career" | "money" | "love" | "health"; name: string }
> = {
  work: { domainId: "career", name: "การงาน" },
  money: { domainId: "money", name: "การเงิน" },
  love: { domainId: "love", name: "ความรัก" },
  health: { domainId: "health", name: "สุขภาพ" },
};

/** One call → analysis + copy packs for the result page. */
export function buildDailyReadingPack(input: FortuneAnalyzeInput) {
  const analysis = analyzeFortune(input);
  const zodiacDaily = pickZodiacDaily(analysis.zodiac.id, analysis.dayTone);
  const zodiacDeep = pickZodiacDeep(analysis.zodiac.id);
  const colors = pickLuckyColors(analysis.dayTone);
  const numbers = pickLuckyNumbers(analysis.seed);
  const shirt = pickShirtForTone(analysis.dayTone);

  const aspects = analysis.aspects.map((a) => {
    const copy = pickAspectCopy(a.id, a.tone);
    const ui = ASPECT_UI[a.id];
    return {
      ...a,
      ...ui,
      ...copy,
    };
  });

  return {
    analysis,
    zodiacDaily,
    zodiacDeep,
    aspects,
    lucky: { colors, numbers },
    shirt,
  };
}

export function monthScoreForDate(
  input: FortuneAnalyzeInput,
  yearCe: number,
  monthIndex: number
) {
  const asOf = new Date(yearCe, monthIndex, 15);
  return analyzeFortune({ ...input, asOf }).monthScore;
}

export function yearScoreForCe(input: FortuneAnalyzeInput, yearCe: number) {
  const asOf = new Date(yearCe, 6, 1);
  return analyzeFortune({ ...input, asOf }).yearScore;
}
