"use client";

import { ArrowRight } from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { PremiumOfferCountdown } from "@/components/fortune/premium-offer-countdown";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Gold premium unlock CTA — shared on free result surfaces */
export function FortuneUnlockBanner({
  unlocked = false,
  unlocking = false,
  onUnlock,
  showCountdown = false,
  className,
}: {
  unlocked?: boolean;
  unlocking?: boolean;
  onUnlock?: () => void;
  showCountdown?: boolean;
  className?: string;
}) {
  if (unlocked) return null;

  return (
    <section className={cn("space-y-2", className)}>
      {showCountdown ? <PremiumOfferCountdown compact /> : null}
      <div
        className="no-sky-lift flex flex-col gap-3 rounded-[16px] px-3.5 py-3.5"
        style={{
          border: "1.5px solid transparent",
          background:
            "linear-gradient(165deg, #1c2738 0%, #141c2b 45%, #101827 100%) padding-box, linear-gradient(145deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 55%, #b8924f 78%, #f0dc9e 100%) border-box",
          boxShadow:
            "0 12px 28px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,248,228,0.08)",
        }}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center">
            <FortuneIcon name="finance" size={44} plain />
          </span>
          <div className="min-w-0 flex-1">
            <p className="mae-gold-text text-[14px] font-semibold leading-snug tracking-wide">
              เห็นจังหวะชีวิตได้ไกลกว่าเดิม
            </p>
            <p className="mt-1 text-[12px] leading-snug text-[#e8d19a]/75">
              เจาะลึกเส้นทางชีวิต 12 ปี พร้อมคำแนะนำเฉพาะคุณ
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onUnlock}
          disabled={!onUnlock || unlocking}
          className="mae-gold-cta inline-flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-[13px] font-semibold text-[#101827] outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45 disabled:opacity-60"
        >
          {unlocking
            ? "…"
            : `ปลดล็อกพรีเมียม · ${FORTUNE_UNLOCK_PRICE} บาท`}
          {!unlocking ? (
            <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          ) : null}
        </button>
      </div>
    </section>
  );
}
