"use client";

import { useState } from "react";
import { Heart, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FortunePaidHeader,
  FortunePaidLock,
} from "@/components/fortune/fortune-paid-lock";

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

const CONTENT = {
  single: [
    {
      quote: "ความสัมพันธ์ที่ดี คือพื้นที่ที่ทั้งสองคนยังเป็นตัวเองได้",
      desire: "คุณต้องการความเข้าใจที่จริงใจ และพื้นที่ปลอดภัยที่จะได้เป็นตัวเองโดยไม่ต้องแสดงบทบาท",
      adjust: "ลองเปิดใจคุยเรื่องความต้องการสั้น ๆ ให้ชัด และสังเกตคนที่ฟังคุณจริง ๆ",
    },
    {
      quote: "รักที่ดีเริ่มจากรู้จักจังหวะของตัวเอง",
      desire: "คุณอยากได้ความสัมพันธ์ที่นิ่ง พอมีที่ว่าง และไม่ต้องแข่งกันพิสูจน์คุณค่า",
      adjust: "ใช้เวลากับตัวเองให้พอ ก่อนเร่งเข้าสู่ความสัมพันธ์ใหม่",
    },
  ],
  coupled: [
    {
      quote: "ความสัมพันธ์ที่ดี คือพื้นที่ที่ทั้งสองคนยังเป็นตัวเองได้",
      desire: "คุณต้องการการสื่อสารที่ชัด และการได้รับการเห็นคุณค่าจากคู่โดยไม่ต้องเดา",
      adjust: "ลองนัดเวลาคุยสั้น ๆ รายสัปดาห์ และฟังอีกฝ่ายให้จบก่อนตอบ",
    },
    {
      quote: "ความใกล้ชิดเติบโตได้เมื่อทั้งคู่รู้สึกปลอดภัย",
      desire: "คุณอยากได้ความอบอุ่นที่สม่ำเสมอ มากกว่าโมเมนต์ใหญ่เป็นครั้งคราว",
      adjust: "ลดการสรุปจากความรู้สึกชั่วขณะ และใช้คำถามเปิดแทนการตัดสิน",
    },
  ],
} as const;

/** 06 ความรัก */
export function FortunePaidLove({
  seed = "dooduang",
  locked = false,
  onUnlock,
  className,
}: {
  seed?: string;
  locked?: boolean;
  onUnlock?: () => void;
  className?: string;
}) {
  const [mode, setMode] = useState<"single" | "coupled">("single");
  const pool = CONTENT[mode];
  const data = pool[hashSeed(`${seed}-love-${mode}`) % pool.length]!;

  return (
    <section
      className={cn(
        "fortune-dash-card fortune-frame-pink relative overflow-hidden rounded-[20px]",
        className
      )}
    >
      <FortunePaidHeader
        num="06"
        numClassName="text-pink-300"
        title="ความรัก — เข้าใจสิ่งที่ต้องการ"
        en="LOVE"
        aside="ความรักที่ดี เริ่มจากความเข้าใจตัวเอง"
      />

      <div className="grid gap-3 px-3.5 pb-3.5 pt-3 sm:grid-cols-[1fr_1.1fr]">
        <div
          className="relative overflow-hidden rounded-[16px] px-3.5 py-5"
          data-slot="paid-love-hero"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 60% at 70% 20%, rgba(244,114,182,0.22), transparent 55%), linear-gradient(165deg, rgba(28,12,40,0.95), rgba(8,10,28,0.97))",
            }}
          />
          <div className="relative">
            <span
              className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-pink-400/15 ring-1 ring-pink-300/30"
              data-slot="paid-love-moon"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path
                  d="M16 4.5A8 8 0 1 0 19.5 16 6.5 6.5 0 0 1 16 4.5Z"
                  fill="rgba(251,207,232,0.85)"
                />
              </svg>
            </span>
            <p className="text-[13px] font-semibold leading-snug text-white">
              “{data.quote}”
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3">
          <div
            className="mx-auto flex w-full max-w-[220px] rounded-full bg-white/[0.05] p-1 ring-1 ring-white/[0.08]"
            role="tablist"
            aria-label="สถานะความสัมพันธ์"
          >
            {(
              [
                { id: "single", label: "โสด" },
                { id: "coupled", label: "มีคู่" },
              ] as const
            ).map((t) => {
              const active = mode === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setMode(t.id)}
                  className={cn(
                    "flex-1 rounded-full py-1.5 text-[11.5px] font-semibold transition",
                    active
                      ? "bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-[0_0_14px_rgba(236,72,153,0.4)]"
                      : "text-white/45"
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <ul className="space-y-2.5">
            <li className="flex items-start gap-2.5">
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-pink-400/12 ring-1 ring-pink-400/30"
                data-slot="paid-love-desire-icon"
              >
                <Heart className="h-4 w-4 text-pink-300" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-pink-200">
                  ความต้องการลึก ๆ
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-white/52">
                  {data.desire}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-pink-400/12 ring-1 ring-pink-400/30"
                data-slot="paid-love-adjust-icon"
              >
                <Users className="h-4 w-4 text-pink-300" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-pink-200">
                  สิ่งที่ลองปรับได้
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-white/52">
                  {data.adjust}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {locked ? (
        <FortunePaidLock
          title="ความรักฉบับเต็ม"
          subtitle="ปลดล็อกเพื่อดูโสด / มีคู่ แบบละเอียด"
          onUnlock={onUnlock}
          accent="pink"
        />
      ) : null}
    </section>
  );
}
