"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const BACK_CLASS =
  "inline-flex h-11 min-h-11 shrink-0 items-center justify-center gap-1 rounded-full px-4 text-[15.5px] font-bold tracking-wide outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45";

const BACK_STYLE = {
  color: "#e8d19a",
  background: "rgba(16, 24, 39, 0.92)",
  boxShadow: "inset 0 0 0 1.5px rgba(232, 209, 154, 0.7)",
} as const;

/** Dark pill + gold rim “‹ กลับ” — matches Mae back control. */
export function PageBackButton({
  href,
  onClick,
  label = "กลับ",
  className,
  absolute = false,
}: {
  href?: string;
  onClick?: () => void;
  label?: string;
  className?: string;
  /** Position top-left in a relative header */
  absolute?: boolean;
}) {
  const classes = cn(
    BACK_CLASS,
    absolute && "absolute left-0 top-1/2 z-10 -translate-y-1/2",
    className
  );

  const inner = (
    <>
      <ChevronLeft
        className="h-5 w-5 shrink-0"
        strokeWidth={2.6}
        aria-hidden
      />
      <span className="dd-btn-label">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} style={BACK_STYLE} aria-label={label}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={classes}
      style={BACK_STYLE}
      aria-label={label}
    >
      {inner}
    </button>
  );
}
