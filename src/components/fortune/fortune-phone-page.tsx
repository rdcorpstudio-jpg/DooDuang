"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { RefreshCw, Smartphone, Sparkles } from "lucide-react";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { MaePageLoading } from "@/components/layout/mae-page-loading";
import { MaeOpenLight, useMaeOpenLight } from "@/components/fortune/mae-open-light";
import { AnimatedPage, Reveal, useRevealMounted } from "@/components/ui/reveal";
import { PageBackButton } from "@/components/ui/page-back-button";
import {
  formatPhoneDisplay,
  isValidThaiMobile,
  msUntilNextBangkokWeek,
  normalizePhoneInput,
  type PhoneReading,
} from "@/lib/fortune/phone-reading";
import {
  requirePremiumFromServer,
  setPremiumUnlocked,
} from "@/lib/fortune/premium-unlock";
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
  premium: boolean;
  asked: boolean;
  phone: string;
  reading: PhoneReading | null;
};

export function FortunePhonePage() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const { token, flash } = useMaeOpenLight();

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const profile = readFortuneProfile();
        const [res, access] = await Promise.all([
          fetch("/api/fortune/phone", { cache: "no-store" }),
          requirePremiumFromServer(
            profile
              ? { birthDate: profile.birthDate, nickname: profile.nickname }
              : null,
          ),
        ]);
        const data = (await res.json()) as {
          user?: boolean | null;
          premium?: boolean;
          asked?: boolean;
          phone?: string;
          reading?: PhoneReading;
          error?: string;
        };
        if (!alive) return;
        setLoaded({
          signedIn: Boolean(data.user),
          premium: Boolean(data.premium) || access.ok,
          asked: Boolean(data.asked && data.reading),
          phone: data.phone ?? "",
          reading: data.reading ?? null,
        });
        if (data.error) setError(data.error);
      } catch {
        if (!alive) return;
        setLoaded({
          signedIn: false,
          premium: false,
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
      if (res.status === 403 || data.code === "PREMIUM_REQUIRED") {
        setLoaded((prev) => (prev ? { ...prev, premium: false } : prev));
        setPayOpen(true);
        setError(data.error || "ต้องเป็นสมาชิกพรีเมียม");
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
        premium: true,
        asked: true,
        phone: data.phone ?? phone,
        reading: data.reading,
      });
      flash();
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
          premium?: boolean;
          asked?: boolean;
          phone?: string;
          reading?: PhoneReading;
        };
        if (!alive) return;
        setLoaded({
          signedIn: Boolean(data.user),
          premium: Boolean(data.premium),
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
      {token > 0 ? <MaeOpenLight key={token} /> : null}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[36rem] overflow-hidden"
        style={{
          WebkitMaskImage:
            "linear-gradient(180deg, #000 0%, #000 42%, rgba(0,0,0,0.55) 68%, transparent 100%)",
          maskImage:
            "linear-gradient(180deg, #000 0%, #000 42%, rgba(0,0,0,0.55) 68%, transparent 100%)",
        }}
      >
        <Image
          src={PHONE_ART}
          alt=""
          fill
          unoptimized
          className="object-cover object-[center_28%] opacity-[0.38]"
          sizes="480px"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(6,20,42,0.2) 0%, rgba(6,20,42,0.45) 50%, rgba(6,20,42,0.7) 100%)",
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
        ) : !loaded.premium ? (
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
            <Sparkles
              className="mx-auto h-8 w-8"
              style={{ color: GOLD }}
              strokeWidth={1.8}
            />
            <p
              className="mt-4 text-[16px] font-medium leading-[1.55]"
              style={{ color: TEXT }}
            >
              วิเคราะห์เบอร์เป็นฟีเจอร์พรีเมียม
              <br />
              สมัครแล้วแม่วิเคราะห์ให้ได้ทันที
            </p>
            <button
              type="button"
              onClick={() => setPayOpen(true)}
              className="wallpaper-dl-btn mt-6 inline-flex h-12 items-center justify-center rounded-full px-8 text-[15px] font-bold"
            >
              <span className="dd-btn-label">สมัครพรีเมียม</span>
            </button>
          </div>
        ) : (
          <>
            {!locked ? (
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
                      เบอร์มือถือ
                    </span>
                    <input
                      value={draft}
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={16}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="08x-xxx-xxxx"
                      className="mt-3 w-full bg-transparent text-[1.35rem] font-semibold tabular-nums tracking-wide text-white outline-none placeholder:text-white/35"
                    />
                  </label>
                </div>

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
              </>
            ) : (
              <p
                className="mt-8 text-center text-[15px] font-semibold tabular-nums tracking-[0.14em]"
                style={{ color: GOLD_SOFT }}
              >
                {formatPhoneDisplay(loaded.phone)}
              </p>
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
                    premium: true,
                    asked: false,
                    phone: "",
                    reading: null,
                  });
                  setDraft("");
                  setError("");
                }}
                className="mx-auto mt-10 flex h-12 items-center justify-center gap-2.5 rounded-full px-7 text-[15px] font-semibold tabular-nums outline-none transition active:scale-[0.99] disabled:opacity-100"
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

      <FortunePaymentSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onPaid={() => {
          const profile = readFortuneProfile();
          setPremiumUnlocked(
            profile
              ? { birthDate: profile.birthDate, nickname: profile.nickname }
              : null,
          );
          setLoaded((prev) => (prev ? { ...prev, premium: true } : prev));
          setPayOpen(false);
          setError("");
        }}
        returnPath="/special/phone"
      />
    </div>
  );
}

