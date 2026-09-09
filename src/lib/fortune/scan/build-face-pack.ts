import { requestAiScanPack } from "@/lib/fortune/scan/scan-client";
import type { FaceReadingPack } from "@/lib/fortune/scan/types";

export type { FaceReadingPack };

/** Face reading via OpenAI only — no local/mock fallback. */
export async function buildFaceReadingPack(
  files: File | File[],
  _seed?: string
): Promise<FaceReadingPack> {
  const list = Array.isArray(files) ? files : [files];
  if (!list[0]) throw new Error("ไม่มีรูปใบหน้า");
  return requestAiScanPack("face", list);
}
