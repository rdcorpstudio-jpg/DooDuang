import type { FortuneProfile } from "./engine";
import type { ReadingType } from "./zodiac";
import { generateExtendedFortune, type ExtendedFortuneResult } from "./extended";
import { generateFortuneWithOpenAI } from "./ai";

export async function generateReading(
  type: ReadingType,
  profile: FortuneProfile
): Promise<ExtendedFortuneResult> {
  const ai = await generateFortuneWithOpenAI(type, profile);
  if (ai?.title && ai.preview) return ai;
  return generateExtendedFortune(type, profile);
}
