"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { MAE_GLASS } from "@/lib/mae-glass";

const TITLE_GOLD = {
  background:
    "linear-gradient(180deg, #fffef8 0%, #ffe9b0 24%, #f0d078 48%, #d5b16f 72%, #b8924f 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
} as const;

const GOLD_SOFT = "#d5b16f";

const CARD_BACK = "/images/tarot/card-back.webp?v=4";

function FanCard({
  rotate,
  x,
  y,
  w,
  h,
  z,
  priority,
}: {
  rotate: number;
  x: string;
  y: string;
  w: number;
  h: number;
  z: number;
  priority?: boolean;
}) {
  return (
    <span
      className="absolute overflow-hidden rounded-[12px]"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        zIndex: z,
        transform: `translateX(-50%) rotate(${rotate}deg)`,
        boxShadow:
          "0 14px 32px rgba(0,0,0,0.48), 0 0 0 1px rgba(232,209,154,0.32)",
        background: "#05070c",
      }}
    >
      <Image
        src={CARD_BACK}
        alt=""
        fill
        className="object-cover"
        sizes={`${w}px`}
        unoptimized
        priority={priority}
      />
    </span>
  );
}

function PrayerCardFan() {
  return (
    <div className="relative mx-auto h-[160px] w-[220px]" aria-hidden>
      <span
        className="pointer-events-none absolute left-1/2 top-6 h-28 w-40 -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(240,208,120,0.28) 0%, rgba(213,177,111,0.1) 45%, transparent 72%)",
          filter: "blur(10px)",
        }}
      />
      <FanCard rotate={-14} x="26%" y="26px" w={78} h={116} z={1} />
      <FanCard rotate={14} x="74%" y="26px" w={78} h={116} z={1} />
      <FanCard rotate={0} x="50%" y="4px" w={92} h={136} z={2} priority />
    </div>
  );
}

function MoonArc() {
  return (
    <svg
      viewBox="0 0 160 40"
      className="mx-auto h-8 w-[8.5rem] opacity-90"
      aria-hidden
    >
      <defs>
        <linearGradient id="tarotPrayMoon" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8f6e38" stopOpacity="0.1" />
          <stop offset="40%" stopColor="#e8d19a" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#fff8e4" stopOpacity="1" />
          <stop offset="100%" stopColor="#8f6e38" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <path
        d="M16 32 C 44 6, 116 6, 144 32"
        fill="none"
        stroke="url(#tarotPrayMoon)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Meditative pre-draw ritual — Mae navy–gold glass ceremony */
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
      className="no-sky-lift absolute inset-0 z-[75] flex items-center justify-center px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: visible ? 1 : 0,
          background: "rgba(2, 6, 14, 0.78)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
        aria-hidden
      />

      <div
        className="relative z-[1] w-full max-w-[340px] overflow-hidden rounded-[26px] px-5 pb-5 pt-7 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(16px) scale(0.98)",
          transition:
            "opacity 480ms cubic-bezier(0.22,1,0.36,1), transform 480ms cubic-bezier(0.22,1,0.36,1)",
          background: MAE_GLASS.bg,
          border: MAE_GLASS.border,
          boxShadow: `${MAE_GLASS.shadow}, ${MAE_GLASS.highlight}, 0 28px 56px rgba(0,0,0,0.45)`,
          backdropFilter: MAE_GLASS.blur,
          WebkitBackdropFilter: MAE_GLASS.blur,
        }}
      >
        <span
          className="pointer-events-none absolute inset-x-10 top-0 h-24 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(232,209,154,0.18) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        <div className="relative">
          <MoonArc />
          <div className="mt-1">
            <PrayerCardFan />
          </div>
        </div>

        <p
          className="relative mt-4 text-[13px] font-semibold tracking-[0.18em]"
          style={{ color: GOLD_SOFT }}
        >
          ก่อนเปิดไพ่
        </p>
        <h2
          id={titleId}
          className="relative mt-2 text-[clamp(1.7rem,7vw,2rem)] font-bold leading-[1.3] tracking-tight"
          style={{
            ...TITLE_GOLD,
            paddingTop: "0.1em",
            paddingBottom: "0.04em",
          }}
        >
          หลับตาอธิษฐาน
        </h2>
        <p
          className="relative mx-auto mt-3 max-w-[17rem] text-[15px] font-medium leading-[1.65]"
          style={{ color: "rgba(186,204,230,0.82)" }}
        >
          หลับตานิ่งสักครู่ ตั้งจิตตามสิ่งที่อยากรู้ในวันนี้
          แล้วค่อยเปิดไพ่ด้วยใจสงบ
        </p>

        <div className="relative mt-5 flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-7 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, #b8924f, #e8d19a, #b8924f)",
                backgroundSize: "200% 100%",
                animation: `wallpaper-breath-pill 2.4s ease-in-out ${i * 0.4}s infinite`,
              }}
              aria-hidden
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onReady}
          className="wallpaper-dl-btn group relative mt-6 flex h-[3.55rem] w-full items-center gap-3 overflow-hidden rounded-[18px] px-2.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
        >
          <span className="wallpaper-dl-btn__icon relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
            <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </span>
          <span className="relative z-[1] min-w-0 flex-1">
            <span className="dd-btn-label block text-[15.5px] font-bold leading-tight tracking-wide">
              พร้อมแล้ว · ไปเปิดไพ่
            </span>
            <span className="mt-0.5 block text-[12px] font-medium leading-tight opacity-70">
              ตั้งจิตครบแล้ว กดเพื่อจั่ว
            </span>
          </span>
          <span
            className="wallpaper-dl-btn__shine pointer-events-none absolute inset-0"
            aria-hidden
          />
        </button>

        <p
          className="relative mt-3.5 text-[11.5px] font-semibold tracking-[0.14em]"
          style={{ color: "rgba(232,209,154,0.55)" }}
        >
          แม่มั่งมี พามู
        </p>
      </div>
    </div>,
    host,
  );
}
