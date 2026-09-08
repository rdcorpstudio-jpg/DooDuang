"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
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
        "fortune-glass relative overflow-hidden rounded-[20px] px-4 py-4",
        className
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-2 top-6 select-none text-[8rem] leading-none text-[#7B6BB0]/[0.08]"
      >
        {zodiac.symbol}
      </span>

      <div className="relative z-[1] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FortuneIcon name="sparkle" size={24} />
          <p className="text-[15px] font-semibold text-[#2C2458]">
            {deep ? "เจาะลึกราศี · พรีเมียม" : "ดวงของคุณวันนี้"}
          </p>
        </div>
        <div className="shrink-0 rounded-full bg-white/55 px-3 py-1.5 text-[12px] text-[#5E5688] ring-1 ring-[#7B6BB0]/15">
          {dateLabel}
        </div>
      </div>

      <div className="relative z-[1] mt-4 flex items-center gap-3.5">
        <span className="relative flex h-14 w-14 shrink-0 items-center justify-center">
          {zodiac.id === "virgo" ? (
            <FortuneIcon name="virgo" size={56} />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#B9A4F0]/35 text-[1.7rem] text-[#3A2F6B] ring-1 ring-[#B9A4F0]/45">
              {zodiac.symbol}
            </span>
          )}
        </span>
        <div className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-wide text-[#2C2458]">
            ราศี{zodiac.thaiName}
          </h2>
          <p className="mt-1 text-[13px] text-[#5E5688]">
            ธาตุ{zodiac.element} · {zodiac.dateRange}
          </p>
        </div>
      </div>

      <p className="relative z-[1] mt-4 text-[16px] font-medium leading-[1.7] text-[#2C2458]">
        {nickname
          ? `คุณ${nickname.replace(/^คุณ\s*/, "").trim()} — `
          : "คุณ — "}
        {today.vibe}
      </p>

      <div className="relative z-[1] mt-3.5 space-y-2.5 border-t border-[#7B6BB0]/15 pt-3.5 text-[15px] leading-[1.65] text-[#4A4278]">
        <p className="flex items-start gap-2.5">
          <FortuneIcon name="check" size={28} className="mt-0.5 shrink-0" />
          <span>
            <span className="font-semibold text-[#2C2458]">ทำ · </span>
            {today.doToday}
          </span>
        </p>
        <p className="flex items-start gap-2.5">
          <FortuneIcon name="warning" size={28} className="mt-0.5 shrink-0" />
          <span>
            <span className="font-semibold text-[#2C2458]">ระวัง · </span>
            {today.watch}
          </span>
        </p>
      </div>

      {deep ? (
        <div className="mt-4 border-t border-white/[0.08] pt-4">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[#E4C56A]/85">
                บุคลิก
              </p>
              <p className="mt-1.5 text-[13px] leading-[1.75] text-[#E8EEF8]">
                {deepCopy.personality}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[#E4C56A]/85">
                จุดแข็ง
              </p>
              <p className="mt-1.5 text-[13px] leading-[1.75] text-[#E8EEF8]">
                {deepCopy.strength}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[#E4C56A]/85">
                จุดเปลี่ยน
              </p>
              <p className="mt-1.5 text-[13px] leading-[1.75] text-[#E8EEF8]">
                {deepCopy.turning}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-white/[0.08] pt-3.5">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#E4C56A]">
              คำแนะนำ
            </p>
            <p className="mt-1.5 text-[14px] font-medium leading-[1.7] text-[#F7F8FF]">
              {deepCopy.advice}
            </p>
          </div>
        </div>
      ) : unlocked ? (
        <Link
          href="/premium"
          className="mt-4 flex w-full items-center gap-3 rounded-[16px] border border-[#7B6BB0]/15 bg-white/45 px-3.5 py-3 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/35"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center">
            <FortuneIcon name="sparkle" size={36} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold text-[#2C2458]">
              เปิดเจาะลึกดวงราศี{zodiac.thaiName}
            </span>
            <span className="mt-0.5 block text-[12px] text-[#5E5688]">
              ปลดล็อกแล้ว · อ่านบุคลิก จุดเปลี่ยน และคำแนะนำที่แท็บพรีเมียม
            </span>
          </span>
          <FortuneIcon name="arrow-right" size={22} className="shrink-0" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={onUnlock}
          disabled={!onUnlock}
          className="mt-4 flex w-full items-center gap-3 rounded-[16px] border border-[#7B6BB0]/15 bg-white/45 px-3.5 py-3 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/35 disabled:opacity-60"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center">
            <FortuneIcon name="lock" size={36} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-[15px] font-semibold text-[#2C2458]">
              <FortuneIcon name="sparkle" size={16} />
              ปลดล็อกเจาะลึกดวงราศี{zodiac.thaiName}
            </span>
            <span className="mt-0.5 block text-[12px] text-[#5E5688]">
              บุคลิก · จุดเปลี่ยน · คำแนะนำเฉพาะราศี · {FORTUNE_UNLOCK_PRICE} บาท
            </span>
          </span>
          <FortuneIcon name="arrow-right" size={22} className="shrink-0" />
        </button>
      )}
    </section>
  );
}
