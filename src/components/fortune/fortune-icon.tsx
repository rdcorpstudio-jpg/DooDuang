"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export const FORTUNE_ICONS = {
  moon: "/images/icons/moon.webp",
  sparkle: "/images/icons/sparkle.webp",
  "arrow-left": "/images/icons/arrow-left-gold.webp?v=1",
  "arrow-right": "/images/icons/arrow-right-gold.webp?v=1",
  home: "/images/icons/home.webp",
  calendar: "/images/icons/calendar-gold.webp?v=1",
  shirt: "/images/icons/shirt-gold.webp?v=2",
  check: "/images/icons/check-gold.webp?v=1",
  warning: "/images/icons/warning.webp",
  "warning-gold": "/images/icons/warning-gold.webp",
  love: "/images/icons/love-gold.webp?v=3",
  profile: "/images/icons/profile.webp",
  compass: "/images/icons/compass-gold.webp?v=1",
  article: "/images/icons/article-gold.webp?v=1",
  finance: "/images/icons/finance-gold.webp?v=3",
  lock: "/images/icons/lock.webp",
  "lock-gold": "/images/icons/lock-gold.webp",
  virgo: "/images/icons/virgo.webp",
  clover: "/images/icons/clover.webp",
  career: "/images/icons/career-gold.webp?v=3",
  "crystal-ball": "/images/icons/crystal-ball.webp",
  health: "/images/icons/health-gold.webp?v=3",
} as const;

export type FortuneIconName = keyof typeof FORTUNE_ICONS;

/** Premium 3D glass icons from design pack */
export function FortuneIcon({
  name,
  size = 24,
  alt = "",
  className,
  plain = false,
}: {
  name: FortuneIconName;
  size?: number;
  alt?: string;
  className?: string;
  /** No drop-shadow glow */
  plain?: boolean;
}) {
  return (
    <Image
      src={FORTUNE_ICONS[name]}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      className={cn(
        "object-contain",
        !plain && "drop-shadow-[0_2px_8px_rgba(213,177,111,0.28)]",
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}
