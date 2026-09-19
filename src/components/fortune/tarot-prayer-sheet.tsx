"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

const TITLE_GOLD = {
  background:
    "linear-gradient(180deg, #fffef8 0%, #ffe9b0 24%, #f0d078 48%, #d5b16f 72%, #b8924f 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
} as const;

const CARD_BACK = "/images/tarot/card-back.webp?v=mae1";

function PrayerCardFan() {
  return (
    <div
      className="relative mx-auto h-[148px] w-[200px]"
      aria-hidden
    >
      {/* left */}
      <span
        className="absolute left-[18px] top-5 h-[112px] w-[76px] overflow-hidden rounded-[12px] shadow-[0_12px_28px_rgba(0,0,0,0.4)]"
        style={{
          transform: "rotate(-14deg)",
          boxShadow:
            "0 12px 28px rgba(0,0,0,0.4), inset 0 0 0 1.5px rgba(232,209,154,0.45)",
        }}
      >
        <Image
          src={CARD_BACK}
          alt=""
          fill
          className="object-cover"
          sizes="76px"
          unoptimized
        />
      </span>
      {/* right */}
      <span
        className="absolute right-[18px] top-5 h-[112px] w-[76px] overflow-hidden rounded-[12px]"
        style={{
          transform: "rotate(14deg)",
          boxShadow:
            "0 12px 28px rgba(0,0,0,0.4), inset 0 0 0 1.5px rgba(232,209,154,0.45)",
        }}
      >
        <Image
          src={CARD_BACK}
          alt=""
          fill
          className="object-cover"
          sizes="76px"
          unoptimized
        />
      </span>
      {/* center */}
      <span
        className="absolute left-1/2 top-1 z-[1] h-[128px] w-[86px] -translate-x-1/2 overflow-hidden rounded-[13px]"
        style={{
          boxShadow:
            "0 16px 36px rgba(0,0,0,0.45), inset 0 0 0 1.5px rgba(232,209,154,0.65)",
        }}
      >
        <Image
          src={CARD_BACK}
          alt=""
          fill
          className="object-cover"
          sizes="86px"
          unoptimized
          priority
        />
      </span>
    </div>
  );
}

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
        className="absolute inset-0 bg-[#020916]/72 backdrop-blur-[8px] transition-opacity duration-500"
        style={{ opacity: visible ? 1 : 0 }}
        aria-hidden
      />

      <div
        className="relative z-[1] w-full max-w-[340px] overflow-hidden rounded-[24px] px-5 pb-6 pt-7 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(16px) scale(0.98)",
          transition:
            "opacity 480ms cubic-bezier(0.22,1,0.36,1), transform 480ms cubic-bezier(0.22,1,0.36,1)",
          background: "rgba(12, 22, 40, 0.92)",
          border: "1px solid rgba(213, 177, 111, 0.28)",
          boxShadow:
            "0 24px 56px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.06)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <PrayerCardFan />

        <p className="mt-5 text-[12px] font-medium tracking-[0.18em] text-[#bacce6]/65">
          ก่อนเปิดไพ่
        </p>
        <h2
          id={titleId}
          className="mt-1.5 text-[clamp(1.55rem,6.5vw,1.85rem)] font-bold leading-[1.25] tracking-tight"
          style={TITLE_GOLD}
        >
          หลับตาอธิษฐาน
        </h2>
        <p className="mx-auto mt-3 max-w-[17rem] text-[14px] font-medium leading-[1.7] text-[#f7f4ec]/78">
          หลับตานิ่งสักครู่ ตั้งจิตตามสิ่งที่อยากรู้ในวันนี้
          แล้วค่อยเปิดไพ่ด้วยใจสงบ
        </p>

        <button
          type="button"
          onClick={onReady}
          className="mae-gold-cta mt-6 inline-flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
        >
          พร้อมแล้ว · ไปเปิดไพ่
        </button>
      </div>
    </div>,
    host
  );
}
