"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const ITEM_H = 40;
const PAD = 2;

const THAI_MONTHS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
] as const;

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function clampDay(year: number, month: number, day: number) {
  return Math.min(day, daysInMonth(year, month));
}

function toIso(year: number, month: number, day: number) {
  const d = clampDay(year, month, day);
  return `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function parseIso(value: string | undefined) {
  const today = new Date();
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    };
  }
  const [y, m, d] = value.split("-").map(Number);
  return { year: y, month: m, day: d };
}

function WheelColumn({
  items,
  value,
  onChange,
  ariaLabel,
}: {
  items: { value: number; label: string }[];
  value: number;
  onChange: (value: number) => void;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lock = useRef(false);
  const endTimer = useRef<number | null>(null);
  const index = Math.max(0, items.findIndex((item) => item.value === value));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    lock.current = true;
    el.scrollTop = index * ITEM_H;
    const t = window.setTimeout(() => {
      lock.current = false;
    }, 120);
    return () => window.clearTimeout(t);
  }, [index, items.length]);

  function settle() {
    const el = ref.current;
    if (!el || lock.current) return;
    const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_H)));
    el.scrollTop = i * ITEM_H;
    const next = items[i]?.value;
    if (next != null && next !== value) onChange(next);
  }

  return (
    <div className="relative z-[2] h-[200px] flex-1 overflow-hidden">
      <div
        ref={ref}
        role="listbox"
        aria-label={ariaLabel}
        onScroll={() => {
          if (lock.current) return;
          if (endTimer.current) window.clearTimeout(endTimer.current);
          endTimer.current = window.setTimeout(settle, 100);
        }}
        className="date-wheel-col h-full overflow-y-auto overscroll-contain"
        style={{
          scrollSnapType: "y mandatory",
          paddingTop: PAD * ITEM_H,
          paddingBottom: PAD * ITEM_H,
        }}
      >
        {items.map((item) => (
          <button
            key={`${ariaLabel}-${item.value}`}
            type="button"
            className={cn(
              "flex w-full shrink-0 items-center justify-center text-[17px]",
              item.value === value
                ? "font-bold text-[#241C4F]"
                : "font-medium text-[#6B6490]/70"
            )}
            style={{ height: ITEM_H, scrollSnapAlign: "center" }}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function BirthDatePicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (isoDate: string) => void;
  className?: string;
}) {
  const now = new Date();
  const maxYear = now.getFullYear();
  const minYear = maxYear - 80;
  const initial = parseIso(value);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);

  const years = useMemo(
    () =>
      Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
        const y = maxYear - i;
        return { value: y, label: String(y + 543) };
      }),
    [maxYear, minYear]
  );

  const months = useMemo(
    () => THAI_MONTHS.map((label, i) => ({ value: i + 1, label })),
    []
  );

  const maxDay = daysInMonth(year, month);
  const days = useMemo(
    () =>
      Array.from({ length: maxDay }, (_, i) => ({
        value: i + 1,
        label: String(i + 1).padStart(2, "0"),
      })),
    [maxDay]
  );

  function commit(nextYear: number, nextMonth: number, nextDay: number) {
    const safeDay = clampDay(nextYear, nextMonth, nextDay);
    setYear(nextYear);
    setMonth(nextMonth);
    setDay(safeDay);
    onChange(toIso(nextYear, nextMonth, safeDay));
  }

  return (
    <div className={cn("relative", className)}>
      <div className="mb-2.5 grid grid-cols-3 text-center text-[11px] font-semibold tracking-[0.12em] text-[#6B6490]">
        <span>วัน</span>
        <span>เดือน</span>
        <span>ปี พ.ศ.</span>
      </div>
      <div className="relative flex overflow-hidden rounded-[18px] bg-white/45 ring-1 ring-inset ring-[#7B6BB0]/18">
        <div className="pointer-events-none absolute inset-x-2.5 top-1/2 z-[1] h-10 -translate-y-1/2 rounded-xl border border-[#9B7FE8]/35 bg-[#EDE6FF]/55" />
        <WheelColumn
          ariaLabel="วัน"
          items={days}
          value={Math.min(day, maxDay)}
          onChange={(d) => commit(year, month, d)}
        />
        <WheelColumn
          ariaLabel="เดือน"
          items={months}
          value={month}
          onChange={(m) => commit(year, m, day)}
        />
        <WheelColumn
          ariaLabel="ปี"
          items={years}
          value={year}
          onChange={(y) => commit(y, month, day)}
        />
      </div>
    </div>
  );
}
