import {
  HAND_NATURE_LABEL_TH,
  PALM_LINE_LABEL_TH,
  pickHandNatureCopy,
  pickPalmLineCopy,
} from "@/lib/fortune/content/face-palm-library";
import { requestAiScanPack } from "@/lib/fortune/scan/scan-client";
import { buildPalmReading } from "@/lib/fortune/scan/palm-rules";
import { measurePalmFromImage } from "@/lib/fortune/scan/palm-measure";
import type {
  PalmLineId,
  PalmReadingPack,
} from "@/lib/fortune/scan/types";

export type { PalmReadingPack };

const LINE_ORDER: PalmLineId[] = ["life", "heart", "head"];

export async function buildPalmReadingPack(
  file: File,
  seed: string
): Promise<PalmReadingPack> {
  const ai = await requestAiScanPack("palm", file);
  if (ai) return ai;

  const metrics = await measurePalmFromImage(file);
  const result = buildPalmReading(metrics, seed);
  return {
    result,
    natureLabel: HAND_NATURE_LABEL_TH[result.nature],
    natureCopy: pickHandNatureCopy(result.nature),
    lines: LINE_ORDER.map((id) => ({
      id,
      label: PALM_LINE_LABEL_TH[id],
      copy: pickPalmLineCopy(id, result.lines[id]),
    })),
  };
}
