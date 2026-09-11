/** One high-quality wallpaper per premium subscription (browser-local assignment). */

export type PremiumWallpaper = {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  fileName: string;
};

const STORAGE_KEY = "dooduang-premium-wallpaper-id";

export const PREMIUM_WALLPAPERS: PremiumWallpaper[] = Array.from(
  { length: 50 },
  (_, i) => {
    const n = i + 1;
    const id = `wallpaper-${String(n).padStart(2, "0")}`;
    return {
      id,
      title: `วอลเปเปอร์มงคล · เลข ${n}`,
      subtitle: "ของขวัญพรีเมียมเฉพาะคุณ · โหลดคุณภาพเต็มไฟล์",
      src: `/images/wallpaper/premium/${id}.webp`,
      fileName: `dooduang-${id}.jpg`,
    };
  }
);

export function getAssignedPremiumWallpaperId(): string | null {
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    if (id && PREMIUM_WALLPAPERS.some((w) => w.id === id)) return id;
  } catch {
    /* ignore */
  }
  return null;
}

export function getPremiumWallpaperById(id: string): PremiumWallpaper {
  return (
    PREMIUM_WALLPAPERS.find((w) => w.id === id) ?? PREMIUM_WALLPAPERS[0]!
  );
}

/** Preview image for locked (non-premium) users — not an assignment. */
export function getPremiumWallpaperTeaser(): PremiumWallpaper {
  return PREMIUM_WALLPAPERS[0]!;
}

/**
 * Assign exactly one random wallpaper for this premium entitlement.
 * Keeps the same id on later visits until cleared.
 */
export function assignPremiumWallpaperIfNeeded(): PremiumWallpaper {
  const existing = getAssignedPremiumWallpaperId();
  if (existing) return getPremiumWallpaperById(existing);

  const pick =
    PREMIUM_WALLPAPERS[Math.floor(Math.random() * PREMIUM_WALLPAPERS.length)]!;
  try {
    localStorage.setItem(STORAGE_KEY, pick.id);
  } catch {
    /* ignore */
  }
  return pick;
}

export function clearAssignedPremiumWallpaper(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
