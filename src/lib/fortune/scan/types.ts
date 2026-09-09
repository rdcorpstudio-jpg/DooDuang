import type { FortuneTone } from "@/lib/fortune/analyze";

export type FaceShapeId = "oval" | "long" | "heart" | "square";
export type FaceAspectId = "work" | "love" | "image";
export type PalmLineId = "life" | "heart" | "head";
export type HandNatureId = "earth" | "air" | "fire" | "water";

export type FaceMetrics = {
  /** Skin bbox width / height inside guide */
  ratio: number;
  /** Top third width / bottom third width — >1 suggests heart */
  topBottom: number;
  /** 0–1 how much of oval looks like skin */
  fill: number;
  /** 0–100 scan clarity estimate */
  clarity: number;
};

export type FaceReadingResult = {
  shape: FaceShapeId;
  shapeTone: FortuneTone;
  aspects: Record<FaceAspectId, FortuneTone>;
  metrics: FaceMetrics;
};

export type PalmMetrics = {
  /** Hand blob width / height */
  ratio: number;
  /** Darker linear density proxy 0–1 */
  lineDensity: number;
  fill: number;
  clarity: number;
};

export type PalmReadingResult = {
  nature: HandNatureId;
  lines: Record<PalmLineId, FortuneTone>;
  metrics: PalmMetrics;
};

export type FaceShapeCopy = {
  title: string;
  blurb: string;
  body: string;
  strengths: string[];
  watch: string;
  advice: string;
};

export type FaceAspectCopy = {
  title: string;
  blurb: string;
  body: string;
  highlights: string[];
};

export type PalmLineCopy = {
  title: string;
  blurb: string;
  body: string;
  meaning: string;
  advice: string;
};

export type HandNatureCopy = {
  personality: string;
  strength: string;
  shadow: string;
  advice: string;
};

export type FaceReadingPack = {
  result: FaceReadingResult;
  shapeLabel: string;
  shapeCopy: FaceShapeCopy;
  aspects: Array<{
    id: FaceAspectId;
    copy: FaceAspectCopy;
  }>;
};

export type PalmReadingPack = {
  result: PalmReadingResult;
  natureLabel: string;
  natureCopy: HandNatureCopy;
  lines: Array<{
    id: PalmLineId;
    label: string;
    copy: PalmLineCopy;
  }>;
};
