"use client";

import { useState } from "react";
import { MapPin, Clock } from "lucide-react";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import {
  writeFortuneProfile,
  type FortuneUserProfile,
} from "@/lib/fortune/profile-storage";
import { cn } from "@/lib/utils";

const FOCUS_OPTIONS: { id: FortuneFocus; label: string }[] = [
  { id: "life", label: "ชีวิตภาพรวม" },
  { id: "work", label: "การงาน" },
  { id: "money", label: "การเงิน" },
  { id: "love", label: "ความรัก" },
  { id: "health", label: "สุขภาพ" },
];

/** After premium unlock — collect time + birth place for deeper analysis */
export function PremiumDeepenForm({
  profile,
  onSaved,
  onSkip,
  className,
}: {
  profile: FortuneUserProfile;
  onSaved: (next: FortuneUserProfile) => void;
  onSkip: (next: FortuneUserProfile) => void;
  className?: string;
}) {
  const [birthTime, setBirthTime] = useState(profile.birthTime ?? "");
  const [birthPlace, setBirthPlace] = useState(profile.birthPlace ?? "");
  const [focus, setFocus] = useState<FortuneFocus>(profile.focus ?? "life");
  const [error, setError] = useState<string | null>(null);

  function save() {
    if (!/^\d{1,2}:\d{2}$/.test(birthTime)) {
      setError("กรุณาเลือกเวลาเกิด หรือข้ามไปดูแบบประมาณก่อน");
      return;
    }
    if (birthPlace.trim().length < 2) {
      setError("กรุณาระบุจังหวัดหรือเมืองเกิด");
      return;
    }
    const next = writeFortuneProfile({
      ...profile,
      birthTime: birthTime.trim(),
      birthPlace: birthPlace.trim(),
      focus,
      deepenSkipped: false,
    });
    onSaved(next);
  }

  function skip() {
    const next = writeFortuneProfile({
      ...profile,
      deepenSkipped: true,
    });
    onSkip(next);
  }

  return (
    <section
      className={cn(
        "fortune-glass mx-auto w-full max-w-[480px] rounded-[22px] px-4 py-5 text-center",
        className
      )}
    >
      <p className="text-[12px] font-semibold tracking-[0.14em] text-[#8B7BC8]">
        พรีเมียม · ขั้นต่อไป
      </p>
      <h1 className="mt-1.5 text-[1.35rem] font-semibold leading-snug text-[#2C2458]">
        กรอกเพิ่มเพื่อวิเคราะห์เชิงลึก
      </h1>
      <p className="mx-auto mt-2 max-w-[20rem] text-[14px] leading-relaxed text-[#5E5688]">
        ดวงฟรีใช้แค่วันเกิด ส่วนพรีเมียมใช้เวลาเกิดและสถานที่เกิด
        เพื่อให้จังหวะวันและเชิงลึกแม่นขึ้น
      </p>

      <div className="mt-5 space-y-4 text-left">
        <label className="block">
          <span className="mb-2 flex items-center justify-center gap-1.5 text-[13px] font-medium text-[#5E5688]">
            <Clock className="h-4 w-4 text-[#7B5FD4]" strokeWidth={2} />
            เวลาเกิด
          </span>
          <input
            type="time"
            value={birthTime}
            onChange={(e) => {
              setBirthTime(e.target.value);
              setError(null);
            }}
            className="name-step-input text-center"
          />
          <span className="mt-1.5 block text-center text-[12px] text-[#9A90C0]">
            ไม่ทราบเวลาแน่ ๆ ลองใส่ช่วงที่ใกล้เคียงที่สุด
          </span>
        </label>

        <label className="block">
          <span className="mb-2 flex items-center justify-center gap-1.5 text-[13px] font-medium text-[#5E5688]">
            <MapPin className="h-4 w-4 text-[#7B5FD4]" strokeWidth={2} />
            จังหวัดหรือเมืองเกิด
          </span>
          <input
            type="text"
            value={birthPlace}
            onChange={(e) => {
              setBirthPlace(e.target.value);
              setError(null);
            }}
            placeholder="เช่น กรุงเทพฯ / เชียงใหม่"
            className="name-step-input text-center"
            autoComplete="address-level1"
          />
        </label>

        <div className="block">
          <span className="mb-2 block text-center text-[13px] font-medium text-[#5E5688]">
            ตอนนี้โฟกัสเรื่องไหน
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {FOCUS_OPTIONS.map((opt) => {
              const selected = focus === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFocus(opt.id)}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-[13px] font-medium outline-none transition active:scale-[0.98]",
                    selected
                      ? "bg-[#6A48C8] text-white shadow-[0_6px_14px_rgba(106,72,200,0.28)]"
                      : "bg-white/70 text-[#4A4278] ring-1 ring-[#7B6BB0]/18"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-center text-[13px] text-rose-600">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={save}
          className="flex w-full items-center justify-center rounded-full bg-[#6A48C8] px-4 py-3.5 text-[15px] font-semibold text-white outline-none transition active:scale-[0.99]"
        >
          บันทึกแล้วดูดวงเชิงลึก
        </button>

        <button
          type="button"
          onClick={skip}
          className="w-full py-2 text-center text-[13px] text-[#8B7BC8] outline-none transition active:opacity-70"
        >
          ข้ามไปก่อน · ดูแบบประมาณ
        </button>
      </div>
    </section>
  );
}
