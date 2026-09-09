"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { ZodiacSignImage } from "@/components/fortune/zodiac-sign-image";
import { analyzeFortune, type FortuneFocus } from "@/lib/fortune/analyze";
import { pickZodiacDaily } from "@/lib/fortune/content/zodiac-daily";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Free: today's vibe from analyzeFortune + content bank. Premium deep: unlocked profile. */
export function FortuneFreeZodiacToday({
  birthDate,
  nickname,
  birthTime,
  focus,
  gender,
  unlocked = false,
  deep = false,
  onUnlock,
  className,
}: {
  birthDate: string;
  nickname: string;
  birthTime?: string;
  focus?: FortuneFocus;
  gender?: string;
  unlocked?: boolean;
  deep?: boolean;
  onUnlock?: () => void;
  className?: string;
}) {
  const analysis = useMemo(
    () =>
      analyzeFortune({
        birthDate,
        nickname,
        birthTime,
        focus,
        gender,
      }),
    [birthDate, nickname, birthTime, focus, gender]
  );

  const zodiac = analysis.zodiac;

  const today = useMemo(
    () => pickZodiacDaily(zodiac.id, analysis.dayTone),
    [zodiac.id, analysis.dayTone]
  );

  const [dailyMore, setDailyMore] = useState(false);

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
      {/* Header */}
      <div className="relative z-[1] flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <FortuneIcon name="sparkle" size={22} />
          <p className="truncate text-[15px] font-semibold text-[#2C2458]">
            {deep ? "เจาะลึกราศี · พรีเมียม" : "ดวงของคุณวันนี้"}
          </p>
        </div>
        <div className="shrink-0 rounded-full bg-white/70 px-3 py-1.5 text-[12px] text-[#5E5688] ring-1 ring-[#7B6BB0]/15">
          {dateLabel}
        </div>
      </div>

      {/* Left: medallions (orb) · Right: constellations (star, faint) */}
      <div className="relative z-[1] mt-3.5 min-h-[5rem]">
        <div
          className="pointer-events-none absolute -right-4 top-1/2 z-0 -translate-y-1/2 opacity-[0.28]"
          aria-hidden
        >
          <ZodiacSignImage
            sign={zodiac.id}
            variant="star"
            size={128}
            alt=""
          />
        </div>

        <div className="relative z-[1] flex items-center gap-3.5 pr-14">
          <ZodiacSignImage
            sign={zodiac.id}
            variant="orb"
            size={72}
            alt={`ราศี${zodiac.thaiName}`}
            className="shrink-0 drop-shadow-[0_8px_16px_rgba(120,90,200,0.28)]"
            priority
          />
          <div className="min-w-0">
            <h2 className="text-[1.4rem] font-semibold tracking-wide text-[#2C2458]">
              ราศี{zodiac.thaiName}
            </h2>
            <p className="mt-1 text-[13px] text-[#5E5688]">
              {zodiac.dateRange}
            </p>
          </div>
        </div>
      </div>

      <p className="relative z-[1] mt-3.5 text-[15px] font-semibold leading-[1.7] text-[#2C2458]">
        {nickname
          ? `คุณ${nickname.replace(/^คุณ\s*/, "").trim()} — `
          : null}
        {today.vibe}
      </p>

      <div className="relative z-[1] mt-3 space-y-0 text-[15px] leading-[1.65] text-[#4A4278]">
        <p className="flex items-start gap-2.5 border-t border-[#7B6BB0]/14 py-3">
          <FortuneIcon name="check" size={26} className="mt-0.5 shrink-0" />
          <span>
            <span className="font-semibold text-[#2C2458]">ทำ</span>
            <span className="mx-1.5 text-[#9A90C0]">·</span>
            {today.doToday}
          </span>
        </p>
        <p className="flex items-start gap-2.5 border-t border-[#7B6BB0]/14 py-3">
          <FortuneIcon name="warning" size={26} className="mt-0.5 shrink-0" />
          <span>
            <span className="font-semibold text-[#2C2458]">ระวัง</span>
            <span className="mx-1.5 text-[#9A90C0]">·</span>
            {today.watch}
          </span>
        </p>

        {/* Premium: มุมลึก / ก่อนนอน / lucky hint */}
        {!deep && unlocked && dailyMore ? (
          <>
            <p className="border-t border-[#7B6BB0]/14 py-3 text-[14px] leading-[1.7] text-[#4A4278]">
              <span className="font-semibold text-[#2C2458]">มุมลึก</span>
              <span className="mx-1.5 text-[#9A90C0]">·</span>
              {today.insight}
            </p>
            <p className="border-t border-[#7B6BB0]/14 py-3 text-[14px] leading-[1.7] text-[#5E5688]">
              <span className="font-semibold text-[#2C2458]">ก่อนนอน</span>
              <span className="mx-1.5 text-[#9A90C0]">·</span>
              {today.evening}
            </p>
            {today.luckyHint ? (
              <p className="border-t border-[#7B6BB0]/14 py-3 text-[13px] leading-snug text-[#6B6490]">
                {today.luckyHint}
              </p>
            ) : null}
          </>
        ) : null}
      </div>

      {!deep ? (
        <button
          type="button"
          onClick={() => {
            if (!unlocked) {
              onUnlock?.();
              return;
            }
            setDailyMore((v) => !v);
          }}
          aria-expanded={unlocked ? dailyMore : false}
          disabled={!unlocked && !onUnlock}
          className="relative z-[1] mt-1 inline-flex w-full items-center justify-center gap-1.5 py-2 text-[13px] font-semibold text-[#7B5FD4] outline-none transition active:opacity-70 disabled:opacity-60"
        >
          {!unlocked ? (
            <>
              <FortuneIcon name="lock" size={16} />
              อ่านเพิ่มเติม · พรีเมียม
            </>
          ) : dailyMore ? (
            <>
              ย่อข้อความ
              <FortuneIcon
                name="arrow-right"
                size={18}
                className="rotate-90 transition"
              />
            </>
          ) : (
            <>
              อ่านเพิ่มเติม
              <FortuneIcon
                name="arrow-right"
                size={18}
                className="rotate-0 transition"
              />
            </>
          )}
        </button>
      ) : null}

      {deep ? (
        <div className="relative z-[1] border-t border-[#7B6BB0]/15 pt-3.5">
          <Link
            href="/premium/self-map"
            className="no-sky-lift dd-gold-glass-btn inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-[#5C4810] outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#F4BC52]/45"
          >
            เจาะลึกตัวตน
            <FortuneIcon name="arrow-right" size={20} />
          </Link>
        </div>
      ) : unlocked ? (
        <Link
          href="/premium"
          className="mt-1 flex w-full items-center gap-3 rounded-[16px] border border-[#7B6BB0]/15 bg-white/45 px-3.5 py-3 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/35"
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
          className="mt-1 flex w-full items-center gap-3 rounded-[16px] border border-[#7B6BB0]/15 bg-white/45 px-3.5 py-3 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/35 disabled:opacity-60"
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
