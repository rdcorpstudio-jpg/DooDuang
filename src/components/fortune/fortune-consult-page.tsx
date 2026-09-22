"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Send, Sparkles } from "lucide-react";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { MaePageLoading } from "@/components/layout/mae-page-loading";
import { AnimatedPage, Reveal, useRevealMounted } from "@/components/ui/reveal";
import { PageBackButton } from "@/components/ui/page-back-button";
import {
  bangkokDayKey,
  CONSULT_DAILY_SESSIONS,
  CONSULT_MAX_INPUT,
  type ConsultMessage,
} from "@/lib/fortune/consult-reading";
import { readFortuneProfile } from "@/lib/fortune/profile-storage";
import { MAE_GLASS } from "@/lib/mae-glass";

const GOLD = "#e8d19a";
const GOLD_SOFT = "#efc36c";
const TEXT = "rgba(240,244,250,0.92)";
const MUTED = "rgba(186,204,230,0.82)";
const CAUTION = "#f0a8b0";
const GLASS = MAE_GLASS;
const CONSULT_ART = "/images/special/coming-soon/02-consult-mae-card.webp?v=4";

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

type SessionView = {
  id: string;
  messages: ConsultMessage[];
  userTurns: number;
  maxTurns: number;
  remainingTurns: number;
  closed: boolean;
};

type Loaded = {
  signedIn: boolean;
  premium: boolean;
  limit: number;
  used: number;
  remainingSessions: number;
  session: SessionView | null;
};

