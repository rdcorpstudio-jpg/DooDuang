"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Lock,
  Sparkles,
} from "lucide-react";
import {
  ENERGY_META,
  MARKER_META,
  adviceForDay,
  formatThaiDayShort,
  formatThaiMonthYear,
  getCalendarYearRange,
  getDayProfile,
  getMonthGrid,
  parseIsoDate,
  toIsoDate,
  type DayEnergy,
  type DayMarker,
  type DayProfile,
} from "@/lib/fortune/auspicious-calendar";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"] as const;

function MarkerIcon({
  marker,
  size = 12,
}: {
  marker: DayMarker;
  size?: number;
}) {
  if (marker === "victory") {
    return (
      <Crown
        className="text-[#F4BC52]"
        style={{ width: size, height: size }}
        strokeWidth={2.2}
      />
    );
  }
  if (marker === "chaos") {
    return (
      <span
        className="inline-block rounded-full bg-[#2A1A1A]"
        style={{ width: size - 1, height: size - 1 }}
        title="วันโลกาวินาศ"
      />
    );
  }
  // holy / fortune — gold coin
  return (
    <span
      className="relative inline-flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background:
          "linear-gradient(145deg, #FFE7A8 0%, #F4BC52 45%, #C9922E 100%)",
        boxShadow: "0 0 0 0.5px rgba(184,120,40,0.5)",
      }}
    >
      <span
        className="font-bold leading-none text-[#5C3A10]"
        style={{ fontSize: Math.max(7, size * 0.55) }}
      >
        {marker === "fortune" ? "฿" : "P"}
      </span>
    </span>
  );
}

function EnergyDot({ energy, size = 14 }: { energy: DayEnergy; size?: number }) {
  const meta = ENERGY_META[energy];
  return (
    <span
      className="inline-block rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 35% 30%, ${meta.soft}, ${meta.color})`,
        boxShadow: `0 0 0 1px ${meta.color}55`,
      }}
    />
  );
}

function DayCell({
  profile,
  dayNum,
  selected,
  isToday,
  locked,
  onSelect,
}: {
  profile: DayProfile;
  dayNum: number;
  selected: boolean;
  isToday: boolean;
  locked: boolean;
  onSelect: () => void;
}) {
  const color = ENERGY_META[profile.energy].color;
  const soft = ENERGY_META[profile.energy].soft;
  const topMarker =
    profile.markers.find((m) => m === "victory") ??
    profile.markers.find((m) => m === "fortune") ??
    profile.markers.find((m) => m === "holy") ??
    profile.markers.find((m) => m === "chaos");

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold outline-none transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#F4BC52]/55",
        locked && "opacity-55"
      )}
      style={{
        color: "#0C1427",
        background: `radial-gradient(circle at 32% 28%, ${soft}, ${color})`,
        boxShadow: selected
          ? `0 0 0 2px #F4BC52, 0 0 14px rgba(244,188,82,0.45)`
          : isToday
            ? `0 0 0 1.5px rgba(247,248,255,0.85)`
            : `0 1px 2px rgba(0,0,0,0.2)`,
      }}
      aria-label={`${dayNum}${locked ? " (ล็อก)" : ""}`}
      aria-pressed={selected}
    >
      {dayNum}
      {topMarker ? (
        <span className="absolute -right-0.5 -top-0.5 flex items-center justify-center">
          <MarkerIcon marker={topMarker} size={11} />
        </span>
      ) : null}
      {locked ? (
        <span className="absolute -bottom-0.5 -left-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#0C1427]/85 ring-1 ring-[#F4BC52]/5">
          <Lock className="h-2 w-2 text-[#F4BC52]" strokeWidth={2.5} />
        </span>
      ) : null}
    </button>
  );
}

