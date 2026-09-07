"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Compass, Lock, Sparkles, Target } from "lucide-react";
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

const DEEP_BY_ELEMENT: Record<
  string,
  {
    personality: string;
    strength: string;
    turning: string;
    advice: string;
  }
> = {
  ไฟ: {
    personality:
      "คุณมีพลังขับเคลื่อนสูง ชอบเริ่มต้นและเห็นผลเร็ว จุดศูนย์กลางคือความกล้าตัดสินใจ",
    strength: "นำทางได้ดี · จุดประกายคนรอบข้าง · ลงมือเร็วเมื่อเป้าหมายชัด",
    turning:
      "จุดเปลี่ยนมาเมื่อคุณเลือกโฟกัสเรื่องหลักแทนการไล่ทุกโอกาสพร้อมกัน",
    advice: "ตั้งเกณฑ์สั้น ๆ ก่อนรับงานใหม่ และเว้นจังหวะพักเพื่อไม่ให้ไฟไหม้ตัวเอง",
  },
  ดิน: {
    personality:
      "คุณสร้างความมั่นคงด้วยวินัยและรายละเอียด เชื่อในสิ่งที่ลงมือทำซ้ำจนเห็นรูป",
    strength: "วางแผนเก่ง · รับผิดชอบสูง · ทำให้สิ่งสำคัญจบได้จริง",
    turning:
      "จุดเปลี่ยนมาเมื่อยอมปรับแผนที่ยึดไว้ เพื่อให้ระบบใหม่ทำงานได้ลื่นขึ้น",
    advice: "แบ่งงานที่คนอื่นช่วยได้ และอย่าเก็บมาตรฐานไว้คนเดียวจนช้า",
  },
  ลม: {
    personality:
      "คุณเชื่อมไอเดียและผู้คนเก่ง สื่อสารชัดเมื่อใจนิ่ง และชอบเรียนรู้สิ่งใหม่",
    strength: "คิดไว · เชื่อมเครือข่าย · มองหลายมุมได้เร็ว",
    turning:
      "จุดเปลี่ยนมาเมื่อเลือกทำ 1 แนวทางจนเห็นผล แทนการเปิดหลายแนวพร้อมกัน",
    advice: "จดไอเดียแล้วคัดเหลือข้อหลัก แล้วปิดให้จบก่อนเปิดเรื่องใหม่",
  },
  น้ำ: {
    personality:
      "คุณอ่านบรรยากาศและความรู้สึกได้ละเอียด สัญชาตญาณคมเมื่อมีเวลาเงียบให้ใจ",
    strength: "เข้าใจคน · โอบอุ้มได้ · เลือกทางที่สอดคล้องใจได้ดี",
    turning:
      "จุดเปลี่ยนมาเมื่อแยกความรู้สึกชั่วขณะออกจากข้อตัดสินใจระยะยาว",
    advice: "ตั้งขอบเขตอารมณ์ก่อนตอบรับภาระ และพักให้พอหลังรับพลังงานคนอื่น",
  },
};

