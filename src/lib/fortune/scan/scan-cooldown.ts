import type {
  FaceReadingPack,
  PalmReadingPack,
} from "@/lib/fortune/scan/types";

/** Face / palm: 1 scan every 7 days; can re-open last result anytime. */
export const SCAN_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

const KEYS = {
  face: "dooduang-scan-face-v2",
  palm: "dooduang-scan-palm-v2",
} as const;

/** Migrate / clean older keys without photos */
const LEGACY_KEYS = [
  "dooduang-scan-face-v1",
  "dooduang-scan-palm-v1",
] as const;

export type ScanMode = keyof typeof KEYS;

export type SavedFaceScan = {
  scannedAt: string;
  pack: FaceReadingPack;
  /** [front, side] compressed data URLs */
  photoDataUrls?: string[];
};

export type SavedPalmScan = {
  scannedAt: string;
  pack: PalmReadingPack;
  /** [palm] compressed data URL */
  photoDataUrls?: string[];
};

function isPackish(value: unknown): value is { result: unknown } {
  return Boolean(value && typeof value === "object" && "result" in value);
}

function readRaw(
  mode: ScanMode
): { scannedAt: string; pack: unknown; photoDataUrls?: string[] } | null {
  try {
    for (const legacy of LEGACY_KEYS) {
      /* keep reading only current keys; legacy cleared on save */
      void legacy;
    }
    const raw = localStorage.getItem(KEYS[mode]);
    if (!raw) {
      // fallback read v1 once
      const legacyKey =
        mode === "face" ? "dooduang-scan-face-v1" : "dooduang-scan-palm-v1";
      const legacyRaw = localStorage.getItem(legacyKey);
      if (!legacyRaw) return null;
      const parsed = JSON.parse(legacyRaw) as {
        scannedAt?: string;
        pack?: unknown;
      };
      if (!parsed?.scannedAt || !isPackish(parsed.pack)) return null;
      if (Number.isNaN(Date.parse(parsed.scannedAt))) return null;
      return { scannedAt: parsed.scannedAt, pack: parsed.pack };
    }
    const parsed = JSON.parse(raw) as {
      scannedAt?: string;
      pack?: unknown;
      photoDataUrls?: string[];
    };
    if (!parsed?.scannedAt || !isPackish(parsed.pack)) return null;
    if (Number.isNaN(Date.parse(parsed.scannedAt))) return null;
    const photos = Array.isArray(parsed.photoDataUrls)
      ? parsed.photoDataUrls.filter(
          (u) => typeof u === "string" && u.startsWith("data:image/")
        )
      : undefined;
    return {
      scannedAt: parsed.scannedAt,
      pack: parsed.pack,
      photoDataUrls: photos?.length ? photos : undefined,
    };
  } catch {
    return null;
  }
}

export function readSavedFaceScan(): SavedFaceScan | null {
  const raw = readRaw("face");
  if (!raw) return null;
  return {
    scannedAt: raw.scannedAt,
    pack: raw.pack as FaceReadingPack,
    photoDataUrls: raw.photoDataUrls,
  };
}

export function readSavedPalmScan(): SavedPalmScan | null {
  const raw = readRaw("palm");
  if (!raw) return null;
  return {
    scannedAt: raw.scannedAt,
    pack: raw.pack as PalmReadingPack,
    photoDataUrls: raw.photoDataUrls,
  };
}

/** Remove previous saved reading for this mode. */
export function clearSavedScan(mode: ScanMode): void {
  try {
    localStorage.removeItem(KEYS[mode]);
    localStorage.removeItem(
      mode === "face" ? "dooduang-scan-face-v1" : "dooduang-scan-palm-v1"
    );
  } catch {
    /* ignore */
  }
}

/**
 * Replace any previous result with the new pack (+ optional photos).
 * Always deletes old data first, then writes the latest.
 */
export function saveFaceScan(
  pack: FaceReadingPack,
  photoDataUrls?: string[]
): void {
  clearSavedScan("face");
  try {
    localStorage.setItem(
      KEYS.face,
      JSON.stringify({
        scannedAt: new Date().toISOString(),
        pack,
        photoDataUrls: photoDataUrls?.length ? photoDataUrls : undefined,
      } satisfies SavedFaceScan)
    );
  } catch {
    // Retry without photos if quota exceeded
    try {
      localStorage.setItem(
        KEYS.face,
        JSON.stringify({
          scannedAt: new Date().toISOString(),
          pack,
        } satisfies SavedFaceScan)
      );
    } catch {
      /* ignore */
    }
  }
}

export function savePalmScan(
  pack: PalmReadingPack,
  photoDataUrls?: string[]
): void {
  clearSavedScan("palm");
  try {
    localStorage.setItem(
      KEYS.palm,
      JSON.stringify({
        scannedAt: new Date().toISOString(),
        pack,
        photoDataUrls: photoDataUrls?.length ? photoDataUrls : undefined,
      } satisfies SavedPalmScan)
    );
  } catch {
    try {
      localStorage.setItem(
        KEYS.palm,
        JSON.stringify({
          scannedAt: new Date().toISOString(),
          pack,
        } satisfies SavedPalmScan)
      );
    } catch {
      /* ignore */
    }
  }
}

export function canRescanScan(mode: ScanMode): boolean {
  const raw = readRaw(mode);
  if (!raw) return true;
  const at = Date.parse(raw.scannedAt);
  if (Number.isNaN(at)) return true;
  return Date.now() >= at + SCAN_COOLDOWN_MS;
}

export function scanCooldownDaysLeft(mode: ScanMode): number {
  const raw = readRaw(mode);
  if (!raw) return 0;
  const at = Date.parse(raw.scannedAt);
  if (Number.isNaN(at)) return 0;
  const ms = at + SCAN_COOLDOWN_MS - Date.now();
  if (ms <= 0) return 0;
  return Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export function hasSavedScan(mode: ScanMode): boolean {
  return readRaw(mode) != null;
}

/** Compress image file to a small data URL for local re-view. */
export async function fileToStoredDataUrl(
  file: File,
  maxEdge = 720,
  quality = 0.72
): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("อ่านรูปไม่สำเร็จ"));
      el.src = objectUrl;
    });
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
