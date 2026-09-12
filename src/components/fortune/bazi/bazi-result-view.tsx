"use client";

import { useState } from "react";
import type { BaziChart, BaziElement } from "@/lib/fortune/bazi";
import { elementColor } from "@/lib/fortune/bazi";
import { PageBackButton } from "@/components/ui/page-back-button";
import { cn } from "@/lib/utils";

const ELEMENT_ICON: Record<BaziElement, string> = {
  wood: "/images/elements/wood.webp",
  fire: "/images/elements/fire.webp",
  earth: "/images/elements/earth.webp",
  metal: "/images/elements/metal.webp",
  water: "/images/elements/water.webp",
};

/** Engine stores god/relation "tone" as category ids, not CSS colors */
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

function godColor(tone: string) {
  return GOD_TONE_COLOR[tone] ?? "#e8d19a";
}

function formatLuckAge(age: number) {
  const n = Math.round(age);
  return Number.isFinite(n) ? String(n) : "—";
}

function SectionCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mae-aspect-card px-3.5 py-3.5", className)}>
      <h2 className="text-center text-[14px] font-bold tracking-wide text-[#d5b16f]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mx-auto mt-1 max-w-[18rem] text-center text-[11.5px] leading-relaxed text-[#c5cdd9]/70">
          {subtitle}
        </p>
      ) : null}
      <div className="mt-3">{children}</div>
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
  const [cycleOpen, setCycleOpen] = useState(false);
  const selectedYear = chart.annual[yearIdx] ?? chart.annual[0];
  const maxEl = Math.max(...chart.elements.map((e) => e.count), 1);
  const cycle = chart.currentCycleMeaning;

  return (
    <div
      className={cn(
        "relative h-full overflow-x-hidden overflow-y-auto overscroll-contain px-3.5 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-3",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <PageBackButton onClick={onBack} />
        <p className="text-[11px] font-semibold tracking-[0.18em] text-[#d5b16f]/80">
          ปาจื้อ{nickname ? ` · ${nickname}` : ""}
        </p>
        <span className="w-[5.5rem]" aria-hidden />
      </div>

      <div className="mx-auto flex max-w-[360px] flex-col gap-3.5">
        {/* Four pillars */}
        <SectionCard
          title="สี่เสา (Four Pillars)"
          subtitle="แต่ละเสา = ก้านฟ้า(บน) + กิ่งดิน(ล่าง) · เสาวันคือเจ้าชะตา"
        >
          <div className="grid grid-cols-4 gap-1.5">
            {chart.pillars.map((p) => (
              <div
                key={p.key}
                className={cn(
                  "flex flex-col items-center rounded-[14px] px-1 py-2 text-center",
                  p.isDayMaster
                    ? "bg-[rgba(213,177,111,0.1)] shadow-[inset_0_0_0_1.5px_rgba(213,177,111,0.75)]"
                    : "bg-[rgba(16,24,39,0.45)] shadow-[inset_0_0_0_1px_rgba(213,177,111,0.22)]"
                )}
              >
                <p className="text-[10px] font-medium text-[#f7f4ec]/75">{p.label}</p>
                <p
                  className="mt-1 text-[1.55rem] font-bold leading-none"
                  style={{ color: elementColor(p.stem.element) }}
                >
                  {p.stem.char}
                </p>
                <p className="mt-0.5 text-[9px] leading-snug text-[#d5dde8]">
                  {p.stem.pinyin}
                  <br />
                  {p.stem.th}
                </p>
                <div className="my-1.5 h-px w-8 bg-[rgba(213,177,111,0.25)]" />
                <p
                  className="text-[1.45rem] font-bold leading-none"
                  style={{ color: elementColor(p.branch.element) }}
                >
                  {p.branch.char}
                </p>
                <p className="mt-0.5 text-[9px] leading-snug text-[#d5dde8]">
                  {p.branch.animal}
                  <br />
                  {p.branch.stage}
                </p>
                <div className="mt-2 flex min-h-[2.5rem] flex-col justify-start gap-0.5">
                  {p.gods.map((g) => (
                    <span
                      key={g.label}
                      className="text-[9px] font-semibold leading-tight"
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

        {/* Day master & zodiac */}
        <SectionCard
          title="เจ้าชะตา & นักษัตร"
          subtitle="ธาตุประจำตัวและปีนักษัตรของคุณ"
        >
          <div className="space-y-2.5 text-center">
            <div className="flex items-center justify-center gap-2.5">
              <span
                className="text-[1.75rem] font-bold leading-none"
                style={{ color: elementColor(chart.dayMaster.element) }}
              >
                {chart.dayMaster.char}
              </span>
              <div className="text-left">
                <p className="text-[11px] text-[#9aa3b2]">เจ้าชะตา</p>
                <p className="text-[13px] font-semibold text-[#f7f4ec]">
                  {chart.dayMaster.pinyin} — {chart.dayMaster.th}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2.5">
              <span
                className="text-[1.75rem] font-bold leading-none"
                style={{ color: elementColor(chart.zodiac.element) }}
              >
                {chart.zodiac.char}
              </span>
              <div className="text-left">
                <p className="text-[11px] text-[#9aa3b2]">นักษัตร</p>
                <p className="text-[13px] font-semibold text-[#f7f4ec]">
                  {chart.zodiac.animal}
                </p>
              </div>
            </div>
            <p className="text-[12px] text-[#e8d19a]/85">
              จันทรคติจีน · {chart.lunarDate}
            </p>
          </div>
        </SectionCard>

        {/* Five elements */}
        <SectionCard
          title="สมดุลธาตุห้า (Five Elements)"
          subtitle="สัดส่วนธาตุจากตัวอักษร 8 ตัวในดวง"
        >
          <ul className="space-y-2">
            {chart.elements.map((el) => (
              <li key={el.id} className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ELEMENT_ICON[el.id]}
                  alt=""
                  className="h-6 w-6 shrink-0 object-contain"
                />
                <span
                  className="w-8 shrink-0 text-[12px] font-semibold"
                  style={{ color: el.color }}
                >
                  {el.label}
                </span>
                <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[rgba(213,177,111,0.12)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(el.count / maxEl) * 100}%`,
                      background: el.color,
                      minWidth: el.count > 0 ? 6 : 0,
                    }}
                  />
                </div>
                <span className="w-4 text-right text-[12px] font-semibold tabular-nums text-[#e8d19a]">
                  {el.count}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Strength */}
        <SectionCard title="ความแข็ง–อ่อน & ธาตุที่เป็นประโยชน์">
          <p className="text-center text-[13px] font-semibold text-[#e8d19a]">
            สถานะ: {chart.strength.status}{" "}
            <span className="text-[#d5b16f]/80">({chart.strength.statusZh})</span>
          </p>
          <p className="mt-0.5 text-center text-[11px] text-[#9aa3b2]">
            {chart.strength.scoreLabel}
          </p>
          <div className="mt-3 text-center">
            <p className="text-[11px] text-[#9aa3b2]">ควรเสริม</p>
            <div className="mt-1.5 flex justify-center gap-2">
              {chart.strength.favor.map((f) => (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                  style={{
                    color: f.color,
                    background: `${f.color}22`,
                    boxShadow: `inset 0 0 0 1px ${f.color}55`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ELEMENT_ICON[f.id]} alt="" className="h-4 w-4 object-contain" />
                  {f.label}
                </span>
              ))}
            </div>
            <p className="mt-2.5 text-[11px] text-[#9aa3b2]">
              ควรเลี่ยง ·{" "}
              <span className="text-[#c5cdd9]">{chart.strength.avoid}</span>
            </p>
          </div>
        </SectionCard>

        {/* Stars */}
        <SectionCard title="ดาวพิเศษ (神煞)">
          <ul className="space-y-2">
            {chart.stars.map((s) => (
              <li
                key={s.name}
                className="rounded-[12px] bg-[rgba(16,24,39,0.5)] px-3 py-2 text-center shadow-[inset_0_0_0_1px_rgba(213,177,111,0.2)]"
              >
                <p className="text-[13px] font-semibold text-[#e8d19a]">{s.name}</p>
                <p className="mt-0.5 text-[11.5px] leading-snug text-[#c5cdd9]/75">
                  {s.meaning}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Relations */}
        <SectionCard
          title="ความสัมพันธ์ในดวง"
          subtitle="ก้านฟ้าและกิ่งดินที่ส่งเสริมหรือขัดแย้งกัน"
        >
          <div className="flex flex-wrap justify-center gap-1.5">
            {chart.relations.map((r) => (
              <span
                key={r.label}
                className="rounded-full px-2.5 py-1 text-[11px] font-medium text-[#f7f4ec]"
                style={{
                  background:
                    RELATION_TONE_BG[r.tone] ?? "rgba(213,177,111,0.18)",
                }}
              >
                {r.label}
              </span>
            ))}
          </div>
        </SectionCard>

        {/* Specials */}
        <SectionCard title="จุดพิเศษ" subtitle="จุดสำคัญเพิ่มเติมในดวง">
          <div className="grid grid-cols-2 gap-2">
            {chart.specials.map((s) => (
              <div
                key={s.label}
                className="rounded-[12px] bg-[rgba(16,24,39,0.5)] px-2.5 py-2.5 text-center shadow-[inset_0_0_0_1px_rgba(213,177,111,0.2)]"
              >
                <p className="text-[10px] text-[#9aa3b2]">{s.label}</p>
                <p className="mt-1 text-[1.15rem] font-bold leading-none text-[#f7f4ec]">
                  {s.value}
                </p>
                <p className="mt-1 text-[10px] leading-snug text-[#c5cdd9]/65">
                  {s.note}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Luck pillars */}
        <SectionCard
          title="วัยจร (大運)"
          subtitle="รอบโชค 10 ปี คำนวณจากอายุและเพศ"
        >
          <div className="grid grid-cols-4 gap-1.5">
            {chart.luckPillars.map((lp) => (
              <div
                key={lp.age}
                className="flex flex-col items-center rounded-[12px] bg-[rgba(16,24,39,0.5)] px-1 py-2 text-center shadow-[inset_0_0_0_1px_rgba(213,177,111,0.2)]"
              >
                <p className="text-[9px] font-medium leading-none text-[#9aa3b2]">
                  อายุ
                </p>
                <p className="mt-0.5 text-[11px] font-semibold tabular-nums leading-none text-[#e8d19a]">
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

        {/* Annual */}
        <SectionCard
          title="ปีจร (流年) — ดวงรายปี"
          subtitle="แนวโน้มรายปีจากสิบเทพเทียบเจ้าชะตา"
        >
          <div className="grid grid-cols-4 gap-1.5">
            {chart.annual.map((y, i) => (
              <button
                key={y.year}
                type="button"
                onClick={() => setYearIdx(i)}
                className={cn(
                  "rounded-[12px] px-1 py-2 text-center outline-none transition",
                  i === yearIdx
                    ? "bg-[rgba(213,177,111,0.12)] shadow-[inset_0_0_0_1.5px_rgba(213,177,111,0.8)]"
                    : "bg-[rgba(16,24,39,0.5)] shadow-[inset_0_0_0_1px_rgba(213,177,111,0.2)]"
                )}
              >
                <p className="text-[9px] text-[#9aa3b2]">{y.year}</p>
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
                <p className="mt-1 text-[9px] font-medium text-[#e8d19a]/85">
                  {y.god}
                </p>
              </button>
            ))}
          </div>
          {selectedYear ? (
            <p className="mt-3 text-center text-[12px] leading-snug text-[#c5cdd9]/80">
              ปี {selectedYear.year} · สิบเทพ “{selectedYear.god}” —{" "}
              {selectedYear.top}
              {selectedYear.bottom}
            </p>
          ) : null}
        </SectionCard>

        {/* Deep meaning */}
        <SectionCard
          title="ความหมายเชิงลึกของดวงคุณ"
          subtitle="คำแปลความหมายเจ้าชะตาและสิบเทพในดวงของคุณ"
        >
          <div className="space-y-3 text-left">
            <div>
              <p className="text-[12px] font-semibold text-[#d5b16f]">
                {chart.deepMeaning.dayMasterTitle}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#f7f4ec]/88">
                {chart.deepMeaning.dayMasterBody}
              </p>
            </div>
            <div className="h-px bg-[rgba(213,177,111,0.2)]" />
            <p className="text-[12px] font-semibold text-[#d5b16f]">
              สิบเทพในดวงของคุณ
            </p>
            <ul className="space-y-2">
              {chart.deepMeaning.gods.map((g) => (
                <li key={g.title} className="text-[12px] leading-relaxed">
                  <span className="font-semibold text-[#f7f4ec]">{g.title}</span>
                  <span className="text-[#c5cdd9]/75"> — {g.body}</span>
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>

        {/* Current cycle CTA + meaning */}
        <section className="mae-aspect-card px-3.5 py-3.5 text-center">
          <p className="text-[13px] font-bold text-[#d5b16f]">
            ดวงจรช่วงนี้ (วัยจร + ปีจร)
          </p>
          <p className="mx-auto mt-1 max-w-[17rem] text-[11.5px] leading-relaxed text-[#c5cdd9]/70">
            {chart.currentCycleNote}
          </p>
          <div className="my-3 h-px bg-[rgba(213,177,111,0.22)]" />
          <button
            type="button"
            aria-expanded={cycleOpen}
            className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold text-[#e8d19a] outline-none transition active:scale-[0.99]"
            style={{
              background: cycleOpen
                ? "rgba(213,177,111,0.22)"
                : "rgba(213,177,111,0.12)",
              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.55)",
            }}
            onClick={() => {
              setCycleOpen((open) => {
                const next = !open;
                if (next) {
                  requestAnimationFrame(() => {
                    document
                      .getElementById("bazi-cycle-meaning")
                      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  });
                }
                return next;
              });
            }}
          >
            {cycleOpen ? "ปิดความหมายดวงจร" : "อ่านความหมายจากดวงจร"}
          </button>

          {cycleOpen && cycle ? (
            <div
              id="bazi-cycle-meaning"
              className="mt-3 space-y-3 text-left"
            >
              {cycle.luck ? (
                <div>
                  <p className="text-[12px] font-semibold text-[#d5b16f]">
                    {cycle.luck.title}
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-[#9aa3b2]">
                    ช่วงอายุ {cycle.luck.ageFrom.toFixed(2)}–
                    {cycle.luck.ageTo.toFixed(2)} ปี
                  </p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-[#f7f4ec]/88">
                    {cycle.luck.body}
                  </p>
                </div>
              ) : null}
              {cycle.luck ? (
                <div className="h-px bg-[rgba(213,177,111,0.2)]" />
              ) : null}
              <div>
                <p className="text-[12px] font-semibold text-[#d5b16f]">
                  {cycle.annual.title}
                </p>
                <p className="mt-0.5 text-[10.5px] text-[#9aa3b2]">
                  ปีจร {cycle.annual.year} (เริ่มที่立春)
                </p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-[#f7f4ec]/88">
                  {cycle.annual.body}
                </p>
              </div>
              <div className="h-px bg-[rgba(213,177,111,0.2)]" />
              <p className="text-[12px] leading-relaxed text-[#c5cdd9]/85">
                {cycle.combo}
              </p>
            </div>
          ) : null}

          <p className="mt-2 text-[10.5px] text-[#9aa3b2]">
            คำนวณจากวัน–เวลาเกิดในโปรไฟล์ · ใช้หลักปาจื้อคลาสสิก
          </p>
        </section>

        <button
          type="button"
          onClick={onBack}
          className="mae-gold-cta mb-2 flex h-11 w-full items-center justify-center rounded-full text-[14px] font-bold tracking-wide outline-none transition active:scale-[0.99]"
        >
          กลับ
        </button>
      </div>
    </div>
  );
}
