"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { FORTUNE_PACKAGE_LABEL } from "@/lib/site";

interface PricingCardProps {
  name: string;
  credits?: number;
  durationLabel?: string;
  price: number;
  description: string;
  popular?: boolean;
  packageId: string;
}

export function PricingCard({
  name,
  durationLabel = FORTUNE_PACKAGE_LABEL,
  price,
  description,
  popular,
}: PricingCardProps) {
  return (
    <Card
      className={cn("ui-lift relative flex flex-col", popular && "pt-5")}
      glow={popular}
    >
      {popular ? (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#b8860b] via-[#e8c547] to-[#c9a227] px-3 py-0.5 text-[10px] font-semibold text-[#1f1704]">
          แนะนำ
        </span>
      ) : null}
      <h3 className="text-[15px] font-semibold text-[#f7f4ec]">{name}</h3>
      <p className="mt-1 text-[12px] text-[#bacce6]/70">{description}</p>
      <div className="my-4">
        <span className="text-[1.75rem] font-semibold tabular-nums text-[#f7f4ec]">
          {formatPrice(price)}
        </span>
        <span className="ml-2 text-[13px] text-[#bacce6]/65">
          / {durationLabel}
        </span>
      </div>
      <Link
        href="/premium/pay"
        className={cn(
          "mt-auto inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-[14px] font-medium tracking-wide transition active:scale-[0.98]",
          popular
            ? "bg-gradient-to-r from-[#b8860b] via-[#e8c547] to-[#c9a227] text-[#1f1704] hover:opacity-95"
            : "bg-[rgba(16,24,39,0.85)] text-[#e8d19a] ring-1 ring-[#d5b16f]/40 hover:bg-[rgba(16,24,39,0.95)]"
        )}
      >
        ชำระเงิน
      </Link>
    </Card>
  );
}
