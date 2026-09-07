"use client";

import { Briefcase, CheckCircle2, SquareCheck } from "lucide-react";
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
    quote: "วางบทบาทให้ชัด โฟกัสสิ่งที่สำคัญ แล้วความสำเร็จจะตามมา",
    items: [
      {
        id: "situation",
        title: "สถานการณ์",
        body: "งานอาจมีหลายแนวเข้ามาพร้อมกัน จังหวะนี้เหมาะกับการจัดลำดับก่อนลงมือ",
        Icon: Briefcase,
      },
      {
        id: "opportunity",
        title: "โอกาสที่ควรใช้",
        body: "งานที่ให้คุณได้โชว์ความรับผิดชอบและความละเอียด จะถูกมองเห็นชัดขึ้น",
        Icon: SquareCheck,
      },
      {
        id: "handle",
        title: "แนวทางรับมือ",
        body: "เลือกเป้าหมายหลักวันละหนึ่งเรื่อง แล้วปิดงานค้างก่อนเปิดแนวใหม่",
        Icon: CheckCircle2,
      },
    ],
  },
  {
    quote: "ทำงานด้วยทิศทาง ดีกว่าทำงานด้วยความเร่ง",
    items: [
      {
        id: "situation",
        title: "สถานการณ์",
        body: "พลังงานงานนิ่งพอสำหรับวางระบบและสร้างผลงานระยะกลาง",
        Icon: Briefcase,
      },
      {
        id: "opportunity",
        title: "โอกาสที่ควรใช้",
        body: "การอัปสกิลเล็ก ๆ และการสื่อสารกับทีมจะเปิดทางให้คุณก้าวต่อ",
        Icon: SquareCheck,
      },
      {
        id: "handle",
        title: "แนวทางรับมือ",
        body: "ตั้งเกณฑ์ความสำเร็จที่วัดได้ และทบทวนสัปดาห์ละครั้ง",
        Icon: CheckCircle2,
      },
    ],
  },
] as const;

/** 04 การงาน */
export function FortunePaidCareer({
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
  const data = SETS[hashSeed(`${seed}-career`) % SETS.length]!;

  return (
    <section
      className={cn(
        "fortune-dash-card fortune-frame-sky relative overflow-hidden rounded-[20px]",
        className
      )}
    >
      <FortunePaidHeader
        num="04"
        numClassName="text-sky-300"
        title="การงาน — เติบโตอย่างมีทิศทาง"
        en="CAREER"
        aside="งานที่ใช่ ไม่ใช่แค่ทำได้ แต่ทำแล้วมีความหมาย"
      />

      <div className="grid gap-3 px-3.5 pb-3.5 pt-3 sm:grid-cols-[0.9fr_1.2fr_0.55fr]">
        {/* Hero art + quote */}
        <div
          className="relative overflow-hidden rounded-[16px] px-3.5 py-4"
          data-slot="paid-career-hero"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(90% 80% at 50% 20%, rgba(56,189,248,0.18), transparent 55%), linear-gradient(165deg, rgba(12,18,40,0.95), rgba(20,24,56,0.92))",
            }}
          />
          <div className="relative flex flex-col items-center text-center">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-400/10 ring-1 ring-sky-300/25"
              data-slot="paid-career-icon"
            >
              <Briefcase className="h-7 w-7 text-sky-300" strokeWidth={1.6} />
            </span>
            <p className="mt-3 text-[13px] font-semibold leading-snug text-white">
              “{data.quote}”
            </p>
          </div>
        </div>

        <ul className="flex flex-col justify-center gap-2.5">
          {data.items.map((item) => (
            <li key={item.id} className="flex items-start gap-2.5">
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#e8c547]/10 ring-1 ring-[#e8c547]/30"
                data-slot={`paid-career-row-${item.id}`}
              >
                <item.Icon className="h-4 w-4 text-[#e8c547]" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[#e8c547]">{item.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-white/52">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* Side art placeholder */}
        <div
          className="relative hidden min-h-[140px] overflow-hidden rounded-[16px] sm:block"
          data-slot="paid-career-side-art"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(30,40,90,0.9), rgba(8,10,28,0.98)), radial-gradient(circle at 50% 20%, rgba(232,197,71,0.2), transparent 55%)",
            }}
          />
          <p className="absolute inset-x-2 bottom-3 text-center text-[9px] font-semibold tracking-[0.12em] text-white/55">
            GOOD WORK
            <br />
            BRIGHTER YOU
          </p>
        </div>
      </div>

      {locked ? (
        <FortunePaidLock
          title="การงานฉบับเต็ม"
          subtitle="ปลดล็อกเพื่อดูสถานการณ์และแนวทาง"
          onUnlock={onUnlock}
          accent="sky"
        />
      ) : null}
    </section>
  );
}
