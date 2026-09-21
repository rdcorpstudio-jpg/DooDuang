"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, RefreshCw, Sparkles } from "lucide-react";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { MaePageLoading } from "@/components/layout/mae-page-loading";
import { PageBackButton } from "@/components/ui/page-back-button";
import {
  bangkokDayKey,
  type DreamReading,
} from "@/lib/fortune/dream-reading";
import { MAE_GLASS } from "@/lib/mae-glass";

const GOLD = "#e8d19a";
const GOLD_SOFT = "#efc36c";
const TEXT = "rgba(240,244,250,0.92)";
const MUTED = "rgba(186,204,230,0.78)";
const GLASS = MAE_GLASS;

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
    active ? msUntilNextBangkokMidnight() : 0
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

const TITLE_GOLD = {
  background:
    "linear-gradient(180deg, #fffef8 0%, #ffe9b0 24%, #f0d078 48%, #d5b16f 72%, #b8924f 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
} as const;

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
      <MaePageBackground blur={18} scrollBlur={false} />
      <div className="relative z-[2] px-4 pb-16 pt-5 sm:px-5">
        <PageBackButton href="/special" />

        <header className="mt-5 text-center">
          <p
            className="text-[13.5px] font-semibold tracking-[0.16em]"
            style={{ color: GOLD }}
          >
            ตำราแม่มั่งมี
          </p>
          <h1
            className="mt-2 text-[2rem] font-bold leading-[1.3]"
            style={{
              ...TITLE_GOLD,
              paddingTop: "0.12em",
              paddingBottom: "0.06em",
            }}
          >
            ทำนายฝัน
          </h1>
          <p className="mt-2 text-[13px] font-medium" style={{ color: MUTED }}>
            วันละ 1 ครั้ง · รีเซ็ต 00:00 น.
          </p>
        </header>

        {!loaded.signedIn ? (
          <div
            className="mt-8 rounded-[22px] px-5 py-6 text-center"
            style={{
              background:
                "linear-gradient(145deg, rgba(12,28,52,0.78), rgba(6,16,34,0.7))",
              boxShadow:
                "inset 0 0 0 1px rgba(232,209,154,0.28), 0 16px 36px rgba(0,0,0,0.28)",
            }}
          >
            <Moon className="mx-auto h-7 w-7" style={{ color: GOLD }} strokeWidth={1.8} />
            <p className="mt-3 text-[15.5px] font-medium leading-[1.55]" style={{ color: TEXT }}>
              ต้องเข้าสู่ระบบก่อน
              <br />
              แม่จะได้จำว่าวันนี้ถามไปแล้ว
            </p>
            <Link
              href="/login?callbackUrl=/special/dream"
              className="wallpaper-dl-btn mt-5 inline-flex h-12 items-center justify-center rounded-full px-7 text-[15px] font-bold"
            >
              <span className="dd-btn-label">เข้าสู่ระบบ</span>
            </Link>
          </div>
        ) : (
          <>
            <div
              className="mt-7 rounded-[22px] px-4 py-4"
              style={{
                background: GLASS.bg,
                border: GLASS.border,
                boxShadow: `${GLASS.shadow}, ${GLASS.highlight}`,
                backdropFilter: GLASS.blur,
                WebkitBackdropFilter: GLASS.blur,
              }}
            >
              <label className="block">
                <span
                  className="text-[13.5px] font-semibold tracking-[0.1em]"
                  style={{ color: GOLD }}
                >
                  {locked ? "ความฝันที่ถามวันนี้" : "ความฝันเมื่อคืน"}
                </span>
                <textarea
                  value={locked ? loaded.dream : draft}
                  readOnly={locked}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={400}
                  rows={3}
                  placeholder="เช่น ฝันว่าถูกงูกัด แล้วตื่นกลางดึก"
                  className="mt-2.5 w-full resize-none bg-transparent text-[16px] font-medium leading-[1.55] text-white outline-none placeholder:text-white/35"
                />
              </label>
            </div>

            {!locked && (
              <button
                type="button"
                disabled={busy || draft.trim().length < 4}
                onClick={() => void ask()}
                className="wallpaper-dl-btn group relative mt-4 flex h-[3.55rem] w-full items-center gap-3 overflow-hidden rounded-[18px] px-2.5 text-left outline-none transition active:scale-[0.99] disabled:opacity-50"
              >
                <span className="wallpaper-dl-btn__icon relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
                  <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.2} />
                </span>
                <span className="relative z-[1] min-w-0 flex-1">
                  <span className="dd-btn-label block text-[15.5px] font-bold leading-tight tracking-wide">
                    {busy ? "แม่กำลังเปิดตำรา…" : "ตีความฝันนี้"}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] font-medium leading-tight opacity-70">
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
              <p className="mt-3 text-center text-[14.5px] font-medium text-[#f0a8b0]">
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
                className="mx-auto mt-6 flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[14.5px] font-semibold tabular-nums outline-none transition active:scale-[0.99] disabled:opacity-100"
                style={{
                  color: GOLD,
                  background: "rgba(6,14,30,0.55)",
                  boxShadow: `inset 0 0 0 1px ${GOLD}`,
                }}
              >
                <RefreshCw className="h-4 w-4 shrink-0" strokeWidth={2.2} />
                <span>
                  ทำนายฝันใหม่
                  {leftMs > 0 ? (
                    <span className="ml-1.5 opacity-90">
                      {formatCountdown(leftMs)}
                    </span>
                  ) : null}
                </span>
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function DreamResult({ reading }: { reading: DreamReading }) {
  return (
    <section
      className="mt-6 overflow-hidden rounded-[22px] px-4 py-5 sm:px-5"
      style={{
        background: GLASS.bg,
        border: GLASS.border,
        boxShadow: `${GLASS.shadow}, ${GLASS.highlight}`,
        backdropFilter: GLASS.blur,
        WebkitBackdropFilter: GLASS.blur,
      }}
    >
      <div className="flex items-center gap-2">
        <Moon className="h-4 w-4 shrink-0" style={{ color: GOLD_SOFT }} strokeWidth={2} />
        <p
          className="text-[13px] font-semibold tracking-[0.14em]"
          style={{ color: GOLD }}
        >
          ตำราแม่มั่งมี
        </p>
      </div>

      <h2
        className="mt-3 text-[1.4rem] font-bold leading-[1.35]"
        style={{
          ...TITLE_GOLD,
          paddingTop: "0.08em",
          paddingBottom: "0.04em",
        }}
      >
        {reading.title}
      </h2>
      <p
        className="mt-3 text-[16px] font-medium leading-[1.65]"
        style={{ color: TEXT }}
      >
        {reading.meaning}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div
          className="rounded-[18px] px-3.5 py-3.5"
          style={{
            background: GLASS.bgSoft,
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
          }}
        >
          <p
            className="text-[13.5px] font-bold tracking-wide"
            style={{ color: GOLD_SOFT }}
          >
            วันนี้ลอง
          </p>
          <p className="mt-1.5 text-[14.5px] font-medium leading-[1.5] text-white">
            {reading.doToday}
          </p>
        </div>
        <div
          className="rounded-[18px] px-3.5 py-3.5"
          style={{
            background: GLASS.bgSoft,
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
          }}
        >
          <p
            className="text-[13.5px] font-bold tracking-wide"
            style={{ color: GOLD_SOFT }}
          >
            ควรระวัง
          </p>
          <p className="mt-1.5 text-[14.5px] font-medium leading-[1.5] text-white">
            {reading.holdOff}
          </p>
        </div>
      </div>

      <div
        className="mt-5 rounded-[18px] px-4 py-4"
        style={{
          background: "rgba(8,14,28,0.4)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
        }}
      >
        <p
          className="text-[13px] font-semibold tracking-[0.14em]"
          style={{ color: GOLD }}
        >
          เลขเด็ด
        </p>
        <p className="mt-2.5 text-[2.05rem] font-bold tabular-nums leading-none tracking-tight text-white">
          {reading.numbers.main}
          <span className="mx-2 text-[1.15rem] font-medium text-white/40">·</span>
          {reading.numbers.secondary}
        </p>
        <p className="mt-2.5 text-[1.15rem] font-semibold tabular-nums tracking-[0.1em] text-white/88">
          {reading.numbers.triples.join("   ")}
        </p>
        <p
          className="mt-2.5 text-[14px] font-medium leading-[1.5]"
          style={{ color: MUTED }}
        >
          {reading.numbers.why}
        </p>
      </div>

      <p
        className="mt-5 text-[15.5px] font-medium leading-[1.55]"
        style={{ color: TEXT }}
      >
        {reading.closing}
      </p>
      <p
        className="mt-3 text-[12.5px] font-medium leading-snug"
        style={{ color: MUTED }}
      >
        เลขเป็นความเชื่อประกอบ ไม่การันตีผล
      </p>
    </section>
  );
}
