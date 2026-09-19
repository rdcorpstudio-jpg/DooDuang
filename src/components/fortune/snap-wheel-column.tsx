"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

const ITEM_H = 40;
const VISIBLE = 5;
const PAD = Math.floor(VISIBLE / 2) * ITEM_H;

export type WheelOption = { value: number; label: string };

/** Mae scroll wheel — narrow, soft fade, pill selection, optional type. */
export function SnapWheelColumn({
  label,
  options,
  value,
  onChange,
  widthClass = "w-[4rem]",
  editable = false,
  ariaLabel,
}: {
  label: string;
  options: WheelOption[];
  value: number;
  onChange: (next: number) => void;
  widthClass?: string;
  editable?: boolean;
  ariaLabel?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef(false);
  const settleRef = useRef<number | null>(null);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);

  const indexOf = useCallback(
    (v: number) => {
      const i = options.findIndex((o) => o.value === v);
      return i >= 0 ? i : 0;
    },
    [options],
  );

  const scrollToValue = useCallback(
    (v: number, smooth: boolean) => {
      const el = scrollerRef.current;
      if (!el) return;
      const i = indexOf(v);
      lockRef.current = true;
      el.scrollTo({ top: i * ITEM_H, behavior: smooth ? "smooth" : "auto" });
      window.setTimeout(() => {
        lockRef.current = false;
      }, smooth ? 240 : 50);
    },
    [indexOf],
  );

  useEffect(() => {
    if (typing) return;
    scrollToValue(value, false);
  }, [value, options, typing, scrollToValue]);

  function commitFromScroll() {
    const el = scrollerRef.current;
    if (!el || lockRef.current) return;
    const i = Math.round(el.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(options.length - 1, i));
    const next = options[clamped]?.value;
    if (next !== undefined && next !== value) onChange(next);
    else scrollToValue(value, true);
  }

  function onScroll() {
    if (lockRef.current) return;
    if (settleRef.current) window.clearTimeout(settleRef.current);
    settleRef.current = window.setTimeout(commitFromScroll, 90);
  }

  function startTyping() {
    if (!editable) return;
    const current = options.find((o) => o.value === value);
    setDraft(current?.label ?? String(value));
    setTyping(true);
  }

  function applyDraft() {
    const raw = draft.trim();
    setTyping(false);
    if (!raw) {
      scrollToValue(value, false);
      return;
    }
    const digits = raw.replace(/\D/g, "");
    const n = digits ? Number(digits) : NaN;

    const byLabel = options.find(
      (o) => o.label === raw || o.label === digits || o.label === String(n),
    );
    if (byLabel) {
      onChange(byLabel.value);
      return;
    }
    const byValue = options.find((o) => o.value === n);
    if (byValue) {
      onChange(byValue.value);
      return;
    }
    if (!Number.isNaN(n) && options.length) {
      let best = options[0];
      let bestDist = Math.abs(options[0].value - n);
      for (const o of options) {
        const d = Math.abs(o.value - n);
        if (d < bestDist) {
          best = o;
          bestDist = d;
        }
        const labelN = Number(o.label.replace(/\D/g, ""));
        if (!Number.isNaN(labelN)) {
          const ld = Math.abs(labelN - n);
          if (ld < bestDist) {
            best = o;
            bestDist = ld;
          }
        }
      }
      onChange(best.value);
      return;
    }
    scrollToValue(value, false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === "Escape") {
      setTyping(false);
      scrollToValue(value, false);
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-1.5", widthClass)}>
      <span className="text-[13px] font-semibold tracking-wide text-[#e8d19a]/85">
        {label}
      </span>

      <div
        className="relative w-full overflow-hidden rounded-[22px]"
        style={{
          height: ITEM_H * VISIBLE,
          background:
            "linear-gradient(180deg, rgba(10,20,40,0.72) 0%, rgba(6,14,30,0.78) 100%)",
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.1), 0 8px 20px rgba(0,0,0,0.18)",
        }}
      >
        {/* fade edges */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,12,26,0.95) 0%, transparent 100%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-10"
          style={{
            background:
              "linear-gradient(0deg, rgba(5,12,26,0.95) 0%, transparent 100%)",
          }}
          aria-hidden
        />

        {/* pill selection band */}
        <div
          className="pointer-events-none absolute inset-x-1.5 top-1/2 z-[1] h-10 -translate-y-1/2 rounded-full"
          style={{
            background: "rgba(232,209,154,0.12)",
            boxShadow:
              "inset 0 0 0 1.5px rgba(232,209,154,0.55), 0 0 12px rgba(213,177,111,0.12)",
          }}
          aria-hidden
        />

        {typing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={applyDraft}
            onKeyDown={onKeyDown}
            inputMode="numeric"
            aria-label={ariaLabel ?? label}
            className="absolute inset-x-2 top-1/2 z-[3] h-10 -translate-y-1/2 rounded-full bg-transparent text-center text-[18px] font-bold tabular-nums text-[#e8d19a] outline-none"
          />
        ) : (
          <div
            ref={scrollerRef}
            data-birth-wheel
            className="date-wheel-col relative z-0 h-full w-full overflow-y-auto overscroll-contain"
            style={{
              scrollSnapType: "y mandatory",
              WebkitOverflowScrolling: "touch",
            }}
            onScroll={onScroll}
            role="listbox"
            aria-label={ariaLabel ?? label}
          >
            <div style={{ height: PAD }} aria-hidden />
            {options.map((opt) => {
              const selected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    if (editable && selected) {
                      startTyping();
                      return;
                    }
                    onChange(opt.value);
                  }}
                  className={cn(
                    "flex w-full shrink-0 items-center justify-center font-semibold tabular-nums outline-none transition-all duration-150",
                    selected
                      ? "text-[17px] text-[#e8d19a]"
                      : "text-[14px] text-white/28",
                  )}
                  style={{
                    height: ITEM_H,
                    scrollSnapAlign: "center",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
            <div style={{ height: PAD }} aria-hidden />
          </div>
        )}
      </div>
    </div>
  );
}
