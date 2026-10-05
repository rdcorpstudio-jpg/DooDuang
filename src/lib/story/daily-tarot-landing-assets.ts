/** Asset slots for /3 Daily Tarot landing — set a path when you drop the file in. */
export const DAILY_TAROT_LANDING_ASSETS = {
  /** Full mystical scene behind the card (castle / moon / fog). */
  scene: null as string | null,
  /** Book stack on the left. */
  books: null as string | null,
  /** Crystal ball near the books. */
  crystal: null as string | null,
  /** Candle on the right. */
  candle: null as string | null,
  /** Quartz / crystals near the candle. */
  stones: null as string | null,
  /** Zodiac circle under the card. */
  zodiacFloor: null as string | null,
  /** Sun / moon crest above the title. */
  crest: null as string | null,
  /** Moon-phase strip under the crest. */
  moonPhases: null as string | null,
  /**
   * Center card face-down art.
   * Default uses the pack back until a custom one is ready.
   */
  cardBack: "/images/tarot/card-back.webp?v=4" as string | null,
} as const;

export type DailyTarotLandingAssetKey = keyof typeof DAILY_TAROT_LANDING_ASSETS;
