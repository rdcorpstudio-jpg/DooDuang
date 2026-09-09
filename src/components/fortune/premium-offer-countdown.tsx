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

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[18px] px-3.5",
        compact ? "py-2.5" : "py-3",
        compact
          ? "bg-gradient-to-b from-[#FFF8E8]/90 to-[#F8F0FF]/85 ring-1 ring-[#E8C86A]/45"
          : "fortune-glass",
        className
      )}
    >
      {/* soft gold wash */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_0%,rgba(244,188,82,0.18),transparent_70%)]"
        aria-hidden
      />

      <div className="relative">
        <div className="flex items-center justify-center gap-1.5">
          <FortuneIcon name="sparkle" size={compact ? 13 : 15} />
          <p
            className={cn(
              "font-semibold tracking-wide text-[#8A6A12]",
              compact ? "text-[11px]" : "text-[12.5px]"
            )}
          >
            ลดราคาเฉพาะคุณ · ประหยัด {saveBaht} บาท
          </p>
        </div>

        <p
          className={cn(
            "mt-1 text-center font-medium text-[#7A7198]",
            compact ? "text-[10px]" : "text-[11px]"
          )}
        >
          เหลือเวลาสำหรับข้อเสนอนี้
        </p>

        <div
          className={cn(
            "flex items-center justify-center",
            compact ? "mt-1.5 gap-1.5" : "mt-2.5 gap-2"
          )}
        >
          {units.map((unit, i) => (
            <div key={unit.label} className="flex items-center gap-1.5">
              <div className="flex min-w-0 flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center rounded-[12px] bg-white/80 tabular-nums font-bold text-[#241C4F] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-[#E8C86A]/50",
                    compact
                      ? "h-9 min-w-[2.55rem] px-1.5 text-[1.05rem] leading-none"
                      : "h-11 min-w-[3.1rem] px-2 text-[1.3rem] leading-none"
                  )}
                >
                  {unit.value}
                </div>
                <p
                  className={cn(
                    "mt-1 font-medium tracking-wide text-[#9A90B8]",
                    compact ? "text-[8.5px]" : "text-[9.5px]"
                  )}
                >
                  {unit.label}
                </p>
              </div>
              {i < units.length - 1 ? (
                <span
                  className={cn(
                    "-mt-4 font-semibold text-[#C4A84A]/90",
                    compact ? "text-[1rem]" : "text-[1.15rem]"
                  )}
                  aria-hidden
                >
                  :
                </span>
              ) : null}
            </div>
          ))}
        </div>

        {showPrice ? (
          <div className="mt-3 flex items-baseline justify-center gap-2 border-t border-[#E8C86A]/35 pt-2.5">
            <span className="text-[13px] text-[#A89BC8] line-through">
              {PREMIUM_LIST_PRICE} บาท
            </span>
            <span className="text-[1.55rem] font-bold tabular-nums leading-none text-[#241C4F]">
              {FORTUNE_UNLOCK_PRICE}
              <span className="ml-1 text-[0.95rem] font-semibold">บาท</span>
            </span>
            <span className="rounded-full bg-[#F4BC52]/28 px-2 py-0.5 text-[10.5px] font-semibold text-[#8A6A12]">
              -{pctOff}%
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
