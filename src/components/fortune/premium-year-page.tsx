"use client";

import { PageBackButton } from "@/components/ui/page-back-button";
import { MaeBrandLink } from "@/components/layout/mae-brand-link";
import { FortuneFreeMonthTrend } from "@/components/fortune/fortune-free-month-trend";
import {
  usePremiumProfileGate,
  useAnalyzeInputFromProfile,
} from "@/components/fortune/premium-detail-shell";

const TITLE_GOLD = {
  background:
    "linear-gradient(180deg, #fffef8 0%, #ffe9b0 24%, #f0d078 48%, #d5b16f 72%, #b8924f 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
} as const;

const TEXT_MUTED = "rgba(186, 204, 230, 0.82)";

/**
 * หน้าแยกจังหวะชีวิตรายปี/รายเดือน — จากเมนู “ดวงรายปี”
 */
export function PremiumYearPage() {
  const { ready, profile } = usePremiumProfileGate();
  const input = useAnalyzeInputFromProfile(profile);

  if (!ready || !input) {
    return (
      <div
        className="px-4 py-10 text-center text-[15.5px] font-medium"
        style={{ color: TEXT_MUTED }}
      >
        กำลังเปิด…
      </div>
    );
  }

  const seed = `year-rhythm-${input.birthDate}-${input.nickname}`;

  return (
    <div className="relative mx-auto min-h-full w-full max-w-[480px] px-5 pb-16 pt-3">
      <header className="relative flex items-center justify-between gap-3 py-1">
        <MaeBrandLink />
        <PageBackButton href="/home" />
      </header>

      <div className="mt-5">
        <p
          className="text-[12.5px] font-semibold tracking-[0.16em]"
          style={{ color: "#e8d19a" }}
        >
          เส้นเวลาชีวิต
        </p>
        <h1
          className="mt-1.5 text-[clamp(1.65rem,7vw,1.9rem)] font-bold leading-[1.35] tracking-tight"
          style={TITLE_GOLD}
        >
          ดวงรายปี
        </h1>
        <p
          className="mt-2 max-w-[20rem] text-[14.5px] font-medium leading-[1.5]"
          style={{ color: TEXT_MUTED }}
        >
          ปัดดูจังหวะ · สลับรายเดือนหรือรายปี
        </p>
      </div>

      <div className="mt-5">
        <FortuneFreeMonthTrend
          seed={seed}
          birthDate={input.birthDate}
          nickname={input.nickname}
          birthTime={input.birthTime}
          birthPlace={input.birthPlace}
          focus={input.focus}
          gender={input.gender}
          unlocked
          initialMode="year"
        />
      </div>
    </div>
  );
}
