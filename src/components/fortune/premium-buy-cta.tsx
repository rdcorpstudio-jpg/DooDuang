"use client";

import type { ButtonHTMLAttributes } from "react";
import { ChevronRight, Loader2, Sparkles } from "lucide-react";
import { FORTUNE_PACKAGE_LABEL, FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

type PremiumBuyCtaProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  loading?: boolean;
  loadingLabel?: string;
  subtitle?: string;
};

/** Primary buy CTA — gold card button with icon + two-line label */
export function PremiumBuyCta({
  loading = false,
  loadingLabel = "กำลังดำเนินการ…",
  subtitle = `฿${FORTUNE_UNLOCK_PRICE} · ${FORTUNE_PACKAGE_LABEL}`,
  className,
  disabled,
  type = "button",
  ...rest
}: PremiumBuyCtaProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "wallpaper-dl-btn group relative flex h-[3.55rem] w-full items-center gap-3 overflow-hidden rounded-[18px] px-2.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45 disabled:opacity-60",
        className,
      )}
      {...rest}
    >
      <span className="wallpaper-dl-btn__icon relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
        {loading ? (
          <Loader2 className="h-[18px] w-[18px] animate-spin" strokeWidth={2.2} />
        ) : (
          <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.2} />
        )}
      </span>
      <span className="relative z-[1] flex min-w-0 flex-1 flex-col justify-center gap-0.5 overflow-visible py-0.5">
        <span className="block text-[15.5px] font-bold leading-[1.35] tracking-wide">
          {loading ? loadingLabel : "ซื้อพรีเมียม"}
        </span>
        {!loading ? (
          <span className="block text-[12px] font-medium leading-[1.35] opacity-70">
            {subtitle}
          </span>
        ) : null}
      </span>
      {!loading ? (
        <ChevronRight
          className="relative z-[1] mr-1 h-5 w-5 shrink-0 opacity-80 transition-transform duration-200 group-hover:translate-x-0.5"
          strokeWidth={2.4}
        />
      ) : null}
      <span
        className="wallpaper-dl-btn__shine pointer-events-none absolute inset-0"
        aria-hidden
      />
    </button>
  );
}
