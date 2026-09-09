import {
  FACE_SHAPE_LABEL_TH,
  pickFaceAspectCopy,
  pickFaceShapeCopy,
} from "@/lib/fortune/content/face-palm-library";
import { requestAiScanPack } from "@/lib/fortune/scan/scan-client";
import { buildFaceReading } from "@/lib/fortune/scan/face-rules";
import { measureFaceFromImage } from "@/lib/fortune/scan/face-measure";
import type {
  FaceAspectId,
  FaceReadingPack,
} from "@/lib/fortune/scan/types";

export type { FaceReadingPack };

const ASPECT_ORDER: FaceAspectId[] = ["work", "love", "image"];

export async function buildFaceReadingPack(
  files: File | File[],
  seed: string
): Promise<FaceReadingPack> {
  const list = Array.isArray(files) ? files : [files];
  const primary = list[0];
  if (!primary) throw new Error("ไม่มีรูปใบหน้า");

  const ai = await requestAiScanPack("face", list);
  if (ai) return ai;

  const metrics = await measureFaceFromImage(primary);
  const result = buildFaceReading(metrics, seed);
  return {
    result,
    shapeLabel: FACE_SHAPE_LABEL_TH[result.shape],
    shapeCopy: pickFaceShapeCopy(result.shape, result.shapeTone),
    aspects: ASPECT_ORDER.map((id) => ({
      id,
      copy: pickFaceAspectCopy(id, result.aspects[id]),
    })),
  };
}
