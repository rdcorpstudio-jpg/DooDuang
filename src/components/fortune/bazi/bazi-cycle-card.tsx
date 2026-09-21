"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Sparkles } from "lucide-react";
import type { BaziChart } from "@/lib/fortune/bazi";
import type { BaziCycleReading } from "@/lib/fortune/bazi/cycle-ai-reading";
import { readFortuneProfile } from "@/lib/fortune/profile-storage";
import { MAE_GLASS } from "@/lib/mae-glass";
import { Reveal, useRevealMounted } from "@/components/ui/reveal";

const GOLD = "#e8d19a";
const GOLD_SOFT = "#efc36c";
const TEXT = "#f5f7ff";
const TEXT_MUTED = "rgba(186, 204, 230, 0.78)";
const CAUTION = "#f0a8b0";
const GOOD = "#b9ebdc";
const GOLD_BTN =
  "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)";
const GLASS = MAE_GLASS;

function glassStyle(soft = false): CSSProperties {
  return {
    background: soft ? GLASS.bgSoft : GLASS.bg,
    border: GLASS.border,
    boxShadow: `${GLASS.shadow}, ${GLASS.highlight}`,
    backdropFilter: GLASS.blur,
    WebkitBackdropFilter: GLASS.blur,
  };
}

type Props = {
  chart: BaziChart;
};

export function BaziCycleCard({ chart }: Props) {
  const visible = useRevealMounted(40);
  const [reading, setReading] = useState<BaziCycleReading | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [alreadyAsked, setAlreadyAsked] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/fortune/bazi-cycle", { cache: "no-store" });
        const data = (await res.json()) as {
          asked?: boolean;
          reading?: BaziCycleReading;
          error?: string;
        };
        if (!alive) return;
        if (data.reading) {
          setReading(data.reading);
          setAlreadyAsked(Boolean(data.asked));
        }
        if (data.error) setError(data.error);
      } catch {
        /* keep empty until user taps */
      } finally {
        if (alive) setLoaded(true);
      }
    }
    void load();
    return () => {
      alive = false;
    };
  }, []);

  async function askMae() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/fortune/bazi-cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: readFortuneProfile() }),
      });
      const raw = await res.text();
      let data: {
        error?: string;
        code?: string;
        reading?: BaziCycleReading;
        alreadyAsked?: boolean;
      } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        setError("เชื่อมต่อไม่ได้ ลองอีกครั้ง");
        return;
      }
      if (res.status === 401 || data.code === "UNAUTHENTICATED") {
        window.location.href = "/login?callbackUrl=/reading/bazi";
        return;
      }
      if (data.code === "NO_PREMIUM") {
        window.location.href = "/premium";
        return;
      }
      if (data.code === "NO_PROFILE") {
        window.location.href = "/dashboard";
        return;
      }
      if (!res.ok || !data.reading) {
        setError(data.error || "แม่เปิดตำราดวงจรไม่สำเร็จ");
        return;
      }
      setReading(data.reading);
      setAlreadyAsked(Boolean(data.alreadyAsked));
    } catch {
      setError("เชื่อมต่อไม่ได้ ลองอีกครั้ง");
    } finally {
      setBusy(false);
    }
  }

  const note = chart.currentCycleNote;

  return (
    <section className="rounded-[22px] px-4 py-5" style={glassStyle()}>
      <Reveal visible={visible} delay={20} className="text-center">
        <p className="mae-gold-text text-[21px] font-bold leading-snug">
          ดวงจรช่วงนี้
        </p>
        <p
          className="mx-auto mt-1.5 max-w-[18rem] text-[14px] font-medium tracking-wide"
          style={{ color: GOLD_SOFT }}
        >
          วัยจร + ปีจร · อ่านว่าร่วมกันแล้วชีวิตเป็นยังไง
        </p>
        <p
          className="mx-auto mt-3 max-w-[21rem] text-[15px] leading-[1.5]"
          style={{ color: TEXT_MUTED }}
        >
          {note}
        </p>
      </Reveal>

      {!reading && loaded ? (
        <div className="mt-5 text-center">
          <button
            type="button"
            disabled={busy}
            onClick={() => void askMae()}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[16px] font-semibold outline-none transition active:scale-[0.99] disabled:opacity-60"
            style={{
              color: "#1a1408",
              background: GOLD_BTN,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28)",
            }}
          >
            <Sparkles className="h-4 w-4" strokeWidth={2.2} />
            {busy ? "แม่กำลังอ่านดวงจร…" : "ให้แม่สรุปช่วงนี้"}
          </button>
          <p className="mt-2.5 text-[13px]" style={{ color: TEXT_MUTED }}>
            วิเคราะห์ด้วย AI · บัญชีละ 1 ครั้ง
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 text-center text-[15px] font-medium" style={{ color: CAUTION }}>
          {error}
        </p>
      ) : null}

      {reading ? (
        <CycleReadingView
          reading={reading}
          alreadyAsked={alreadyAsked}
          visible={visible}
        />
      ) : null}
    </section>
  );
}

