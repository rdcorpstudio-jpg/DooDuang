"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PremiumDetailShell,
  DetailSection,
  usePremiumProfileGate,
} from "@/components/fortune/premium-detail-shell";
import { BirthDatePicker } from "@/components/fortune/birth-date-picker";
import {
  buildCouplePack,
  readPartnerBirth,
  writePartnerBirth,
} from "@/lib/fortune/build-premium-value-pack";
import { cn } from "@/lib/utils";

export function PremiumCouplePage() {
  const { ready, profile } = usePremiumProfileGate();
  const [partnerBirth, setPartnerBirth] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = readPartnerBirth();
    if (existing) {
      setPartnerBirth(existing);
      setSaved(true);
    }
  }, []);

  const couple = useMemo(() => {
    if (!profile?.birthDate || !partnerBirth) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(partnerBirth)) return null;
    return buildCouplePack(profile.birthDate, partnerBirth);
  }, [profile, partnerBirth]);

  if (!ready || !profile) {
    return (
      <div className="px-4 py-10 text-center text-[14px] text-[#8A82B0]">
        กำลังเปิด…
      </div>
    );
  }

  function handleSave() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(partnerBirth)) return;
    writePartnerBirth(partnerBirth);
    setSaved(true);
  }

  return (
    <PremiumDetailShell title="ดวงคู่ / คนรอบตัว">
      <p className="mt-1 text-[13px] text-[#6B6490]">
        ใส่วันเกิดอีกคน แล้วดูจังหวะเข้ากันแบบสั้น ๆ
      </p>

      <div className="fortune-glass mt-4 rounded-[20px] px-3.5 py-4">
        <p className="text-[12px] font-semibold text-[#7B5FD4]">
          วันเกิดอีกฝ่าย
        </p>
        <div className="mt-2">
          <BirthDatePicker value={partnerBirth} onChange={setPartnerBirth} />
        </div>
        <button
          type="button"
          disabled={!partnerBirth}
          onClick={handleSave}
          className="no-sky-lift mt-3 w-full rounded-full bg-gradient-to-r from-[#7B5FD4] to-[#9B7FE8] py-3 text-[14px] font-semibold text-white outline-none transition enabled:active:scale-[0.99] disabled:opacity-35"
        >
          {saved && couple ? "อัปเดตผล" : "ดูความเข้ากัน"}
        </button>
      </div>

      {couple ? (
        <>
          <div className="fortune-glass mt-3 rounded-[20px] px-4 py-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <span className="rounded-full bg-[#9B7FE8]/14 px-3 py-1.5 text-[12px] font-semibold text-[#5B45B8]">
                คุณ · {couple.youSign}
              </span>
              <span className="text-[#C9A227]">♥</span>
              <span className="rounded-full bg-[#F4BC52]/18 px-3 py-1.5 text-[12px] font-semibold text-[#8A6A10]">
                อีกฝ่าย · {couple.partnerSign}
              </span>
            </div>
            <p
              className={cn(
                "mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#7B5FD4] to-[#9B7FE8] text-[1.25rem] font-bold text-white"
              )}
            >
              {couple.score}
            </p>
            <p className="mt-2 text-[15px] font-semibold text-[#241C4F]">
              {couple.copy.vibeTitle}
            </p>
            <p className="mt-1 text-[12px] text-[#6B6490]">{couple.copy.blurb}</p>
          </div>

          <DetailSection title="จุดที่ไปด้วยกันได้">
            <p>{couple.copy.together}</p>
          </DetailSection>
          <DetailSection title="จุดเสียดสีที่พบบ่อย">
            <p>{couple.copy.friction}</p>
          </DetailSection>
          <DetailSection title="วิธีคุยให้ดีขึ้น">
            <p>{couple.copy.tip}</p>
          </DetailSection>
        </>
      ) : null}
    </PremiumDetailShell>
  );
}
