"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { FortuneIcon } from "@/components/fortune/fortune-icon";

/** Meditative pre-draw ritual before daily tarot — Mae navy–gold */
export function TarotPrayerSheet({
  open,
  onReady,
}: {
  open: boolean;
  onReady: () => void;
}) {
  const titleId = useId();
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    setHost(document.querySelector(".phone-frame") as HTMLElement | null);
    const t = window.setTimeout(() => setVisible(true), 40);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!open || !host) return null;

  return createPortal(
    <div
      className="no-sky-lift absolute inset-0 z-[75] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[6px] transition-opacity duration-500"
        style={{ opacity: visible ? 1 : 0 }}
        aria-hidden
      />

      <div
        className="tarot-prayer-enter relative z-[1] w-full max-w-[340px] overflow-hidden rounded-[24px] px-5 pb-6 pt-8 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(18px) scale(0.97)",
          transition:
            "opacity 480ms cubic-bezier(0.22,1,0.36,1), transform 480ms cubic-bezier(0.22,1,0.36,1)",
          background: "#101827",
          boxShadow:
            "inset 0 0 0 1px rgba(213,177,111,0.42), 0 24px 56px rgba(0,0,0,0.4)",
        }}
      >
        <span
          className="tarot-prayer-spark pointer-events-none absolute left-7 top-10 h-1.5 w-1.5 rounded-full bg-[#e8d19a]/80"
          aria-hidden
        />
        <span
          className="tarot-prayer-spark pointer-events-none absolute right-9 top-16 h-1 w-1 rounded-full bg-[#d5b16f]/75"
          style={{ animationDelay: "0.8s" }}
          aria-hidden
        />
        <span
          className="tarot-prayer-spark pointer-events-none absolute bottom-24 left-10 h-1 w-1 rounded-full bg-[#e8d19a]/70"
          style={{ animationDelay: "1.4s" }}
          aria-hidden
        />

        <div className="relative z-[1]">
          <div className="tarot-prayer-breathe relative mx-auto flex h-[108px] w-[108px] items-center justify-center">
            <span
              className="tarot-prayer-ring absolute inset-0 rounded-full"
              aria-hidden
            />
            <span
              className="tarot-prayer-ring tarot-prayer-ring-delay absolute inset-2 rounded-full"
              aria-hidden
            />
            <span
              className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 35% 28%, #fff8e4 0%, #e8d19a 42%, #d5b16f 78%, #b8924f 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.45), 0 10px 24px rgba(0,0,0,0.28)",
              }}
            >
              <FortuneIcon name="sparkle" size={30} plain />
            </span>
          </div>

          <p className="mae-gold-text mt-5 text-[11px] font-semibold tracking-[0.22em]">
            ก่อนเปิดไพ่
          </p>
          <h2
            id={titleId}
            className="mae-gold-text mt-1.5 text-[1.55rem] font-bold tracking-tight"
          >
            หลับตาอธิษฐาน
          </h2>
          <p className="mx-auto mt-2.5 max-w-[16.5rem] text-[13.5px] leading-[1.75] text-[#f7f4ec]/70">
            หลับตานิ่งสักครู่ ตั้งจิตถามสิ่งที่อยากรู้ในวันนี้
            — แล้วค่อยเปิดไพ่ด้วยใจสงบ
          </p>

          <div className="mt-5 flex items-center justify-center gap-2 text-[11.5px] text-[#f7f4ec]/55">
            <span className="tarot-prayer-dot h-1.5 w-1.5 rounded-full bg-[#d5b16f]" />
            หายใจเข้าลึก ๆ
            <span className="text-[#d5b16f]/50">·</span>
            หายใจออกช้า ๆ
            <span
              className="tarot-prayer-dot h-1.5 w-1.5 rounded-full bg-[#e8d19a]"
              style={{ animationDelay: "0.9s" }}
            />
          </div>

          <div
            className="mx-auto mt-5 flex h-[72px] w-[48px] flex-col items-center justify-center rounded-[12px]"
            style={{
              background: "#141c2b",
              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.4)",
            }}
            aria-hidden
          >
            <FortuneIcon name="sparkle" size={16} plain />
          </div>

          <button
            type="button"
            onClick={onReady}
            className="mae-gold-cta mt-6 inline-flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
          >
            พร้อมแล้ว · ไปเปิดไพ่
          </button>
        </div>
      </div>
    </div>,
    host
  );
}
