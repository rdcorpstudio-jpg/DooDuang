import type {
  FaceReadingPack,
  PalmReadingPack,
} from "@/lib/fortune/scan/types";

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("อ่านรูปไม่สำเร็จ"));
    reader.readAsDataURL(file);
  });
}

/** Call server OpenAI vision scan. Returns null if unavailable / failed. */
export async function requestAiScanPack(
  mode: "face",
  files: File | File[]
): Promise<FaceReadingPack | null>;
export async function requestAiScanPack(
  mode: "palm",
  files: File | File[]
): Promise<PalmReadingPack | null>;
export async function requestAiScanPack(
  mode: "face" | "palm",
  files: File | File[]
): Promise<FaceReadingPack | PalmReadingPack | null> {
  try {
    const list = Array.isArray(files) ? files : [files];
    const imageDataUrls = await Promise.all(list.map(fileToDataUrl));
    const res = await fetch("/api/fortune/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, imageDataUrls }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      pack?: FaceReadingPack | PalmReadingPack;
    };
    return data.pack ?? null;
  } catch {
    return null;
  }
}