function DayDetailCards({
  profile,
  titleDate,
}: {
  profile: DayProfile;
  titleDate: string;
}) {
  const primaryMarkers = profile.markers.filter((m) => m !== "chaos");
  const hasChaos = profile.markers.includes("chaos");

  return (
    <div className="space-y-3.5">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-[#E4C56A]/90">
        ฤกษ์มงคล · {titleDate}
      </p>

      <div>
        <div className="flex items-center gap-2">
          <EnergyDot energy={profile.energy} size={14} />
          <p className="text-[14px] font-semibold text-[#F7F8FF]">
            {ENERGY_META[profile.energy].label}
          </p>
        </div>
        <p className="mt-1.5 text-[13px] leading-[1.65] text-[#B7C3D8]">
          {adviceForDay({ ...profile, markers: [] })}
        </p>
      </div>

      {primaryMarkers.length > 0 ? (
        <div className="space-y-3 border-t border-white/[0.08] pt-3.5">
          {primaryMarkers.map((m) => (
            <div key={m}>
              <div className="flex items-center gap-2">
                <MarkerIcon marker={m} size={14} />
                <p className="text-[12px] font-semibold tracking-wide text-[#E4C56A]/90">
                  {MARKER_META[m].label}
                </p>
              </div>
              <p className="mt-1 text-[13px] leading-[1.65] text-[#E8EEF8]">
                {MARKER_META[m].hint}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {hasChaos ? (
        <div className="border-t border-white/[0.08] pt-3.5">
          <p className="text-[12px] font-semibold tracking-wide text-[#F16DB5]">
            {MARKER_META.chaos.label}
          </p>
          <p className="mt-1 text-[13px] leading-[1.65] text-[#E8EEF8]">
            {MARKER_META.chaos.hint}
          </p>
        </div>
      ) : null}

      {(hasChaos && primaryMarkers.includes("victory")) ||
      profile.markers.length > 1 ? (
        <div className="border-t border-white/[0.08] pt-3.5">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B7C3D8]">
            หมายเหตุ
          </p>
          <p className="mt-1 text-[13px] leading-[1.65] text-[#E8EEF8]">
            {adviceForDay(profile)}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** Free: look back 1 month → today. Premium: browse 12 years. */
export function FortuneAuspiciousCalendar({
  seed,
  unlocked = false,
  onUnlock,
  variant = "teaser",
  className,
}: {
  seed: string;
  unlocked?: boolean;
  onUnlock?: () => void;
  variant?: "teaser" | "full";
  className?: string;
}) {
  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);
  const todayIso = toIsoDate(today);
  const freeStart = useMemo(() => {
    const d = new Date(today);
    d.setMonth(d.getMonth() - 1);
    return d;
  }, [today]);
  const freeStartIso = toIsoDate(freeStart);
  const yearRange = useMemo(() => getCalendarYearRange(today.getFullYear()), [today]);

  const canBrowse = unlocked || variant === "full";

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedIso, setSelectedIso] = useState(todayIso);
  const [legendOpen, setLegendOpen] = useState(variant === "full");

  const isFreeDay = (iso: string) => iso >= freeStartIso && iso <= todayIso;

  const isFreeMonth = (year: number, month: number) => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    return monthEnd >= freeStart && monthStart <= today;
  };

  const grid = useMemo(
    () => getMonthGrid(seed, viewYear, viewMonth),
    [seed, viewYear, viewMonth]
  );

  const activeIso =
    canBrowse || isFreeDay(selectedIso) ? selectedIso : todayIso;

  const selectedProfile = useMemo(
    () => getDayProfile(seed, parseIsoDate(activeIso)),
    [activeIso, seed]
  );

  const selectedLabel = formatThaiDayShort(parseIsoDate(selectedProfile.iso));

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    if (!canBrowse) {
      if (!isFreeMonth(y, m)) {
        onUnlock?.();
        return;
      }
    } else if (y < yearRange.start || y > yearRange.end) {
      return;
    }
    setViewYear(y);
    setViewMonth(m);
  }

  function shiftYear(delta: number) {
    if (!canBrowse) {
      onUnlock?.();
      return;
    }
    const y = viewYear + delta;
    if (y < yearRange.start || y > yearRange.end) return;
    setViewYear(y);
  }

  function selectDay(profile: DayProfile) {
    if (!canBrowse && !isFreeDay(profile.iso)) {
      onUnlock?.();
      return;
    }
    setSelectedIso(profile.iso);
  }

  function goToday() {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedIso(todayIso);
  }

  return (
    <section
      className={cn(
        "fortune-glass overflow-hidden rounded-[22px]",
        className
      )}
    >
      <div className="relative px-3.5 pb-3.5 pt-3.5">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(244,188,82,0.16), transparent 55%)",
          }}
        />

        <div className="relative z-[1]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="flex items-center gap-1.5 text-[12px] font-semibold tracking-wide text-[#F4BC52]">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                ปฏิทินฤกษ์ 12 ปี
              </p>
              <h2 className="mt-1 text-[18px] font-semibold text-[#F7F8FF]">
                {canBrowse ? "ดูฤกษ์มงคลรายวัน" : "ฤกษ์ย้อนหลัง 1 เดือน"}
              </h2>
              {canBrowse ? (
                <p className="mt-0.5 text-[12px] text-[#9AB8DC]">
                  พ.ศ. {yearRange.start + 543}–{yearRange.end + 543}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={goToday}
              className="shrink-0 rounded-full border border-[#F4BC52]/35 bg-[#F4BC52]/12 px-2.5 py-1 text-[11px] font-semibold text-[#F4BC52] outline-none focus-visible:ring-2 focus-visible:ring-[#F4BC52]/45"
            >
              วันนี้
            </button>
          </div>

          {/* Year row (premium) */}
          {canBrowse ? (
            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => shiftYear(-1)}
                disabled={viewYear <= yearRange.start}
                className="flex h-8 w-8 items-center justify-center text-[#A07E1A] outline-none transition active:opacity-60 disabled:opacity-30"
                aria-label="ปีก่อน"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
              </button>
              <p className="text-[14px] font-semibold text-[#241C4F]">
                พ.ศ. {viewYear + 543}
              </p>
              <button
                type="button"
                onClick={() => shiftYear(1)}
                disabled={viewYear >= yearRange.end}
                className="flex h-8 w-8 items-center justify-center text-[#A07E1A] outline-none transition active:opacity-60 disabled:opacity-30"
                aria-label="ปีถัดไป"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2.2} />
              </button>
            </div>
          ) : null}

          {/* Month nav */}
          <div className="mt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="flex h-8 w-8 items-center justify-center text-[#A07E1A] outline-none transition active:opacity-60"
              aria-label="เดือนก่อน"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
            </button>
            <p className="text-[15px] font-semibold text-[#241C4F]">
              {formatThaiMonthYear(viewYear, viewMonth)}
            </p>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="flex h-8 w-8 items-center justify-center text-[#A07E1A] outline-none transition active:opacity-60"
              aria-label="เดือนถัดไป"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.2} />
            </button>
          </div>

          {/* Weekday header */}
          <div className="mt-3 grid grid-cols-7 gap-y-1">
            {WEEKDAYS.map((d) => (
              <p
                key={d}
                className="text-center text-[11px] font-medium text-[#9AB8DC]/80"
              >
                {d}
              </p>
            ))}
          </div>

          {/* Day grid */}
          <div className="mt-1.5 grid grid-cols-7 gap-y-2">
            {grid.map((cell, i) => {
              if (!cell) return <div key={`e-${i}`} />;
              const dayNum = parseIsoDate(cell.iso).getDate();
              const locked = !canBrowse && !isFreeDay(cell.iso);
              const selected = activeIso === cell.iso;
              return (
                <DayCell
                  key={cell.iso}
                  profile={cell}
                  dayNum={dayNum}
                  selected={selected}
                  isToday={cell.iso === todayIso}
                  locked={locked}
                  onSelect={() => selectDay(cell)}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setLegendOpen((v) => !v)}
              className="flex w-full items-center justify-between text-left"
            >
              <p className="text-[13px] font-semibold text-[#F7F8FF]">
                รายละเอียดของวัน
              </p>
              <span className="text-[11px] text-[#9AB8DC]">
                {legendOpen ? "ย่อ" : "ดูคำอธิบาย"}
              </span>
            </button>
            {legendOpen ? (
              <div className="mt-2 grid grid-cols-1 gap-1.5 min-[380px]:grid-cols-2">
                {(Object.keys(ENERGY_META) as DayEnergy[]).map((e) => (
                  <div key={e} className="flex items-center gap-2">
                    <EnergyDot energy={e} />
                    <span className="text-[12px] text-[#9AB8DC]">
                      {ENERGY_META[e].label}
                    </span>
                  </div>
                ))}
                {(["holy", "victory", "fortune"] as DayMarker[]).map((m) => (
                  <div key={m} className="flex items-center gap-2">
                    <MarkerIcon marker={m} size={14} />
                    <span className="text-[12px] text-[#9AB8DC]">
                      {MARKER_META[m].label}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div
            className="my-3 h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(244,188,82,0.45), transparent)",
            }}
          />

          <DayDetailCards profile={selectedProfile} titleDate={selectedLabel} />

          {!canBrowse ? (
            <button
              type="button"
              onClick={onUnlock}
              disabled={!onUnlock}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[14px] font-semibold text-[#1A1208] outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#F4BC52]/5 disabled:opacity-60"
              style={{
                background:
                  "linear-gradient(135deg, #FFF0C4 0%, #F4BC52 40%, #C9922E 100%)",
                boxShadow: "0 10px 28px rgba(244,188,82,0.35)",
              }}
            >
              <Lock className="h-3.5 w-3.5" strokeWidth={2.2} />
              ปลดล็อกปฏิทิน 12 ปี · {FORTUNE_UNLOCK_PRICE} บาท
              <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
