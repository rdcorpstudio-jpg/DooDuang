"use client";

import {
  BarChart3,
  Beaker,
  Flag,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FortunePaidHeader,
  FortunePaidLock,
} from "@/components/fortune/fortune-paid-lock";

const QUARTERS = [
  {
    id: "q1",
    label: "ไตรมาส 1",
    title: "ทบทวนเป้าหมาย",
    body: "จัดลำดับสิ่งสำคัญใหม่ และปล่อยสิ่งที่ไม่จำเป็นออกจากแผนปีนี้",
    Icon: Leaf,
    tone: "text-emerald-300",
    ring: "ring-emerald-400/40",
    bg: "bg-emerald-400/12",
    dot: "bg-emerald-300",
  },
  {
    id: "q2",
    label: "ไตรมาส 2",
    title: "ทดลองทางเลือก",
    body: "ลองแนวทางเล็ก ๆ สองสามแบบ แล้วเก็บข้อมูลว่าอะไรเข้ากับจังหวะคุณ",
    Icon: Beaker,
    tone: "text-sky-300",
    ring: "ring-sky-400/40",
    bg: "bg-sky-400/12",
    dot: "bg-sky-300",
  },
  {
    id: "q3",
    label: "ไตรมาส 3",
    title: "ขยายสิ่งที่ได้ผล",
    body: "โฟกัสสิ่งที่พิสูจน์แล้วว่าเวิร์ก แล้วขยายผลอย่างมีวินัย",
    Icon: BarChart3,
    tone: "text-[#e8c547]",
    ring: "ring-[#e8c547]/40",
    bg: "bg-[#e8c547]/12",
    dot: "bg-[#e8c547]",
  },
  {
    id: "q4",
    label: "ไตรมาส 4",
    title: "สรุปและปรับแผน",
    body: "ปิดรอบปีด้วยการสรุปบทเรียน แล้วตั้งแผนรอบใหม่ที่เบาและชัดขึ้น",
    Icon: Flag,
    tone: "text-pink-300",
    ring: "ring-pink-400/40",
    bg: "bg-pink-400/12",
    dot: "bg-pink-300",
  },
] as const;

/** 03 จังหวะสำคัญในปีนี้ */
export function FortuneKeyMoments({
  locked = false,
  onUnlock,
  className,
}: {
  locked?: boolean;
  onUnlock?: () => void;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "fortune-dash-card fortune-frame-violet relative overflow-hidden rounded-[20px]",
        className
      )}
    >
      <FortunePaidHeader
        num="03"
        numClassName="text-[#c4b5fd]"
        title="จังหวะสำคัญในปีนี้"
        en="KEY MOMENTS"
        aside="สิ่งดี ๆ มักเกิดขึ้น เมื่อคุณพร้อม"
      />

      <div className="relative px-3.5 pb-3.5 pt-4">
        {/* connector line (desktop) */}
        <div className="pointer-events-none absolute left-[14%] right-[14%] top-[52px] hidden h-px bg-gradient-to-r from-emerald-400/30 via-white/15 to-pink-400/30 sm:block" />

        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-2">
          {QUARTERS.map((q, i) => (
            <li key={q.id} className="relative flex flex-col items-center text-center">
              <span
                className={cn(
                  "relative z-[1] flex h-11 w-11 items-center justify-center rounded-full ring-1",
                  q.bg,
                  q.ring
                )}
                data-slot={`paid-moment-icon-${q.id}`}
              >
                <q.Icon className={cn("h-5 w-5", q.tone)} strokeWidth={1.8} />
              </span>
              {i < QUARTERS.length - 1 ? (
                <span
                  className={cn(
                    "absolute right-[-10%] top-[20px] hidden h-1.5 w-1.5 rounded-full sm:block",
                    q.dot,
                    "opacity-50"
                  )}
                />
              ) : null}
              <p className="mt-2.5 text-[11px] font-semibold leading-snug text-white">
                {q.label} — {q.title}
              </p>
              <p className="mt-1 text-[10.5px] leading-relaxed text-white/48">
                {q.body}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {locked ? (
        <FortunePaidLock
          title="จังหวะสำคัญในปีนี้"
          subtitle="ปลดล็อกเพื่อดูไทม์ไลน์ไตรมาส"
          onUnlock={onUnlock}
          accent="gold"
        />
      ) : null}
    </section>
  );
}