function CycleReadingView({
  reading,
  alreadyAsked,
  visible,
}: {
  reading: BaziCycleReading;
  alreadyAsked: boolean;
  visible: boolean;
}) {
  return (
    <div className="mt-6 space-y-0 text-left">
      <Reveal visible={visible} delay={60} className="text-center">
        <p
          className="text-[13px] font-semibold tracking-[0.18em]"
          style={{ color: GOLD }}
        >
          สรุปช่วงนี้
        </p>
        <h3
          className="mae-gold-text mx-auto mt-2.5 max-w-[22rem] text-[1.25rem] font-bold leading-[1.4]"
          style={{ paddingTop: "0.06em", paddingBottom: "0.04em" }}
        >
          {reading.headline}
        </h3>
        <p
          className="mx-auto mt-3.5 max-w-[22rem] text-[16px] font-medium leading-[1.7]"
          style={{ color: TEXT }}
        >
          {reading.combo}
        </p>
      </Reveal>

      <Rule visible={visible} delay={100} />

      {reading.luck ? (
        <Reveal visible={visible} delay={120}>
          <p
            className="text-[13px] font-semibold tracking-[0.16em]"
            style={{ color: GOLD }}
          >
            ช่วงชีวิตใหญ่
          </p>
          <p className="mt-2 text-[15px] font-semibold" style={{ color: GOLD_SOFT }}>
            {reading.luck.theme}
          </p>
          <p className="mt-1 text-[14px]" style={{ color: TEXT_MUTED }}>
            อายุ {reading.luck.ageLabel}
            {reading.luck.pillar ? ` · ${reading.luck.pillar}` : ""}
          </p>
          <p className="mt-2.5 text-[15px] leading-[1.65]" style={{ color: TEXT }}>
            {reading.luck.body}
          </p>
        </Reveal>
      ) : null}

      {reading.luck ? <Rule visible={visible} delay={150} /> : null}

      <Reveal visible={visible} delay={170}>
        <p
          className="text-[13px] font-semibold tracking-[0.16em]"
          style={{ color: GOLD }}
        >
          ปีนี้บนธีมนั้น
        </p>
        <p className="mt-2 text-[15px] font-semibold" style={{ color: GOLD_SOFT }}>
          {reading.annual.theme}
        </p>
        <p className="mt-1 text-[14px]" style={{ color: TEXT_MUTED }}>
          ปี {reading.annual.year}
          {reading.annual.pillar ? ` · ${reading.annual.pillar}` : ""}
        </p>
        <p className="mt-2.5 text-[15px] leading-[1.65]" style={{ color: TEXT }}>
          {reading.annual.body}
        </p>
        <div
          className="mt-3 rounded-[16px] px-3.5 py-3"
          style={{
            background: "rgba(8,16,32,0.45)",
            boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.18)",
          }}
        >
          <p className="text-[13px] font-semibold" style={{ color: GOLD_SOFT }}>
            จุดกระทบปีนี้
          </p>
          <p className="mt-1.5 text-[15px] leading-[1.55]" style={{ color: TEXT }}>
            {reading.annual.impact}
          </p>
        </div>
      </Reveal>

      <Rule visible={visible} delay={210} />

      <Reveal visible={visible} delay={230}>
        <p
          className="text-[13px] font-semibold tracking-[0.16em]"
          style={{ color: GOLD }}
        >
          ผลต่อชีวิต
        </p>
        <div
          className="mt-3 overflow-hidden rounded-[18px]"
          style={{
            background: "rgba(8,16,32,0.45)",
            boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.16)",
          }}
        >
          {reading.aspects.map((a, i) => (
            <div
              key={`${a.key}-${a.body.slice(0, 12)}`}
              className="px-4 py-3.5"
              style={{
                borderTop: i === 0 ? undefined : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[15px] font-bold" style={{ color: GOLD_SOFT }}>
                  {a.label}
                </span>
                <span
                  className="text-[12px] font-semibold tracking-wide"
                  style={{
                    color:
                      a.tone === "เด่น"
                        ? GOOD
                        : a.tone === "ระวัง"
                          ? CAUTION
                          : TEXT_MUTED,
                  }}
                >
                  {a.tone}
                </span>
              </div>
              <p className="mt-1.5 text-[15px] leading-[1.55]" style={{ color: TEXT }}>
                {a.body}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <Rule visible={visible} delay={270} />

      <Reveal visible={visible} delay={290} className="space-y-5">
        <BulletBlock label="เหมาะกับ" color={GOOD} items={reading.suit} />
        <BulletBlock label="ควรระวัง" color={CAUTION} items={reading.watch} />
      </Reveal>

      <p className="mt-6 text-center text-[13px]" style={{ color: TEXT_MUTED }}>
        {alreadyAsked
          ? "อ่านแล้วในบัญชีนี้ · ไม่หักเครดิตซ้ำ"
          : "บันทึกในบัญชีแล้ว · วิเคราะห์ครั้งเดียวต่อไอดี"}
        {" · "}
        เป็นความเชื่อประกอบ ไม่การันตีผล
      </p>
    </div>
  );
}

function Rule({ visible, delay }: { visible: boolean; delay: number }) {
  return (
    <Reveal visible={visible} delay={delay} className="py-6">
      <div
        aria-hidden
        className="mx-auto h-px w-full max-w-[12rem]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(232,209,154,0.35), transparent)",
        }}
      />
    </Reveal>
  );
}

function BulletBlock({
  label,
  color,
  items,
}: {
  label: string;
  color: string;
  items: string[];
}) {
  return (
    <div>
      <p className="text-[15px] font-bold tracking-wide" style={{ color }}>
        {label}
      </p>
      <ul className="mt-2.5 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-[15px] font-medium leading-[1.55]"
            style={{ color: TEXT }}
          >
            <span
              className="mt-[0.5em] h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: color }}
              aria-hidden
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
