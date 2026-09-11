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
        "mae-aspect-card mx-auto w-full max-w-[360px] rounded-[22px] px-4 py-5 text-center",
        className
      )}
    >
      <p className="mae-gold-text text-[11px] font-semibold tracking-[0.16em]">
        พรีเมียม · ขั้นต่อไป
      </p>
      <h1 className="mae-gold-text mt-1.5 text-[1.25rem] font-bold leading-snug tracking-tight">
        กรอกเพิ่มเพื่อวิเคราะห์เชิงลึก
      </h1>
      <p className="mx-auto mt-2 max-w-[19rem] text-[13px] leading-relaxed text-[#c5cdd9]/75">
        ดวงฟรีใช้แค่วันเกิด ส่วนพรีเมียมใช้เวลาเกิดและสถานที่เกิด
        เพื่อให้จังหวะวันและเชิงลึกแม่นขึ้น
      </p>

      <div className="mt-5 space-y-4 text-left">
        <label className="block">
          <span className="mb-2 flex items-center justify-center gap-1.5 text-[13px] font-medium text-[#e8d19a]/90">
            <Clock className="h-4 w-4 text-[#d5b16f]" strokeWidth={2} />
            เวลาเกิด
          </span>
          <input
            type="time"
            value={birthTime}
            onChange={(e) => {
              setBirthTime(e.target.value);
              setError(null);
            }}
            className="h-11 w-full rounded-full px-4 text-center text-[15px] text-[#f7f4ec] outline-none transition placeholder:text-[#9aa3b2]/55 focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35"
            style={{
              background: "rgba(16,24,39,0.72)",
              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.35)",
              colorScheme: "dark",
            }}
          />
          <span className="mt-1.5 block text-center text-[12px] text-[#c5cdd9]/55">
            ไม่ทราบเวลาแน่ ๆ ลองใส่ช่วงที่ใกล้เคียงที่สุด
          </span>
        </label>

        <label className="block">
          <span className="mb-2 flex items-center justify-center gap-1.5 text-[13px] font-medium text-[#e8d19a]/90">
            <MapPin className="h-4 w-4 text-[#d5b16f]" strokeWidth={2} />
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
            className="h-11 w-full rounded-full px-4 text-center text-[15px] text-[#f7f4ec] outline-none transition placeholder:text-[#9aa3b2]/55 focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35"
            style={{
              background: "rgba(16,24,39,0.72)",
              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.35)",
            }}
            autoComplete="address-level1"
          />
        </label>

        <div className="block">
          <span className="mb-2 block text-center text-[13px] font-medium text-[#e8d19a]/90">
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
                      ? "bg-[#d5b16f] text-[#101827] shadow-[0_6px_14px_rgba(213,177,111,0.28)]"
                      : "text-[#e8d19a]/85"
                  )}
                  style={
                    selected
                      ? undefined
                      : {
                          background: "rgba(16,24,39,0.55)",
                          boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
                        }
                  }
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <p className="rounded-xl bg-[rgba(255,77,122,0.12)] px-3 py-2 text-center text-[13px] text-[#ff8fa3]">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={save}
          className="mae-gold-cta flex h-11 w-full items-center justify-center rounded-full text-[14px] font-semibold tracking-wide text-[#101827] outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
        >
          บันทึกแล้วดูดวงเชิงลึก
        </button>

        <button
          type="button"
          onClick={skip}
          className="w-full py-2 text-center text-[13px] text-[#e8d19a]/80 outline-none transition hover:text-[#f7f4ec] active:opacity-70"
        >
          ข้ามไปก่อน · ดูแบบประมาณ
        </button>
      </div>
    </section>
  );
}
