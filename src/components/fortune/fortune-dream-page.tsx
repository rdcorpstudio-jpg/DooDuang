"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Moon, RefreshCw, Sparkles } from "lucide-react";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { MaePageLoading } from "@/components/layout/mae-page-loading";
import { AnimatedPage, Reveal, useRevealMounted } from "@/components/ui/reveal";
import { PageBackButton } from "@/components/ui/page-back-button";
import {
  bangkokDayKey,
  type DreamReading,
} from "@/lib/fortune/dream-reading";
import { MAE_GLASS } from "@/lib/mae-glass";

const GOLD = "#e8d19a";
const GOLD_SOFT = "#efc36c";
const TEXT = "rgba(240,244,250,0.92)";
const MUTED = "rgba(186,204,230,0.82)";
const CAUTION = "#f0a8b0";
const GLASS = MAE_GLASS;
const DREAM_ART = "/images/special/coming-soon/03-dream-reading.webp?v=2";

function pad2(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function msUntilNextBangkokMidnight(now = Date.now()) {
  const dayKey = bangkokDayKey(new Date(now));
  const start = new Date(`${dayKey}T00:00:00+07:00`).getTime();
  return Math.max(0, start + 86_400_000 - now);
}

function formatCountdown(ms: number) {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

function useBangkokMidnightCountdown(active: boolean) {
  const [leftMs, setLeftMs] = useState(() =>
    active ? msUntilNextBangkokMidnight() : 0,
  );

  useEffect(() => {
    if (!active) {
      setLeftMs(0);
      return;
    }
    const tick = () => setLeftMs(msUntilNextBangkokMidnight());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [active]);

  return leftMs;
}

type Loaded = {
  signedIn: boolean;
  asked: boolean;
  dream: string;
  reading: DreamReading | null;
};

export function FortuneDreamPage() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/fortune/dream", { cache: "no-store" });
        const data = (await res.json()) as {
          user?: boolean | null;
          asked?: boolean;
          dream?: string;
          reading?: DreamReading;
          error?: string;
        };
        if (!alive) return;
        setLoaded({
          signedIn: Boolean(data.user),
          asked: Boolean(data.asked && data.reading),
          dream: data.dream ?? "",
          reading: data.reading ?? null,
        });
        if (data.error) setError(data.error);
      } catch {
        if (!alive) return;
        setLoaded({
          signedIn: false,
          asked: false,
          dream: "",
          reading: null,
        });
        setError("เชื่อมต่อไม่ได้ ลองรีเฟรชอีกครั้ง");
      }
    }
    void load();
    return () => {
      alive = false;
    };
  }, []);

  async function ask() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/fortune/dream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dream: draft }),
      });
      const data = (await res.json()) as {
        error?: string;
        code?: string;
        dream?: string;
        reading?: DreamReading;
        asked?: boolean;
      };
      if (res.status === 401 || data.code === "UNAUTHENTICATED") {
        window.location.href = "/login?callbackUrl=/special/dream";
        return;
      }
      if (!res.ok || !data.reading) {
        setError(data.error || "แม่เปิดตำราไม่สำเร็จ ลองอีกครั้ง");
        return;
      }
      setLoaded({
        signedIn: true,
        asked: true,
        dream: data.dream ?? draft,
        reading: data.reading,
      });
    } catch {
      setError("เชื่อมต่อไม่ได้ ลองอีกครั้ง");
    } finally {
      setBusy(false);
    }
  }

  const reading = loaded?.reading;
  const locked = Boolean(loaded?.asked && reading);
  const leftMs = useBangkokMidnightCountdown(locked);
  const canAskAgain = locked && leftMs <= 0;

  useEffect(() => {
    if (!canAskAgain) return;
    let alive = true;
    async function refresh() {
      try {
        const res = await fetch("/api/fortune/dream", { cache: "no-store" });
        const data = (await res.json()) as {
          user?: boolean | null;
          asked?: boolean;
          dream?: string;
          reading?: DreamReading;
        };
        if (!alive) return;
        setLoaded({
          signedIn: Boolean(data.user),
          asked: Boolean(data.asked && data.reading),
          dream: data.dream ?? "",
          reading: data.reading ?? null,
        });
        setDraft("");
      } catch {
        /* keep locked UI until next tick / manual retry */
      }
    }
    void refresh();
    return () => {
      alive = false;
    };
  }, [canAskAgain]);

  if (loaded === null || busy) {
    return (
      <MaePageLoading
        label={busy ? "แม่กำลังเปิดตำรา…" : "กำลังเปิดตำราฝัน…"}
        hint={
          busy
            ? "กำลังตีความฝันและจัดเลขเด็ดให้"
            : "รอสักครู่ แม่กำลังจัดหน้าให้"
        }
      />
    );
  }

  return (
    <div className="relative mx-auto min-h-full w-full max-w-[480px] text-white">
      <MaePageBackground blur={16} scrollBlur={false} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[22rem] overflow-hidden"
      >
        <Image
          src={DREAM_ART}
          alt=""
          fill
          unoptimized
          className="object-cover object-[center_28%] opacity-[0.34]"
          sizes="480px"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(6,20,42,0.35) 0%, rgba(6,20,42,0.72) 55%, #06142a 100%)",
          }}
        />
        <div
          className="absolute left-1/2 top-[5.5rem] h-40 w-40 -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(232,209,154,0.22) 0%, transparent 70%)",
          }}
        />
      </div>

      <AnimatedPage className="relative z-[2] px-4 pb-20 pt-5 sm:px-5">
        <PageBackButton href="/special" />

        <header className="mt-6 text-center">
          <p
            className="text-[15px] font-semibold tracking-[0.18em]"
            style={{ color: GOLD }}
          >
            ตำราแม่มั่งมี
          </p>
          <h1
            className="mae-gold-text mt-2 text-[2.15rem] font-bold tracking-tight"
            style={{
              lineHeight: 1.25,
              paddingTop: "0.1em",
              paddingBottom: "0.06em",
            }}
          >
            ทำนายฝัน
          </h1>
          <span
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-[0.45em] text-[15px] font-semibold leading-none"
            style={{
              color: GOLD_SOFT,
              background: "rgba(8,16,32,0.55)",
              boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.32)",
            }}
          >
            <Moon className="h-3.5 w-3.5" strokeWidth={2.2} />
            วันละ 1 ครั้ง · 00:00 น.
          </span>
        </header>

        {!loaded.signedIn ? (
          <div
            className="mt-10 rounded-[24px] px-5 py-7 text-center"
            style={{
              background: GLASS.bg,
              border: GLASS.border,
              boxShadow: GLASS.shadow,
              backdropFilter: GLASS.blur,
              WebkitBackdropFilter: GLASS.blur,
            }}
          >
            <Moon
              className="mx-auto h-8 w-8"
              style={{ color: GOLD }}
              strokeWidth={1.8}
            />
            <p
              className="mt-4 text-[16px] font-medium leading-[1.55]"
              style={{ color: TEXT }}
            >
              เข้าสู่ระบบก่อน
              <br />
              แม่จะจำว่าวันนี้ถามไปแล้ว
            </p>
            <Link
              href="/login?callbackUrl=/special/dream"
              className="wallpaper-dl-btn mt-6 inline-flex h-12 items-center justify-center rounded-full px-8 text-[15px] font-bold"
            >
              <span className="dd-btn-label">เข้าสู่ระบบ</span>
            </Link>
          </div>
        ) : (
          <>
            <div
              className="mt-8 rounded-[24px] px-4 py-4"
              style={{
                background: GLASS.bg,
                border: GLASS.border,
                boxShadow: GLASS.shadow,
                backdropFilter: GLASS.blur,
                WebkitBackdropFilter: GLASS.blur,
              }}
            >
              <label className="block">
                <span
                  className="text-[15px] font-semibold tracking-[0.06em]"
                  style={{ color: GOLD }}
                >
                  {locked ? "ความฝันวันนี้" : "เล่าความฝันเมื่อคืน"}
                </span>
                <textarea
                  value={locked ? loaded.dream : draft}
                  readOnly={locked}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={400}
                  rows={locked ? 2 : 4}
                  placeholder="เช่น ฝันว่ามีงูเต็มพื้น แล้วตื่นกลางดึก"
                  className="mt-3 w-full resize-none bg-transparent text-[16px] font-medium leading-[1.6] text-white outline-none placeholder:text-white/35"
                />
                {!locked ? (
                  <p
                    className="mt-2 text-right text-[15px] font-medium tabular-nums"
                    style={{ color: MUTED }}
                  >
                    {draft.trim().length}/400
                  </p>
                ) : null}
              </label>
            </div>

            {!locked && (
              <button
                type="button"
                disabled={busy || draft.trim().length < 4}
                onClick={() => void ask()}
                className="wallpaper-dl-btn group relative mt-4 flex h-[3.65rem] w-full items-center gap-3 overflow-hidden rounded-[18px] px-2.5 text-left outline-none transition active:scale-[0.99] disabled:opacity-50"
              >
                <span className="wallpaper-dl-btn__icon relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
                  <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.2} />
                </span>
                <span className="relative z-[1] min-w-0 flex-1">
                  <span className="dd-btn-label block text-[16px] font-bold leading-tight tracking-wide">
                    {busy ? "แม่กำลังเปิดตำรา…" : "ตีความฝันนี้"}
                  </span>
                  <span className="mt-0.5 block text-[15px] font-medium leading-tight opacity-70">
                    ได้ความหมายและเลขเด็ด
                  </span>
                </span>
                <span
                  className="wallpaper-dl-btn__shine pointer-events-none absolute inset-0"
                  aria-hidden
                />
              </button>
            )}

            {error ? (
              <p className="mt-3 text-center text-[15px] font-medium text-[#f0a8b0]">
                {error}
              </p>
            ) : null}

            {reading ? <DreamResult reading={reading} /> : null}

            {locked ? (
              <button
                type="button"
                disabled={!canAskAgain}
                onClick={() => {
                  if (!canAskAgain) return;
                  setLoaded({
                    signedIn: true,
                    asked: false,
                    dream: "",
                    reading: null,
                  });
                  setDraft("");
                  setError("");
                }}
                className="mx-auto mt-8 flex h-12 items-center justify-center gap-2.5 rounded-full px-6 text-[15px] font-semibold tabular-nums outline-none transition active:scale-[0.99] disabled:opacity-100"
                style={{
                  color: GOLD,
                  background: "rgba(6,14,30,0.62)",
                  boxShadow: `inset 0 0 0 1px rgba(232,209,154,0.55)`,
                }}
              >
                <RefreshCw className="h-4 w-4 shrink-0" strokeWidth={2.2} />
                <span>
                  ทำนายฝันใหม่
                  {leftMs > 0 ? (
                    <span className="ml-2 opacity-90">
                      {formatCountdown(leftMs)}
                    </span>
                  ) : null}
                </span>
              </button>
            ) : null}
          </>
        )}
      </AnimatedPage>
    </div>
  );
}

