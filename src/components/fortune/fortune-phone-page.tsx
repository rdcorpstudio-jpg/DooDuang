"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RefreshCw, Smartphone, Sparkles } from "lucide-react";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { MaePageLoading } from "@/components/layout/mae-page-loading";
import { AnimatedPage, Reveal, useRevealMounted } from "@/components/ui/reveal";
import { PageBackButton } from "@/components/ui/page-back-button";
import {
  formatPhoneDisplay,
  isValidThaiMobile,
  msUntilNextBangkokWeek,
  normalizePhoneInput,
  type PhoneReading,
} from "@/lib/fortune/phone-reading";
import { readFortuneProfile } from "@/lib/fortune/profile-storage";
import { MAE_GLASS } from "@/lib/mae-glass";

const GOLD = "#e8d19a";
const GOLD_SOFT = "#efc36c";
const TEXT = "rgba(240,244,250,0.92)";
const MUTED = "rgba(186,204,230,0.82)";
const CAUTION = "#f0a8b0";
const GLASS = MAE_GLASS;
const PHONE_ART = "/images/special/coming-soon/05-phone-reading.webp";

function pad2(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function formatCountdown(ms: number) {
  const total = Math.ceil(ms / 1000);
  const d = Math.floor(total / 86_400);
  const h = Math.floor((total % 86_400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d}ว ${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

function useWeekCountdown(active: boolean) {
  const [leftMs, setLeftMs] = useState(() =>
    active ? msUntilNextBangkokWeek() : 0,
  );

  useEffect(() => {
    if (!active) {
      setLeftMs(0);
      return;
    }
    const tick = () => setLeftMs(msUntilNextBangkokWeek());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [active]);

  return leftMs;
}

type Loaded = {
  signedIn: boolean;
  asked: boolean;
  phone: string;
  reading: PhoneReading | null;
};

export function FortunePhonePage() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/fortune/phone", { cache: "no-store" });
        const data = (await res.json()) as {
          user?: boolean | null;
          asked?: boolean;
          phone?: string;
          reading?: PhoneReading;
          error?: string;
        };
        if (!alive) return;
        setLoaded({
          signedIn: Boolean(data.user),
          asked: Boolean(data.asked && data.reading),
          phone: data.phone ?? "",
          reading: data.reading ?? null,
        });
        if (data.error) setError(data.error);
      } catch {
        if (!alive) return;
        setLoaded({
          signedIn: false,
          asked: false,
          phone: "",
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
    const phone = normalizePhoneInput(draft);
    if (!isValidThaiMobile(phone)) {
      setError("ใส่เบอร์มือถือไทย 10 หลัก เช่น 08x-xxx-xxxx");
      return;
    }
    const profile = readFortuneProfile();
    if (!profile?.nickname || !profile.birthDate) {
      setError("กรอกโปรไฟล์ชื่อและวันเกิดก่อน แม่จะเทียบกับพื้นดวงได้");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/fortune/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, profile }),
      });
      const raw = await res.text();
      let data: {
        error?: string;
        code?: string;
        phone?: string;
        reading?: PhoneReading;
      } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        setError("เชื่อมต่อไม่ได้ ลองอีกครั้ง");
        return;
      }
      if (res.status === 401 || data.code === "UNAUTHENTICATED") {
        window.location.href = "/login?callbackUrl=/special/phone";
        return;
      }
      if (data.code === "NO_PROFILE") {
        window.location.href = "/dashboard";
        return;
      }
      if (!res.ok || !data.reading) {
        setError(data.error || "แม่เปิดตำราไม่สำเร็จ ลองอีกครั้ง");
        return;
      }
      setLoaded({
        signedIn: true,
        asked: true,
        phone: data.phone ?? phone,
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
  const leftMs = useWeekCountdown(locked);
  const canAskAgain = locked && leftMs <= 0;
  const draftDigits = normalizePhoneInput(draft);
  const canSubmit = isValidThaiMobile(draftDigits);

  useEffect(() => {
    if (!canAskAgain) return;
    let alive = true;
    async function refresh() {
      try {
        const res = await fetch("/api/fortune/phone", { cache: "no-store" });
        const data = (await res.json()) as {
          user?: boolean | null;
          asked?: boolean;
          phone?: string;
          reading?: PhoneReading;
        };
        if (!alive) return;
        setLoaded({
          signedIn: Boolean(data.user),
          asked: Boolean(data.asked && data.reading),
          phone: data.phone ?? "",
          reading: data.reading ?? null,
        });
        setDraft("");
      } catch {
        /* keep locked UI */
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
        label={busy ? "แม่กำลังเปิดตำรา…" : "กำลังเปิดตำราเบอร์…"}
        hint={
          busy
            ? "กำลังอ่านพลังตัวเลขในเบอร์ให้"
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
          src={PHONE_ART}
          alt=""
          fill
          unoptimized
          className="object-cover object-[center_30%] opacity-[0.34]"
          sizes="480px"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(6,20,42,0.35) 0%, rgba(6,20,42,0.72) 55%, #06142a 100%)",
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
            className="mae-gold-text mt-2 text-[2rem] font-bold tracking-tight"
            style={{
              lineHeight: 1.25,
              paddingTop: "0.1em",
              paddingBottom: "0.06em",
            }}
          >
            วิเคราะห์เบอร์
          </h1>
          <span
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-[0.45em] text-[15px] font-semibold leading-none"
            style={{
              color: GOLD_SOFT,
              background: "rgba(8,16,32,0.55)",
              boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.32)",
            }}
          >
            <Smartphone className="h-3.5 w-3.5" strokeWidth={2.2} />
            อาทิตย์ละ 1 ครั้ง · จันทร์ 00:00 น.
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
            <Smartphone
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
              href="/login?callbackUrl=/special/phone"
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
                  {locked ? "เบอร์ที่ถามสัปดาห์นี้" : "เบอร์มือถือ"}
                </span>
                <input
                  value={
                    locked
                      ? formatPhoneDisplay(loaded.phone)
                      : draft
                  }
                  readOnly={locked}
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={16}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="08x-xxx-xxxx"
                  className="mt-3 w-full bg-transparent text-[1.35rem] font-semibold tabular-nums tracking-wide text-white outline-none placeholder:text-white/35"
                />
              </label>
            </div>

            {!locked && (
              <button
                type="button"
                disabled={busy || !canSubmit}
                onClick={() => void ask()}
                className="wallpaper-dl-btn group relative mt-4 flex h-[3.65rem] w-full items-center gap-3 overflow-hidden rounded-[18px] px-2.5 text-left outline-none transition active:scale-[0.99] disabled:opacity-50"
              >
                <span className="wallpaper-dl-btn__icon relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
                  <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.2} />
                </span>
                <span className="relative z-[1] min-w-0 flex-1">
                  <span className="dd-btn-label block text-[16px] font-bold leading-tight tracking-wide">
                    {busy ? "แม่กำลังเปิดตำรา…" : "วิเคราะห์เบอร์นี้"}
                  </span>
                  <span className="mt-0.5 block text-[15px] font-medium leading-tight opacity-70">
                    เทียบกับโปรไฟล์ · อ่านผลครบด้าน
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

            {reading ? <PhoneResult reading={reading} /> : null}

            {locked ? (
              <button
                type="button"
                disabled={!canAskAgain}
                onClick={() => {
                  if (!canAskAgain) return;
                  setLoaded({
                    signedIn: true,
                    asked: false,
                    phone: "",
                    reading: null,
                  });
                  setDraft("");
                  setError("");
                }}
                className="mx-auto mt-8 flex h-12 items-center justify-center gap-2.5 rounded-full px-6 text-[15px] font-semibold tabular-nums outline-none transition active:scale-[0.99] disabled:opacity-100"
                style={{
                  color: GOLD,
                  background: "rgba(6,14,30,0.62)",
                  boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.55)",
                }}
              >
                <RefreshCw className="h-4 w-4 shrink-0" strokeWidth={2.2} />
                <span>
                  วิเคราะห์ใหม่
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

function PhoneResult({ reading }: { reading: PhoneReading }) {
  const visible = useRevealMounted(60);
  const fitTone =
    reading.birthFit.verdict.includes("ตี")
      ? CAUTION
      : reading.birthFit.verdict.includes("หนุน")
        ? "#b9ebdc"
        : GOLD_SOFT;

  return (
    <section className="mt-8 space-y-7">
      <Reveal visible={visible} delay={40} className="text-center">
        <p
          className="text-[15px] font-semibold tracking-[0.16em]"
          style={{ color: GOLD }}
        >
          ภาพรวมเบอร์
        </p>
        <p className="mt-3 text-[2.4rem] font-bold tabular-nums leading-none text-white">
          {reading.score}
          <span className="ml-1 text-[1rem] font-medium text-white/45">/100</span>
        </p>
        <h2
          className="mae-gold-text mt-3 text-[1.4rem] font-bold leading-[1.35]"
          style={{ paddingTop: "0.08em", paddingBottom: "0.04em" }}
        >
          {reading.title}
        </h2>
        <p
          className="mx-auto mt-2.5 max-w-[21rem] text-[16px] font-medium leading-[1.55]"
          style={{ color: TEXT }}
        >
          {reading.scoreLabel}
        </p>
        <p
          className="mx-auto mt-3 max-w-[22rem] text-[15px] font-medium leading-[1.65]"
          style={{ color: MUTED }}
        >
          {reading.meaning}
        </p>
      </Reveal>

      <Reveal visible={visible} delay={100}>
        <p
          className="text-[15px] font-semibold tracking-[0.12em]"
          style={{ color: GOLD }}
        >
          เลขคู่ที่เด่น
        </p>
        <div className="mt-3 space-y-3">
          {reading.pairs.map((row) => (
            <div key={`${row.pair}-${row.meaning}`} className="flex gap-3">
              <span
                className="shrink-0 text-[1.25rem] font-bold tabular-nums leading-none"
                style={{ color: GOLD_SOFT }}
              >
                {row.pair}
              </span>
              <p className="text-[15px] font-medium leading-[1.5] text-white">
                {row.meaning}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal visible={visible} delay={160}>
        <p
          className="text-[15px] font-semibold tracking-[0.12em]"
          style={{ color: GOLD }}
        >
          ผลต่อ 4 ด้าน
        </p>
        <div className="mt-3 space-y-3.5">
          <AspectLine label="งาน" body={reading.aspects.work} />
          <AspectLine label="เงิน" body={reading.aspects.money} />
          <AspectLine label="ความรัก" body={reading.aspects.love} />
          <AspectLine label="การสื่อสาร" body={reading.aspects.social} />
        </div>
      </Reveal>

      <Reveal visible={visible} delay={220} className="space-y-5">
        <BulletBlock
          label="จุดแข็ง"
          color={GOLD_SOFT}
          items={reading.strengths}
        />
        <BulletBlock
          label="ควรระวัง"
          color={CAUTION}
          items={reading.cautions}
        />
      </Reveal>

      <Reveal visible={visible} delay={280} className="space-y-4">
        <div>
          <p
            className="text-[15px] font-semibold tracking-[0.12em]"
            style={{ color: GOLD }}
          >
            เลขท้าย {reading.tailDigits}
          </p>
          <p className="mt-2 text-[15px] font-medium leading-[1.55] text-white">
            {reading.tailMeaning}
          </p>
        </div>
        <div>
          <p
            className="text-[15px] font-semibold tracking-[0.12em]"
            style={{ color: GOLD }}
          >
            {reading.repeated}
          </p>
          <p className="mt-2 text-[15px] font-medium leading-[1.55] text-white">
            {reading.repeatedMeaning}
          </p>
        </div>
      </Reveal>

      <Reveal visible={visible} delay={340} className="space-y-4">
        <div>
          <p
            className="text-[15px] font-semibold tracking-[0.12em]"
            style={{ color: GOLD }}
          >
            แนะนำการใช้เบอร์
          </p>
          <p className="mt-2 text-[15px] font-medium leading-[1.55] text-white">
            {reading.usageAdvice}
          </p>
        </div>
        <div>
          <p
            className="text-[15px] font-semibold tracking-[0.12em]"
            style={{ color: fitTone }}
          >
            เทียบพื้นดวง · {reading.birthFit.verdict}
          </p>
          <p className="mt-2 text-[15px] font-medium leading-[1.55] text-white">
            {reading.birthFit.detail}
          </p>
        </div>
      </Reveal>

      <Reveal visible={visible} delay={400} className="text-center">
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
          เป็นความเชื่อประกอบ ไม่การันตีผล
        </p>
      </Reveal>
    </section>
  );
}

function AspectLine({ label, body }: { label: string; body: string }) {
  return (
    <div className="flex gap-3">
      <span
        className="w-[4.5rem] shrink-0 text-[15px] font-bold"
        style={{ color: GOLD_SOFT }}
      >
        {label}
      </span>
      <p className="min-w-0 flex-1 text-[15px] font-medium leading-[1.5] text-white">
        {body}
      </p>
    </div>
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
      <p
        className="text-[15px] font-bold tracking-wide"
        style={{ color }}
      >
        {label}
      </p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-[15px] font-medium leading-[1.5] text-white"
          >
            <span
              className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full"
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
