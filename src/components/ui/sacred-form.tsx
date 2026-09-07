"use client";

import { cn } from "@/lib/utils";

export const GENDER_OPTIONS = [
  { id: "female", label: "หญิง" },
  { id: "male", label: "ชาย" },
  { id: "other", label: "อื่นๆ" },
] as const;

export type Gender = (typeof GENDER_OPTIONS)[number]["id"];

export function SacredField({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-[14px] font-medium tracking-wide text-white/70"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export const sacredInputClassName =
  "w-full rounded-xl border-0 bg-[#0f0a24]/55 px-4 py-3.5 text-[16px] text-white placeholder:text-white/32 outline-none transition-all duration-200 ring-1 ring-inset ring-[#c9a8ff]/18 focus:bg-[#0f0a24]/75 focus:ring-2 focus:ring-[#a967f5]/55 focus:shadow-[0_0_16px_rgba(169,103,245,0.18)]";

interface SacredGenderPickerProps {
  value: Gender | "";
  onChange: (gender: Gender) => void;
}

export function SacredGenderPicker({ value, onChange }: SacredGenderPickerProps) {
  return (
    <div
      className="grid grid-cols-3 gap-1.5 rounded-xl bg-[#0f0a24]/45 p-1.5 ring-1 ring-inset ring-[#c9a8ff]/18"
      role="group"
      aria-label="เพศ"
    >
      {GENDER_OPTIONS.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded-lg py-3 text-[15px] font-medium transition-all duration-200 active:scale-[0.98]",
              selected
                ? "bg-gradient-to-b from-[#b66bff] to-[#8b3fd9] text-white shadow-[0_4px_14px_rgba(169,103,245,0.4)]"
                : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
