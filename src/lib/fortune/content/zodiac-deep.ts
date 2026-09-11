import type { FortuneTone } from "@/lib/fortune/analyze";
import type { ZodiacSign } from "@/lib/fortune/zodiac";
import library from "@/lib/fortune/content/fortune-library-th.json";

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

/** Shirt pick by day tone — maps to existing public shirt assets */
export function pickShirtForTone(tone: FortuneTone) {
  if (tone === "high") {
    return {
      id: "purple",
      name: "ม่วง",
      meaning: "โชคลาภ",
      src: "/images/shirts/purple.webp",
    };
  }
  if (tone === "mid") {
    return {
      id: "green",
      name: "เขียว",
      meaning: "การงาน",
      src: "/images/shirts/green.webp",
    };
  }
  return {
    id: "black",
    name: "ดำ",
    meaning: "คุ้มครอง",
    src: "/images/shirts/black.webp",
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
