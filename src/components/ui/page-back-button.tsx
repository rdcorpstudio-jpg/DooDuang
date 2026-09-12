"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const BACK_CLASS =
  "inline-flex min-h-10 items-center gap-1 rounded-full px-3.5 py-2 text-[14px] font-semibold tracking-wide text-[#e8d19a] outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45";

const BACK_STYLE = {
  background: "rgba(213,177,111,0.14)",
  boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.5)",
} as const;

/** Clear gold “กลับ” control — always shows icon + label */
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
      <ChevronLeft className="h-5 w-5 shrink-0" strokeWidth={2.4} aria-hidden />
      <span>{label}</span>
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
