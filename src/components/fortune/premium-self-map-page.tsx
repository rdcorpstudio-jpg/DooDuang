"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, ChevronRight, Heart, Briefcase, Quote, UserRound } from "lucide-react";
import {
  PremiumDetailShell,
  usePremiumProfileGate,
  useAnalyzeInputFromProfile,
} from "@/components/fortune/premium-detail-shell";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { analyzeFortune } from "@/lib/fortune/analyze";
import { pickZodiacDeep } from "@/lib/fortune/content/zodiac-deep";
import { buildPremiumValuePack } from "@/lib/fortune/build-premium-value-pack";
import { cn } from "@/lib/utils";

function splitBullets(text: string, max = 3): string[] {
  if (/[·•]/.test(text)) {
    return text
      .split(/[·•]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, max);
  }
  const parts = text
    .split(/(?=\s(?:การ|และ|จึง|ข้อ|ถ้า|เมื่อ|บาง))/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 10);
  if (parts.length >= 2) return parts.slice(0, max);
  const out: string[] = [];
  let rest = text.trim();
  while (rest && out.length < max) {
    if (rest.length <= 42) {
      out.push(rest);
      break;
    }
    let cut = rest.lastIndexOf(" ", 40);
    if (cut < 18) cut = 40;
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  return out.length ? out : [text];
}

const ADVICE_STEPS = ["เลือกสิ่งสำคัญ", "ลงมือทำ", "พักให้พอ"] as const;

/** Short personal quote — avoid dumping the full advice block */
function pickPersonalQuote(advice: string): string {
  const fallback = "ไม่ต้องสมบูรณ์แบบทุกวัน ก็ยังมีคุณค่า";
  const trimmed = advice.trim();
  if (!trimmed) return fallback;

  const byPeriod = trimmed
    .split(/[.。]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (byPeriod.length > 1 && byPeriod[0]!.length <= 90) return byPeriod[0]!;

  // Thai copy often separates clauses with spaces
  const clauses = trimmed
    .split(/\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 12);
  if (clauses.length >= 2) return clauses[0]!;

  if (trimmed.length <= 72) return trimmed;
  return clauses[0] ?? fallback;
}

function StyleExpandCard({
  title,
  body,
  open,
  onToggle,
  icon,
  iconClassName,
  className,
}: {
  title: string;
  body: string;
  open: boolean;
  onToggle: () => void;
  icon: ReactNode;
  iconClassName: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className={cn(
        "mae-aspect-card w-full rounded-[18px] px-3 py-3 text-left outline-none transition active:scale-[0.99]",
        open && "col-span-2 rounded-[20px] px-4 py-4",
        className
      )}
    >
      {open ? (
        <>
          <div className="flex items-start justify-between gap-2">
            <p className="mae-aspect-title text-[15px] font-semibold tracking-[0.06em]">
              {title}
            </p>
            <ChevronRight
              className="mt-0.5 h-4 w-4 shrink-0 rotate-90 text-[#d5b16f] transition"
              strokeWidth={2.2}
            />
          </div>
          <p className="mae-aspect-body mt-2 text-[15px] leading-[1.75]">{body}</p>
        </>
      ) : (
        <>
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              iconClassName
            )}
          >
            {icon}
          </span>
          <p className="mae-aspect-title mt-2 text-[15px] font-semibold">{title}</p>
          <p className="mae-aspect-body mt-1 line-clamp-2 text-[13px] leading-snug">
            {body}
          </p>
          <span className="mt-2 inline-flex text-[#d5b16f]">
            <ChevronRight className="h-4 w-4 transition" strokeWidth={2.2} />
          </span>
        </>
      )}
    </button>
  );
}

