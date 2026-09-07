"use client";

import { NotebookPen, Target } from "lucide-react";
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

const SETS = [
  {
    quote: "เงินที่จัดการได้ดี คือรากฐานของชีวิตที่มั่นคง",
    spend:
      "คุณมักใส่ใจรายละเอียด แต่รายจ่ายเล็ก ๆ ที่เกิดซ้ำอาจสะสมโดยไม่ทันสังเกต ลองจดสั้น ๆ สัปดาห์ละครั้ง",
    plan: "ตั้งงบสำรองฉุกเฉินก่อน แล้วค่อยแบ่งเงินสำหรับเป้าหมายระยะกลางที่ชัดเจน",
  },
  {
    quote: "ความมั่นคงเริ่มจากตัวเลขที่คุณกล้ามอง",
    spend:
      "จังหวะนี้เหมาะกับการรู้กระแสเงินเข้า–ออกให้ชัด มากกว่าการลงทุนเสี่ยงเพื่อผลเร็ว",
    plan: "เลือกเป้าหมายการเงินหนึ่งเรื่องในปีนี้ และตัดรายจ่ายที่ไม่สร้างคุณค่าออกทีละน้อย",
  },
] as const;

/** 05 การเงิน */
export function FortunePaidFinance({
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
  const data = SETS[hashSeed(`${seed}-finance`) % SETS.length]!;

  return (
    <section
      className={cn(
        "fortune-dash-card fortune-frame-gold relative overflow-hidden rounded-[20px]",
        className
      )}
    >
      <FortunePaidHeader
        num="05"
        numClassName="text-[#e8c547]"
        title="การเงิน — สร้างความมั่นคง"
        en="FINANCE"
        aside="ความมั่นคงทางการเงิน คืออิสระที่เลือกได้"
      />

      <div className="grid gap-3 px-3.5 pb-3.5 pt-3 sm:grid-cols-[1fr_1.15fr]">
        <div
          className="relative overflow-hidden rounded-[16px] px-3.5 py-5"
          data-slot="paid-finance-hero"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(80% 70% at 50% 30%, rgba(232,197,71,0.22), transparent 60%), linear-gradient(160deg, rgba(36,28,12,0.95), rgba(12,10,28,0.96))",
            }}
          />
          <div className="relative flex flex-col items-center text-center">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8c547]/12 ring-1 ring-[#e8c547]/35"
              data-slot="paid-finance-icon"
            >
              {/* coin stack placeholder */}
              <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden>
                <ellipse cx="20" cy="28" rx="12" ry="4" fill="rgba(232,197,71,0.35)" />
                <ellipse cx="20" cy="24" rx="10" ry="3.5" fill="rgba(232,197,71,0.55)" />
                <ellipse cx="20" cy="20" rx="10" ry="3.5" fill="rgba(250,220,120,0.7)" />
                <ellipse cx="20" cy="16" rx="10" ry="3.5" fill="rgba(232,197,71,0.85)" />
              </svg>
            </span>
            <p className="mt-3 text-[13px] font-semibold leading-snug text-white">
              {data.quote}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div className="fortune-dash-inset rounded-[14px] px-3 py-3">
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#e8c547]/12 ring-1 ring-[#e8c547]/30"
                data-slot="paid-finance-spend-icon"
              >
                <NotebookPen className="h-4 w-4 text-[#e8c547]" strokeWidth={1.8} />
              </span>
              <p className="text-[12px] font-semibold text-[#e8c547]">
                รูปแบบการใช้เงิน
              </p>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-white/52">
              {data.spend}
            </p>
          </div>

          <div className="fortune-dash-inset rounded-[14px] px-3 py-3">
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#e8c547]/12 ring-1 ring-[#e8c547]/30"
                data-slot="paid-finance-plan-icon"
              >
                <Target className="h-4 w-4 text-[#e8c547]" strokeWidth={1.8} />
              </span>
              <p className="text-[12px] font-semibold text-[#e8c547]">
                สิ่งที่ควรวางแผน
              </p>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-white/52">
              {data.plan}
            </p>
          </div>
        </div>
      </div>

      {locked ? (
        <FortunePaidLock
          title="การเงินฉบับเต็ม"
          subtitle="ปลดล็อกเพื่อดูรูปแบบและแผนเงิน"
          onUnlock={onUnlock}
          accent="gold"
        />
      ) : null}
    </section>
  );
}
