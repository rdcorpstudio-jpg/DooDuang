"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Shirt } from "lucide-react";
import { FortuneAuspiciousCalendar } from "@/components/fortune/fortune-auspicious-calendar";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import {
  ENERGY_META,
  getDayProfile,
  toIsoDate,
} from "@/lib/fortune/auspicious-calendar";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import { buildDailyReadingPack } from "@/lib/fortune/build-daily-pack";
import { cn } from "@/lib/utils";

const WEEKDAY_SHORT = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"] as const;

const SHIRT_DETAILS = [
  { id: "green", name: "เขียว", meaning: "การงาน", src: "/images/shirts/green.png" },
  { id: "purple", name: "ม่วง", meaning: "โชคลาภ", src: "/images/shirts/purple.png" },
  { id: "orange", name: "ส้ม", meaning: "ความมั่นใจ", src: "/images/shirts/orange.png" },
  { id: "red", name: "แดง", meaning: "พลังใจ", src: "/images/shirts/red.png" },
  { id: "black", name: "ดำ", meaning: "คุ้มครอง", src: "/images/shirts/black.png" },
] as const;

/** Calendar + shirt — shirt of the day from day tone */
export function FortuneCalendarShirtPreview({
  seed,
  birthDate = "2000-01-01",
  nickname = "",
  birthTime,
  focus,
  gender,
  unlocked = false,
  onUnlock,
  className,
}: {
  seed: string;
  birthDate?: string;
  nickname?: string;
  birthTime?: string;
  focus?: FortuneFocus;
  gender?: string;
  unlocked?: boolean;
  onUnlock?: () => void;
  className?: string;
}) {
  const [openCalendar, setOpenCalendar] = useState(false);
  /** Default closed — less scroll; tap to expand shirt picks */
  const [openShirts, setOpenShirts] = useState(false);

  const todayShirt = useMemo(() => {
    return buildDailyReadingPack({
      birthDate,
      nickname,
      birthTime,
      focus,
      gender,
    }).shirt;
  }, [birthDate, nickname, birthTime, focus, gender]);

  const previewDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 3 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return { date: d, profile: getDayProfile(seed, d) };
    });
  }, [seed]);

  function toggleShirts() {
    setOpenShirts((v) => !v);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-2 items-stretch gap-2.5">
        <button
          type="button"
          onClick={() => setOpenCalendar((v) => !v)}
          aria-expanded={openCalendar}
          className="fortune-glass group flex h-[11.5rem] flex-col rounded-[20px] px-3 py-3 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/4"
        >
          <span className="flex h-7 shrink-0 items-center justify-between gap-1.5">
            <span className="inline-flex min-w-0 items-center gap-2">
              <FortuneIcon name="calendar" size={24} />
              <span className="truncate text-[13px] font-bold text-[#2C2458]">
                ปฏิทินฤกษ์
              </span>
            </span>
            <FortuneIcon
              name="arrow-right"
              size={20}
              className={cn(
                "shrink-0 transition-transform",
                openCalendar && "rotate-90"
              )}
            />
          </span>

          <div className="mt-2 flex min-h-0 flex-1 items-center justify-between gap-1 px-0.5">
            {previewDays.map(({ date, profile }, i) => {
              const meta = ENERGY_META[profile.energy];
              const selected = i === 0;
              return (
                <div
                  key={toIsoDate(date)}
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
                  <p
                    className={cn(
                      "text-[11px] font-semibold",
                      selected ? "text-[#5B45B8]" : "text-[#8A82B0]"
                    )}
                  >
                    {WEEKDAY_SHORT[date.getDay()]}
                  </p>
                  <span
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-full text-[15px] font-bold",
                      selected
                        ? "bg-[#9B7FE8] text-white ring-2 ring-[#9B7FE8]/35"
                        : "text-[#2C2458]"
                    )}
                    style={
                      selected
                        ? undefined
                        : {
                            background: `radial-gradient(circle at 32% 28%, ${meta.soft}, ${meta.color})`,
                            color: "#0C1427",
                          }
                    }
                  >
                    {date.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          <span className="mt-auto inline-flex h-6 w-fit items-center rounded-full bg-[#9B7FE8]/12 px-2.5 text-[11px] font-semibold text-[#5B45B8]">
            ดูฤกษ์ดีประจำวัน
          </span>
        </button>

        <button
          type="button"
          onClick={toggleShirts}
          aria-expanded={openShirts}
          className="fortune-glass group flex h-[11.5rem] flex-col rounded-[20px] px-3 py-3 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/4"
        >
          <span className="flex h-7 shrink-0 items-center justify-between gap-1.5">
            <span className="inline-flex min-w-0 items-center gap-2">
              <Shirt className="h-5 w-5 shrink-0 text-[#2F8A9E]" strokeWidth={2.1} />
              <span className="truncate text-[13px] font-bold text-[#2C2458]">
                สีเสื้อมงคล
              </span>
            </span>
            <FortuneIcon
              name="arrow-right"
              size={20}
              className={cn(
                "shrink-0 transition-transform",
                openShirts && "rotate-90"
              )}
            />
          </span>

          <div className="mt-2 flex min-h-0 flex-1 items-center gap-2.5">
            <span className="relative flex h-16 w-16 shrink-0 items-center justify-center">
              <Image
                src={todayShirt.src}
                alt={todayShirt.name}
                width={96}
                height={96}
                unoptimized
                className="h-14 w-14 object-contain drop-shadow-[0_8px_14px_rgba(80,60,140,0.2)]"
              />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold leading-snug text-[#2C2458]">
                วันนี้ · สี{todayShirt.name}
              </p>
              <p className="mt-1 text-[12px] leading-snug text-[#5E5688]">
                เสริมเรื่อง{todayShirt.meaning}
              </p>
            </div>
          </div>

          <span className="mt-auto inline-flex h-6 w-fit items-center rounded-full bg-[#46A8C8]/14 px-2.5 text-[11px] font-semibold text-[#2F8A9E]">
            กดดูสีอื่น
          </span>
        </button>
      </div>

      {openCalendar ? (
        <FortuneAuspiciousCalendar
          seed={seed}
          unlocked={unlocked}
          onUnlock={onUnlock}
          variant={unlocked ? "full" : "teaser"}
        />
      ) : null}

      {openShirts ? (
        <section className="fortune-glass overflow-hidden rounded-[20px] px-3.5 py-3.5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[13px] font-semibold text-[#2C2458]">
              เลือกสีให้ตรงกับสิ่งที่อยากเสริม
            </p>
            <button
              type="button"
              onClick={toggleShirts}
              aria-label="หุบสีเสื้อ"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7B5FD4]/18 outline-none transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/4"
            >
              <FortuneIcon
                name="arrow-right"
                size={22}
                className="rotate-[-90deg]"
              />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {SHIRT_DETAILS.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-1.5">
                <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/70">
                  <Image
                    src={s.src}
                    alt={s.name}
                    width={80}
                    height={80}
                    unoptimized
                    className="h-10 w-10 object-contain"
                  />
                </span>
                <span className="text-center text-[11px] font-medium leading-tight text-[#2C2458]">
                  {s.meaning}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
