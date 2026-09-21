"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import {
  bangkokTodayKey,
  defaultTarotDailySeed,
  resolveOpenedDailyTarot,
} from "@/lib/fortune/tarot-day-storage";
import { tarotCardImageSrc } from "@/lib/fortune/tarot-deck";
import { MAE_GLASS } from "@/lib/mae-glass";

const GOLD = "#e8d19a";
const GOLD_SOFT = "#efc36c";
const TEXT = "rgba(240,244,250,0.92)";
const MUTED = "rgba(186,204,230,0.82)";
const GLASS = MAE_GLASS;

type Draw = NonNullable<ReturnType<typeof resolveOpenedDailyTarot>>;

/**
 * Home block under ฤกษ์วันนี้ — today's opened tarot + meaning,
 * or CTA to draw.
 */
export function HomeDailyTarotCard() {
  const [draw, setDraw] = useState<Draw | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      const dayKey = bangkokTodayKey();
      setDraw(resolveOpenedDailyTarot(defaultTarotDailySeed(dayKey), dayKey));
      setReady(true);
    };
    sync();
    const onVis = () => {
      if (document.visibilityState === "visible") sync();
    };
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", onVis);
    const id = window.setInterval(sync, 20_000);
    return () => {
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", onVis);
      window.clearInterval(id);
    };
  }, []);

  if (!ready) return null;

  if (!draw) {
    return (
      <Link
        href="/reading/tarot"
        className="flex items-center gap-3.5 rounded-[22px] px-4 py-4 outline-none transition active:scale-[0.99]"
        style={{
          background: GLASS.bgSoft,
          boxShadow: "0 14px 32px rgba(0,0,0,0.28)",
          backdropFilter: GLASS.blur,
          WebkitBackdropFilter: GLASS.blur,
        }}
      >
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]"
          style={{
            color: GOLD,
            background: "rgba(8,14,28,0.5)",
            boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.4)",
          }}
        >
          <Sparkles className="h-5 w-5" strokeWidth={2.1} />
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-[16px] font-bold leading-tight text-white">
            ไพ่ประจำวัน
          </span>
          <span
            className="mt-1 block text-[15px] font-medium leading-snug"
            style={{ color: MUTED }}
          >
            ยังไม่ได้จั่ววันนี้ · แตะเพื่อเปิดไพ่
          </span>
        </span>
        <ChevronRight
          className="h-5 w-5 shrink-0 opacity-70"
          style={{ color: GOLD_SOFT }}
          strokeWidth={2.3}
        />
      </Link>
    );
  }

  const { card, upright, side } = draw;
  const title = upright ? card.nameTh : `${card.nameTh} · กลับหัว`;

  return (
    <Link
      href="/reading/tarot"
      className="group relative block overflow-hidden rounded-[26px] px-5 pb-6 pt-5 text-center outline-none transition active:scale-[0.99]"
      style={{
        background:
          "linear-gradient(165deg, rgba(14,30,58,0.72) 0%, rgba(6,14,30,0.55) 100%)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.3)",
        backdropFilter: "blur(16px) saturate(1.1)",
        WebkitBackdropFilter: "blur(16px) saturate(1.1)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28"
        style={{
          background:
            "radial-gradient(ellipse 70% 100% at 50% 0%, rgba(232,209,154,0.16), transparent 72%)",
        }}
      />

      <p
        className="relative text-[15px] font-semibold tracking-[0.18em]"
        style={{ color: GOLD }}
      >
        ไพ่ประจำวัน
      </p>

      <div className="relative mx-auto mt-4 w-fit">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[11rem] w-[11rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(232,209,154,0.18) 0%, transparent 68%)",
          }}
        />
        {/* กรอบเหลี่ยมทอง — เล็กลงจากเดิม */}
        <div
          className="relative p-[2.5px]"
          style={{
            background:
              "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)",
            boxShadow:
              "0 14px 32px rgba(0,0,0,0.4), 0 0 18px rgba(232,209,154,0.18)",
          }}
        >
          <div
            className="relative w-[7.75rem] overflow-hidden bg-[#0a1424] sm:w-[8.25rem]"
            style={{
              aspectRatio: "840 / 1455",
              transform: upright ? undefined : "rotate(180deg)",
            }}
          >
            <Image
              src={tarotCardImageSrc(card)}
              alt={title}
              fill
              unoptimized
              className="object-cover object-center transition duration-500 group-hover:scale-[1.02]"
              sizes="132px"
            />
          </div>
        </div>
      </div>

      <h3
        className="mae-gold-text relative mt-5 text-[1.45rem] font-bold leading-[1.3]"
        style={{
          paddingTop: "0.06em",
          paddingBottom: "0.04em",
        }}
      >
        {title}
      </h3>

      <p
        className="relative mx-auto mt-3 max-w-[19.5rem] text-[15px] font-medium leading-[1.6]"
        style={{ color: TEXT }}
      >
        {side.summary}
      </p>

      <span
        className="relative mt-5 inline-flex items-center gap-1 rounded-full px-4 py-[0.45em] text-[15px] font-semibold leading-none transition group-hover:brightness-110"
        style={{
          color: GOLD_SOFT,
          background: "rgba(8,16,32,0.5)",
          boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.35)",
        }}
      >
        ดูไพ่อีกครั้ง
        <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
      </span>
    </Link>
  );
}