function PhoneResult({ reading }: { reading: PhoneReading }) {
  const visible = useRevealMounted(60);
  const fitTone = reading.birthFit.verdict.includes("ตี")
    ? CAUTION
    : reading.birthFit.verdict.includes("หนุน")
      ? "#b9ebdc"
      : GOLD_SOFT;

  return (
    <section className="mt-7 space-y-0">
      {/* Hero score */}
      <Reveal visible={visible} delay={40} className="text-center">
        <p
          className="text-[13px] font-semibold tracking-[0.22em]"
          style={{ color: GOLD }}
        >
          ภาพรวมเบอร์
        </p>

        <div className="relative mx-auto mt-5 flex h-[7.25rem] w-[7.25rem] items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(232,209,154,0.18) 0%, rgba(232,209,154,0.04) 55%, transparent 70%)",
              boxShadow:
                "inset 0 0 0 1px rgba(232,209,154,0.38), 0 0 28px rgba(232,209,154,0.12)",
            }}
          />
          <p className="relative text-[2.75rem] font-bold tabular-nums leading-none tracking-tight text-white">
            {reading.score}
            <span className="ml-0.5 align-baseline text-[0.95rem] font-medium text-white/40">
              /100
            </span>
          </p>
        </div>

        <h2
          className="mae-gold-text mx-auto mt-5 max-w-[20rem] text-[1.35rem] font-bold leading-[1.4]"
          style={{ paddingTop: "0.08em", paddingBottom: "0.04em" }}
        >
          {reading.title}
        </h2>

        {reading.scoreLabel ? (
          <p
            className="mx-auto mt-2.5 max-w-[20rem] text-[15px] font-semibold leading-[1.45]"
            style={{ color: GOLD_SOFT }}
          >
            {reading.scoreLabel}
          </p>
        ) : null}

        <p
          className="mx-auto mt-3.5 max-w-[22rem] text-[15px] font-medium leading-[1.7]"
          style={{ color: MUTED }}
        >
          {reading.summary}
          {reading.summary && reading.meaning ? " · " : null}
          {reading.meaning}
        </p>
      </Reveal>

      <SectionRule delay={90} visible={visible} />

      {/* Pairs */}
      <Reveal visible={visible} delay={110}>
        <SectionTitle>เลขคู่ที่เด่น</SectionTitle>
        <div className="mt-4 space-y-4">
          {reading.pairs.map((row) => (
            <div
              key={`${row.pair}-${row.meaning}`}
              className="grid grid-cols-[3.25rem_1fr] items-start gap-3"
            >
              <span
                className="pt-0.5 text-[1.35rem] font-bold tabular-nums leading-none"
                style={{ color: GOLD_SOFT }}
              >
                {row.pair}
              </span>
              <p className="text-[15px] font-medium leading-[1.55] text-white">
                {row.meaning}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <SectionRule delay={150} visible={visible} />

      {/* Four aspects */}
      <Reveal visible={visible} delay={170}>
        <SectionTitle>ผลต่อ 4 ด้าน</SectionTitle>
        <div
          className="mt-4 overflow-hidden rounded-[20px]"
          style={{
            background: "rgba(8,16,32,0.45)",
            boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.16)",
          }}
        >
          {(
            [
              ["งาน", reading.aspects.work],
              ["เงิน", reading.aspects.money],
              ["ความรัก", reading.aspects.love],
              ["การสื่อสาร", reading.aspects.social],
            ] as const
          ).map(([label, body], i) => (
            <div
              key={label}
              className="grid grid-cols-[5.25rem_1fr] gap-3 px-4 py-3.5"
              style={{
                borderTop:
                  i === 0 ? undefined : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span
                className="text-[15px] font-bold leading-[1.45]"
                style={{ color: GOLD_SOFT }}
              >
                {label}
              </span>
              <p className="min-w-0 text-[15px] font-medium leading-[1.55] text-white">
                {body}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <SectionRule delay={210} visible={visible} />

      {/* Strengths / cautions */}
      <Reveal visible={visible} delay={230} className="space-y-7">
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

      <SectionRule delay={270} visible={visible} />

      {/* Digits + advice */}
      <Reveal visible={visible} delay={290} className="space-y-6">
        <NoteBlock
          title={`เลขท้าย ${reading.tailDigits}`}
          body={reading.tailMeaning}
        />
        <NoteBlock title={reading.repeated} body={reading.repeatedMeaning} />
        <NoteBlock title="แนะนำการใช้เบอร์" body={reading.usageAdvice} />
        <NoteBlock
          title={`เทียบพื้นดวง · ${reading.birthFit.verdict}`}
          titleColor={fitTone}
          body={reading.birthFit.detail}
        />
      </Reveal>

      <SectionRule delay={330} visible={visible} />

      <Reveal visible={visible} delay={350} className="pb-1 text-center">
        <p
          className="mx-auto max-w-[21rem] text-[16px] font-medium leading-[1.65]"
          style={{ color: TEXT }}
        >
          {reading.closing}
        </p>
        <p
          className="mt-3 text-[13px] font-medium tracking-wide"
          style={{ color: "rgba(160,176,198,0.72)" }}
        >
          เป็นความเชื่อประกอบ ไม่การันตีผล
        </p>
      </Reveal>
    </section>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-[13px] font-semibold tracking-[0.18em]"
      style={{ color: GOLD }}
    >
      {children}
    </p>
  );
}

function SectionRule({
  visible,
  delay,
}: {
  visible: boolean;
  delay: number;
}) {
  return (
    <Reveal visible={visible} delay={delay} className="py-7">
      <div
        aria-hidden
        className="mx-auto h-px w-full max-w-[14rem]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(232,209,154,0.35), transparent)",
        }}
      />
    </Reveal>
  );
}

function NoteBlock({
  title,
  body,
  titleColor = GOLD,
}: {
  title: string;
  body: string;
  titleColor?: string;
}) {
  return (
    <div className="pl-3" style={{ borderLeft: `2px solid ${titleColor}55` }}>
      <p
        className="text-[15px] font-semibold tracking-[0.06em]"
        style={{ color: titleColor }}
      >
        {title}
      </p>
      <p className="mt-2 text-[15px] font-medium leading-[1.6] text-white">
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
      <p className="text-[15px] font-bold tracking-wide" style={{ color }}>
        {label}
      </p>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-[15px] font-medium leading-[1.55] text-white"
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
