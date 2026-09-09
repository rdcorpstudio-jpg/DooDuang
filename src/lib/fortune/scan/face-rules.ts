import type { FortuneTone } from "@/lib/fortune/analyze";
import type {
  FaceAspectId,
  FaceMetrics,
  FaceReadingResult,
  FaceShapeId,
} from "@/lib/fortune/scan/types";

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

function toneFromScore(score: number): FortuneTone {
  if (score >= 0.66) return "high";
  if (score >= 0.38) return "mid";
  return "low";
}

export function classifyFaceShape(metrics: FaceMetrics): FaceShapeId {
  const { ratio, topBottom, fill } = metrics;
  if (fill < 0.07) {
    // Weak detection — lean oval as safe default
    return "oval";
  }
  if (topBottom >= 1.12 && ratio < 0.95) return "heart";
  if (ratio >= 0.95) return "square";
  if (ratio <= 0.78) return "long";
  return "oval";
}

/** Map measurements → shape + aspect tones (stable with optional seed blend). */
export function buildFaceReading(
  metrics: FaceMetrics,
  seed = "face"
): FaceReadingResult {
  const shape = classifyFaceShape(metrics);
  const h = hashSeed(`${seed}|${shape}|${metrics.ratio.toFixed(3)}`);

  const shapeScore =
    metrics.fill * 0.55 +
    (1 - Math.abs(metrics.ratio - 0.86)) * 0.35 +
    ((h % 100) / 100) * 0.1;

  const aspectIds: FaceAspectId[] = ["work", "love", "image"];
  const aspects = Object.fromEntries(
    aspectIds.map((id, i) => {
      const base =
        metrics.clarity / 100 * 0.45 +
        metrics.fill * 0.25 +
        ((hashSeed(`${seed}|asp|${id}`) % 100) / 100) * 0.3 +
        (i === 0 ? (metrics.ratio - 0.75) * 0.15 : 0);
      return [id, toneFromScore(Math.max(0, Math.min(1, base)))];
    })
  ) as Record<FaceAspectId, FortuneTone>;

  return {
    shape,
    shapeTone: toneFromScore(Math.max(0, Math.min(1, shapeScore))),
    aspects,
    metrics,
  };
}
