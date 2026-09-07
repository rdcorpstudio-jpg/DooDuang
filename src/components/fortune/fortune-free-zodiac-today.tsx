"use client";

import { useMemo } from "react";
import { ChevronRight, Lock, Sparkles } from "lucide-react";
import {
  getZodiacByBirthDate,
  type ZodiacInfo,
} from "@/lib/fortune/zodiac";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

const TODAY_BY_ELEMENT: Record<
  string,
  Array<{ vibe: string; doToday: string; watch: string }>
> = {
  ไฟ: [
    {
      vibe: "วันนี้พลังพุ่ง เหมาะเริ่มเรื่องสำคัญและกล้าตัดสินใจ",
      doToday: "ลงมือกับงานหลัก 1 เรื่องให้เห็นรูป",
      watch: "อย่าใจร้อนจนข้ามรายละเอียด",
    },
    {
      vibe: "จังหวะดีสำหรับการนำทางและจุดประกายไอเดีย",
      doToday: "เสนอแนวทางสั้น ๆ ที่ทำได้ทันที",
      watch: "ระวังพูดแรงเกินไปโดยไม่ตั้งใจ",
    },
  ],
  ดิน: [
    {
      vibe: "วันนี้เหมาะจัดระบบ สร้างความมั่นคง และเก็บงานให้จบ",
      doToday: "ปิดงานค้างอย่างน้อย 1 รายการ",
      watch: "อย่าแบกทุกอย่างคนเดียวจนช้า",
    },
    {
      vibe: "พลังนิ่งช่วยให้วางแผนระยะสั้นได้ชัด",
      doToday: "เขียนลำดับความสำคัญของวันนี้",
      watch: "อย่ายึดแผนเดิมจนปรับไม่ได้",
    },
  ],
  ลม: [
    {
      vibe: "วันนี้เหมาะสื่อสาร แลกเปลี่ยน และเชื่อมคน",
      doToday: "คุยเรื่องสำคัญให้ชัด 1 ประโยค",
      watch: "อย่ากระจายโฟกัสไปหลายทางพร้อมกัน",
    },
    {
      vibe: "ไอเดียไหลดี แต่ควรเลือกทำทีละเรื่อง",
      doToday: "จดไอเดียแล้วเลือกทำแค่ 1 ข้อ",
      watch: "ระวังสัญญาเร็วเกินโดยยังไม่พร้อม",
    },
  ],
  น้ำ: [
    {
      vibe: "วันนี้ความรู้สึกคม เหมาะดูแลใจตัวเองและความสัมพันธ์",
      doToday: "เว้นเวลาเงียบ ๆ ให้ใจได้พัก",
      watch: "อย่าสรุปจากอารมณ์ชั่วขณะ",
    },
    {
      vibe: "สัญชาตญาณดี ใช้เลือกสิ่งที่สบายใจจริง",
      doToday: "ฟังตัวเองก่อนตอบรับภาระใหม่",
      watch: "ระวังรับพลังงานคนรอบข้างมากเกิน",
    },
  ],
};

/** Free: today's vibe by the user's sun sign */
export function FortuneFreeZodiacToday({
  birthDate,
  nickname,
  seed = "dooduang",
  unlocked = false,
  onUnlock,
  className,
}: {
  birthDate: string;
  nickname: string;
  seed?: string;
  unlocked?: boolean;
  onUnlock?: () => void;
  className?: string;
}) {
  const zodiac: ZodiacInfo = useMemo(
    () => getZodiacByBirthDate(birthDate),
    [birthDate]
  );

  const today = useMemo(() => {
    const pool = TODAY_BY_ELEMENT[zodiac.element] ?? TODAY_BY_ELEMENT["ดิน"]!;
    const i = hashSeed(`${seed}-zoday-${zodiac.id}`) % pool.length;
    return pool[i]!;
  }, [seed, zodiac.element, zodiac.id]);

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("th-TH", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }).format(new Date()),
    []
  );

  return (
    <section
      className={cn("overflow-hidden rounded-[20px] px-3.5 py-3.5", className)}
      style={{
        border: "1px solid transparent",
        backgroundImage: [
          "linear-gradient(160deg, rgba(18,29,54,0.78), rgba(36,24,64,0.7))",
          "linear-gradient(135deg, rgba(244,188,82,0.45), rgba(187,108,240,0.4) 50%, rgba(70,221,237,0.4))",
        ].join(", "),
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold tracking-wide text-[#F4BC52]">
            ราศีของคุณ · วันนี้
          </p>
          <h2 className="mt-1 text-[18px] font-semibold text-[#F7F8FF]">
            ราศี{zodiac.thaiName}{" "}
            <span className="text-[#F4BC52]">{zodiac.symbol}</span>
          </h2>
          <p className="mt-0.5 text-[12px] text-[#9AB8DC]">
            ธาตุ{zodiac.element} · {zodiac.dateRange}
          </p>
        </div>
        <div className="shrink-0 rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1 text-[11px] text-[#9AB8DC]">
          {dateLabel}
        </div>
      </div>

      <p className="mt-3 text-[15px] leading-[1.7] text-[#F7F8FF]/92">
        {nickname ? `${nickname} — ` : null}
        {today.vibe}
      </p>

      <div className="mt-3 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
        <div className="rounded-[14px] border border-[#46DDED]/25 bg-[#46DDED]/08 px-3 py-2.5">
          <p className="text-[11px] font-semibold text-[#46DDED]">วันนี้ลองทำ</p>
          <p className="mt-1 text-[13px] leading-[1.6] text-[#F7F8FF]/88">
            {today.doToday}
          </p>
        </div>
        <div className="rounded-[14px] border border-[#F16DB5]/25 bg-[#F16DB5]/08 px-3 py-2.5">
          <p className="text-[11px] font-semibold text-[#F16DB5]">ควรระวัง</p>
          <p className="mt-1 text-[13px] leading-[1.6] text-[#F7F8FF]/88">
            {today.watch}
          </p>
        </div>
      </div>

      {!unlocked ? (
        <button
          type="button"
          onClick={onUnlock}
          disabled={!onUnlock}
          className="mt-3 flex w-full items-center gap-2.5 rounded-[14px] border border-[#BB6CF0]/3 bg-[#BB6CF0]/1 px-3 py-2.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#BB6CF0]/45 disabled:opacity-60"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4BC52]/15 ring-1 ring-[#F4BC52]/4">
            <Lock className="h-3.5 w-3.5 text-[#F4BC52]" strokeWidth={1.9} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1 text-[13px] font-semibold text-[#F7F8FF]">
              <Sparkles className="h-3.5 w-3.5 text-[#BB6CF0]" />
              เจาะลึกดวงราศี{zodiac.thaiName}
            </span>
            <span className="mt-0.5 block text-[11px] text-[#9AB8DC]">
              บุคลิก · จุดเปลี่ยน · คำแนะนำเฉพาะราศี · {FORTUNE_UNLOCK_PRICE} บาท
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-[#BB6CF0]" strokeWidth={2.2} />
        </button>
      ) : null}
    </section>
  );
}
