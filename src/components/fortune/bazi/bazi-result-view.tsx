"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import type { BaziChart, BaziElement } from "@/lib/fortune/bazi";
import { elementColor } from "@/lib/fortune/bazi";
import { BaziCycleCard } from "@/components/fortune/bazi/bazi-cycle-card";
import { MaeBrandLink } from "@/components/layout/mae-brand-link";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { MAE_GLASS } from "@/lib/mae-glass";
import { cn } from "@/lib/utils";

const ELEMENT_ICON: Record<BaziElement, string> = {
  wood: "/images/elements/wood.webp",
  fire: "/images/elements/fire.webp",
  earth: "/images/elements/earth.webp",
  metal: "/images/elements/metal.webp",
  water: "/images/elements/water.webp",
};

const GOD_TONE_COLOR: Record<string, string> = {
  peer: "#e8d19a",
  output: "#6dbf7a",
  wealth: "#d5b16f",
  officer: "#6a9fd8",
  resource: "#c9b8e8",
};

const RELATION_TONE_BG: Record<string, string> = {
  harmony: "rgba(109,191,122,0.22)",
  tension: "rgba(232,122,106,0.22)",
};

const GOLD = "#e8d19a";
const GOLD_SOFT = "#efc36c";
const TEXT = "#f5f7ff";
const TEXT_MUTED = "rgba(186, 204, 230, 0.78)";
const GOLD_BTN =
  "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)";

const GLASS = MAE_GLASS;

const CELL = {
  idle: {
    background: "rgba(8, 28, 52, 0.45)",
    boxShadow: "inset 0 0 0 1px rgba(130, 205, 255, 0.22)",
  },
  active: {
    background: "rgba(201, 163, 90, 0.12)",
    boxShadow: "inset 0 0 0 1.5px rgba(232, 209, 154, 0.7)",
  },
} as const;

function godColor(tone: string) {
  return GOD_TONE_COLOR[tone] ?? GOLD;
}

function formatLuckAge(age: number) {
  const n = Math.round(age);
  return Number.isFinite(n) ? String(n) : "—";
}

function glassStyle(soft = false): CSSProperties {
  return {
    background: soft ? GLASS.bgSoft : GLASS.bg,
    border: GLASS.border,
    boxShadow: `${GLASS.shadow}, ${GLASS.highlight}`,
    backdropFilter: GLASS.blur,
    WebkitBackdropFilter: GLASS.blur,
  };
}

function SectionCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-[22px] px-4 py-5", className)}
      style={glassStyle()}
    >
      <h2 className="mae-gold-text text-center text-[21px] font-bold tracking-wide">
        {title}
      </h2>
      {subtitle ? (
        <p
          className="mx-auto mt-1.5 max-w-[22rem] text-center text-[17.5px] font-medium leading-[1.45]"
          style={{ color: TEXT_MUTED }}
        >
          {subtitle}
        </p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function BaziResultView({
  chart,
  onBack,
  className,
  nickname,
}: {
  chart: BaziChart;
  onBack: () => void;
  className?: string;
  nickname?: string;
}) {
  const [yearIdx, setYearIdx] = useState(0);
  const [deepOpen, setDeepOpen] = useState(false);
  const selectedYear = chart.annual[yearIdx] ?? chart.annual[0];
  const maxEl = Math.max(...chart.elements.map((e) => e.count), 1);

  return (
    <div
      className={cn(
        "relative h-full overflow-x-hidden overflow-y-auto overscroll-contain text-white",
        className
      )}
    >
      <MaePageBackground />

      <div className="relative z-[1] mx-auto flex min-h-full max-w-[430px] flex-col gap-4 px-5 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-5 sm:px-6">
        <header className="flex items-center justify-between gap-3">
          <MaeBrandLink />
        </header>

        <div className="text-center">
          <p className="mae-gold-text text-[12px] font-semibold tracking-[0.18em]">
            ปาจื้อ
          </p>
          <h1 className="mae-gold-text mt-1 text-[1.45rem] font-bold tracking-tight">
            {nickname ? `ดวงของคุณ${nickname}` : "โหราศาสตร์จีน"}
          </h1>
        </div>

        <SectionCard
          title="สี่เสา (Four Pillars)"
          subtitle="แต่ละเสา = ก้านฟ้า(บน) + กิ่งดิน(ล่าง) · เสาวันคือเจ้าชะตา"
        >
          <div className="grid grid-cols-4 gap-2">
            {chart.pillars.map((p) => (
              <div
                key={p.key}
                className="flex flex-col items-center rounded-[16px] px-1.5 py-2.5 text-center"
                style={p.isDayMaster ? CELL.active : CELL.idle}
              >
                <p
                  className="text-[15.5px] font-semibold"
                  style={{ color: TEXT }}
                >
                  {p.label}
                </p>
                <p
                  className="mt-1.5 text-[1.55rem] font-bold leading-none"
                  style={{ color: elementColor(p.stem.element) }}
                >
                  {p.stem.char}
                </p>
                <p
                  className="mt-1 text-[15.5px] font-medium leading-snug"
                  style={{ color: TEXT_MUTED }}
                >
                  {p.stem.pinyin}
                  <br />
                  {p.stem.th}
                </p>
                <div
                  className="my-2 h-px w-8"
                  style={{ background: "rgba(232,209,154,0.28)" }}
                />
                <p
                  className="text-[1.45rem] font-bold leading-none"
                  style={{ color: elementColor(p.branch.element) }}
                >
                  {p.branch.char}
                </p>
                <p
                  className="mt-1 text-[15.5px] font-medium leading-snug"
                  style={{ color: TEXT_MUTED }}
                >
                  {p.branch.animal}
                  <br />
                  {p.branch.stage}
                </p>
                <div className="mt-2 flex min-h-[2.75rem] flex-col justify-start gap-0.5">
                  {p.gods.map((g) => (
                    <span
                      key={g.label}
                      className="text-[15.5px] font-semibold leading-tight"
                      style={{ color: godColor(g.tone) }}
                    >
                      {g.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="เจ้าชะตา & นักษัตร"
          subtitle="ธาตุประจำตัวและปีนักษัตรของคุณ"
        >
          <div className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-3">
              <span
                className="text-[1.75rem] font-bold leading-none"
                style={{ color: elementColor(chart.dayMaster.element) }}
              >
                {chart.dayMaster.char}
              </span>
              <div className="text-left">
                <p className="text-[15.5px]" style={{ color: TEXT_MUTED }}>
                  เจ้าชะตา
                </p>
                <p className="text-[17.5px] font-semibold" style={{ color: TEXT }}>
                  {chart.dayMaster.pinyin} — {chart.dayMaster.th}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span
                className="text-[1.75rem] font-bold leading-none"
                style={{ color: elementColor(chart.zodiac.element) }}
              >
                {chart.zodiac.char}
              </span>
              <div className="text-left">
                <p className="text-[15.5px]" style={{ color: TEXT_MUTED }}>
                  นักษัตร
                </p>
                <p className="text-[17.5px] font-semibold" style={{ color: TEXT }}>
                  {chart.zodiac.animal}
                </p>
              </div>
            </div>
            <p className="text-[15.5px] font-medium" style={{ color: GOLD_SOFT }}>
              จันทรคติจีน · {chart.lunarDate}
            </p>
          </div>
        </SectionCard>

        <SectionCard
          title="สมดุลธาตุห้า (Five Elements)"
          subtitle="สัดส่วนธาตุจากตัวอักษร 8 ตัวในดวง"
        >
          <ul className="space-y-2.5">
            {chart.elements.map((el) => (
              <li key={el.id} className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ELEMENT_ICON[el.id]}
                  alt=""
                  className="h-6 w-6 shrink-0 object-contain"
                />
                <span
                  className="w-10 shrink-0 text-[17.5px] font-semibold"
                  style={{ color: el.color }}
                >
                  {el.label}
                </span>
                <div
                  className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full"
                  style={{ background: "rgba(130, 205, 255, 0.12)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(el.count / maxEl) * 100}%`,
                      background: el.color,
                      minWidth: el.count > 0 ? 6 : 0,
                    }}
                  />
                </div>
                <span
                  className="w-8 text-right text-[17.5px] font-semibold tabular-nums"
                  style={{ color: GOLD }}
                >
                  {el.count}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="ความแข็ง–อ่อน & ธาตุที่เป็นประโยชน์">
          <p className="text-center text-[17.5px] font-semibold" style={{ color: GOLD }}>
            สถานะ: {chart.strength.status}{" "}
            <span style={{ color: "rgba(232,209,154,0.75)" }}>
              ({chart.strength.statusZh})
            </span>
          </p>
          <p
            className="mt-1 text-center text-[15.5px]"
            style={{ color: TEXT_MUTED }}
          >
            {chart.strength.scoreLabel}
          </p>
          <div className="mt-4 text-center">
            <p className="text-[15.5px]" style={{ color: TEXT_MUTED }}>
              ควรเสริม
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {chart.strength.favor.map((f) => (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[15.5px] font-semibold"
                  style={{
                    color: f.color,
                    background: `${f.color}22`,
                    boxShadow: `inset 0 0 0 1px ${f.color}55`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ELEMENT_ICON[f.id]}
                    alt=""
                    className="h-4 w-4 object-contain"
                  />
                  {f.label}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[15.5px]" style={{ color: TEXT_MUTED }}>
              ควรเลี่ยง ·{" "}
              <span style={{ color: TEXT }}>{chart.strength.avoid}</span>
            </p>
          </div>
        </SectionCard>

        <SectionCard title="ดาวพิเศษ (神煞)">
          <ul className="space-y-2.5">
            {chart.stars.map((s) => (
              <li
                key={s.name}
                className="rounded-[16px] px-3.5 py-3 text-center"
                style={CELL.idle}
              >
                <p className="text-[17.5px] font-semibold" style={{ color: GOLD }}>
                  {s.name}
                </p>
                <p
                  className="mt-1 text-[17.5px] leading-[1.45]"
                  style={{ color: TEXT_MUTED }}
                >
                  {s.meaning}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="ความสัมพันธ์ในดวง"
          subtitle="ก้านฟ้าและกิ่งดินที่ส่งเสริมหรือขัดแย้งกัน"
        >
          <div className="flex flex-wrap justify-center gap-2">
            {chart.relations.map((r) => (
              <span
                key={r.label}
                className="rounded-full px-3 py-1.5 text-[15.5px] font-medium"
                style={{
                  color: TEXT,
                  background:
                    RELATION_TONE_BG[r.tone] ?? "rgba(213,177,111,0.18)",
                }}
              >
                {r.label}
              </span>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="จุดพิเศษ" subtitle="จุดสำคัญเพิ่มเติมในดวง">
          <div className="grid grid-cols-2 gap-2.5">
            {chart.specials.map((s) => (
              <div
                key={s.label}
                className="rounded-[16px] px-3 py-3 text-center"
                style={CELL.idle}
              >
                <p className="text-[15.5px]" style={{ color: TEXT_MUTED }}>
                  {s.label}
                </p>
                <p
                  className="mt-1 text-[1.25rem] font-bold leading-none"
                  style={{ color: TEXT }}
                >
                  {s.value}
                </p>
                <p
                  className="mt-1.5 text-[15.5px] leading-snug"
                  style={{ color: TEXT_MUTED }}
                >
                  {s.note}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="วัยจร (大運)"
          subtitle="รอบโชค 10 ปี คำนวณจากอายุและเพศ"
        >
          <div className="grid grid-cols-4 gap-2">
            {chart.luckPillars.map((lp) => (
              <div
                key={lp.age}
                className="flex flex-col items-center rounded-[14px] px-1 py-2.5 text-center"
                style={CELL.idle}
              >
                <p
                  className="text-[13px] font-medium leading-none"
                  style={{ color: TEXT_MUTED }}
                >
                  อายุ
                </p>
                <p
                  className="mt-1 text-[15.5px] font-semibold tabular-nums leading-none"
                  style={{ color: GOLD }}
                >
                  {formatLuckAge(lp.age)}
                </p>
                <p
                  className="mt-2 text-[1.2rem] font-bold leading-none"
                  style={{ color: lp.topColor }}
                >
                  {lp.top}
                </p>
                <p
                  className="mt-1 text-[1.2rem] font-bold leading-none"
                  style={{ color: lp.bottomColor }}
                >
                  {lp.bottom}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="ปีจร (流年) — ดวงรายปี"
          subtitle="แนวโน้มรายปีจากสิบเทพเทียบเจ้าชะตา"
        >
          <div className="grid grid-cols-4 gap-2">
            {chart.annual.map((y, i) => (
              <button
                key={y.year}
                type="button"
                onClick={() => setYearIdx(i)}
                className="rounded-[14px] px-1 py-2.5 text-center outline-none transition active:scale-[0.98]"
                style={i === yearIdx ? CELL.active : CELL.idle}
              >
                <p className="text-[13px]" style={{ color: TEXT_MUTED }}>
                  {y.year}
                </p>
                <p
                  className="mt-1 text-[1.15rem] font-bold leading-none"
                  style={{ color: y.topColor }}
                >
                  {y.top}
                </p>
                <p
                  className="mt-0.5 text-[1.15rem] font-bold leading-none"
                  style={{ color: y.bottomColor }}
                >
                  {y.bottom}
                </p>
                <p
                  className="mt-1 text-[13px] font-medium"
                  style={{ color: GOLD_SOFT }}
                >
                  {y.god}
                </p>
              </button>
            ))}
          </div>
          {selectedYear ? (
            <p
              className="mt-3 text-center text-[17.5px] leading-[1.45]"
              style={{ color: TEXT_MUTED }}
            >
              ปี {selectedYear.year} · สิบเทพ “{selectedYear.god}” —{" "}
              {selectedYear.top}
              {selectedYear.bottom}
            </p>
          ) : null}
        </SectionCard>

        <SectionCard
          title="ความหมายเชิงลึกของดวงคุณ"
          subtitle="คำแปลความหมายเจ้าชะตาและสิบเทพในดวงของคุณ"
        >
          <div className="space-y-3 text-left">
            <div>
              <p className="text-[17.5px] font-semibold" style={{ color: GOLD_SOFT }}>
                {chart.deepMeaning.dayMasterTitle}
              </p>
              <p
                className={
                  deepOpen
                    ? "mt-1.5 text-[17.5px] leading-[1.55]"
                    : "mt-1.5 line-clamp-3 text-[17.5px] leading-[1.55]"
                }
                style={{ color: TEXT }}
              >
                {chart.deepMeaning.dayMasterBody}
              </p>
            </div>

            {deepOpen ? (
              <>
                <div
                  className="h-px"
                  style={{ background: "rgba(130, 205, 255, 0.18)" }}
                />
                <p className="text-[17.5px] font-semibold" style={{ color: GOLD_SOFT }}>
                  สิบเทพในดวงของคุณ
                </p>
                <ul className="space-y-2.5">
                  {chart.deepMeaning.gods.map((g) => (
                    <li key={g.title} className="text-[17.5px] leading-[1.55]">
                      <span className="font-semibold" style={{ color: TEXT }}>
                        {g.title}
                      </span>
                      <span style={{ color: TEXT_MUTED }}> — {g.body}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <button
              type="button"
              aria-expanded={deepOpen}
              onClick={() => setDeepOpen((v) => !v)}
              className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-full text-[15px] font-semibold outline-none transition active:scale-[0.99]"
              style={{
                color: GOLD,
                background: "rgba(201,163,90,0.1)",
                boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.4)",
              }}
            >
              {deepOpen ? "ย่อข้อความ" : "อ่านเพิ่มเติม"}
            </button>
          </div>
        </SectionCard>

        <BaziCycleCard chart={chart} />

        <Link
          href="/home"
          className="mb-2 inline-flex h-12 w-full items-center justify-center rounded-full text-[17.5px] font-semibold outline-none transition active:scale-[0.99]"
          style={{
            color: GOLD,
            background: "rgba(201,163,90,0.12)",
            boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.45)",
          }}
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
        >
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
