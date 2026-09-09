"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, ChevronRight, Heart, Briefcase, UserRound } from "lucide-react";
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
        "fortune-glass w-full rounded-[18px] px-3 py-3 text-left outline-none transition active:scale-[0.99]",
        open && "col-span-2 rounded-[20px] px-4 py-4",
        className
      )}
    >
      {open ? (
        <>
          <div className="flex items-start justify-between gap-2">
            <p className="text-[15px] font-semibold tracking-[0.06em] text-[#A07E1A]">
              {title}
            </p>
            <ChevronRight
              className="mt-0.5 h-4 w-4 shrink-0 rotate-90 text-[#7B5FD4] transition"
              strokeWidth={2.2}
            />
          </div>
          <p className="mt-2 text-[15px] leading-[1.75] text-[#3A3270]">{body}</p>
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
          <p className="mt-2 text-[15px] font-semibold text-[#241C4F]">{title}</p>
          <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[#6B6490]">
            {body}
          </p>
          <span className="mt-2 inline-flex text-[#7B5FD4]">
            <ChevronRight className="h-4 w-4 transition" strokeWidth={2.2} />
          </span>
        </>
      )}
    </button>
  );
}

/** Full-page self map — matches premium mockup (not a popup) */
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
      quote:
        deep.advice.split(/[.。]/)[0]?.trim() ||
        "ไม่ต้องสมบูรณ์แบบทุกวัน ก็ยังมีคุณค่า",
    };
  }, [input]);

  if (!ready || !data) {
    return (
      <div className="px-4 py-10 text-center text-[14px] text-[#8A82B0]">
        กำลังเปิด…
      </div>
    );
  }

  const { zodiacName, deep, chips, strengths, shadows, quote } = data;

  return (
    <PremiumDetailShell>
      <header className="mt-4">
        <h1 className="text-[1.55rem] font-bold tracking-tight text-[#241C4F]">
          แผนที่ตัวเอง
        </h1>
        <p className="mt-1 text-[15px] text-[#6B6490]">
          เจาะลึกตัวตน · ราศี{zodiacName}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span
              key={c}
              className="rounded-full bg-[#9B7FE8]/14 px-2.5 py-1.5 text-[13px] font-medium text-[#5B45B8]"
            >
              {c}
            </span>
          ))}
        </div>
      </header>

      {/* ตัวตน */}
      <section className="fortune-glass mt-4 flex gap-3 rounded-[20px] px-3.5 py-3.5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#9B7FE8]/14 text-[#7B5FD4]">
          <UserRound className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <p className="text-[16px] font-semibold text-[#241C4F]">ตัวตนของคุณ</p>
          <p className="mt-1.5 text-[15px] leading-[1.75] text-[#4A4278]">
            {deep.personality}
          </p>
        </div>
      </section>

      {/* จุดแข็ง / เงา */}
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <section className="fortune-glass rounded-[18px] px-3 py-3">
          <p className="text-[15px] font-semibold text-[#241C4F]">จุดแข็ง</p>
          <ul className="mt-2.5 space-y-2.5">
            {strengths.map((s) => (
              <li key={s} className="flex items-start gap-1.5 text-[13px] leading-snug text-[#4A4278]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#7B5FD4]" strokeWidth={2.4} />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="fortune-glass rounded-[18px] px-3 py-3">
          <p className="text-[15px] font-semibold text-[#241C4F]">เงาที่ควรรู้</p>
          <ul className="mt-2.5 space-y-2.5">
            {shadows.map((s) => (
              <li key={s} className="flex items-start gap-1.5 text-[13px] leading-snug text-[#4A4278]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9B7FE8]" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="fortune-glass mt-3 rounded-[18px] px-3.5 py-3.5">
        <p className="text-[15px] font-semibold text-[#241C4F]">จุดเปลี่ยน</p>
        <p className="mt-1.5 text-[15px] leading-[1.75] text-[#4A4278]">
          {deep.turning}
        </p>
      </section>

      {/* สไตล์รัก / งาน — กดขยาย / หุบ */}
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <StyleExpandCard
          title="สไตล์ความรัก"
          body={deep.loveStyle}
          open={loveOpen}
          onToggle={() => setLoveOpen((v) => !v)}
          iconClassName="bg-[#F4BC52]/18 text-[#C9A227]"
          icon={<Heart className="h-4 w-4" strokeWidth={1.9} />}
        />
        <StyleExpandCard
          title="สไตล์การทำงาน"
          body={deep.workStyle}
          open={workOpen}
          onToggle={() => setWorkOpen((v) => !v)}
          iconClassName="bg-[#9B7FE8]/16 text-[#7B5FD4]"
          icon={<Briefcase className="h-4 w-4" strokeWidth={1.9} />}
        />
      </div>

      {/* Quote */}
      <section className="fortune-glass relative mt-3 overflow-hidden rounded-[20px] px-4 pb-4 pt-3.5">
        <span
          className="pointer-events-none absolute -left-1 -top-2 select-none font-sacred text-[4.5rem] leading-none text-[#9B7FE8]/22"
          aria-hidden
        >
          “
        </span>
        <p className="relative text-[11px] font-semibold tracking-[0.18em] text-[#7B5FD4]">
          คำคมประจำตัว
        </p>
        <p className="relative mt-2 text-[15px] font-medium leading-[1.75] text-[#2C2458]">
          {quote}
        </p>
      </section>

      {/* คำแนะนำ */}
      <section className="fortune-glass mt-3 rounded-[20px] px-4 py-4">
        <div className="flex items-center gap-2">
          <FortuneIcon name="sparkle" size={28} />
          <p className="text-[16px] font-semibold text-[#241C4F]">คำแนะนำประจำตัว</p>
        </div>
        <p className="mt-2 text-[15px] leading-[1.75] text-[#4A4278]">{deep.advice}</p>
        <div className="mt-3.5 flex items-center justify-center gap-1.5">
          {ADVICE_STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-1.5">
              <span className="whitespace-nowrap rounded-full bg-[#9B7FE8]/14 px-2.5 py-1.5 text-center text-[12px] font-semibold leading-snug text-[#5B45B8]">
                {step}
              </span>
              {i < ADVICE_STEPS.length - 1 ? (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#9B7FE8]" />
              ) : null}
            </div>
          ))}
        </div>
      </section>

    </PremiumDetailShell>
  );
}
