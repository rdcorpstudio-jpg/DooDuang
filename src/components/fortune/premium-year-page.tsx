"use client";

import { PageBackButton } from "@/components/ui/page-back-button";
import { FortuneFreeMonthTrend } from "@/components/fortune/fortune-free-month-trend";
import {
  usePremiumProfileGate,
  useAnalyzeInputFromProfile,
} from "@/components/fortune/premium-detail-shell";
import { APP_BRAND_MARK } from "@/lib/site";

/**
 * หน้าแยกจังหวะชีวิตรายปี/รายเดือน — จากเมนู “ดวงรายปี”
 */
export function PremiumYearPage() {
  const { ready, profile } = usePremiumProfileGate();
  const input = useAnalyzeInputFromProfile(profile);

  if (!ready || !input) {
    return (
      <div className="px-4 py-10 text-center text-[14px] text-[#f7f4ec]/55">
        กำลังเปิด…
      </div>
    );
  }

  const seed = `year-rhythm-${input.birthDate}-${input.nickname}`;

  return (
    <div className="relative mx-auto w-full max-w-[480px] px-4 pb-16 pt-2">
      <header className="relative flex min-h-11 items-center justify-center py-2">
        <PageBackButton href="/menu" absolute />
        <div className="min-w-0 px-20 text-center">
          <p className="text-[11px] tracking-[0.18em] text-[#d5b16f]/75">
            {APP_BRAND_MARK}
          </p>
          <h1 className="text-[1.2rem] font-bold tracking-wide text-[#f7f4ec]">
            ดวงรายปี
          </h1>
        </div>
      </header>

      <p className="mt-1 text-center text-[12.5px] leading-relaxed text-[#c5cdd9]/75">
        ดูจังหวะชีวิตแบบเส้นเวลา สลับรายเดือนหรือรายปีได้
      </p>

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
          detailHrefBase="/premium/year/detail"
        />
      </div>
    </div>
  );
}
