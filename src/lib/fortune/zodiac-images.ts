import type { ZodiacSign } from "@/lib/fortune/zodiac";

export type ZodiacImageVariant = "orb" | "star";

/** Glass gold-rim medallions from pack `medallions/` (left badge) */
const ORB_EXT: Record<ZodiacSign, "png"> = {
  aries: "png",
  taurus: "png",
  gemini: "png",
  cancer: "png",
  leo: "png",
  virgo: "png",
  libra: "png",
  scorpio: "png",
  sagittarius: "png",
  capricorn: "png",
  aquarius: "png",
  pisces: "png",
};

/** Constellation glyphs from pack `constellations/` (right watermark) */
const STAR_EXT: Record<ZodiacSign, "png"> = {
  aries: "png",
  taurus: "png",
  gemini: "png",
  cancer: "png",
  leo: "png",
  virgo: "png",
  libra: "png",
  scorpio: "png",
  sagittarius: "png",
  capricorn: "png",
  aquarius: "png",
  pisces: "png",
};

/** Public path for a zodiac art asset (orb glass or constellation). */
export function getZodiacImageSrc(
  sign: ZodiacSign,
  variant: ZodiacImageVariant = "orb"
): string {
  if (variant === "star") {
    return `/images/zodiac/star/${sign}.${STAR_EXT[sign]}`;
  }
  return `/images/zodiac/orb/${sign}.${ORB_EXT[sign]}`;
}

/**
 * Older black-plate exports needed mix-blend-screen.
 * Pack assets are true transparent PNGs — no blend.
 */
export function zodiacImageNeedsBlend(
  _sign: ZodiacSign,
  _variant: ZodiacImageVariant = "orb"
): boolean {
  return false;
}
