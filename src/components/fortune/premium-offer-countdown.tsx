"use client";

import { FortuneIcon } from "@/components/fortune/fortune-icon";
import {
  pad2,
  PREMIUM_LIST_PRICE,
  usePersonalOfferCountdown,
} from "@/lib/fortune/premium-offer-countdown";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Shared personal flash-discount countdown for premium upsell */
export function PremiumOfferCountdown({
  className,
  compact = false,
  showPrice = false,
}: {
  className?: string;
  compact?: boolean;
  /** Fold list/sale price into the same card (sales page) */
  showPrice?: boolean;
}) {
  const offer = usePersonalOfferCountdown();
  const saveBaht = PREMIUM_LIST_PRICE - FORTUNE_UNLOCK_PRICE;
  const pctOff = Math.round((saveBaht / PREMIUM_LIST_PRICE) * 100);

  const units =
    offer.hours > 0
      ? [
          { label: "ชม.", value: pad2(offer.hours) },
          { label: "นาที", value: pad2(offer.minutes) },
          { label: "วิ", value: pad2(offer.seconds) },
        ]
      : [
          { label: "นาที", value: pad2(offer.minutes) },
          { label: "วินาที", value: pad2(offer.seconds) },
        ];

  if (compact) {
    return (
      <div className={cn("text-center", className)}>
        <p className="text-[10px] font-medium tracking-[0.14em] text-[#9aa3b2]">
          ข้อเสนอเหลือเวลา
        </p>
        <div className="mt-1.5 flex items-center justify-center gap-1 tabular-nums">
          {units.map((unit, i) => (
            <div key={unit.label} className="flex items-center gap-1">
              <span className="min-w-[2.6rem] rounded-md px-1.5 py-1 text-[12px] font-semibold text-[#f4f1ea]"
                style={{
                  background: "rgba(16,24,39,0.85)",
                  boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.32)",
                }}
              >
                {unit.value}
                <span className="ml-0.5 text-[9px] font-medium text-[#9aa3b2]">
                  {unit.label}
                </span>
              </span>
              {i < units.length - 1 ? (
                <span className="text-[11px] text-[#806031]" aria-hidden>
                  :
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl px-4 py-3.5", className)}
      style={{
        background: "rgba(255,255,255,0.04)",
        boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.22)",
      }}
    >
      <div className="relative">
        <div className="flex items-center justify-center gap-1.5">
          <FortuneIcon name="sparkle" size={14} />
          <p className="text-[12.5px] font-medium tracking-wide text-[#e8d19a]">
            ลดราคาเฉพาะคุณ · ประหยัด {saveBaht} บาท
          </p>
        </div>

        <p className="mt-1 text-center text-[11px] text-[#9aa3b2]">
          เหลือเวลาสำหรับข้อเสนอนี้
        </p>

        <div className="mt-2.5 flex items-center justify-center gap-2">
          {units.map((unit, i) => (
            <div key={unit.label} className="flex items-center gap-2">
              <div className="flex min-w-0 flex-col items-center">
                <div className="flex h-11 min-w-[3rem] items-center justify-center rounded-xl bg-[#101827] px-2 text-[1.25rem] font-semibold tabular-nums leading-none text-[#f4f1ea] shadow-[inset_0_0_0_1px_rgba(213,177,111,0.28)]">
                  {unit.value}
                </div>
                <p className="mt-1 text-[9.5px] font-medium tracking-wide text-[#9aa3b2]">
                  {unit.label}
                </p>
              </div>
              {i < units.length - 1 ? (
                <span className="-mt-4 text-[1.1rem] font-semibold text-[#806031]" aria-hidden>
                  :
                </span>
              ) : null}
            </div>
          ))}
        </div>

        {showPrice ? (
          <div className="mt-3 flex items-baseline justify-center gap-2 border-t border-[rgba(213,177,111,0.2)] pt-2.5">
            <span className="text-[13px] text-[#9aa3b2] line-through">
              {PREMIUM_LIST_PRICE} บาท
            </span>
            <span className="text-[1.5rem] font-bold tabular-nums leading-none text-[#f4f1ea]">
              {FORTUNE_UNLOCK_PRICE}
              <span className="ml-1 text-[0.95rem] font-semibold">บาท</span>
            </span>
            <span className="rounded-full bg-[rgba(213,177,111,0.16)] px-2 py-0.5 text-[10.5px] font-semibold text-[#d5b16f]">
              -{pctOff}%
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
