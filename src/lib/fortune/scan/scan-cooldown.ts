import type {
  FaceReadingPack,
  PalmReadingPack,
} from "@/lib/fortune/scan/types";

/** Face / palm: 1 scan every 7 days; can re-open last result anytime. */
export const SCAN_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

const KEYS = {
  face: "dooduang-scan-face-v1",
  palm: "dooduang-scan-palm-v1",
} as const;

export type ScanMode = keyof typeof KEYS;

type SavedFace = { scannedAt: string; pack: FaceReadingPack };
type SavedPalm = { scannedAt: string; pack: PalmReadingPack };

function isPackish(value: unknown): value is { result: unknown } {
  return Boolean(value && typeof value === "object" && "result" in value);
}

function readRaw(mode: ScanMode): { scannedAt: string; pack: unknown } | null {
  try {
    const raw = localStorage.getItem(KEYS[mode]);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { scannedAt?: string; pack?: unknown };
    if (!parsed?.scannedAt || !isPackish(parsed.pack)) return null;
    if (Number.isNaN(Date.parse(parsed.scannedAt))) return null;
    return { scannedAt: parsed.scannedAt, pack: parsed.pack };
  } catch {
    return null;
  }
}

export function readSavedFaceScan(): SavedFace | null {
  const raw = readRaw("face");
  if (!raw) return null;
  return { scannedAt: raw.scannedAt, pack: raw.pack as FaceReadingPack };
}

export function readSavedPalmScan(): SavedPalm | null {
  const raw = readRaw("palm");
  if (!raw) return null;
  return { scannedAt: raw.scannedAt, pack: raw.pack as PalmReadingPack };
}

export function saveFaceScan(pack: FaceReadingPack): void {
  try {
    localStorage.setItem(
      KEYS.face,
      JSON.stringify({ scannedAt: new Date().toISOString(), pack })
    );
  } catch {
    /* quota / private mode */
  }
}

export function savePalmScan(pack: PalmReadingPack): void {
  try {
    localStorage.setItem(
      KEYS.palm,
      JSON.stringify({ scannedAt: new Date().toISOString(), pack })
    );
  } catch {
    /* quota / private mode */
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
