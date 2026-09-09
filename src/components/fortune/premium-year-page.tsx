"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  PremiumDetailShell,
  DetailSection,
  usePremiumProfileGate,
  useAnalyzeInputFromProfile,
} from "@/components/fortune/premium-detail-shell";
import { yearScoreForCe } from "@/lib/fortune/build-daily-pack";
import {
  scoreBand,
  yearDetailForCe,
} from "@/lib/fortune/year-rhythm";

/** Full-page year reading (replaces YearDetailPopup) */
export function PremiumYearPage() {
  const search = useSearchParams();
  const { ready, profile } = usePremiumProfileGate();
  const input = useAnalyzeInputFromProfile(profile);

  const data = useMemo(() => {
    if (!input) return null;
    const nowCe = new Date().getFullYear();
    const raw = Number(search.get("ce"));
    const ce =
      Number.isFinite(raw) && raw >= nowCe - 2 && raw <= nowCe + 9
        ? raw
        : nowCe;
    const be = ce + 543;
    const score = yearScoreForCe(input, ce);
    const band = scoreBand(score);
    const { detail } = yearDetailForCe(ce, nowCe);
    const when =
      ce === nowCe ? "ปีนี้" : ce < nowCe ? "ปีที่ผ่านมา" : "ปีข้างหน้า";
    return { ce, be, score, band, detail, when };
  }, [input, search]);

  if (!ready || !data) {
    return (
      <div className="px-4 py-10 text-center text-[14px] text-[#8A82B0]">
        กำลังเปิด…
      </div>
    );
  }

  const { be, score, band, detail, when } = data;

  return (
    <PremiumDetailShell title="จังหวะปีนี้" backHref="/premium">
      <p className="mt-1 text-[13px] text-[#6B6490]">
        {when} · พ.ศ. {be} · {band.label} · {score}/12
      </p>

      <section className="fortune-glass mt-4 rounded-[20px] px-4 py-4">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#A07E1A]">
          ภาพรวม
        </p>
        <p className="mt-2 text-[15px] font-medium leading-[1.7] text-[#241C4F]">
          {detail.overview}
        </p>
        <p className="mt-2 text-[13px] leading-[1.7] text-[#5E5688]">
          {band.meaning}
        </p>
      </section>

      <DetailSection title="จุดเปลี่ยน">{detail.turning}</DetailSection>
      <DetailSection title="ทำไมถึงเป็นแบบนี้">{detail.reason}</DetailSection>
      <DetailSection title="แนวทาง">{detail.guidance}</DetailSection>
      <DetailSection title="จุดเด่น · ใช้ยังไง">
        {band.strength} — {band.use}
      </DetailSection>
    </PremiumDetailShell>
  );
}
