/** Rider–Waite style deck — 78 cards (22 Major + 56 Minor) */

import tarotDailyCopy from "@/lib/fortune/content/tarot-daily-th.json";

export type TarotSuit = "wands" | "cups" | "swords" | "pentacles";

export type TarotSideCopy = {
  keywords: string[];
  summary: string;
  do: string;
  watch: string;
  message: string;
};

export type TarotCardDef = {
  id: string;
  arcana: "major" | "minor";
  suit?: TarotSuit;
  /** Major: 0–21. Minor: 1–14 (Ace–King). */
  number: number;
  nameEn: string;
  nameTh: string;
  /** Roman numeral for majors, e.g. "VI" */
  label: string;
  upright: TarotSideCopy;
  reversed: TarotSideCopy;
};

type TarotCopyRow = {
  id: string;
  nameEn: string;
  nameTh: string;
  upright: TarotSideCopy;
  reversed: TarotSideCopy;
};

const COPY_BY_ID = new Map(
  (tarotDailyCopy as TarotCopyRow[]).map((row) => [row.id, row])
);

const ROMAN = [
  "0",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
  "XXI",
] as const;

const MAJOR_IDS = [
  "fool",
  "magician",
  "high-priestess",
  "empress",
  "emperor",
  "hierophant",
  "lovers",
  "chariot",
  "strength",
  "hermit",
  "wheel-of-fortune",
  "justice",
  "hanged-man",
  "death",
  "temperance",
  "devil",
  "tower",
  "star",
  "moon",
  "sun",
  "judgement",
  "world",
] as const;

const SUITS: TarotSuit[] = ["wands", "cups", "swords", "pentacles"];

const MINOR_RANKS = [
  { n: 1, id: "ace", label: "A" },
  { n: 2, id: "two", label: "2" },
  { n: 3, id: "three", label: "3" },
  { n: 4, id: "four", label: "4" },
  { n: 5, id: "five", label: "5" },
  { n: 6, id: "six", label: "6" },
  { n: 7, id: "seven", label: "7" },
  { n: 8, id: "eight", label: "8" },
  { n: 9, id: "nine", label: "9" },
  { n: 10, id: "ten", label: "10" },
  { n: 11, id: "page", label: "P" },
  { n: 12, id: "knight", label: "Kn" },
  { n: 13, id: "queen", label: "Q" },
  { n: 14, id: "king", label: "K" },
] as const;

function requireCopy(id: string): TarotCopyRow {
  const row = COPY_BY_ID.get(id);
  if (!row) {
    throw new Error(`Missing tarot daily copy for id: ${id}`);
  }
  return row;
}

function buildDeck(): TarotCardDef[] {
  const majors: TarotCardDef[] = MAJOR_IDS.map((id, n) => {
    const copy = requireCopy(id);
    return {
      id,
      arcana: "major" as const,
      number: n,
      nameEn: copy.nameEn,
      nameTh: copy.nameTh,
      label: ROMAN[n] ?? String(n),
      upright: copy.upright,
      reversed: copy.reversed,
    };
  });

  const minors: TarotCardDef[] = [];
  for (const suit of SUITS) {
    for (const rank of MINOR_RANKS) {
      const id = `${rank.id}-of-${suit}`;
      const copy = requireCopy(id);
      minors.push({
        id,
        arcana: "minor",
        suit,
        number: rank.n,
        nameEn: copy.nameEn,
        nameTh: copy.nameTh,
        label: rank.label,
        upright: copy.upright,
        reversed: copy.reversed,
      });
    }
  }

  return [...majors, ...minors];
}

export const TAROT_DECK: TarotCardDef[] = buildDeck();

export const TAROT_DECK_COUNT = TAROT_DECK.length; // 78

/** Rider–Waite AI pack filenames under /public/images/tarot */
const MAJOR_IMAGE_FILES = [
  "00_THE_FOOL.webp",
  "01_I_THE_MAGICIAN.webp",
  "02_II_THE_HIGH_PRIESTESS.webp",
  "03_III_THE_EMPRESS.webp",
  "04_IV_THE_EMPEROR.webp",
  "05_V_THE_HIEROPHANT.webp",
  "06_VI_THE_LOVERS.webp",
  "07_VII_THE_CHARIOT.webp",
  "08_VIII_STRENGTH.webp",
  "09_IX_THE_HERMIT.webp",
  "10_X_WHEEL_OF_FORTUNE.webp",
  "11_XI_JUSTICE.webp",
  "12_XII_THE_HANGED_MAN.webp",
  "13_XIII_DEATH.webp",
  "14_XIV_TEMPERANCE.webp",
  "15_XV_THE_DEVIL.webp",
  "16_XVI_THE_TOWER.webp",
  "17_XVII_THE_STAR.webp",
  "18_XVIII_THE_MOON.webp",
  "19_XIX_THE_SUN.webp",
  "20_XX_JUDGEMENT.webp",
  "21_XXI_THE_WORLD.webp",
] as const;

const MINOR_RANK_FILES = [
  "ACE",
  "TWO",
  "THREE",
  "FOUR",
  "FIVE",
  "SIX",
  "SEVEN",
  "EIGHT",
  "NINE",
  "TEN",
  "PAGE",
  "KNIGHT",
  "QUEEN",
  "KING",
] as const;

const MINOR_SUIT_META: Record<
  TarotSuit,
  { start: number; file: string }
> = {
  wands: { start: 22, file: "WANDS" },
  cups: { start: 36, file: "CUPS" },
  swords: { start: 50, file: "SWORDS" },
  pentacles: { start: 64, file: "PENTACLES" },
};

/** Public path for a deck card’s face art (78-card RWS pack). */
export function tarotCardImageSrc(card: TarotCardDef): string {
  let file: string;
  if (card.arcana === "major") {
    file = MAJOR_IMAGE_FILES[card.number] ?? MAJOR_IMAGE_FILES[0]!;
  } else {
    const suit = card.suit ?? "wands";
    const meta = MINOR_SUIT_META[suit];
    const rankIdx = Math.min(
      MINOR_RANK_FILES.length - 1,
      Math.max(0, card.number - 1)
    );
    const idx = meta.start + rankIdx;
    file = `${String(idx).padStart(2, "0")}_${MINOR_RANK_FILES[rankIdx]}_OF_${meta.file}.webp`;
  }
  return `/images/tarot/${file}?v=rws1`;
}

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

export function getTarotSide(
  card: TarotCardDef,
  upright: boolean
): TarotSideCopy {
  return upright ? card.upright : card.reversed;
}

/** Pick one card + orientation from seed (deterministic “random”). */
export function drawTarotCard(seed: string): {
  card: TarotCardDef;
  upright: boolean;
  side: TarotSideCopy;
  brief: string;
} {
  const card = TAROT_DECK[hashSeed(seed) % TAROT_DECK.length]!;
  const upright = hashSeed(`${seed}-orient`) % 2 === 0;
  const side = getTarotSide(card, upright);
  return {
    card,
    upright,
    side,
    brief: side.summary,
  };
}

/** Draw N unique cards from the deck using a seed. */
export function drawTarotSpread(seed: string, count: number): TarotCardDef[] {
  const n = Math.min(count, TAROT_DECK.length);
  const used = new Set<number>();
  const out: TarotCardDef[] = [];
  let i = 0;
  while (out.length < n && i < TAROT_DECK.length * 4) {
    const h = hashSeed(`${seed}-spread-${i++}`);
    const idx = h % TAROT_DECK.length;
    if (used.has(idx)) continue;
    used.add(idx);
    out.push(TAROT_DECK[idx]!);
  }
  return out;
}
