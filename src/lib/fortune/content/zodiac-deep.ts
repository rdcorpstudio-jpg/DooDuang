import type { FortuneTone } from "@/lib/fortune/analyze";
import type { ZodiacSign } from "@/lib/fortune/zodiac";
import library from "@/lib/fortune/content/fortune-library-th.json";
import { getLuckyShirtById } from "@/lib/fortune/content/lucky-shirts";

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

/** Shirt pick by day tone + score — same bands as lucky-shirts catalog */
export function pickShirtForTone(tone: FortuneTone, dayScore = 6) {
  const id =
    tone === "high"
      ? dayScore >= 10
        ? "purple"
        : "orange"
      : tone === "mid"
        ? dayScore >= 7
          ? "green"
          : "red"
        : "black";
  const shirt = getLuckyShirtById(id);
  return {
    id: shirt.id,
    name: shirt.name,
    meaning: shirt.meaning,
    src: shirt.src,
  };
}

const COLOR_BY_TONE: Record<
  FortuneTone,
  Array<{ name: string; hex: string }>
> = {
  high: [
    { name: "ทอง", hex: "#E4C56A" },
    { name: "ม่วง", hex: "#B9A4F0" },
  ],
  mid: [
    { name: "เขียว", hex: "#7ED9A8" },
    { name: "ฟ้า", hex: "#8EC5F5" },
  ],
  low: [
    { name: "ครีม", hex: "#F3E6C8" },
    { name: "ชมพู", hex: "#F2A8C8" },
  ],
};

export function pickLuckyColors(tone: FortuneTone) {
  return COLOR_BY_TONE[tone];
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
