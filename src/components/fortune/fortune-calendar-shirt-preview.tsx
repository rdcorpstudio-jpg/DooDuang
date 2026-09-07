"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { CalendarDays, ChevronRight, Crown, Shirt } from "lucide-react";
import { FortuneAuspiciousCalendar } from "@/components/fortune/fortune-auspicious-calendar";
import {
  ENERGY_META,
  getDayProfile,
  toIsoDate,
  type DayProfile,
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
  { id: "green", name: "เขียว", meaning: "งาน", src: "/images/shirts/green.png" },
  { id: "purple", name: "ม่วง", meaning: "เสน่ห์", src: "/images/shirts/purple.png" },
  { id: "orange", name: "ส้ม", meaning: "มั่นใจ", src: "/images/shirts/orange.png" },
  { id: "red", name: "แดง", meaning: "พลัง", src: "/images/shirts/red.png" },
  { id: "black", name: "ดำ", meaning: "คุ้มครอง", src: "/images/shirts/black.png" },
] as const;

function PreviewDay({
  profile,
  date,
  selected,
}: {
  profile: DayProfile;
  date: Date;
  selected: boolean;
}) {
  const meta = ENERGY_META[profile.energy];
  const dayNum = date.getDate();
  const weekday = WEEKDAY_SHORT[date.getDay()]!;
  const hasVictory = profile.markers.includes("victory");

  return (
    <div className="relative flex flex-col items-center gap-0.5">
      <p
        className={cn(
          "text-[12px] font-semibold leading-none",
          selected ? "text-[#F4BC52]" : "text-[#9AB8DC]/85"
        )}
      >
        {weekday}
      </p>
      <span className="relative mt-1 flex h-10 w-10 items-center justify-center">
        {hasVictory ? (
          <Crown
            className="absolute -top-1 left-1/2 z-[1] h-3 w-3 -translate-x-1/2 text-[#F4BC52]"
            strokeWidth={2.4}
          />
        ) : null}
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-[15px] font-bold text-[#0C1427]",
            selected && "ring-2 ring-[#F4BC52]/70"
          )}
          style={{
            background: `radial-gradient(circle at 32% 28%, ${meta.soft}, ${meta.color})`,
          }}
        >
          {dayNum}
        </span>
      </span>
    </div>
  );
}

function PreviewCardShell({
  title,
  icon,
  titleClass,
  open,
  onClick,
  ariaLabel,
  hint,
  children,
}: {
  title: string;
  icon: ReactNode;
  titleClass: string;
  open: boolean;
  onClick: () => void;
  ariaLabel: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-label={ariaLabel}
      className={cn(
        "fortune-glass flex h-full min-h-[126px] flex-col rounded-[18px] px-3 py-2.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-white/30",
        open && "ring-1 ring-white/20"
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-[13px] font-semibold tracking-wide",
            titleClass
          )}
        >
          {icon}
          {title}
        </span>
        <ChevronRight
          className={cn(
            "h-4 w-4 text-white/35 transition-transform",
            open && "rotate-90"
          )}
          strokeWidth={2}
        />
      </div>

      <div className="mt-2 flex min-h-[56px] flex-1 items-center">{children}</div>

      <p className="mt-1.5 text-[11px] leading-snug text-white/45">{hint}</p>
    </button>
  );
}

/** Compact labeled previews — tap to expand full calendar / shirt detail */
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

  const previewDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 3 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return { date: d, profile: getDayProfile(seed, d) };
    });
  }, [seed]);

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="grid grid-cols-2 items-stretch gap-2.5">
        <PreviewCardShell
          title="ปฏิทินฤกษ์"
          titleClass="text-[#F4BC52]"
          icon={<CalendarDays className="h-3.5 w-3.5" strokeWidth={2} />}
          open={openCalendar}
          ariaLabel="เปิดปฏิทินฤกษ์"
          hint="วันนี้ + 2 วัน · กดดูเต็ม"
          onClick={() => setOpenCalendar((v) => !v)}
        >
          <div className="flex w-full items-center justify-center gap-2.5">
            {previewDays.map(({ date, profile }, i) => (
              <PreviewDay
                key={toIsoDate(date)}
                profile={profile}
                date={date}
                selected={i === 0}
              />
            ))}
          </div>
        </PreviewCardShell>

        <div className="fortune-glass flex h-full min-h-[126px] flex-col rounded-[18px] px-3 py-2.5 text-left">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold tracking-wide text-[#46DDED]">
            <Shirt className="h-3.5 w-3.5" strokeWidth={2} />
            สีเสื้อมงคล
          </span>
          <div className="mt-2 flex min-h-[56px] flex-1 items-center">
            <div className="flex w-full items-center gap-2.5">
              <span className="relative block h-11 w-11 shrink-0">
                <Image
                  src={TODAY_SHIRT.src}
                  alt={TODAY_SHIRT.name}
                  width={88}
                  height={88}
                  unoptimized
                  className="h-full w-full object-contain"
                />
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold leading-tight text-[#F7F8FF]">
                  วันนี้ · {TODAY_SHIRT.name}
                </p>
                <p className="mt-0.5 text-[12px] leading-snug text-[#9AB8DC]">
                  เหมาะกับเรื่อง{TODAY_SHIRT.meaning}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-white/45">
            สีวันนี้ตามพื้นดวง
          </p>
        </div>
      </div>

      {openCalendar ? (
        <FortuneAuspiciousCalendar
          seed={seed}
          unlocked={unlocked}
          onUnlock={onUnlock}
          variant={unlocked ? "full" : "teaser"}
        />
      ) : null}

      <section className="fortune-glass overflow-hidden rounded-[18px] px-3.5 py-3">
        <p className="text-[13px] font-semibold tracking-wide text-[#46DDED]">
          สีเสื้อแนะนำ
        </p>
        <p className="mt-1 text-[12px] leading-snug text-[#9AB8DC]">
          สีวันนี้และสีตามพื้นดวงที่เสริมโชคเฉพาะคุณ
        </p>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {SHIRT_DETAILS.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-1">
              <span className="relative block h-9 w-9">
                <Image
                  src={s.src}
                  alt={s.name}
                  width={72}
                  height={72}
                  unoptimized
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="text-[10px] font-medium text-[#F7F8FF]">
                {s.name}
              </span>
              <span className="text-[9px] text-[#9AB8DC]">{s.meaning}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
