"use client";

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
        className="no-sky-lift flex items-center gap-2.5 rounded-[14px] px-3 py-2.5 ring-1 ring-[#E8C547]/40"
        style={{
          background:
            "linear-gradient(118deg, #3D2E0A 0%, #6B5214 38%, #A07E1A 72%, #8A6A12 100%)",
          boxShadow:
            "0 10px 22px rgba(122, 92, 18, 0.28), inset 0 1px 0 rgba(255, 236, 180, 0.35)",
        }}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center">
          <FortuneIcon name="finance" size={40} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-snug text-[#FFF8E7]">
            เห็นจังหวะชีวิตได้ไกลกว่าเดิม
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-[#F5E6B8]/82">
            เจาะลึกเส้นทางชีวิต 12 ปี พร้อมคำแนะนำเฉพาะคุณ
          </p>
        </div>
        <button
          type="button"
          onClick={onUnlock}
          disabled={!onUnlock || unlocking}
          className="dd-gold-glass-btn inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-[11px] font-semibold text-[#5C4810] outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#F4BC52]/45 disabled:opacity-60"
        >
          {unlocking
            ? "…"
            : `ปลดล็อกพรีเมียม · ${FORTUNE_UNLOCK_PRICE} บาท`}
          {!unlocking ? <FortuneIcon name="arrow-right" size={20} /> : null}
        </button>
      </div>
    </section>
  );
}
