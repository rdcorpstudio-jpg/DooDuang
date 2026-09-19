"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { SnapWheelColumn } from "@/components/fortune/snap-wheel-column";

const THAI_MONTHS_FULL = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
] as const;

const THAI_MONTHS_SHORT = [
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
  const fallbackYear = today.getFullYear() - 28;
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { year: fallbackYear, month: 1, day: 1 };
  }
  const [y, m, d] = value.split("-").map(Number);
  if (
    y === today.getFullYear() &&
    m === today.getMonth() + 1 &&
    d === today.getDate()
  ) {
    return { year: fallbackYear, month: m, day: Math.min(d, 28) };
  }
  return { year: y, month: m, day: d };
}

/** Mae birth date — redesigned scroll wheels. */
export function BirthDatePicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (isoDate: string) => void;
  className?: string;
  tone?: string;
}) {
  const now = new Date();
  const maxYear = now.getFullYear();
  const minYear = maxYear - 80;
  const initial = parseIso(value);
  const [year, setYear] = useState(
    Math.min(maxYear, Math.max(minYear, initial.year)),
  );
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);

  useEffect(() => {
    const next = toIso(year, month, day);
    if (value !== next) onChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
    const parsed = parseIso(value);
    setYear(parsed.year);
    setMonth(parsed.month);
    setDay(parsed.day);
  }, [value]);

  function commit(nextYear: number, nextMonth: number, nextDay: number) {
    const y = Math.min(maxYear, Math.max(minYear, nextYear));
    const m = ((nextMonth - 1 + 12) % 12) + 1;
    const safeDay = clampDay(y, m, nextDay);
    setYear(y);
    setMonth(m);
    setDay(safeDay);
    onChange(toIso(y, m, safeDay));
  }

  const dayOptions = useMemo(() => {
    const max = daysInMonth(year, month);
    return Array.from({ length: max }, (_, i) => ({
      value: i + 1,
      label: String(i + 1).padStart(2, "0"),
    }));
  }, [year, month]);

  const monthOptions = useMemo(
    () =>
      THAI_MONTHS_SHORT.map((label, i) => ({
        value: i + 1,
        label,
      })),
    [],
  );

  const yearOptions = useMemo(() => {
    const list = [];
    for (let y = maxYear; y >= minYear; y -= 1) {
      list.push({ value: y, label: String(y + 543) });
    }
    return list;
  }, [maxYear, minYear]);

  const display = useMemo(
    () => `${day} ${THAI_MONTHS_FULL[month - 1]} พ.ศ. ${year + 543}`,
    [day, month, year],
  );

  return (
    <div className={cn("relative", className)}>
      <p className="mb-3 text-center text-[17px] font-bold leading-snug text-white">
        {display}
      </p>

      <div
        className="mx-auto flex w-fit items-start justify-center gap-2 rounded-[28px] px-3 py-3"
        style={{
          background:
            "linear-gradient(160deg, rgba(12,28,52,0.55) 0%, rgba(6,16,34,0.5) 100%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
        }}
      >
        <SnapWheelColumn
          label="วัน"
          widthClass="w-[3.6rem]"
          options={dayOptions}
          value={day}
          editable
          onChange={(d) => commit(year, month, d)}
        />
        <SnapWheelColumn
          label="เดือน"
          widthClass="w-[4.1rem]"
          options={monthOptions}
          value={month}
          onChange={(m) => commit(year, m, day)}
        />
        <SnapWheelColumn
          label="ปี พ.ศ."
          widthClass="w-[4.6rem]"
          options={yearOptions}
          value={year}
          editable
          onChange={(y) => commit(y, month, day)}
        />
      </div>
    </div>
  );
}
