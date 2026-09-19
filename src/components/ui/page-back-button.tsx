"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const BACK_CLASS =
  "inline-flex min-h-10 items-center gap-1 rounded-full px-3.5 py-2 text-[14px] font-semibold tracking-wide outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45";

const BACK_CLASS_COMPACT =
  "inline-flex min-h-10 min-w-10 items-center gap-0.5 rounded-full px-2.5 py-1.5 text-[12px] font-semibold tracking-wide outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45";

const BACK_STYLE = {
  background: "rgba(213,177,111,0.14)",
  boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.5)",
} as const;

const BACK_STYLE_COMPACT = {
  background: "rgba(213,177,111,0.1)",
  boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.38)",
} as const;

/** Clear gold “กลับ” control — always shows icon + label */
export function PageBackButton({
  href,
  onClick,
  label = "กลับ",
  className,
  absolute = false,
  compact = false,
}: {
  href?: string;
  onClick?: () => void;
  label?: string;
  className?: string;
  /** Position top-left in a relative header */
  absolute?: boolean;
  /** Smaller visual chrome; keeps 40px min touch height */
  compact?: boolean;
}) {
  const classes = cn(
    compact ? BACK_CLASS_COMPACT : BACK_CLASS,
    absolute && "absolute left-0 top-1/2 z-10 -translate-y-1/2",
    className
  );

  const inner = (
    <>
      <ChevronLeft
        className={
          compact
            ? "h-4 w-4 shrink-0 text-[#e8d19a]"
            : "h-5 w-5 shrink-0 text-[#e8d19a]"
        }
        strokeWidth={compact ? 2.2 : 2.4}
        aria-hidden
      />
      <span className="mae-gold-text">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        style={compact ? BACK_STYLE_COMPACT : BACK_STYLE}
        aria-label={label}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={classes}
      style={compact ? BACK_STYLE_COMPACT : BACK_STYLE}
      aria-label={label}
    >
      {inner}
    </button>
  );
}