/** Free: today's vibe. Premium deep: unlocked zodiac profile. */
export function FortuneFreeZodiacToday({
  birthDate,
  nickname,
  seed = "dooduang",
  unlocked = false,
  deep = false,
  onUnlock,
  className,
}: {
  birthDate: string;
  nickname: string;
  seed?: string;
  unlocked?: boolean;
  /** Premium page: show deep zodiac analysis (unlocked content) */
  deep?: boolean;
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

  const deepCopy = DEEP_BY_ELEMENT[zodiac.element] ?? DEEP_BY_ELEMENT["ดิน"]!;

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
      className={cn(
        "fortune-glass overflow-hidden rounded-[20px] px-3.5 py-3.5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mt-1 text-[12px] font-semibold tracking-wide text-[#F4BC52]">
            {deep ? "เจาะลึกราศี · พรีเมียม" : "ราศีของคุณ · วันนี้"}
          </p>
          <h2 className="font-sacred mt-1 text-[1.35rem] font-normal tracking-wide text-[#F7F8FF]">
            ราศี{zodiac.thaiName}
          </h2>
          <p className="mt-0.5 text-[12px] text-[#C8D8EF]">
            ธาตุ{zodiac.element} · {zodiac.dateRange}
          </p>
        </div>
        <div className="shrink-0 rounded-full border border-white/15 bg-white/[0.08] px-2.5 py-1 text-[11px] text-[#D5E4F7]">
          {dateLabel}
        </div>
      </div>

      <p className="mt-3 text-[15px] leading-[1.75] text-[#F7F8FF]">
        {nickname ? `${nickname} — ` : null}
        {today.vibe}
      </p>

      <div className="mt-3 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
        <div className="fortune-glass-inset rounded-[14px] px-3 py-2.5">
          <p className="text-[11px] font-semibold text-[#46DDED]">วันนี้ลองทำ</p>
          <p className="mt-1 text-[13px] leading-[1.65] text-[#F7F8FF]">
            {today.doToday}
          </p>
        </div>
        <div className="fortune-glass-inset rounded-[14px] px-3 py-2.5">
          <p className="text-[11px] font-semibold text-[#F16DB5]">ควรระวัง</p>
          <p className="mt-1 text-[13px] leading-[1.65] text-[#F7F8FF]">
            {today.watch}
          </p>
        </div>
      </div>

      {deep ? (
        <div className="mt-3 space-y-2.5">
          <div className="fortune-surface rounded-[14px] px-3 py-3">
            <div className="flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-[#F4BC52]" strokeWidth={1.8} />
              <p className="text-[12px] font-semibold text-[#F4BC52]">
                บุคลิกของราศี{zodiac.thaiName}
              </p>
            </div>
            <p className="mt-1.5 text-[13px] leading-[1.7] text-[#E8EEF8]">
              {deepCopy.personality}
            </p>
          </div>
          <div className="fortune-surface rounded-[14px] px-3 py-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#46DDED]" strokeWidth={1.8} />
              <p className="text-[12px] font-semibold text-[#46DDED]">
                จุดแข็งที่ควรใช้ให้เต็มที่
              </p>
            </div>
            <p className="mt-1.5 text-[13px] leading-[1.7] text-[#E8EEF8]">
              {deepCopy.strength}
            </p>
          </div>
          <div className="fortune-surface rounded-[14px] px-3 py-3">
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-[#BB6CF0]" strokeWidth={1.8} />
              <p className="text-[12px] font-semibold text-[#BB6CF0]">จุดเปลี่ยน</p>
            </div>
            <p className="mt-1.5 text-[13px] leading-[1.7] text-[#E8EEF8]">
              {deepCopy.turning}
            </p>
          </div>
          <div className="rounded-[14px] bg-[#F4BC52]/12 px-3 py-3 ring-1 ring-[#F4BC52]/3">
            <p className="text-[12px] font-semibold text-[#F4BC52]">
              คำแนะนำเฉพาะราศี
            </p>
            <p className="mt-1.5 text-[13px] leading-[1.7] text-[#F7F8FF]">
              {deepCopy.advice}
            </p>
          </div>
        </div>
      ) : unlocked ? (
        <Link
          href="/premium"
          className="mt-3 flex w-full items-center gap-2.5 rounded-[14px] border border-[#F4BC52]/3 bg-[#F4BC52]/12 px-3 py-2.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#F4BC52]/45"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4BC52]/15 ring-1 ring-[#F4BC52]/4">
            <Sparkles className="h-3.5 w-3.5 text-[#F4BC52]" strokeWidth={1.9} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-[#F7F8FF]">
              เปิดเจาะลึกดวงราศี{zodiac.thaiName}
            </span>
            <span className="mt-0.5 block text-[11px] text-[#C8D8EF]">
              ปลดล็อกแล้ว · อ่านบุคลิก จุดเปลี่ยน และคำแนะนำที่แท็บพรีเมียม
            </span>
          </span>
          <ChevronRight
            className="h-4 w-4 shrink-0 text-[#F4BC52]"
            strokeWidth={2.2}
          />
        </Link>
      ) : (
        <button
          type="button"
          onClick={onUnlock}
          disabled={!onUnlock}
          className="mt-3 flex w-full items-center gap-2.5 rounded-[14px] border border-[#BB6CF0]/35 bg-[#F4BC52]/12 px-3 py-2.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#BB6CF0]/45 disabled:opacity-60"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4BC52]/15 ring-1 ring-[#F4BC52]/4">
            <Lock className="h-3.5 w-3.5 text-[#F4BC52]" strokeWidth={1.9} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1 text-[13px] font-semibold text-[#F7F8FF]">
              <Sparkles className="h-3.5 w-3.5 text-[#BB6CF0]" />
              ปลดล็อกเจาะลึกดวงราศี{zodiac.thaiName}
            </span>
            <span className="mt-0.5 block text-[11px] text-[#C8D8EF]">
              บุคลิก · จุดเปลี่ยน · คำแนะนำเฉพาะราศี · {FORTUNE_UNLOCK_PRICE} บาท
            </span>
          </span>
          <ChevronRight
            className="h-4 w-4 shrink-0 text-[#BB6CF0]"
            strokeWidth={2.2}
          />
        </button>
      )}
    </section>
  );
}
