"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { PageBackButton } from "@/components/ui/page-back-button";
import type { DreamReading } from "@/lib/fortune/dream-reading";

const GOLD = "#e8d19a";
const TEXT = "rgba(240,244,250,0.9)";
const MUTED = "rgba(186,204,230,0.78)";

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
      <MaePageBackground blur={16} scrollBlur={false} />
      <div className="relative z-[2] px-4 pb-16 pt-5 sm:px-5">
        <PageBackButton href="/special" />

        <header className="mt-5">
          <p
            className="text-[14px] font-semibold tracking-[0.12em]"
            style={{ color: GOLD }}
          >
            วันละ 1 ความฝัน · รีเซ็ต 00:00 น.
          </p>
          <h1
            className="mt-1.5 text-[1.85rem] font-bold leading-[1.35]"
            style={{ ...TITLE_GOLD, paddingTop: "0.12em", paddingBottom: "0.06em" }}
          >
            ทำนายฝัน
          </h1>
          <p className="mt-2 max-w-[20rem] text-[15px] font-medium leading-[1.55]" style={{ color: TEXT }}>
            เล่าภาพที่จำได้ แม่จะตีความให้
            <br />
            พร้อมเลขเด็ดที่ผูกกับสัญลักษณ์ในฝัน
          </p>
        </header>

        {loaded === null ? (
          <p className="mt-8 text-[15px] font-medium" style={{ color: MUTED }}>
            กำลังเปิดตำรา…
          </p>
        ) : !loaded.signedIn ? (
          <div className="mt-8">
            <p className="text-[15.5px] font-medium leading-[1.55]" style={{ color: TEXT }}>
              ต้องเข้าสู่ระบบก่อน แม่จะได้จำว่าวันนี้ถามไปแล้ว
            </p>
            <Link
              href="/login?callbackUrl=/special/dream"
              className="wallpaper-dl-btn mt-4 inline-flex h-12 items-center justify-center rounded-full px-6 text-[15px] font-bold"
            >
              <span className="dd-btn-label">เข้าสู่ระบบ</span>
            </Link>
          </div>
        ) : (
          <>
            <label className="mt-6 block">
              <span className="text-[14px] font-semibold" style={{ color: GOLD }}>
                {locked ? "ความฝันที่ถามวันนี้" : "ความฝันเมื่อคืน"}
              </span>
              <textarea
                value={locked ? loaded.dream : draft}
                readOnly={locked}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={400}
                rows={4}
                placeholder="เช่น ฝันว่าถูกงูกัด แล้วตื่นกลางดึก"
                className="mt-2 w-full resize-none rounded-[18px] px-4 py-3.5 text-[16px] font-medium leading-[1.5] text-white outline-none placeholder:text-white/35"
                style={{
                  background: "rgba(8,14,28,0.55)",
                  boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.28)",
                }}
              />
            </label>

            {locked ? (
              <p className="mt-2 text-[13.5px] font-medium" style={{ color: MUTED }}>
                ถามไปแล้ววันนี้ · ถามใหม่ได้หลัง 00:00 น.
              </p>
            ) : (
              <button
                type="button"
                disabled={busy || draft.trim().length < 4}
                onClick={() => void ask()}
                className="wallpaper-dl-btn mt-4 flex h-12 w-full items-center justify-center rounded-full text-[15.5px] font-bold disabled:opacity-50"
              >
                <span className="dd-btn-label">
                  {busy ? "แม่กำลังเปิดตำรา…" : "ตีความฝันนี้"}
                </span>
              </button>
            )}

            {error ? (
              <p className="mt-3 text-[14.5px] font-medium text-[#f0a8b0]">{error}</p>
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
      className="mt-6 rounded-[22px] px-4 py-5"
      style={{
        background:
          "linear-gradient(145deg, rgba(12, 28, 52, 0.78) 0%, rgba(6, 16, 34, 0.7) 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.14), 0 16px 36px rgba(0,0,0,0.28)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <h2
        className="text-[1.35rem] font-bold leading-snug"
        style={{ ...TITLE_GOLD, paddingTop: "0.08em", paddingBottom: "0.04em" }}
      >
        {reading.title}
      </h2>
      <p className="mt-3 text-[16px] font-medium leading-[1.6]" style={{ color: TEXT }}>
        {reading.meaning}
      </p>
      <p className="mt-4 text-[15.5px] font-semibold leading-[1.5] text-white">
        วันนี้ควรทำ
      </p>
      <p className="mt-1 text-[15.5px] font-medium leading-[1.5]" style={{ color: TEXT }}>
        {reading.doToday}
      </p>
      <p className="mt-3 text-[15.5px] font-semibold leading-[1.5] text-[#f0a8b0]">
        อย่าเพิ่ง
      </p>
      <p className="mt-1 text-[15.5px] font-medium leading-[1.5]" style={{ color: TEXT }}>
        {reading.holdOff}
      </p>

      <div
        className="my-4 h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(232,209,154,0.4), rgba(255,255,255,0.06))",
        }}
      />

      <p className="text-[14px] font-semibold tracking-[0.12em]" style={{ color: GOLD }}>
        เลขเด็ด
      </p>
      <p className="mt-2 text-[2rem] font-bold tabular-nums leading-none tracking-tight text-white">
        {reading.numbers.main}
        <span className="mx-2 text-[1.2rem] font-medium text-white/40">·</span>
        {reading.numbers.secondary}
      </p>
      <p className="mt-2 text-[1.15rem] font-semibold tabular-nums tracking-wide text-white/90">
        {reading.numbers.triples.join("  ")}
      </p>
      <p className="mt-2 text-[14.5px] font-medium leading-[1.5]" style={{ color: MUTED }}>
        {reading.numbers.why}
      </p>
      <p className="mt-4 text-[15px] font-medium leading-[1.5] text-white">
        {reading.closing}
      </p>
      <p className="mt-3 text-[13px] font-medium leading-snug" style={{ color: MUTED }}>
        เลขเป็นความเชื่อประกอบ ไม่การันตีผล
      </p>
    </section>
  );
}