export function FortuneConsultPage() {
  const reveal = useRevealMounted();
  const listRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/fortune/consult", { cache: "no-store" });
        const data = (await res.json()) as {
          user?: boolean | null;
          premium?: boolean;
          limit?: number;
          used?: number;
          remainingSessions?: number;
          activeSession?: SessionView | null;
          error?: string;
        };
        if (!alive) return;
        if (!data.user) {
          setLoaded({
            signedIn: false,
            premium: false,
            limit: CONSULT_DAILY_SESSIONS,
            used: 0,
            remainingSessions: CONSULT_DAILY_SESSIONS,
            session: null,
          });
          return;
        }
        setLoaded({
          signedIn: true,
          premium: Boolean(data.premium),
          limit: data.limit ?? CONSULT_DAILY_SESSIONS,
          used: data.used ?? 0,
          remainingSessions: data.remainingSessions ?? 0,
          session: data.activeSession ?? null,
        });
        if (data.error) setError(data.error);
      } catch {
        if (!alive) return;
        setLoaded({
          signedIn: false,
          premium: false,
          limit: CONSULT_DAILY_SESSIONS,
          used: 0,
          remainingSessions: CONSULT_DAILY_SESSIONS,
          session: null,
        });
        setError("เชื่อมต่อไม่ได้ ลองรีเฟรชอีกครั้ง");
      }
    }
    void load();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [loaded?.session?.messages.length, busy]);

  const session = loaded?.session ?? null;
  const dbBlocked =
    Boolean(error) &&
    (error.includes("ฐานข้อมูล") || error.includes("consult_sessions"));
  const outOfSessions =
    Boolean(loaded?.signedIn) &&
    !session &&
    !dbBlocked &&
    (loaded?.remainingSessions ?? 0) <= 0;
  const leftMs = useBangkokMidnightCountdown(outOfSessions);
  const canReset = outOfSessions && leftMs <= 0;

  useEffect(() => {
    if (!canReset) return;
    let alive = true;
    async function refresh() {
      try {
        const res = await fetch("/api/fortune/consult", { cache: "no-store" });
        const data = (await res.json()) as {
          user?: boolean | null;
          premium?: boolean;
          limit?: number;
          used?: number;
          remainingSessions?: number;
          activeSession?: SessionView | null;
        };
        if (!alive || !data.user) return;
        setLoaded({
          signedIn: true,
          premium: Boolean(data.premium),
          limit: data.limit ?? CONSULT_DAILY_SESSIONS,
          used: data.used ?? 0,
          remainingSessions: data.remainingSessions ?? 0,
          session: data.activeSession ?? null,
        });
        setError("");
      } catch {
        /* keep locked UI */
      }
    }
    void refresh();
    return () => {
      alive = false;
    };
  }, [canReset]);

  async function startSession() {
    setError("");
    setStarting(true);
    try {
      const res = await fetch("/api/fortune/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          profile: readFortuneProfile(),
        }),
      });
      const raw = await res.text();
      let data: {
        error?: string;
        code?: string;
        premium?: boolean;
        limit?: number;
        used?: number;
        remainingSessions?: number;
        session?: SessionView | null;
      } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        setError("เชื่อมต่อไม่ได้ ลองอีกครั้ง");
        return;
      }
      if (res.status === 401 || data.code === "UNAUTHENTICATED") {
        window.location.href = "/login?callbackUrl=/special/consult";
        return;
      }
      if (!res.ok || !data.session) {
        setError(data.error || "เปิดห้องคุยไม่สำเร็จ");
        if (data.limit != null) {
          setLoaded((prev) =>
            prev
              ? {
                  ...prev,
                  premium: Boolean(data.premium),
                  limit: data.limit ?? prev.limit,
                  used: data.used ?? prev.used,
                  remainingSessions: data.remainingSessions ?? 0,
                }
              : prev,
          );
        }
        return;
      }
      setLoaded({
        signedIn: true,
        premium: Boolean(data.premium),
        limit: data.limit ?? CONSULT_DAILY_SESSIONS,
        used: data.used ?? 0,
        remainingSessions: data.remainingSessions ?? 0,
        session: data.session,
      });
    } catch {
      setError("เชื่อมต่อไม่ได้ ลองอีกครั้ง");
    } finally {
      setStarting(false);
    }
  }

  async function sendMessage() {
    if (!session || session.closed) return;
    const text = draft.trim();
    if (text.length < 2) {
      setError("พิมพ์อีกนิด ให้แม่จับเรื่องได้");
      return;
    }
    if (text.length > CONSULT_MAX_INPUT) {
      setError("สั้นลงนิด เล่าใจความสำคัญพอ");
      return;
    }
    setError("");
    setBusy(true);
    setDraft("");
    try {
      const res = await fetch("/api/fortune/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "message",
          sessionId: session.id,
          text,
          profile: readFortuneProfile(),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        code?: string;
        premium?: boolean;
        limit?: number;
        used?: number;
        remainingSessions?: number;
        session?: SessionView | null;
      };
      if (res.status === 401 || data.code === "UNAUTHENTICATED") {
        window.location.href = "/login?callbackUrl=/special/consult";
        return;
      }
      if (!res.ok || !data.session) {
        setDraft(text);
        setError(data.error || "แม่ตอบไม่ทัน ลองอีกครั้ง");
        if (data.session) {
          setLoaded((prev) =>
            prev
              ? {
                  ...prev,
                  session: data.session ?? prev.session,
                  remainingSessions:
                    data.remainingSessions ?? prev.remainingSessions,
                }
              : prev,
          );
        }
        return;
      }
      setLoaded({
        signedIn: true,
        premium: Boolean(data.premium),
        limit: data.limit ?? CONSULT_DAILY_SESSIONS,
        used: data.used ?? 0,
        remainingSessions: data.remainingSessions ?? 0,
        session: data.session,
      });
    } catch {
      setDraft(text);
      setError("เชื่อมต่อไม่ได้ ลองอีกครั้ง");
    } finally {
      setBusy(false);
    }
  }

  if (loaded === null || starting) {
    return (
      <MaePageLoading
        label={starting ? "แม่กำลังเปิดห้อง…" : "กำลังเปิดปรึกษาแม่…"}
        hint={
          starting
            ? "รอสักครู่ แม่จัดที่นั่งให้"
            : "รอสักครู่ แม่กำลังจัดหน้าให้"
        }
      />
    );
  }

  const canType =
    Boolean(session) && !session?.closed && !busy && !outOfSessions;
  const remainingTurns = session?.remainingTurns ?? 0;

  return (
    <div className="relative mx-auto flex min-h-full w-full max-w-[480px] flex-col text-white">
      <MaePageBackground blur={18} scrollBlur={false} />

      {/* Hero art plane */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[16.5rem] overflow-hidden"
      >
        <Image
          src={CONSULT_ART}
          alt=""
          fill
          priority
          unoptimized
          className="object-cover opacity-[0.55]"
          style={{ objectPosition: "68% 32%" }}
          sizes="480px"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 70% 55% at 50% 20%, rgba(232,209,154,0.16) 0%, transparent 55%),
              linear-gradient(180deg, rgba(6,20,42,0.25) 0%, rgba(6,20,42,0.72) 58%, #06142a 100%)
            `,
          }}
        />
      </div>

      <AnimatedPage className="relative z-[2] flex min-h-full flex-1 flex-col px-4 pb-6 pt-4 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <PageBackButton href="/special" />
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold"
            style={{
              color: GOLD,
              background: "rgba(8,16,32,0.62)",
              boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.4)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={2.3} />
            {loaded.limit} คำถาม/วัน
          </span>
        </div>

        <header className="mt-5 text-center">
          <p
            className="text-[13px] font-semibold tracking-[0.2em]"
            style={{ color: "rgba(232,209,154,0.88)" }}
          >
            ตำราแม่มั่งมี
          </p>
          <h1
            className="mae-gold-text mx-auto mt-1.5 max-w-[16rem] text-[2.2rem] font-bold tracking-tight"
            style={{
              lineHeight: 1.3,
              paddingTop: "0.12em",
              paddingBottom: "0.06em",
              filter:
                "drop-shadow(0 2px 6px rgba(6,22,48,0.85)) drop-shadow(0 0 18px rgba(20,60,120,0.35))",
            }}
          >
            ปรึกษาแม่
          </h1>
          <p
            className="mx-auto mt-2 max-w-[18rem] text-[15px] font-medium leading-[1.5]"
            style={{
              color: "rgba(245,247,255,0.88)",
              textShadow: "0 1px 10px rgba(6,16,28,0.55)",
            }}
          >
            เล่าเรื่องในใจ แม่อยู่ตรงนี้ฟังและแนะทางให้
          </p>
        </header>

        {!loaded.signedIn ? (
          <div
            className="mt-8 rounded-[26px] px-5 py-8 text-center"
            style={{
              background: GLASS.bg,
              border: GLASS.border,
              boxShadow: `${GLASS.shadow}, inset 0 1px 0 rgba(255,255,255,0.12)`,
              backdropFilter: GLASS.blur,
              WebkitBackdropFilter: GLASS.blur,
            }}
          >
            <span
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                background: "rgba(232,209,154,0.12)",
                boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.4)",
              }}
            >
              <MessageCircle className="h-7 w-7" style={{ color: GOLD }} strokeWidth={1.8} />
            </span>
            <p className="mt-5 text-[16.5px] font-medium leading-[1.55]" style={{ color: TEXT }}>
              เข้าสู่ระบบก่อนเริ่มคุย
              <br />
              <span style={{ color: MUTED }}>แม่จะจำจำนวนคำถามของวันนี้ไว้ให้</span>
            </p>
            <Link
              href="/login?callbackUrl=/special/consult"
              className="mae-gold-cta mt-6 inline-flex h-12 items-center justify-center rounded-full px-8 text-[15px] font-bold"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex min-h-0 flex-1 flex-col gap-3.5">
            {/* Quota meter */}
            <Reveal visible={reveal}>
              <div
                className="rounded-[20px] px-4 py-3.5"
                style={{
                  background: GLASS.bg,
                  border: GLASS.border,
                  boxShadow: `${GLASS.shadow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
                  backdropFilter: GLASS.blur,
                  WebkitBackdropFilter: GLASS.blur,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-semibold" style={{ color: TEXT }}>
                    วันนี้ใช้แล้ว {loaded.used}/{loaded.limit} คำถาม
                  </p>
                  <p className="text-[13px] font-medium tabular-nums" style={{ color: GOLD_SOFT }}>
                    เหลือ {Math.max(0, loaded.limit - loaded.used)}
                  </p>
                </div>
                <div
                  className="mt-2.5 flex gap-1.5"
                  role="progressbar"
                  aria-valuenow={loaded.used}
                  aria-valuemin={0}
                  aria-valuemax={loaded.limit}
                >
                  {Array.from({ length: loaded.limit }).map((_, i) => (
                    <span
                      key={i}
                      className="h-1.5 flex-1 rounded-full transition-colors"
                      style={{
                        background:
                          i < loaded.used
                            ? "linear-gradient(90deg, #d5b16f, #e8d19a)"
                            : "rgba(255,255,255,0.12)",
                        boxShadow:
                          i < loaded.used
                            ? "0 0 10px rgba(232,209,154,0.35)"
                            : undefined,
                      }}
                    />
                  ))}
                </div>
                {session && !session.closed ? (
                  <p className="mt-2 text-[12.5px] font-medium" style={{ color: MUTED }}>
                    ถามต่อในแชทนี้ได้เลย · เหลือ {remainingTurns} คำถามวันนี้
                  </p>
                ) : null}
              </div>
            </Reveal>

            {!session && !outOfSessions ? (
              <Reveal visible={reveal}>
                <div
                  className="relative overflow-hidden rounded-[26px] px-5 py-8 text-center"
                  style={{
                    background: GLASS.bg,
                    border: GLASS.border,
                    boxShadow: `${GLASS.shadow}, inset 0 1px 0 rgba(255,255,255,0.12)`,
                    backdropFilter: GLASS.blur,
                    WebkitBackdropFilter: GLASS.blur,
                  }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(232,209,154,0.2) 0%, transparent 68%)",
                    }}
                  />
                  <span
                    className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                    style={{
                      background:
                        "linear-gradient(160deg, rgba(255,248,228,0.2) 0%, rgba(232,209,154,0.08) 100%)",
                      boxShadow: "inset 0 0 0 1.5px rgba(232,209,154,0.5)",
                    }}
                  >
                    <Sparkles className="h-7 w-7" style={{ color: GOLD }} strokeWidth={1.9} />
                  </span>
                  <p className="relative mt-5 text-[17px] font-semibold leading-[1.5]" style={{ color: TEXT }}>
                    พร้อมฟังเรื่องในใจคุณแล้ว
                  </p>
                  <p className="relative mx-auto mt-2 max-w-[17rem] text-[14.5px] font-medium leading-[1.55]" style={{ color: MUTED }}>
                    รัก งาน เงิน ความกังวล — เล่ามาได้แม่จะแนะอย่างอบอุ่น
                  </p>
                  <button
                    type="button"
                    onClick={() => void startSession()}
                    className="mae-gold-cta relative mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full px-8 text-[15px] font-bold"
                  >
                    <MessageCircle className="h-4 w-4" strokeWidth={2.3} />
                    เริ่มคุยกับแม่
                  </button>
                </div>
              </Reveal>
            ) : null}

            {outOfSessions ? (
              <Reveal visible={reveal}>
                <div
                  className="rounded-[26px] px-5 py-8 text-center"
                  style={{
                    background: GLASS.bg,
                    border: GLASS.border,
                    boxShadow: GLASS.shadow,
                    backdropFilter: GLASS.blur,
                    WebkitBackdropFilter: GLASS.blur,
                  }}
                >
                  <p className="text-[17px] font-semibold" style={{ color: TEXT }}>
                    วันนี้ถามครบแล้ว
                  </p>
                  <p
                    className="mt-3 font-mono text-[2rem] font-bold tabular-nums tracking-wide"
                    style={{
                      background:
                        "linear-gradient(180deg, #fffef8 0%, #e8d19a 55%, #b8924f 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {formatCountdown(leftMs)}
                  </p>
                  <p className="mt-2 text-[14.5px] font-medium" style={{ color: MUTED }}>
                    นับถอยหลังถึงรีเซ็ต 00:00 น.
                  </p>
                </div>
              </Reveal>
            ) : null}

            {session ? (
              <Reveal visible={reveal} className="flex min-h-0 flex-1 flex-col">
                <div
                  className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[26px]"
                  style={{
                    background:
                      "linear-gradient(165deg, rgba(14,30,56,0.88) 0%, rgba(6,16,34,0.9) 100%)",
                    boxShadow:
                      "inset 0 0 0 1px rgba(232,209,154,0.22), 0 18px 40px rgba(0,0,0,0.32)",
                    backdropFilter: "blur(20px) saturate(1.15)",
                    WebkitBackdropFilter: "blur(20px) saturate(1.15)",
                  }}
                >
                  {/* Room header */}
                  <div
                    className="flex items-center gap-3 border-b px-4 py-3"
                    style={{ borderColor: "rgba(232,209,154,0.14)" }}
                  >
                    <span
                      className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full"
                      style={{
                        boxShadow:
                          "0 0 0 2px rgba(232,209,154,0.45), 0 0 16px rgba(232,209,154,0.2)",
                      }}
                    >
                      <Image
                        src={CONSULT_ART}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                        style={{ objectPosition: "65% 20%" }}
                        sizes="44px"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold text-[#f7f4ec]">แม่มั่งมี</p>
                      <p className="text-[12.5px] font-medium" style={{ color: MUTED }}>
                        {busy
                          ? "กำลังคิดคำตอบ…"
                          : session.closed
                            ? "วันนี้คุยครบแล้ว"
                            : "ถามต่อได้เลย"}
                      </p>
                    </div>
                    {!session.closed ? (
                      <span
                        className="shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold tabular-nums"
                        style={{
                          color: GOLD,
                          background: "rgba(232,209,154,0.12)",
                          boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.35)",
                        }}
                      >
                        เหลือ {remainingTurns}
                      </span>
                    ) : null}
                  </div>

                  <div
                    ref={listRef}
                    className="min-h-[14rem] flex-1 space-y-3.5 overflow-y-auto overscroll-contain px-3.5 py-4"
                    style={{ maxHeight: "min(48vh, 26rem)" }}
                  >
                    {session.messages.map((msg, i) => {
                      const mine = msg.role === "user";
                      return (
                        <div
                          key={`${session.id}-${i}`}
                          className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
                        >
                          {!mine ? (
                            <span
                              className="relative mb-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-full"
                              style={{
                                boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.4)",
                              }}
                            >
                              <Image
                                src={CONSULT_ART}
                                alt=""
                                fill
                                unoptimized
                                className="object-cover"
                                style={{ objectPosition: "65% 18%" }}
                                sizes="32px"
                              />
                            </span>
                          ) : null}
                          <div
                            className={`max-w-[82%] px-3.5 py-2.5 text-[15px] font-medium leading-[1.55] ${
                              mine
                                ? "rounded-[20px] rounded-br-md"
                                : "rounded-[20px] rounded-bl-md"
                            }`}
                            style={
                              mine
                                ? {
                                    color: "#1a1408",
                                    background:
                                      "linear-gradient(165deg, #fff8e4 0%, #e8d19a 48%, #d5b16f 100%)",
                                    boxShadow:
                                      "0 6px 16px rgba(143,110,56,0.28), inset 0 1px 0 rgba(255,255,255,0.45)",
                                  }
                                : {
                                    color: TEXT,
                                    background: "rgba(12,24,46,0.92)",
                                    boxShadow:
                                      "inset 0 0 0 1px rgba(255,255,255,0.12), 0 6px 16px rgba(0,0,0,0.18)",
                                  }
                            }
                          >
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}
                    {busy ? (
                      <div className="flex items-end gap-2 justify-start">
                        <span
                          className="relative mb-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-full"
                          style={{
                            boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.4)",
                          }}
                        >
                          <Image
                            src={CONSULT_ART}
                            alt=""
                            fill
                            unoptimized
                            className="object-cover"
                            style={{ objectPosition: "65% 18%" }}
                            sizes="32px"
                          />
                        </span>
                        <div
                          className="rounded-[20px] rounded-bl-md px-4 py-3"
                          style={{
                            background: "rgba(12,24,46,0.92)",
                            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
                          }}
                        >
                          <span className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <span
                                key={i}
                                className="mae-load-beam h-1.5 w-1.5 rounded-full"
                                style={{
                                  width: 6,
                                  height: 6,
                                  animationDelay: `${i * 0.18}s`,
                                  background: GOLD,
                                }}
                              />
                            ))}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {session.closed ? (
                    <div
                      className="border-t px-4 py-4 text-center"
                      style={{ borderColor: "rgba(232,209,154,0.14)" }}
                    >
                      <p className="text-[15px] font-semibold" style={{ color: TEXT }}>
                        วันนี้ถามครบ 3 คำถามแล้ว
                      </p>
                      <p className="mt-1.5 text-[14px] font-medium" style={{ color: MUTED }}>
                        กลับมาคุยต่อได้หลัง 00:00 น.
                      </p>
                    </div>
                  ) : (
                    <div
                      className="border-t px-3 pb-3 pt-2.5"
                      style={{
                        borderColor: "rgba(232,209,154,0.14)",
                        background: "rgba(4,12,26,0.45)",
                      }}
                    >
                      <div
                        className="flex items-end gap-2 rounded-[22px] px-2.5 py-2"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.28)",
                        }}
                      >
                        <textarea
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              if (canType && draft.trim().length >= 2) {
                                void sendMessage();
                              }
                            }
                          }}
                          maxLength={CONSULT_MAX_INPUT}
                          rows={2}
                          disabled={!canType}
                          placeholder="เล่าให้น้องฟังได้เลย…"
                          className="min-h-[2.75rem] flex-1 resize-none bg-transparent px-2 py-2 text-[16px] font-medium leading-[1.5] text-white outline-none placeholder:text-white/40 disabled:opacity-50"
                        />
                        <button
                          type="button"
                          disabled={!canType || draft.trim().length < 2}
                          onClick={() => void sendMessage()}
                          className="mae-gold-cta mb-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full outline-none transition active:scale-[0.96] disabled:opacity-40"
                          aria-label="ส่งข้อความ"
                        >
                          <Send className="h-4 w-4" strokeWidth={2.4} />
                        </button>
                      </div>
                      <p
                        className="mt-1.5 px-1 text-right text-[12px] font-medium tabular-nums"
                        style={{ color: MUTED }}
                      >
                        {draft.trim().length}/{CONSULT_MAX_INPUT}
                      </p>
                    </div>
                  )}
                </div>
              </Reveal>
            ) : null}

            {error ? (
              <p
                className="text-center text-[15px] font-medium leading-snug"
                style={{ color: CAUTION }}
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </div>
        )}
      </AnimatedPage>
    </div>
  );
}
