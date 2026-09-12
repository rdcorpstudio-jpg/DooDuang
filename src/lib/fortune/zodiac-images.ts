import type { ZodiacSign } from "@/lib/fortune/zodiac";

export type ZodiacImageVariant = "orb" | "star";

/** Glass gold-rim medallions — Mae gold metallic glyphs (`gold-zodiac-12`) */
const ORB_EXT: Record<ZodiacSign, "webp"> = {
  aries: "webp",
  taurus: "webp",
  gemini: "webp",
  cancer: "webp",
  leo: "webp",
  virgo: "webp",
  libra: "webp",
  scorpio: "webp",
  sagittarius: "webp",
  capricorn: "webp",
  aquarius: "webp",
  pisces: "webp",
};

/** Constellation glyphs from pack `constellations/` (right watermark) */
const STAR_EXT: Record<ZodiacSign, "webp"> = {
  aries: "webp",
  taurus: "webp",
  gemini: "webp",
  cancer: "webp",
  leo: "webp",
  virgo: "webp",
  libra: "webp",
  scorpio: "webp",
  sagittarius: "webp",
  capricorn: "webp",
  aquarius: "webp",
  pisces: "webp",
};

/** Public path for a zodiac art asset (orb glass or constellation). */
export function getZodiacImageSrc(
  sign: ZodiacSign,
  variant: ZodiacImageVariant = "orb"
): string {
  if (variant === "star") {
    return `/images/zodiac/star/${sign}.${STAR_EXT[sign]}`;
  }
  // Mae gold metallic glyphs (pack gold-zodiac-12)
  return `/images/zodiac/orb/${sign}.${ORB_EXT[sign]}?v=gold13`;
}

/**
 * Pack assets are transparent WebP — no mix-blend needed.
 */
export function zodiacImageNeedsBlend(
  _sign: ZodiacSign,
  _variant: ZodiacImageVariant = "orb"
): boolean {
  return false;
}
