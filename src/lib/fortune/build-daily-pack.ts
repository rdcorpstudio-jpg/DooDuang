import {
  analyzeFortune,
  type FortuneAnalyzeInput,
  type FortuneAspectId,
} from "@/lib/fortune/analyze";
import { pickAspectCopy } from "@/lib/fortune/content/aspects-daily";
import { pickZodiacDaily } from "@/lib/fortune/content/zodiac-daily";
import { getLuckyShirtById } from "@/lib/fortune/content/lucky-shirts";
import {
  pickLuckyColorsForShirt,
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
  const shirtPick = pickShirtForTone(analysis.dayTone, analysis.dayScore);
  const shirtFull = getLuckyShirtById(shirtPick.id);
  const colors = pickLuckyColorsForShirt(shirtPick.id);
  const numbers = pickLuckyNumbers(analysis.seed);
  const zodiacDeep = pickZodiacDeep(analysis.zodiac.id);

  const bankDaily = pickZodiacDaily(
    analysis.zodiac.id,
    analysis.dayTone,
    analysis.variant
  );
  /** Align luckyHint with the same shirt/color story shown on the page */
  const zodiacDaily = {
    ...bankDaily,
    luckyHint: `วันนี้สีหลักคือ${shirtFull.name} (${shirtFull.meaning}) — ${shirtFull.tip}`,
  };

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
    shirt: shirtPick,
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
