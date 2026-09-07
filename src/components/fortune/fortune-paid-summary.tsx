"use client";

import { BookOpen, Crown, Lock, Target } from "lucide-react";
import { cn } from "@/lib/utils";

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

const QUOTES = [
  {
    quote: "เติบโตได้ไกล เมื่อเลิกแบกทุกอย่างไว้คนเดียว",
    body: "คุณมีพลังวางแผนและรับผิดชอบสูง แต่ช่วงนี้จักรวาลชวนให้แบ่งภาระ เปิดรับความช่วยเหลือ และโฟกัสสิ่งที่สำคัญจริง ๆ",
  },
  {
    quote: "จังหวะดีเริ่มจากใจที่ว่างพอจะเลือก",
    body: "พลังงานช่วงนี้เหมาะกับการจัดลำดับใหม่ ปล่อยสิ่งที่ไม่จำเป็นออกไป แล้วเปิดพื้นที่ให้โอกาสที่ใช่เข้ามา",
  },
  {
    quote: "ความนิ่งของคุณ คือพลังที่พาไปได้ไกล",
    body: "คุณมีจุดแข็งเรื่องความอดทนและการสังเกต ใช้ความนิ่งนี้ตัดสินใจช้า ๆ แต่ชัด แล้วผลจะตามมาเอง",
  },
] as const;

const INSIGHT_SETS = [
  [
    {
      id: "strength",
      title: "จุดแข็ง",
      body: "วางแผนเก่ง · รับผิดชอบสูง · ใส่ใจรายละเอียด",
      Icon: Crown,
      tone: "text-[#e8c547]",
      ring: "ring-[#e8c547]/35",
      bg: "bg-[#e8c547]/12",
    },
    {
      id: "lesson",
      title: "บทเรียน",
      body: "อย่าแบกทุกอย่างคนเดียว · เรียนรู้การปล่อยวาง",
      Icon: BookOpen,
      tone: "text-sky-300",
      ring: "ring-sky-400/35",
      bg: "bg-sky-400/12",
    },
    {
      id: "focus",
      title: "โฟกัส",
      body: "เลือกเป้าหมายหลักหนึ่งเรื่อง แล้วลงมือให้จบ",
      Icon: Target,
      tone: "text-pink-300",
      ring: "ring-pink-400/35",
      bg: "bg-pink-400/12",
    },
  ],
  [
    {
      id: "strength",
      title: "จุดแข็ง",
      body: "สื่อสารชัด · ใจร้อนแต่ตั้งใจ · มีแรงบันดาลใจ",
      Icon: Crown,
      tone: "text-[#e8c547]",
      ring: "ring-[#e8c547]/35",
      bg: "bg-[#e8c547]/12",
    },
    {
      id: "lesson",
      title: "บทเรียน",
      body: "ชะลอความเร่งรีบ · ให้เวลากับการฟัง",
      Icon: BookOpen,
      tone: "text-sky-300",
      ring: "ring-sky-400/35",
      bg: "bg-sky-400/12",
    },
    {
      id: "focus",
      title: "โฟกัส",
      body: "สร้างวินัยเล็ก ๆ ที่ทำซ้ำได้ทุกวัน",
      Icon: Target,
      tone: "text-pink-300",
      ring: "ring-pink-400/35",
      bg: "bg-pink-400/12",
    },
  ],
] as const;

/** 01 บทสรุปเฉพาะคุณ — paid block (images via data-slot placeholders) */
export function FortunePaidSummary({
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
  const quote = QUOTES[hashSeed(`${seed}-quote`) % QUOTES.length]!;
  const insights = INSIGHT_SETS[hashSeed(`${seed}-insights`) % INSIGHT_SETS.length]!;

  return (
    <section
      className={cn(
        "fortune-dash-card fortune-frame-violet relative overflow-hidden rounded-[20px]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 px-3.5 pt-3.5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-wide text-white">
            <span className="text-[#e8c547]">01</span> บทสรุปเฉพาะคุณ
          </p>
          <p className="mt-0.5 text-[9.5px] tracking-[0.16em] text-white/35">
            YOUR SUMMARY
          </p>
        </div>
        <p className="font-sacred shrink-0 pt-0.5 text-[13px] text-[#e8c547]/75">
          A Brighter You
        </p>
      </div>

      <div className="mt-3 grid gap-3 px-3.5 pb-3.5 sm:grid-cols-[1.15fr_0.95fr]">
        {/* Quote panel — swap bg image later via data-slot */}
        <div
          className="relative overflow-hidden rounded-[16px] px-3.5 py-3.5"
          data-slot="paid-summary-quote-bg"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 20% 10%, rgba(88,50,160,0.55), transparent 55%), linear-gradient(165deg, rgba(12,10,36,0.92), rgba(28,18,64,0.88) 55%, rgba(8,10,28,0.95))",
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#07061a]/80 to-transparent" />
          <div className="relative">
            <p className="text-[15px] font-semibold leading-snug text-white">
              “{quote.quote}”
            </p>
            <p className="mt-2.5 text-[12px] leading-relaxed text-white/55">
              {quote.body}
            </p>
          </div>
        </div>

        <ul className="flex flex-col justify-center gap-2.5">
          {insights.map((item) => (
            <li key={item.id} className="flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1",
                  item.bg,
                  item.ring
                )}
                data-slot={`paid-summary-icon-${item.id}`}
              >
                <item.Icon className={cn("h-4 w-4", item.tone)} strokeWidth={1.8} />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-[12.5px] font-semibold text-white">{item.title}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-white/50">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {locked ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#07061a]/72 px-4 backdrop-blur-[6px]">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8c547]/15 ring-1 ring-[#e8c547]/45">
            <Lock className="h-5 w-5 text-[#e8c547]" strokeWidth={1.9} />
          </span>
          <p className="mt-2.5 text-[13px] font-semibold text-white">เนื้อหาฉบับเต็ม</p>
          <p className="mt-1 text-center text-[11px] text-white/50">
            ปลดล็อกเพื่ออ่านบทสรุปเฉพาะคุณ
          </p>
          {onUnlock ? (
            <button
              type="button"
              onClick={onUnlock}
              className="mt-3 rounded-full bg-gradient-to-r from-[#a855f7] to-[#7c3aed] px-4 py-2 text-[12px] font-semibold text-white"
            >
              ปลดล็อก
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
