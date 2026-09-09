"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, Star } from "lucide-react";

/** Meditative pre-draw ritual before daily tarot */
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
        className="absolute inset-0 bg-[#3A2F6B]/32 backdrop-blur-[8px] transition-opacity duration-500"
        style={{ opacity: visible ? 1 : 0 }}
        aria-hidden
      />

      <div
        className="tarot-prayer-enter relative z-[1] w-full max-w-[340px] overflow-hidden rounded-[30px] px-5 pb-6 pt-8 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(18px) scale(0.97)",
          transition:
            "opacity 480ms cubic-bezier(0.22,1,0.36,1), transform 480ms cubic-bezier(0.22,1,0.36,1)",
          background:
            "linear-gradient(168deg, rgba(255,255,255,0.94) 0%, rgba(248,244,255,0.92) 48%, rgba(236,228,255,0.9) 100%)",
          border: "1px solid rgba(255,255,255,0.96)",
          boxShadow: [
            "0 28px 64px rgba(70,50,140,0.26)",
            "0 0 0 1px rgba(155,127,232,0.16)",
            "inset 0 1px 0 rgba(255,255,255,0.98)",
          ].join(", "),
          backdropFilter: "blur(24px) saturate(1.2)",
          WebkitBackdropFilter: "blur(24px) saturate(1.2)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background: [
              "radial-gradient(ellipse 95% 50% at 50% -8%, rgba(255,255,255,0.98), transparent 58%)",
              "radial-gradient(circle at 82% 14%, rgba(196,176,245,0.34), transparent 40%)",
              "radial-gradient(circle at 18% 86%, rgba(244,188,82,0.12), transparent 42%)",
            ].join(", "),
          }}
        />

        {/* Soft floating sparks */}
        <span
          className="tarot-prayer-spark pointer-events-none absolute left-7 top-10 h-1.5 w-1.5 rounded-full bg-[#F4BC52]/80"
          aria-hidden
        />
        <span
          className="tarot-prayer-spark pointer-events-none absolute right-9 top-16 h-1 w-1 rounded-full bg-[#9B7FE8]/75"
          style={{ animationDelay: "0.8s" }}
          aria-hidden
        />
        <span
          className="tarot-prayer-spark pointer-events-none absolute bottom-24 left-10 h-1 w-1 rounded-full bg-[#C9A227]/70"
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
                  "radial-gradient(circle at 35% 28%, rgba(255,255,255,0.98), rgba(210,198,250,0.7) 55%, rgba(155,127,232,0.42))",
                boxShadow:
                  "0 12px 28px rgba(110,79,201,0.22), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              <Sparkles
                className="h-8 w-8 text-[#7B5FD4]"
                strokeWidth={1.35}
              />
            </span>
          </div>

          <p className="mt-5 text-[11px] font-semibold tracking-[0.22em] text-[#B8921F]">
            ก่อนเปิดไพ่
          </p>
          <h2
            id={titleId}
            className="mt-1.5 font-sacred text-[1.55rem] font-bold tracking-wide text-[#241C4F]"
          >
            หลับตาอธิษฐาน
          </h2>
          <p className="mx-auto mt-2.5 max-w-[16.5rem] text-[13.5px] leading-[1.75] text-[#5E5688]">
            หลับตานิ่งสักครู่ ตั้งจิตถามสิ่งที่อยากรู้ในวันนี้
            — แล้วค่อยเปิดไพ่ด้วยใจสงบ
          </p>

          <div className="mt-5 flex items-center justify-center gap-2 text-[11.5px] text-[#8A82B0]">
            <span className="tarot-prayer-dot h-1.5 w-1.5 rounded-full bg-[#9B7FE8]" />
            หายใจเข้าลึก ๆ
            <span className="text-[#C8B8F0]">·</span>
            หายใจออกช้า ๆ
            <span
              className="tarot-prayer-dot h-1.5 w-1.5 rounded-full bg-[#C9A227]"
              style={{ animationDelay: "0.9s" }}
            />
          </div>

          {/* Mini face-down card hint */}
          <div
            className="mx-auto mt-5 flex h-[72px] w-[48px] flex-col items-center justify-center rounded-[12px]"
            style={{
              background:
                "linear-gradient(160deg, #3A3270 0%, #2C2458 55%, #241C4F 100%)",
              boxShadow: "0 10px 22px rgba(44,36,88,0.28)",
            }}
            aria-hidden
          >
            <Star
              className="h-4 w-4 text-[#F4BC52]/85"
              strokeWidth={1.5}
              fill="rgba(244,188,82,0.2)"
            />
          </div>

          <button
            type="button"
            onClick={onReady}
            className="no-sky-lift dd-gold-glass-btn mt-6 inline-flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold text-[#5C4810] outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#F4BC52]/45"
          >
            พร้อมแล้ว · ไปเปิดไพ่
          </button>
        </div>
      </div>
    </div>,
    host
  );
}
