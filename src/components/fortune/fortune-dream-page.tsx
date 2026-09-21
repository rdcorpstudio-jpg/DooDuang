"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Sparkles } from "lucide-react";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { PageBackButton } from "@/components/ui/page-back-button";
import type { DreamReading } from "@/lib/fortune/dream-reading";

const GOLD = "#e8d19a";
const GOLD_SOFT = "#efc36c";
const TEXT = "rgba(240,244,250,0.92)";
const MUTED = "rgba(186,204,230,0.78)";
const GOLD_RING =
  "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)";

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
          <span
            aria-hidden
            className="mx-auto mt-2.5 block h-px w-20"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(232,209,154,0.75), transparent)",
            }}
          />
          <p
            className="mx-auto mt-3 max-w-[19rem] text-[15px] font-medium leading-[1.55]"
            style={{ color: TEXT }}
          >
            เล่าภาพที่จำได้ แม่จะตีความให้
            <br />
            พร้อมเลขเด็ดที่ผูกกับสัญลักษณ์ในฝัน
          </p>
          <p className="mt-2 text-[13px] font-medium" style={{ color: MUTED }}>
            วันละ 1 ครั้ง · รีเซ็ต 00:00 น.
          </p>
        </header>

        {loaded === null ? (
          <p
            className="mt-10 text-center text-[15px] font-medium"
            style={{ color: MUTED }}
          >
            กำลังเปิดตำรา…
          </p>
        ) : !loaded.signedIn ? (
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
              className="mt-7 rounded-[20px] p-[1.5px]"
              style={{
                background: locked
                  ? "linear-gradient(155deg, rgba(232,209,154,0.45), rgba(143,110,56,0.25))"
                  : GOLD_RING,
              }}
            >
              <label className="block rounded-[18.5px] px-4 py-4" style={{ background: "rgba(6,12,24,0.88)" }}>
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

            {locked ? (
              <p
                className="mt-3 text-center text-[13.5px] font-medium"
                style={{ color: MUTED }}
              >
                ถามไปแล้ววันนี้ · ถามใหม่ได้หลัง 00:00 น.
              </p>
            ) : (
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
          </>
        )}
      </div>
    </div>
  );
}

function DreamResult({ reading }: { reading: DreamReading }) {
  return (
    <section
      className="mt-6 rounded-[22px] p-[2px]"
      style={{
        background: GOLD_RING,
        boxShadow:
          "0 14px 36px rgba(0,0,0,0.34), 0 0 0 1px rgba(232,209,154,0.2)",
      }}
    >
      <div
        className="rounded-[20px] px-4 py-5 sm:px-5"
        style={{
          background:
            "linear-gradient(160deg, rgba(10,20,38,0.96) 0%, rgba(5,12,26,0.94) 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,248,228,0.16), inset 0 0 0 1px rgba(8,12,24,0.5)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <p
            className="text-[12.5px] font-semibold tracking-[0.14em]"
            style={{ color: GOLD }}
          >
            ตำราแม่มั่งมี
          </p>
          <Moon className="h-4 w-4 shrink-0" style={{ color: GOLD_SOFT }} strokeWidth={2} />
        </div>

        <h2
          className="mt-3 text-[1.45rem] font-bold leading-[1.35]"
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

        <div className="mt-4 grid grid-cols-1 gap-2.5">
          <div
            className="rounded-[16px] px-3.5 py-3"
            style={{
              background: "rgba(40,110,90,0.14)",
              boxShadow: "inset 0 0 0 1px rgba(120,210,180,0.22)",
            }}
          >
            <p
              className="text-[13px] font-semibold tracking-wide"
              style={{ color: "#b9ebdc" }}
            >
              วันนี้ควรทำ
            </p>
            <p className="mt-1 text-[15px] font-medium leading-[1.5] text-white">
              {reading.doToday}
            </p>
          </div>
          <div
            className="rounded-[16px] px-3.5 py-3"
            style={{
              background: "rgba(120,48,58,0.16)",
              boxShadow: "inset 0 0 0 1px rgba(255,154,154,0.22)",
            }}
          >
            <p
              className="text-[13px] font-semibold tracking-wide"
              style={{ color: "#f0a8b0" }}
            >
              อย่าเพิ่ง
            </p>
            <p className="mt-1 text-[15px] font-medium leading-[1.5] text-white">
              {reading.holdOff}
            </p>
          </div>
        </div>

        <div
          className="mt-5 rounded-[18px] px-4 py-4"
          style={{
            background:
              "linear-gradient(145deg, rgba(232,209,154,0.14) 0%, rgba(8,14,28,0.45) 100%)",
            boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.32)",
          }}
        >
          <p
            className="text-[12.5px] font-semibold tracking-[0.14em]"
            style={{ color: GOLD }}
          >
            เลขเด็ด
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-2">
            <span className="text-[2.15rem] font-bold tabular-nums leading-none tracking-tight text-white">
              {reading.numbers.main}
            </span>
            <span className="pb-1 text-[1.1rem] font-medium text-white/35">·</span>
            <span className="text-[2.15rem] font-bold tabular-nums leading-none tracking-tight text-white">
              {reading.numbers.secondary}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {reading.numbers.triples.map((n) => (
              <span
                key={n}
                className="rounded-full px-3 py-[0.4em] text-[15px] font-bold tabular-nums leading-none"
                style={{
                  color: "#1a1408",
                  background: GOLD_RING,
                  boxShadow: "0 6px 14px rgba(0,0,0,0.22)",
                }}
              >
                {n}
              </span>
            ))}
          </div>
          <p
            className="mt-3 text-[14px] font-medium leading-[1.5]"
            style={{ color: MUTED }}
          >
            {reading.numbers.why}
          </p>
        </div>

        <p
          className="mt-5 text-center text-[15.5px] font-medium leading-[1.55]"
          style={{ color: TEXT }}
        >
          {reading.closing}
        </p>
        <p
          className="mt-3 text-center text-[12.5px] font-medium leading-snug"
          style={{ color: MUTED }}
        >
          เลขเป็นความเชื่อประกอบ ไม่การันตีผล
        </p>
      </div>
    </section>
  );
}
