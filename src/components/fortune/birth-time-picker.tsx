"use client";

import { useEffect, useState, type FocusEvent } from "react";
import { cn } from "@/lib/utils";

function parseTime(value: string | undefined) {
  if (!value || !/^\d{1,2}:\d{2}$/.test(value)) {
    return { hour: 12, minute: 0, known: false, display: "" };
  }
  const [h, m] = value.split(":").map(Number);
  const hour = Math.min(23, Math.max(0, h));
  const minute = Math.min(59, Math.max(0, m));
  return {
    hour,
    minute,
    known: true,
    text: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  };
}

function normalizeTimeText(raw: string): string | null {
  const cleaned = raw.trim().replace(/\./g, ":").replace(/\s+/g, "");
  if (!cleaned) return null;

  // 1430 / 930
  if (/^\d{3,4}$/.test(cleaned)) {
    const padded = cleaned.padStart(4, "0");
    const h = Number(padded.slice(0, 2));
    const m = Number(padded.slice(2));
    if (h <= 23 && m <= 59) {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    return null;
  }

  const m = cleaned.match(/^(\d{1,2}):(\d{1,2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

/** Mae birth time — type HH:mm or mark unknown. */
export function BirthTimePicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (hhmm: string) => void;
  className?: string;
}) {
  const initial = parseTime(value);
  const [known, setKnown] = useState(initial.known);
  const [text, setText] = useState(initial.text);

  useEffect(() => {
    const next = parseTime(value);
    setKnown(next.known);
    setText(next.known ? next.text : "");
  }, [value]);

  function setUnknown() {
    setKnown(false);
    setText("");
    onChange("");
  }

  function applyText(raw: string) {
    const normalized = normalizeTimeText(raw);
    if (!normalized) {
      if (!raw.trim()) {
        setUnknown();
        return;
      }
      // keep draft visible but don't commit invalid
      setKnown(true);
      setText(raw);
      return;
    }
    setKnown(true);
    setText(normalized);
    onChange(normalized);
  }

  function onBlur(e: FocusEvent<HTMLInputElement>) {
    applyText(e.currentTarget.value);
  }

  return (
    <div className={cn("relative", className)}>
      <span className="mb-2 block text-center text-[16px] font-semibold tracking-wide text-[#e8d19a]/92">
        เวลาเกิด (ถ้าทราบ)
      </span>

      <div className="flex items-center justify-center gap-2.5">
        <input
          type="text"
          inputMode="numeric"
          placeholder="14:30"
          value={known ? text : ""}
          onFocus={() => {
            if (!known) {
              setKnown(true);
              setText("");
            }
          }}
          onChange={(e) => {
            setKnown(true);
            setText(e.target.value);
          }}
          onBlur={onBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="h-12 w-[6.25rem] shrink-0 rounded-full px-3 text-center text-[17px] font-semibold tabular-nums outline-none transition placeholder:font-medium placeholder:text-white/35"
          style={{
            background:
              known || text
                ? "rgba(18, 28, 48, 0.88)"
                : "rgba(8, 16, 32, 0.45)",
            boxShadow:
              known || text
                ? "inset 0 0 0 1.5px rgba(232,209,154,0.55)"
                : "inset 0 0 0 1px rgba(255,255,255,0.14)",
            color: "#e8d19a",
          }}
          aria-label="เวลาเกิด"
          autoComplete="off"
          maxLength={5}
        />

        <button
          type="button"
          onClick={setUnknown}
          className="flex h-12 shrink-0 items-center justify-center rounded-full px-4 text-[14px] font-semibold outline-none transition active:scale-[0.99]"
          style={{
            background: !known
              ? "rgba(18, 28, 48, 0.92)"
              : "rgba(8, 16, 32, 0.4)",
            boxShadow: !known
              ? "inset 0 0 0 1.5px rgba(232,209,154,0.65)"
              : "inset 0 0 0 1px rgba(255,255,255,0.14)",
            color: !known ? "#e8d19a" : "rgba(255,255,255,0.65)",
          }}
        >
          ไม่ทราบเวลา
        </button>
      </div>
    </div>
  );
}
