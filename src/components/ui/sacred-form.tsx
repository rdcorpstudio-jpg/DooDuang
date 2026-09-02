"use client";

import { cn } from "@/lib/utils";
import { useSacredBurst } from "@/components/ui/sacred-burst";

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
        className="mb-2.5 block text-[11px] tracking-[0.16em] text-amber-100/70"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export const sacredInputClassName =
  "w-full rounded-xl border border-brand-purple-light/25 bg-brand-purple-dark/35 px-4 py-3.5 text-[15px] text-white placeholder:text-purple-200/40 outline-none transition-all duration-200 focus:border-amber-200/40 focus:bg-brand-purple-dark/50 focus:shadow-[0_0_0_1px_rgba(212,175,55,0.12),0_0_20px_rgba(168,85,247,0.18)]";

interface SacredGenderPickerProps {
  value: Gender | "";
  onChange: (gender: Gender) => void;
}

function GenderOptionButton({
  option,
  selected,
  onSelect,
}: {
  option: (typeof GENDER_OPTIONS)[number];
  selected: boolean;
  onSelect: (id: Gender) => void;
}) {
  const { triggerBurst, BurstLayer } = useSacredBurst();

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={(e) => {
        triggerBurst(e);
        onSelect(option.id);
      }}
      className={cn(
        "relative overflow-hidden rounded-full border py-3 text-sm tracking-wide transition-all duration-200",
        selected
          ? "border-amber-200/45 bg-gradient-to-b from-brand-purple/35 to-brand-purple-dark/40 text-white shadow-[0_0_20px_rgba(168,85,247,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "border-brand-purple-light/25 bg-brand-purple-dark/30 text-purple-100/65 hover:border-brand-purple-light/40 hover:bg-brand-purple-dark/45 hover:text-purple-50 active:scale-[0.98]"
      )}
    >
      <BurstLayer size="sm" />
      <span className="relative z-[1]">{option.label}</span>
    </button>
  );
}

export function SacredGenderPicker({ value, onChange }: SacredGenderPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5" role="group" aria-label="เพศ">
      {GENDER_OPTIONS.map((option) => (
        <GenderOptionButton
          key={option.id}
          option={option}
          selected={value === option.id}
          onSelect={onChange}
        />
      ))}
    </div>
  );
}
