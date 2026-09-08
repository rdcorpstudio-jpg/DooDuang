"use client";

import { ChevronRight, Gem } from "lucide-react";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Horizontal premium CTA — matches features mockup strip */
export function FortuneUnlockBanner({
  unlocked = false,
  unlocking = false,
  onUnlock,
  className,
}: {
  unlocked?: boolean;
  unlocking?: boolean;
  onUnlock?: () => void;
  className?: string;
}) {
  if (unlocked) return null;

  return (
    <section
      className={cn(
        "fortune-glass flex items-center gap-3 rounded-[18px] px-3 py-3",
        className
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B9A4F0]/35 ring-1 ring-[#9B7FE8]/3">
        <Gem className="h-5 w-5 text-[#7B5FD4]" strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold leading-snug text-[#2C2458]">
          เห็นจังหวะชีวิตได้ไกลกว่าเดิม
        </p>
        <p className="mt-0.5 text-[12px] leading-snug text-[#5E5688]">
          เจาะลึกเส้นทางชีวิต 12 ปี พร้อมคำแนะนำเฉพาะคุณ
        </p>
      </div>
      <button
        type="button"
        onClick={onUnlock}
        disabled={!onUnlock || unlocking}
        className="inline-flex shrink-0 items-center gap-0.5 rounded-full px-3.5 py-2.5 text-[12px] font-semibold text-white outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/55 disabled:opacity-60"
        style={{
          background:
            "linear-gradient(135deg, #C4B0F5 0%, #9B7FE8 45%, #7B5FD4 100%)",
          boxShadow: "0 6px 16px rgba(123,95,212,0.28)",
        }}
      >
        {unlocking ? "…" : `ปลดล็อกพรีเมียม · ${FORTUNE_UNLOCK_PRICE} บาท`}
        {!unlocking ? (
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.4} />
        ) : null}
      </button>
    </section>
  );
}
