"use client";

import { cn } from "@/lib/utils";

export const GENDER_OPTIONS = [
  { id: "female", label: "หญิง" },
  { id: "male", label: "ชาย" },
  { id: "unspecified", label: "ไม่ระบุ" },
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
        className="mb-2 block text-[15.5px] font-medium tracking-wide text-[#e8d19a]"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export const sacredInputClassName =
  "w-full rounded-xl border-0 bg-[rgba(16,24,39,0.72)] px-4 py-3.5 text-[15.5px] text-[#f7f4ec] placeholder:text-[#bacce6]/55 outline-none transition-all duration-200 ring-1 ring-inset ring-[rgba(232,209,154,0.28)] focus:bg-[rgba(16,24,39,0.88)] focus:ring-2 focus:ring-[#d5b16f]/45";

interface SacredGenderPickerProps {
  value: Gender | "";
  onChange: (gender: Gender) => void;
}

export function SacredGenderPicker({ value, onChange }: SacredGenderPickerProps) {
  return (
    <div
      className="grid grid-cols-2 gap-1.5 rounded-xl bg-[rgba(16,24,39,0.55)] p-1.5 ring-1 ring-inset ring-[rgba(232,209,154,0.28)]"
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
              "rounded-lg px-2 py-2.5 text-[15.5px] font-semibold outline-none transition",
              selected
                ? "bg-[#d5b16f] text-[#101827]"
                : "text-[#e8d19a]/75 hover:bg-[rgba(213,177,111,0.1)] hover:text-[#e8d19a]"
            )}
          >
            <span className="dd-btn-label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
