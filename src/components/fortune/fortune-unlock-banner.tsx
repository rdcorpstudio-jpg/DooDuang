"use client";

import {
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  Compass,
  Sparkles,
} from "lucide-react";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

const PREVIEW_BLOCKS = [
  {
    kicker: "ปฏิทิน",
    title: "ปฏิทินฤกษ์ 12 ปี",
    lines: [
      "วันพลังงานดี · วันธงชัย · วันโชคลาภ",
      "เลือกวันมงคลก่อนเริ่มเรื่องสำคัญ",
    ],
  },
  {
    kicker: "ราศี",
    title: "เจาะลึกราศีของคุณ",
    lines: [
      "บุคลิก · จุดแข็ง · จุดเปลี่ยนที่ควรจับตา",
      "คำแนะนำเฉพาะราศีให้ใช้ได้จริง",
    ],
  },
  {
    kicker: "02",
    title: "เส้นทางชีวิต 12 ปี",
    lines: [
      "พ.ศ. นี้ · จุดเปลี่ยนสำคัญของรอบชีวิต",
      "ภาพรวม · จุดเปลี่ยน · แนวทางพิจารณา",
    ],
  },
] as const;

const FEATURES = [
  {
    title: "ปฏิทินฤกษ์ 12 ปี",
    sub: "ดูวันมงคล พลังงาน และจุดที่ควรระวัง",
    Icon: Sparkles,
  },
  {
    title: "เจาะลึกราศีของคุณ",
    sub: "บุคลิก จุดเปลี่ยน และคำแนะนำเฉพาะราศี",
    Icon: Compass,
  },
  {
    title: "เส้นทางชีวิต 12 ปี",
    sub: "พร้อมคำอ่านและจุดเปลี่ยนรายปี",
    Icon: ChartNoAxesColumnIncreasing,
  },
] as const;

const LIST_PRICE = 699;
const SAVE = LIST_PRICE - FORTUNE_UNLOCK_PRICE;

