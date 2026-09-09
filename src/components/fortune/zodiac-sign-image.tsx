"use client";

import Image from "next/image";
import {
  getZodiacImageSrc,
  zodiacImageNeedsBlend,
  type ZodiacImageVariant,
} from "@/lib/fortune/zodiac-images";
import type { ZodiacSign } from "@/lib/fortune/zodiac";
import { cn } from "@/lib/utils";

/**
 * Zodiac art by sign id.
 * - `orb`  = medallions/ (round glass badge — left of name)
 * - `star` = constellations/ (glyph watermark — right accent)
 */
export function ZodiacSignImage({
  sign,
  variant = "orb",
  size = 56,
  alt,
  className,
  imageClassName,
  priority = false,
  blend,
}: {
  sign: ZodiacSign;
  variant?: ZodiacImageVariant;
  size?: number;
  alt?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  blend?: boolean;
}) {
  const src = getZodiacImageSrc(sign, variant);
  const useBlend = blend ?? zodiacImageNeedsBlend(sign, variant);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt ?? ""}
        width={size * 2}
        height={size * 2}
        priority={priority}
        unoptimized
        className={cn(
          "h-full w-full object-contain",
          useBlend && "mix-blend-screen",
          imageClassName
        )}
        sizes={`${size}px`}
      />
    </span>
  );
}
