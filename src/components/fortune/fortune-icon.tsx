"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export const FORTUNE_ICONS = {
  moon: "/images/icons/moon.png",
  sparkle: "/images/icons/sparkle.png",
  "arrow-left": "/images/icons/arrow-left.png",
  "arrow-right": "/images/icons/arrow-right.png",
  home: "/images/icons/home.png",
  calendar: "/images/icons/calendar.png",
  check: "/images/icons/check.png",
  warning: "/images/icons/warning.png",
  "warning-gold": "/images/icons/warning-gold.png",
  love: "/images/icons/love.png",
  profile: "/images/icons/profile.png",
  compass: "/images/icons/compass.png",
  article: "/images/icons/article.png",
  finance: "/images/icons/finance.png",
  lock: "/images/icons/lock.png",
  "lock-gold": "/images/icons/lock-gold.png",
  virgo: "/images/icons/virgo.png",
  clover: "/images/icons/clover.png",
  career: "/images/icons/career.png",
  "crystal-ball": "/images/icons/crystal-ball.png",
  health: "/images/icons/health.png?v=gold2",
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
