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
        className="mb-2 block text-[16px] font-medium text-white/75"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export const sacredInputClassName =
  "w-full rounded-xl border-0 bg-black/25 px-4 py-4 text-[18px] text-white placeholder:text-white/35 outline-none transition-all duration-200 ring-1 ring-inset ring-white/12 focus:bg-black/35 focus:ring-2 focus:ring-[#a855f7]/70";

interface SacredGenderPickerProps {
  value: Gender | "";
  onChange: (gender: Gender) => void;
}

export function SacredGenderPicker({ value, onChange }: SacredGenderPickerProps) {
  return (
    <div
      className="grid grid-cols-3 gap-1.5 rounded-xl bg-black/20 p-1.5 ring-1 ring-inset ring-white/12"
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
              "rounded-lg py-3.5 text-[16px] font-medium transition-all duration-150 active:scale-[0.98]",
              selected
                ? "bg-white text-[#2e1065] shadow-sm"
                : "text-white/55 hover:text-white/85"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