function DreamResult({ reading }: { reading: DreamReading }) {
  const visible = useRevealMounted(60);

  return (
    <section className="mt-8">
      <Reveal visible={visible} delay={40} className="text-center">
        <p
          className="text-[15px] font-semibold tracking-[0.16em]"
          style={{ color: GOLD }}
        >
          คำทำนาย
        </p>
        <h2
          className="mae-gold-text mt-2 text-[1.55rem] font-bold leading-[1.35]"
          style={{
            paddingTop: "0.08em",
            paddingBottom: "0.04em",
          }}
        >
          {reading.title}
        </h2>
        <p
          className="mx-auto mt-3.5 max-w-[22rem] text-[16px] font-medium leading-[1.7]"
          style={{ color: TEXT }}
        >
          {reading.meaning}
        </p>
      </Reveal>

      <Reveal visible={visible} delay={140} className="mt-7 space-y-5">
        <TipRow
          label="วันนี้ลอง"
          labelColor={GOLD_SOFT}
          accent="rgba(232,209,154,0.7)"
          body={reading.doToday}
        />
        <TipRow
          label="ควรระวัง"
          labelColor={CAUTION}
          accent="rgba(240,168,176,0.75)"
          body={reading.holdOff}
        />
      </Reveal>

      <Reveal visible={visible} delay={240} variant="scale" className="mt-8">
        <div
          className="relative overflow-hidden rounded-[26px] px-5 py-6 text-center"
          style={{
            background:
              "linear-gradient(165deg, rgba(14,30,56,0.88) 0%, rgba(6,14,30,0.82) 100%)",
            border: GLASS.border,
            boxShadow: "0 18px 40px rgba(0,0,0,0.32)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-24 rounded-full blur-2xl"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(232,209,154,0.2), transparent 70%)",
            }}
          />
          <p
            className="relative text-[15px] font-semibold tracking-[0.18em]"
            style={{ color: GOLD }}
          >
            เลขเด็ด
          </p>
          <p className="relative mt-4 text-[2.45rem] font-bold tabular-nums leading-none tracking-tight text-white">
            {reading.numbers.main}
            <span className="mx-2.5 text-[1.2rem] font-medium text-white/35">
              ·
            </span>
            {reading.numbers.secondary}
          </p>
          <p className="relative mt-4 text-[1.35rem] font-semibold tabular-nums tracking-[0.22em] text-white/90">
            {reading.numbers.triples.join("  ")}
          </p>
          <p
            className="relative mx-auto mt-4 max-w-[18rem] text-[15px] font-medium leading-[1.55]"
            style={{ color: MUTED }}
          >
            {reading.numbers.why}
          </p>
        </div>
      </Reveal>

      <Reveal visible={visible} delay={340} className="mt-6 text-center">
        <p
          className="text-[16px] font-medium leading-[1.6]"
          style={{ color: TEXT }}
        >
          {reading.closing}
        </p>
        <p
          className="mt-3 text-[15px] font-medium leading-snug"
          style={{ color: MUTED }}
        >
          เลขเป็นความเชื่อประกอบ ไม่การันตีผล
        </p>
      </Reveal>
    </section>
  );
}

function TipRow({
  label,
  labelColor,
  accent,
  body,
}: {
  label: string;
  labelColor: string;
  accent: string;
  body: string;
}) {
  return (
    <div className="flex gap-3.5">
      <span
        aria-hidden
        className="mt-1.5 h-[2.6rem] w-[3px] shrink-0 rounded-full"
        style={{ background: accent }}
      />
      <div className="min-w-0 flex-1">
        <p
          className="text-[15px] font-bold tracking-wide"
          style={{ color: labelColor }}
        >
          {label}
        </p>
        <p className="mt-1.5 text-[15px] font-medium leading-[1.55] text-white">
          {body}
        </p>
      </div>
    </div>
  );
}
