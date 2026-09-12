"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  DetailSection,
  PremiumDetailShell,
  useAnalyzeInputFromProfile,
  usePremiumProfileGate,
} from "@/components/fortune/premium-detail-shell";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { analyzeFortune } from "@/lib/fortune/analyze";
import { pickZodiacDeep } from "@/lib/fortune/content/zodiac-deep";
import { buildPremiumValuePack } from "@/lib/fortune/build-premium-value-pack";

const ASPECT_LABEL: Record<string, string> = {
  work: "งาน",
  money: "เงิน",
  love: "รัก",
  health: "สุขภาพ",
};

/** รายงานสรุปดวง — จาก analyzeFortune + คลังราศี */
export function PremiumReportPage() {
  const { ready, profile } = usePremiumProfileGate();
  const input = useAnalyzeInputFromProfile(profile);

  const data = useMemo(() => {
    if (!input) return null;
    const analysis = analyzeFortune(input);
    const deep = pickZodiacDeep(analysis.zodiac.id);
    const value = buildPremiumValuePack(input);
    const name = (input.nickname || "").replace(/^คุณ\s*/, "").trim() || "คุณ";
    return {
      name,
      analysis,
      deep,
      today: value.outlook[0]!,
      week: value.week[0]!,
    };
  }, [input]);

  if (!ready || !data) {
    return (
      <div className="px-4 py-10 text-center text-[14px] text-[#f7f4ec]/55">
        กำลังเปิด…
      </div>
    );
  }

  const { name, analysis, deep, today } = data;

  return (
    <PremiumDetailShell>
      <header className="mt-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px]"
            style={{
              background:
                "linear-gradient(160deg, rgba(213,177,111,0.14), rgba(16,24,39,0.9))",
              boxShadow:
                "inset 0 0 0 1.5px rgba(213,177,111,0.4), 0 8px 18px rgba(0,0,0,0.22)",
            }}
          >
            <FortuneIcon name="article" size={36} plain />
          </span>
          <div className="min-w-0">
            <h1 className="text-[1.45rem] font-bold tracking-tight text-[#d5b16f]">
              สรุปดวง
            </h1>
            <p className="mt-0.5 text-[14px] text-[#f7f4ec]/65">
              คุณ{name} · ราศี{analysis.zodiac.thaiName}
            </p>
          </div>
        </div>
      </header>

      <DetailSection eyebrow="วันนี้" title={`คะแนน ${today.score}/12`}>
        <p>{today.copy.doHint}</p>
        <p className="mt-2 text-[#f7f4ec]/55">{today.copy.vibe}</p>
      </DetailSection>

      <DetailSection eyebrow="ภาพรวม" title="สี่ด้านหลัก">
        <ul className="grid grid-cols-2 gap-2">
          {analysis.aspects.map((a) => (
            <li
              key={a.id}
              className="rounded-[14px] px-3 py-2.5"
              style={{
                background: "rgba(16,24,39,0.55)",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.22)",
              }}
            >
              <p className="text-[12px] font-semibold text-[#d5b16f]">
                {ASPECT_LABEL[a.id] ?? a.id}
              </p>
              <p className="mt-0.5 text-[18px] font-bold tabular-nums text-[#f7f4ec]">
                {Math.round(a.score)}
                <span className="text-[12px] font-medium text-[#f7f4ec]/45">
                  /12
                </span>
              </p>
            </li>
          ))}
        </ul>
      </DetailSection>

      <DetailSection eyebrow="ตัวตน" title="บทสรุปจากราศี">
        <p>{deep.personality}</p>
      </DetailSection>

      <DetailSection eyebrow="จุดแข็ง" title="สิ่งที่คุณมี">
        <p>{deep.strength}</p>
      </DetailSection>

      <DetailSection eyebrow="ควรรู้" title="เงาและจุดเปลี่ยน">
        <p>{deep.shadow}</p>
        <p className="mt-2 text-[#e8d19a]/90">{deep.turning}</p>
      </DetailSection>

      <DetailSection eyebrow="คำแนะนำ" title="ทางที่เหมาะกับคุณ">
        <p>{deep.advice}</p>
      </DetailSection>

      <div className="mt-4 grid gap-2">
        <Link
          href="/premium/self-map"
          className="mae-aspect-card flex items-center justify-between rounded-[16px] px-3.5 py-3 outline-none transition active:scale-[0.99]"
        >
          <span className="text-[14px] font-semibold text-[#f7f4ec]">
            แผนที่ตัวตนละเอียด
          </span>
          <ChevronRight className="h-4 w-4 text-[#d5b16f]" strokeWidth={2.2} />
        </Link>
        <Link
          href="/premium/year"
          className="mae-aspect-card flex items-center justify-between rounded-[16px] px-3.5 py-3 outline-none transition active:scale-[0.99]"
        >
          <span className="text-[14px] font-semibold text-[#f7f4ec]">
            ดวงรายปี
          </span>
          <ChevronRight className="h-4 w-4 text-[#d5b16f]" strokeWidth={2.2} />
        </Link>
        <Link
          href="/premium"
          className="mae-aspect-card flex items-center justify-between rounded-[16px] px-3.5 py-3 outline-none transition active:scale-[0.99]"
        >
          <span className="text-[14px] font-semibold text-[#f7f4ec]">
            ดวงรายวันเต็ม
          </span>
          <ChevronRight className="h-4 w-4 text-[#d5b16f]" strokeWidth={2.2} />
        </Link>
      </div>
    </PremiumDetailShell>
  );
}
