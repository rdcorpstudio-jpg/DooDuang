"use client";

import type { ReactNode } from "react";
import { Lock, Star } from "lucide-react";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Same soft-lock pattern as daily tarot — free blur teaser, tap to unlock */
export function LockedPreviewTile({
  title,
  unlocked,
  preview,
  onUnlock,
  className,
}: {
  title: string;
  unlocked: boolean;
  preview: string;
  onUnlock?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (!unlocked) onUnlock?.();
      }}
      className={cn(
        "fortune-glass relative overflow-hidden rounded-[16px] px-3 py-3 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45",
        className
      )}
    >
      <p className="flex items-center gap-1 text-[12px] font-semibold text-[#d5b16f]">
        <Star className="h-3 w-3" strokeWidth={2} fill="currentColor" />
        {title}
      </p>
      {unlocked ? (
        <p className="mt-2 text-[12px] leading-snug text-[#c5cdd9]/88">{preview}</p>
      ) : (
        <>
          <p className="mt-2 line-clamp-2 text-[12px] leading-snug text-[#9aa3b2] blur-[2px]">
            {preview}
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-[#d5b16f]">
            <Lock className="h-3 w-3" strokeWidth={2} />
            พรีเมียม
          </span>
        </>
      )}
    </button>
  );
}

export function UnlockDetailBanner({
  unlocked,
  onUnlock,
  title = "ปลดล็อกดูรายละเอียดเต็ม",
  subtitle,
  children,
}: {
  unlocked: boolean;
  onUnlock?: () => void;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  if (unlocked) {
    return children ? (
      <div className="fortune-glass overflow-hidden rounded-[18px] px-3.5 py-3.5">
        {children}
      </div>
    ) : null;
  }

  return (
    <div className="fortune-glass overflow-hidden rounded-[18px]">
      <button
        type="button"
        onClick={() => onUnlock?.()}
        className="no-sky-lift flex w-full items-center gap-3 px-3.5 py-3.5 text-left outline-none transition active:opacity-80"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4BC52]/2 ring-1 ring-[#F4BC52]/4">
          <Lock className="h-4 w-4 text-[#B8921F]" strokeWidth={1.9} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-[#241C4F]">
            {title}
          </span>
          <span className="mt-0.5 block text-[11.5px] leading-snug text-[#6B6490]">
            {subtitle ??
              `ดูรายละเอียดเชิงลึก · ${FORTUNE_UNLOCK_PRICE} บาท`}
          </span>
        </span>
      </button>
    </div>
  );
}
