"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ZODIAC_SIGNS, type ZodiacSign } from "@/lib/fortune/zodiac";

interface ZodiacPickerProps {
  selected: ZodiacSign | null;
  onSelect: (sign: ZodiacSign) => void;
}

const ELEMENT_STYLE: Record<string, string> = {
  ไฟ: "text-orange-300/70 bg-orange-500/10 border-orange-400/20",
  ดิน: "text-amber-300/70 bg-amber-500/10 border-amber-400/20",
  ลม: "text-sky-300/70 bg-sky-500/10 border-sky-400/20",
  น้ำ: "text-cyan-300/70 bg-cyan-500/10 border-cyan-400/20",
};

function RevealItem({
  visible,
  delay,
  children,
  className,
}: {
  visible: boolean;
  delay: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("reveal-up", visible && "is-visible", className)}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export function ZodiacPicker({ selected, onSelect }: ZodiacPickerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {ZODIAC_SIGNS.map((zodiac, index) => {
        const isSelected = selected === zodiac.id;

        return (
          <RevealItem key={zodiac.id} visible={mounted} delay={100 + index * 45}>
            <button
              type="button"
              onClick={() => onSelect(zodiac.id)}
              className={cn(
                "glass-frame relative w-full overflow-hidden rounded-2xl p-3 text-center transition-all duration-300",
                isSelected
                  ? "scale-[1.03] shadow-[0_0_24px_rgba(168,85,247,0.4)]"
                  : "active:scale-[0.98]"
              )}
            >
              {isSelected ? (
                <span className="pointer-events-none absolute inset-0 bg-[#a967f5]/18" aria-hidden />
              ) : null}

              <div className="relative z-[1] mb-1.5 text-2xl leading-none">{zodiac.symbol}</div>
              <div className="relative z-[1] text-xs font-semibold text-white/90">{zodiac.thaiName}</div>
              <div className="relative z-[1] mt-1 text-[9px] leading-tight text-purple-300/50">
                {zodiac.dateRange}
              </div>
              <span
                className={cn(
                  "relative z-[1] mt-2 inline-block rounded-full border px-1.5 py-0.5 text-[8px]",
                  ELEMENT_STYLE[zodiac.element]
                )}
              >
                {zodiac.element}
              </span>
            </button>
          </RevealItem>
        );
      })}
    </div>
  );
}
