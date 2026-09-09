"use client";

import {
  PremiumDetailShell,
  DetailSection,
  usePremiumProfileGate,
  useAnalyzeInputFromProfile,
} from "@/components/fortune/premium-detail-shell";
import { buildPremiumValuePack } from "@/lib/fortune/build-premium-value-pack";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const TONE_RING: Record<string, string> = {
  high: "from-[#7B5FD4] to-[#9B7FE8]",
  mid: "from-[#8B7CC8] to-[#B8A9E8]",
  low: "from-[#A89878] to-[#C9B896]",
};

export function PremiumOutlookPage() {
  const { ready, profile } = usePremiumProfileGate();
  const input = useAnalyzeInputFromProfile(profile);
  const pack = useMemo(
    () => (input ? buildPremiumValuePack(input) : null),
    [input]
  );

  if (!ready || !pack) {
    return (
      <div className="px-4 py-10 text-center text-[14px] text-[#8A82B0]">
        กำลังเปิด…
      </div>
    );
  }

  return (
    <PremiumDetailShell title="จังหวะ 3 วัน">
      <p className="mt-1 text-[13px] text-[#6B6490]">
        สรุปสั้นบนการ์ด · อ่านรายละเอียดทีละวันด้านล่าง
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {pack.outlook.map((d) => (
          <div
            key={d.iso}
            className="rounded-[16px] bg-white/70 px-2 py-3 text-center ring-1 ring-[#9B7FE8]/2"
          >
            <span
              className={cn(
                "mx-auto flex h-12 w-12 flex-col items-center justify-center rounded-full bg-gradient-to-br leading-none text-white",
                TONE_RING[d.tone]
              )}
            >
              <span className="text-[15px] font-bold">{d.score}</span>
              <span className="text-[9px] font-semibold opacity-85">/12</span>
            </span>
            <p className="mt-1.5 text-[12px] font-semibold text-[#241C4F]">
              {d.label}
            </p>
            <p className="text-[10px] text-[#8A82B0]">{d.shortDate}</p>
          </div>
        ))}
      </div>

      {pack.outlook.map((d) => (
        <DetailSection
          key={d.iso}
          eyebrow={d.label}
          title={d.copy.vibe}
        >
          <p className="mb-2 inline-flex rounded-full bg-[#9B7FE8]/12 px-2.5 py-0.5 text-[11px] font-medium text-[#5B45B8]">
            {d.copy.doHint}
          </p>
          <p>{d.copy.body}</p>
        </DetailSection>
      ))}
    </PremiumDetailShell>
  );
}
