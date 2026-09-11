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
  high: "from-[#8a6a28] to-[#d5b16f]",
  mid: "from-[#6a5840] to-[#c4a86a]",
  low: "from-[#5a5040] to-[#a89870]",
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
      <div className="px-4 py-10 text-center text-[14px] text-[#f7f4ec]/55">
        กำลังเปิด…
      </div>
    );
  }

  return (
    <PremiumDetailShell title="จังหวะ 3 วัน">
      <p className="mt-1 text-[13px] text-[#f7f4ec]/65">
        สรุปสั้นบนการ์ด · อ่านรายละเอียดทีละวันด้านล่าง
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {pack.outlook.map((d) => (
          <div
            key={d.iso}
            className="mae-aspect-card rounded-[16px] px-2 py-3 text-center"
          >
            <span
              className={cn(
                "mx-auto flex h-12 w-12 flex-col items-center justify-center rounded-full bg-gradient-to-br leading-none text-white shadow-[0_4px_12px_rgba(0,0,0,0.3)]",
                TONE_RING[d.tone]
              )}
            >
              <span className="text-[15px] font-bold">{d.score}</span>
              <span className="text-[9px] font-semibold opacity-85">/12</span>
            </span>
            <p className="mt-1.5 text-[12px] font-semibold text-[#f7f4ec]">
              {d.label}
            </p>
            <p className="text-[10px] text-[#f7f4ec]/55">{d.shortDate}</p>
          </div>
        ))}
      </div>

      {pack.outlook.map((d) => (
        <DetailSection key={d.iso} eyebrow={d.label} title={d.copy.vibe}>
          <p
            className="mb-2 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium text-[#e8d19a]"
            style={{
              background: "rgba(213,177,111,0.12)",
              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.32)",
            }}
          >
            {d.copy.doHint}
          </p>
          <p>{d.copy.body}</p>
        </DetailSection>
      ))}
    </PremiumDetailShell>
  );
}
