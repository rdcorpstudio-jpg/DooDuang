"use client";

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
  orbTone = "violet",
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
      <span
        className={cn(
          "soft-select-orb relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
          `soft-select-orb-${orbTone}`,
        )}
      >
        {iconNode ??
          (Icon ? (
            <Icon className="relative z-[1] h-[18px] w-[18px] text-white/90" strokeWidth={1.75} />
          ) : null)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium tracking-[0.02em] text-white/42">
          {label}
        </span>
        <span className="mt-0.5 block text-[17px] font-semibold tracking-tight text-white">
          {title}
        </span>
      </span>

      {meta ? (
        <span className="mr-1 text-right">
          <span className="block text-[10px] text-white/35">พลัง</span>
          <span className="block text-[15px] font-semibold tabular-nums text-white/85">
            {meta}
          </span>
        </span>
      ) : null}

      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#3b2a5c] shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
        <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
      </span>
    </button>
  );
}

const iconBase =
  "relative z-[1] h-[20px] w-[20px] text-[#e8c547] drop-shadow-[0_0_6px_rgba(232,197,71,0.35)]";

/** Venus ♀ — female */
export function GenderMoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn(iconBase, className)}
    >
      <circle
        cx="12"
        cy="9"
        r="5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M12 14v7M9 18.5h6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Mars ♂ — male */
export function GenderSunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn(iconBase, className)}
    >
      <circle
        cx="10.5"
        cy="13.5"
        r="5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M14.2 9.8 20 4M20 4h-5.2M20 4v5.2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Four-point star — other / อื่นๆ */
export function GenderStarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn(iconBase, "block", className)}
    >
      <path
        d="M12 5.5c.4 3.25 2.65 5.5 5.9 5.9-3.25.4-5.5 2.65-5.9 5.9-.4-3.25-2.65-5.5-5.9-5.9 3.25-.4 5.5-2.65 5.9-5.9Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}