/** Full-page self map — Mae navy–gold */
export function PremiumSelfMapPage() {
  const { ready, profile } = usePremiumProfileGate();
  const input = useAnalyzeInputFromProfile(profile);
  const [loveOpen, setLoveOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);

  const data = useMemo(() => {
    if (!input) return null;
    const analysis = analyzeFortune(input);
    const deep = pickZodiacDeep(analysis.zodiac.id);
    const value = buildPremiumValuePack(input);
    const chips =
      value.selfMap.copy.chips.length > 0
        ? value.selfMap.copy.chips
        : (deep.strength.split("·").map((s) => s.trim()).filter(Boolean).slice(0, 3) as string[]);
    return {
      zodiacName: analysis.zodiac.thaiName,
      deep,
      chips: chips.slice(0, 3),
      strengths: splitBullets(deep.strength),
      shadows: splitBullets(deep.shadow),
      quote: pickPersonalQuote(deep.advice),
    };
  }, [input]);

  if (!ready || !data) {
    return (
      <div className="px-4 py-10 text-center text-[14px] text-[#f7f4ec]/55">
        กำลังเปิด…
      </div>
    );
  }

  const { zodiacName, deep, chips, strengths, shadows, quote } = data;

  return (
    <PremiumDetailShell>
      <header className="mt-4">
        <h1 className="text-[1.55rem] font-bold tracking-tight text-[#d5b16f]">
          แผนที่ตัวเอง
        </h1>
        <p className="mt-1 text-[15px] text-[#f7f4ec]/65">
          เจาะลึกตัวตน · ราศี{zodiacName}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span
              key={c}
              className="rounded-full px-2.5 py-1.5 text-[13px] font-medium text-[#e8d19a]"
              style={{
                background: "rgba(213,177,111,0.12)",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.32)",
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </header>

      <section className="mae-aspect-card mt-4 flex gap-3 rounded-[20px] px-3.5 py-3.5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgba(213,177,111,0.14)] text-[#d5b16f]">
          <UserRound className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <p className="mae-aspect-title text-[16px] font-semibold">ตัวตนของคุณ</p>
          <p className="mae-aspect-body mt-1.5 text-[15px] leading-[1.75]">
            {deep.personality}
          </p>
        </div>
      </section>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <section className="mae-aspect-card rounded-[18px] px-3 py-3">
          <p className="mae-aspect-title text-[15px] font-semibold">จุดแข็ง</p>
          <ul className="mt-2.5 space-y-2.5">
            {strengths.map((s) => (
              <li key={s} className="mae-aspect-body flex items-start gap-1.5 text-[13px] leading-snug">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#d5b16f]" strokeWidth={2.4} />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="mae-aspect-card rounded-[18px] px-3 py-3">
          <p className="mae-aspect-title text-[15px] font-semibold">เงาที่ควรรู้</p>
          <ul className="mt-2.5 space-y-2.5">
            {shadows.map((s) => (
              <li key={s} className="mae-aspect-body flex items-start gap-1.5 text-[13px] leading-snug">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d5b16f]" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mae-aspect-card mt-3 rounded-[18px] px-3.5 py-3.5">
        <p className="mae-aspect-title text-[15px] font-semibold">จุดเปลี่ยน</p>
        <p className="mae-aspect-body mt-1.5 text-[15px] leading-[1.75]">
          {deep.turning}
        </p>
      </section>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <StyleExpandCard
          title="สไตล์ความรัก"
          body={deep.loveStyle}
          open={loveOpen}
          onToggle={() => setLoveOpen((v) => !v)}
          iconClassName="bg-[rgba(213,177,111,0.16)] text-[#d5b16f]"
          icon={<Heart className="h-4 w-4" strokeWidth={1.9} />}
        />
        <StyleExpandCard
          title="สไตล์การทำงาน"
          body={deep.workStyle}
          open={workOpen}
          onToggle={() => setWorkOpen((v) => !v)}
          iconClassName="bg-[rgba(213,177,111,0.16)] text-[#d5b16f]"
          icon={<Briefcase className="h-4 w-4" strokeWidth={1.9} />}
        />
      </div>

      <section className="mae-aspect-card relative mt-3 rounded-[20px] px-4 pb-4 pt-3.5">
        <Quote
          className="pointer-events-none absolute left-3 top-3 h-7 w-7 -scale-x-100 text-[#d5b16f]/35"
          strokeWidth={1.6}
          aria-hidden
        />
        <p className="relative pl-8 text-[11px] font-semibold tracking-[0.18em] text-[#d5b16f]">
          คำคมประจำตัว
        </p>
        <p className="relative mt-2 text-[15px] font-medium leading-[1.75] text-[#f7f4ec]">
          {quote}
        </p>
      </section>

      <section className="mae-aspect-card mt-3 rounded-[20px] px-4 py-4">
        <div className="flex items-center gap-2">
          <FortuneIcon name="sparkle" size={28} />
          <p className="mae-aspect-title text-[16px] font-semibold">คำแนะนำประจำตัว</p>
        </div>
        <p className="mae-aspect-body mt-2 text-[15px] leading-[1.75]">{deep.advice}</p>
        <div className="mt-3.5 flex items-center justify-center gap-1.5">
          {ADVICE_STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-1.5">
              <span
                className="whitespace-nowrap rounded-full px-2.5 py-1.5 text-center text-[12px] font-semibold leading-snug text-[#e8d19a]"
                style={{
                  background: "rgba(213,177,111,0.12)",
                  boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.32)",
                }}
              >
                {step}
              </span>
              {i < ADVICE_STEPS.length - 1 ? (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#d5b16f]" />
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </PremiumDetailShell>
  );
}
