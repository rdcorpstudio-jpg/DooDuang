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
      <div className="px-4 py-10 text-center text-[14px] text-[#f7f4ec]/55">
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
      <p className="mt-1 text-[13px] text-[#f7f4ec]/65">
        ใส่วันเกิดอีกคน แล้วดูจังหวะเข้ากันแบบสั้น ๆ
      </p>

      <div className="mae-aspect-card mt-4 rounded-[20px] px-3.5 py-4">
        <p className="text-[12px] font-semibold text-[#d5b16f]">
          วันเกิดอีกฝ่าย
        </p>
        <div className="mt-2">
          <BirthDatePicker value={partnerBirth} onChange={setPartnerBirth} tone="mae" />
        </div>
        <button
          type="button"
          disabled={!partnerBirth}
          onClick={handleSave}
          className="no-sky-lift mt-3 w-full rounded-full py-3 text-[14px] font-semibold text-[#101827] outline-none transition enabled:active:scale-[0.99] disabled:opacity-35"
          style={{
            background: "linear-gradient(90deg, #b8923f 0%, #d5b16f 55%, #e8d19a 100%)",
          }}
        >
          {saved && couple ? "อัปเดตผล" : "ดูความเข้ากัน"}
        </button>
      </div>

      {couple ? (
        <>
          <div className="mae-aspect-card mt-3 rounded-[20px] px-4 py-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <span
                className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#e8d19a]"
                style={{
                  background: "rgba(213,177,111,0.12)",
                  boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.32)",
                }}
              >
                คุณ · {couple.youSign}
              </span>
              <span className="text-[#d5b16f]">♥</span>
              <span
                className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#e8d19a]"
                style={{
                  background: "rgba(213,177,111,0.12)",
                  boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.32)",
                }}
              >
                อีกฝ่าย · {couple.partnerSign}
              </span>
            </div>
            <p
              className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-full text-[1.25rem] font-bold text-[#101827]"
              style={{
                background: "linear-gradient(145deg, #b8923f, #d5b16f)",
              }}
            >
              {couple.score}
            </p>
            <p className="mt-2 text-[15px] font-semibold text-[#f7f4ec]">
              {couple.copy.vibeTitle}
            </p>
            <p className="mt-1 text-[12px] text-[#f7f4ec]/65">{couple.copy.blurb}</p>
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
