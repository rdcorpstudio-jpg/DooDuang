import type { FortuneTone } from "@/lib/fortune/analyze";
import type { ZodiacSign } from "@/lib/fortune/zodiac";
import library from "@/lib/fortune/content/fortune-library-th.json";
import {
  getLuckyShirtById,
  shirtIdForDayTone,
  type LuckyShirtId,
} from "@/lib/fortune/content/lucky-shirts";

export type ZodiacDeepCopy = {
  personality: string;
  strength: string;
  shadow: string;
  turning: string;
  loveStyle: string;
  workStyle: string;
  advice: string;
};

/** เชิงลึกตามราศี — จากคลัง DooDuang-fortune-library-th */
export const ZODIAC_DEEP_BANK = library.zodiacDeep as Record<
  ZodiacSign,
  ZodiacDeepCopy
>;

export function pickZodiacDeep(sign: ZodiacSign): ZodiacDeepCopy {
  return ZODIAC_DEEP_BANK[sign];
}

/** Shirt pick by day tone + score — same id as pickLuckyShirtForDay */
export function pickShirtForTone(tone: FortuneTone, dayScore = 6) {
  const shirt = getLuckyShirtById(shirtIdForDayTone(tone, dayScore));
  return {
    id: shirt.id,
    name: shirt.name,
    meaning: shirt.meaning,
    src: shirt.src,
  };
}

/** Chip colors must match today's shirt — one story on the whole page */
const COLORS_BY_SHIRT: Record<
  LuckyShirtId,
  Array<{ name: string; hex: string }>
> = {
  purple: [
    { name: "ม่วง", hex: "#B9A4F0" },
    { name: "ทอง", hex: "#E4C56A" },
  ],
  orange: [
    { name: "ส้ม", hex: "#F0A05A" },
    { name: "ทอง", hex: "#E4C56A" },
  ],
  green: [
    { name: "เขียว", hex: "#7ED9A8" },
    { name: "ครีม", hex: "#F3E6C8" },
  ],
  red: [
    { name: "แดง", hex: "#E87878" },
    { name: "ครีม", hex: "#F3E6C8" },
  ],
  black: [
    { name: "ดำ", hex: "#3A4050" },
    { name: "เทาอ่อน", hex: "#C5CBD6" },
  ],
};

export function pickLuckyColorsForShirt(shirtId: LuckyShirtId) {
  return COLORS_BY_SHIRT[shirtId];
}

/** @deprecated prefer pickLuckyColorsForShirt — kept for call sites that only have tone */
export function pickLuckyColors(tone: FortuneTone, dayScore = 6) {
  return pickLuckyColorsForShirt(shirtIdForDayTone(tone, dayScore));
}

export function pickLuckyNumbers(seed: string, count = 3): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h = Math.abs(h) >>> 0;
  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const idx = (h + i * 17) % pool.length;
    out.push(pool.splice(idx, 1)[0]!);
  }
  return out;
}
