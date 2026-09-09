import type { FortuneAspectId, FortuneTone } from "@/lib/fortune/analyze";
import library from "@/lib/fortune/content/fortune-library-th.json";

export type AspectCopy = {
  blurb: string;
  title: string;
  body: string;
  highlights: string[];
  why: string;
  move: string;
};

/** ดวง 4 ด้าน × 3 โทน — จากคลัง DooDuang-fortune-library-th */
export const ASPECT_DAILY_BANK = library.aspectsDaily as Record<
  FortuneAspectId,
  Record<FortuneTone, AspectCopy>
>;

export function pickAspectCopy(
  id: FortuneAspectId,
  tone: FortuneTone
): AspectCopy {
  return ASPECT_DAILY_BANK[id][tone];
}
