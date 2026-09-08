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
import { cn } from "@/lib/utils";

const WEEKDAY_SHORT = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"] as const;

const TODAY_SHIRT = {
  id: "green",
  name: "เขียว",
  meaning: "งาน",
  src: "/images/shirts/green.png",
} as const;

const SHIRT_DETAILS = [
  { id: "green", name: "เขียว", meaning: "การงาน", src: "/images/shirts/green.png" },
  { id: "purple", name: "ม่วง", meaning: "โชคลาภ", src: "/images/shirts/purple.png" },
  { id: "orange", name: "ส้ม", meaning: "ความมั่นใจ", src: "/images/shirts/orange.png" },
  { id: "red", name: "แดง", meaning: "พลังใจ", src: "/images/shirts/red.png" },
  { id: "black", name: "ดำ", meaning: "คุ้มครอง", src: "/images/shirts/black.png" },
] as const;

/** Calendar + shirt — lilac mockup */
export function FortuneCalendarShirtPreview({
  seed,
  unlocked = false,
  onUnlock,
  className,
}: {
  seed: string;
  unlocked?: boolean;
  onUnlock?: () => void;
  className?: string;
}) {
  const [openCalendar, setOpenCalendar] = useState(false);
  /** Default closed — less scroll; tap to expand shirt picks */
  const [openShirts, setOpenShirts] = useState(false);

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
    <div className={cn("space-y-2.5", className)}>
      <div className="grid grid-cols-2 items-stretch gap-1.5">
        <button
          type="button"
          onClick={() => setOpenCalendar((v) => !v)}
          aria-expanded={openCalendar}
          className="fortune-glass flex min-h-[168px] flex-col rounded-[18px] px-3 py-3.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/4"
        >
          <span className="inline-flex items-center justify-between gap-1 text-[14px] font-semibold text-[#2C2458]">
            <span className="inline-flex items-center gap-2">
              <FortuneIcon name="calendar" size={28} />
              ปฏิทินฤกษ์
            </span>
            <FortuneIcon
              name="arrow-right"
              size={26}
              className={cn(
                "transition-transform",
                openCalendar && "rotate-90"
              )}
            />
          </span>

          <div className="mt-3 flex flex-1 items-center justify-center gap-2.5">
            {previewDays.map(({ date, profile }, i) => {
              const meta = ENERGY_META[profile.energy];
              const selected = i === 0;
              return (
                <div
                  key={toIsoDate(date)}
                  className="flex flex-col items-center gap-1"
                >
                  <p
                    className={cn(
                      "text-[12px] font-semibold",
                      selected ? "text-[#B8921F]" : "text-[#6B6490]"
                    )}
                  >
                    {WEEKDAY_SHORT[date.getDay()]}
                  </p>
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-bold",
                      selected
                        ? "bg-[#F4BC52] text-[#2C1A08] ring-2 ring-[#F4BC52]/45"
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

          <p className="mt-2 text-[12px] leading-snug text-[#5E5688]">
            ดูฤกษ์ดีประจำวัน
          </p>
        </button>

        <button
          type="button"
          onClick={toggleShirts}
          aria-expanded={openShirts}
          className="fortune-glass flex min-h-[168px] flex-col rounded-[18px] px-3 py-3.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/4"
        >
          <span className="inline-flex w-full items-center justify-between gap-1 text-[14px] font-semibold text-[#2C2458]">
            <span className="inline-flex items-center gap-2">
              <Shirt className="h-6 w-6 text-[#46A8C8]" strokeWidth={2} />
              สีเสื้อมงคล
            </span>
            <FortuneIcon
              name="arrow-right"
              size={26}
              className={cn(
                "transition-transform",
                openShirts && "rotate-90"
              )}
            />
          </span>
          <div className="mt-3 flex flex-1 items-center gap-3">
            <span className="relative block h-14 w-14 shrink-0">
              <Image
                src={TODAY_SHIRT.src}
                alt={TODAY_SHIRT.name}
                width={96}
                height={96}
                unoptimized
                className="h-full w-full object-contain drop-shadow-[0_6px_12px_rgba(80,60,140,0.16)]"
              />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold leading-tight text-[#2C2458]">
                วันนี้ · สี{TODAY_SHIRT.name}
              </p>
              <p className="mt-1 text-[13px] leading-snug text-[#5E5688]">
                เสริมเรื่อง{TODAY_SHIRT.meaning}
              </p>
            </div>
          </div>
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

      {/* Shirt colors only after tapping สีเสื้อมงคล */}
      {openShirts ? (
        <section className="fortune-glass overflow-hidden rounded-[18px] px-3.5 py-3.5">
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
                <span className="relative block h-11 w-11">
                  <Image
                    src={s.src}
                    alt={s.name}
                    width={80}
                    height={80}
                    unoptimized
                    className="h-full w-full object-contain"
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
