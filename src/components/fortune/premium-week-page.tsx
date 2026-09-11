"use client";

import { useMemo, useState } from "react";
import {
  PremiumDetailShell,
  DetailSection,
  usePremiumProfileGate,
  useAnalyzeInputFromProfile,
} from "@/components/fortune/premium-detail-shell";
import {
  buildPremiumValuePack,
  type WeekStatus,
} from "@/lib/fortune/build-premium-value-pack";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<WeekStatus, string> = {
  good: "วันเปิดทาง",
  steady: "วันเดินต่อ",
  rest: "วันพักใจ",
};

const STATUS_DOT: Record<WeekStatus, string> = {
  good: "bg-[#5B8C5A]",
  steady: "bg-[#d5b16f]",
  rest: "bg-[#e8d19a]/70",
};

export function PremiumWeekPage() {
  const { ready, profile } = usePremiumProfileGate();
  const input = useAnalyzeInputFromProfile(profile);
  const pack = useMemo(
    () => (input ? buildPremiumValuePack(input) : null),
    [input]
  );
  const [idx, setIdx] = useState(0);

  if (!ready || !pack) {
    return (
      <div className="px-4 py-10 text-center text-[14px] text-[#f7f4ec]/55">
        กำลังเปิด…
      </div>
    );
  }

  const active = pack.week[idx] ?? pack.week[0]!;

  return (
    <PremiumDetailShell title="สัปดาห์นี้">
      <p className="mt-1 text-[13px] text-[#f7f4ec]/65">
        กดวันที่วงกลม · อ่านรายละเอียดด้านล่าง
      </p>

      <div className="mae-aspect-card mt-4 rounded-[20px] px-3 py-3.5">
        <div className="flex justify-between gap-1">
          {pack.week.map((d, i) => (
            <button
              key={d.iso}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1.5 rounded-[12px] py-2 outline-none transition",
                i === idx
                  ? "bg-[rgba(213,177,111,0.18)]"
                  : "active:bg-[rgba(213,177,111,0.08)]"
              )}
            >
              <span className="text-[11px] font-medium text-[#f7f4ec]/65">
                {d.weekdayShort}
              </span>
              <span
                className={cn("h-3 w-3 rounded-full", STATUS_DOT[d.status])}
              />
              <span className="text-[10px] text-[#e8d19a]/75">{d.score}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(Object.keys(STATUS_LABEL) as WeekStatus[]).map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] text-[#e8d19a]"
            style={{
              background: "rgba(213,177,111,0.1)",
              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.32)",
            }}
          >
            <span className={cn("h-2 w-2 rounded-full", STATUS_DOT[s])} />
            {STATUS_LABEL[s]}
          </span>
        ))}
      </div>

      <DetailSection
        eyebrow={STATUS_LABEL[active.status]}
        title={active.copy.tip}
      >
        <p>{active.copy.body}</p>
      </DetailSection>

      <div className="mt-3 space-y-2">
        {pack.week.map((d, i) => (
          <button
            key={d.iso}
            type="button"
            onClick={() => setIdx(i)}
            className={cn(
              "mae-aspect-card flex w-full items-center gap-3 rounded-[16px] px-3 py-2.5 text-left outline-none transition",
              i === idx && "border-[rgba(213,177,111,0.72)]"
            )}
          >
            <span className={cn("h-2.5 w-2.5 rounded-full", STATUS_DOT[d.status])} />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-[#f7f4ec]">
                {d.weekdayShort}
              </span>
              <span className="block truncate text-[11px] text-[#f7f4ec]/65">
                {d.copy.tip}
              </span>
            </span>
          </button>
        ))}
      </div>
    </PremiumDetailShell>
  );
}
