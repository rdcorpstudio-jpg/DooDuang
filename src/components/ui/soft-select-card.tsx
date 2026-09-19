"use client";

import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Soft glass select row — translucent card + modern flat icon + white arrow */
export function SoftSelectCard({
  label,
  title,
  meta,
  icon: Icon,
  iconNode,
  orbTone: _orbTone = "gold",
  selected,
  onClick,
  className,
  delayMs = 0,
  visible = true,
  skipReveal = false,
  style,
}: {
  label: string;
  title: string;
  meta?: string;
  icon?: LucideIcon;
  iconNode?: React.ReactNode;
  orbTone?: "rose" | "sky" | "violet" | "gold";
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  delayMs?: number;
  visible?: boolean;
  skipReveal?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "soft-select-card group relative flex w-full items-center gap-3.5 overflow-hidden rounded-[20px] px-4 py-[1.05rem] text-left",
        !skipReveal && "reveal-up",
        !skipReveal && visible && "is-visible",
        selected && "is-selected",
        className
      )}
      style={
        skipReveal
          ? style
          : ({
              "--reveal-delay": `${delayMs}ms`,
              ...style,
            } as React.CSSProperties)
      }
    >
      <span className="relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center">
        {iconNode ??
          (Icon ? (
            <Icon className="h-[22px] w-[22px] text-[#e8d19a]" strokeWidth={1.75} />
          ) : null)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium tracking-[0.02em] text-[#bacce6]/55">
          {label}
        </span>
        <span className="mt-0.5 block text-[17px] font-semibold tracking-tight text-[#f7f4ec]">
          {title}
        </span>
      </span>

      {meta ? (
        <span className="mr-1 text-right">
          <span className="block text-[10px] text-[#bacce6]/45">พลัง</span>
          <span className="block text-[15px] font-semibold tabular-nums text-[#e8d19a]">
            {meta}
          </span>
        </span>
      ) : null}

      <ArrowRight
        className="h-5 w-5 shrink-0 text-[#e8d19a] transition-transform duration-300 group-hover:translate-x-0.5 group-active:translate-x-1"
        strokeWidth={2.4}
      />
    </button>
  );
}

function GenderAssetIcon({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative z-[1] block h-7 w-7 overflow-hidden",
        className
      )}
    >
      <Image
        src={src}
        alt=""
        width={56}
        height={56}
        className="h-full w-full object-contain"
        style={{ mixBlendMode: "normal" }}
        unoptimized
      />
    </span>
  );
}

/** Venus ♀ — female (user asset) */
export function GenderMoonIcon({ className }: { className?: string }) {
  return (
    <GenderAssetIcon
      src="/images/icons/female-gold.webp"
      className={className}
    />
  );
}

/** Mars ♂ — male (user asset) */
export function GenderSunIcon({ className }: { className?: string }) {
  return (
    <GenderAssetIcon
      src="/images/icons/male-lavender.webp"
      className={className}
    />
  );
}

/** Four-point star — other / อื่นๆ (user asset) */
export function GenderStarIcon({ className }: { className?: string }) {
  return (
    <GenderAssetIcon
      src="/images/icons/star-gold.webp"
      className={className}
    />
  );
}

/** Brand sparkle / gold star */
export function BrandStarIcon({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/images/icons/star-gold.webp"
      alt=""
      width={size}
      height={size}
      className={cn("object-contain", className)}
      style={{ mixBlendMode: "screen" }}
      unoptimized
    />
  );
}
