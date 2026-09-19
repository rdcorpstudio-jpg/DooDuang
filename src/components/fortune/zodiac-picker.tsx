"use client";

import { useEffect, useState } from "react";
import { ZodiacSignImage } from "@/components/fortune/zodiac-sign-image";
import { cn } from "@/lib/utils";
import { ZODIAC_SIGNS, type ZodiacSign } from "@/lib/fortune/zodiac";

interface ZodiacPickerProps {
  selected: ZodiacSign | null;
  onSelect: (sign: ZodiacSign) => void;
}

const ELEMENT_STYLE: Record<string, string> = {
  ไฟ: "text-[#f0a070] bg-[rgba(240,160,112,0.12)] border-[rgba(240,160,112,0.35)]",
  ดิน: "text-[#e8d19a] bg-[rgba(213,177,111,0.12)] border-[rgba(232,209,154,0.35)]",
  ลม: "text-[#bacce6] bg-[rgba(186,204,230,0.12)] border-[rgba(186,204,230,0.35)]",
  น้ำ: "text-[#8ec5e8] bg-[rgba(142,197,232,0.12)] border-[rgba(142,197,232,0.35)]",
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
                  ? "scale-[1.03] shadow-[0_0_24px_rgba(213,177,111,0.35)]"
                  : "active:scale-[0.98]"
              )}
            >
              {isSelected ? (
                <span
                  className="pointer-events-none absolute inset-0 bg-[rgba(213,177,111,0.16)]"
                  aria-hidden
                />
              ) : null}

              <div className="relative z-[1] mb-1 flex justify-center">
                <ZodiacSignImage
                  sign={zodiac.id}
                  variant="orb"
                  size={44}
                  alt={zodiac.thaiName}
                />
              </div>
              <div className="relative z-[1] text-[15.5px] font-semibold text-[#f7f4ec]">
                {zodiac.thaiName}
              </div>
              <div className="relative z-[1] mt-1 text-[15.5px] font-medium leading-tight text-[#e8d19a]/75">
                {zodiac.dateRange}
              </div>
              <span
                className={cn(
                  "relative z-[1] mt-2 inline-block rounded-full border px-2 py-0.5 text-[15.5px] font-medium",
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
