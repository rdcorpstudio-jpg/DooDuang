"use client";

import type { ButtonHTMLAttributes } from "react";
import { ChevronRight, Crown, Loader2 } from "lucide-react";
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

/** Primary buy CTA — slim gold pill with crown + Premium label */
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
        "mae-gold-cta group relative flex min-h-[2.85rem] w-full items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-2.5 outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45 disabled:opacity-60",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2
          className="relative z-[1] h-4 w-4 shrink-0 animate-spin text-[#1a1408]"
          strokeWidth={2.2}
          aria-hidden
        />
      ) : (
        <Crown
          className="relative z-[1] h-4 w-4 shrink-0 text-[#1a1408]"
          strokeWidth={2.2}
          aria-hidden
        />
      )}
      <span className="relative z-[1] flex min-w-0 flex-col items-center justify-center">
        <span className="dd-btn-label text-[15px] font-bold tracking-[0.06em]">
          {loading ? loadingLabel : "Premium"}
        </span>
        {!loading ? (
          <span className="mt-0.5 text-[11.5px] font-medium leading-none tracking-wide opacity-70">
            {subtitle}
          </span>
        ) : null}
      </span>
      {!loading ? (
        <ChevronRight
          className="relative z-[1] h-4 w-4 shrink-0 text-[#1a1408]/75 transition-transform duration-200 group-hover:translate-x-0.5"
          strokeWidth={2.4}
          aria-hidden
        />
      ) : null}
    </button>
  );
}
