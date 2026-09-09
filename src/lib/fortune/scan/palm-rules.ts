import type { FortuneTone } from "@/lib/fortune/analyze";
import type {
  HandNatureId,
  PalmLineId,
  PalmMetrics,
  PalmReadingResult,
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

export function classifyHandNature(metrics: PalmMetrics): HandNatureId {
  const { ratio, lineDensity, fill } = metrics;
  if (fill < 0.06) return "earth";
  if (ratio >= 0.85 && lineDensity < 0.35) return "earth";
  if (ratio < 0.65 && lineDensity >= 0.4) return "air";
  if (lineDensity >= 0.48) return "fire";
  if (ratio < 0.72) return "water";
  return "earth";
}

export function buildPalmReading(
  metrics: PalmMetrics,
  seed = "palm"
): PalmReadingResult {
  const nature = classifyHandNature(metrics);
  const lineIds: PalmLineId[] = ["life", "heart", "head"];
  const lines = Object.fromEntries(
    lineIds.map((id, i) => {
      const base =
        metrics.clarity / 100 * 0.35 +
        metrics.lineDensity * 0.35 +
        metrics.fill * 0.15 +
        ((hashSeed(`${seed}|line|${id}`) % 100) / 100) * 0.2 +
        (i === 0 ? metrics.ratio * 0.05 : 0);
      return [id, toneFromScore(Math.max(0, Math.min(1, base)))];
    })
  ) as Record<PalmLineId, FortuneTone>;

  return { nature, lines, metrics };
}
