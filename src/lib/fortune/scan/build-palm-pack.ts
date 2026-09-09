import { requestAiScanPack } from "@/lib/fortune/scan/scan-client";
import type { PalmReadingPack } from "@/lib/fortune/scan/types";

export type { PalmReadingPack };

/** Palm reading via OpenAI only — no local/mock fallback. */
export async function buildPalmReadingPack(
  file: File,
  _seed?: string
): Promise<PalmReadingPack> {
  if (!file) throw new Error("ไม่มีรูปฝ่ามือ");
  return requestAiScanPack("palm", file);
}