/** Pricing card over blurred premium preview — gold premium tone */
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
    <section className={cn("relative overflow-hidden rounded-[24px]", className)}>
      {/* Short blurred peek — clipped so it doesn't leave empty navy */}
      <div
        className="pointer-events-none relative max-h-[5.75rem] select-none overflow-hidden px-3.5 pt-3"
        aria-hidden
      >
        <div className="space-y-2 blur-[3.5px] opacity-55">
          {PREVIEW_BLOCKS.slice(0, 2).map((block) => (
            <div
              key={block.kicker}
              className="rounded-[14px] border border-[#F4BC52]/16 px-3 py-2"
              style={{
                background:
                  "linear-gradient(145deg, rgba(244,188,82,0.1), rgba(187,108,240,0.08) 55%, rgba(244,188,82,0.06))",
              }}
            >
              <p className="text-center text-[11px] font-semibold text-[#F4BC52]/85">
                {block.kicker} {block.title}
              </p>
              <p className="mt-1 text-center text-[12px] leading-snug text-[#F7F8FF]/65">
                {block.lines[0]}
              </p>
            </div>
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(12,20,39,0.15) 0%, rgba(12,20,39,0.72) 45%, rgba(12,20,39,0.98) 100%)",
          }}
        />
      </div>

      {/* Pricing card — sit tight on the peek */}
      <div className="relative z-[1] -mt-8 px-3 pb-2 pt-0">
        <div
          className="relative overflow-hidden rounded-[22px] px-4 pb-4 pt-5"
          style={{
            border: "1px solid transparent",
            backgroundImage: [
              "linear-gradient(165deg, rgba(18,22,42,0.98) 0%, rgba(28,24,18,0.96) 42%, rgba(16,20,38,0.98) 100%)",
              "linear-gradient(145deg, rgba(255,230,170,0.95), rgba(244,188,82,0.85) 35%, rgba(184,120,40,0.75) 70%, rgba(244,188,82,0.9))",
            ].join(", "),
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            boxShadow:
              "inset 0 1px 0 rgba(255,236,190,0.35), 0 18px 44px rgba(8,4,16,0.55), 0 0 36px rgba(244,188,82,0.22)",
          }}
        >
          {/* Soft gold wash + sparkle dots */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background: [
                "radial-gradient(ellipse 90% 55% at 50% -10%, rgba(244,188,82,0.22), transparent 60%)",
                "radial-gradient(circle at 12% 78%, rgba(244,188,82,0.08), transparent 40%)",
                "radial-gradient(circle at 88% 30%, rgba(255,220,140,0.1), transparent 35%)",
              ].join(", "),
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(1.2px 1.2px at 18% 22%, rgba(255,236,190,0.7), transparent), radial-gradient(1px 1px at 72% 18%, rgba(244,188,82,0.65), transparent), radial-gradient(1px 1px at 40% 88%, rgba(255,236,190,0.5), transparent), radial-gradient(1.2px 1.2px at 86% 70%, rgba(244,188,82,0.55), transparent)",
            }}
          />

          <div className="relative z-[1]">
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-9 bg-gradient-to-r from-transparent via-[#F4BC52]/70 to-[#F4BC52]/90" />
              <div className="flex items-center gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/icons/star-gold.png"
                  alt=""
                  width={14}
                  height={14}
                  className="h-3.5 w-3.5 object-contain"
                  style={{ mixBlendMode: "screen" }}
                />
                <p
                  className="text-[13px] font-semibold tracking-[0.2em]"
                  style={{
                    background:
                      "linear-gradient(180deg, #FFF6D8 0%, #F4BC52 55%, #C9922E 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  ดวงพรีเมียม
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/icons/star-gold.png"
                  alt=""
                  width={14}
                  height={14}
                  className="h-3.5 w-3.5 object-contain"
                  style={{ mixBlendMode: "screen" }}
                />
              </div>
              <span className="h-px w-9 bg-gradient-to-l from-transparent via-[#F4BC52]/70 to-[#F4BC52]/90" />
            </div>

            <p className="mt-3 text-center text-[15px] text-[#9AB8DC]/55 line-through decoration-[#9AB8DC]/45">
              {LIST_PRICE} บาท
            </p>
            <p
              className="mt-0.5 text-center text-[46px] font-bold leading-none tracking-tight"
              style={{
                background:
                  "linear-gradient(180deg, #FFF8E4 8%, #F4BC52 48%, #D4A03A 78%, #B8862B 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 2px 10px rgba(244,188,82,0.35))",
              }}
            >
              {FORTUNE_UNLOCK_PRICE}.-
            </p>

            <div className="mt-2.5 flex justify-center">
              <span
                className="rounded-full px-3.5 py-1 text-[12px] font-semibold text-[#1A1208]"
                style={{
                  background:
                    "linear-gradient(135deg, #FFE7A8 0%, #F4BC52 45%, #D4A03A 100%)",
                  boxShadow:
                    "0 0 16px rgba(244,188,82,0.35), inset 0 1px 0 rgba(255,255,255,0.45)",
                }}
              >
                ประหยัด {SAVE} บาท
              </span>
            </div>

            <div
              className="mx-auto mt-4 h-px w-full max-w-[16rem]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(244,188,82,0.55), transparent)",
              }}
            />

            <ul className="mt-4 space-y-3.5">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background:
                        "linear-gradient(160deg, rgba(244,188,82,0.22), rgba(244,188,82,0.08))",
                      boxShadow:
                        "inset 0 0 0 1px rgba(244,188,82,0.45), 0 0 12px rgba(244,188,82,0.15)",
                    }}
                  >
                    <f.Icon
                      className="h-4 w-4 text-[#F4BC52]"
                      strokeWidth={1.8}
                    />
                  </span>
                  <div className="min-w-0 pt-0.5 text-left">
                    <p className="text-[14px] font-semibold text-[#F7F8FF]">
                      {f.title}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-snug text-[#9AB8DC]/75">
                      {f.sub}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={onUnlock}
              disabled={!onUnlock || unlocking}
              className="mt-5 inline-flex w-full items-center justify-center gap-1 rounded-full px-4 py-3.5 text-[15px] font-semibold outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#F4BC52]/55 disabled:opacity-60"
              style={{
                color: "#1A1208",
                background:
                  "linear-gradient(135deg, #FFF0C4 0%, #F4BC52 38%, #E0A83A 72%, #C9922E 100%)",
                boxShadow:
                  "0 12px 32px rgba(244,188,82,0.4), inset 0 1px 0 rgba(255,255,255,0.5)",
              }}
            >
              {unlocking
                ? "กำลังเปิด…"
                : `ปลดล็อกพรีเมียม ${FORTUNE_UNLOCK_PRICE} บาท`}
              {!unlocking ? (
                <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
              ) : null}
            </button>
            <a
              href="/premium"
              className="mt-2.5 block text-center text-[12px] text-[#F4BC52]/85 underline-offset-2 hover:underline"
            >
              ดูรายละเอียดพรีเมียม
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
