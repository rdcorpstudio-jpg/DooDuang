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

  return (
    <div className="relative mx-auto min-h-full w-full max-w-[480px] text-white">
      <MaePageBackground blur={16} scrollBlur={false} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[20rem] overflow-hidden"
      >
        <Image
          src={CONSULT_ART}
          alt=""
          fill
          unoptimized
          className="object-cover opacity-[0.42]"
          style={{ objectPosition: "72% 40%" }}
          sizes="480px"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(6,20,42,0.4) 0%, rgba(6,20,42,0.78) 55%, #06142a 100%)",
          }}
        />
      </div>

      <AnimatedPage className="relative z-[2] px-4 pb-8 pt-5 sm:px-5">
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
            ปรึกษาแม่
          </h1>
          <span
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-[0.45em] text-[15px] font-semibold leading-none"
            style={{
              color: GOLD_SOFT,
              background: "rgba(8,16,32,0.55)",
              boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.32)",
            }}
          >
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={2.2} />
            3 คำถามต่อวัน · 00:00 น.
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
            <MessageCircle
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
              แม่จะจำจำนวนคำถามของวันนี้
            </p>
            <Link
              href="/login?callbackUrl=/special/consult"
              className="wallpaper-dl-btn mt-6 inline-flex h-12 items-center justify-center rounded-full px-8 text-[15px] font-bold"
            >
              <span className="dd-btn-label">เข้าสู่ระบบ</span>
            </Link>
          </div>
        ) : (
          <>
            <Reveal visible={reveal} className="mt-8">
              <div
                className="rounded-[24px] px-4 py-3"
                style={{
                  background: GLASS.bg,
                  border: GLASS.border,
                  boxShadow: GLASS.shadow,
                  backdropFilter: GLASS.blur,
                  WebkitBackdropFilter: GLASS.blur,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p
                    className="text-[15px] font-medium"
                    style={{ color: MUTED }}
                  >
                    วันนี้ใช้แล้ว {loaded.used}/{loaded.limit} คำถาม
                  </p>
                </div>
              </div>
            </Reveal>

            {!session && !outOfSessions ? (
              <Reveal visible={reveal} className="mt-5">
                <div
                  className="rounded-[24px] px-5 py-7 text-center"
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
                    เล่าเรื่องที่อยู่ในใจได้
                    <br />
                    รัก งาน เงิน หรืออะไรก็ได้
                  </p>
                  <p
                    className="mt-2 text-[15px] font-medium leading-snug"
                    style={{ color: MUTED }}
                  >
                    วันละ {CONSULT_DAILY_SESSIONS} คำถาม · รีเซ็ต 00:00 น.
                  </p>
                  <button
                    type="button"
                    onClick={() => void startSession()}
                    className="wallpaper-dl-btn mt-6 inline-flex h-12 items-center justify-center rounded-full px-8 text-[15px] font-bold"
                  >
                    <span className="dd-btn-label">เริ่มคุยกับแม่</span>
                  </button>
                </div>
              </Reveal>
            ) : null}

            {outOfSessions ? (
              <Reveal visible={reveal} className="mt-5">
                <div
                  className="rounded-[24px] px-5 py-7 text-center"
                  style={{
                    background: GLASS.bg,
                    border: GLASS.border,
                    boxShadow: GLASS.shadow,
                    backdropFilter: GLASS.blur,
                    WebkitBackdropFilter: GLASS.blur,
                  }}
                >
                  <p
                    className="text-[16px] font-medium leading-[1.55]"
                    style={{ color: TEXT }}
                  >
                    วันนี้ถามครบแล้ว
                  </p>
                  <p
                    className="mt-3 font-mono text-[1.65rem] font-bold tabular-nums tracking-wide"
                    style={{ color: GOLD }}
                  >
                    {formatCountdown(leftMs)}
                  </p>
                  <p
                    className="mt-2 text-[15px] font-medium"
                    style={{ color: MUTED }}
                  >
                    รีเซ็ต 00:00 น.
                  </p>
                </div>
              </Reveal>
            ) : null}

            {session ? (
              <Reveal visible={reveal} className="mt-5">
                <div
                  className="overflow-hidden rounded-[24px]"
                  style={{
                    background: GLASS.bg,
                    border: GLASS.border,
                    boxShadow: GLASS.shadow,
                    backdropFilter: GLASS.blur,
                    WebkitBackdropFilter: GLASS.blur,
                  }}
                >
                  <div
                    ref={listRef}
                    className="max-h-[min(52vh,28rem)] space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
                  >
                    {session.messages.map((msg, i) => {
                      const mine = msg.role === "user";
                      return (
                        <div
                          key={`${session.id}-${i}`}
                          className={`flex ${mine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[88%] rounded-[18px] px-3.5 py-2.5 text-[15px] font-medium leading-[1.55] ${
                              mine ? "rounded-br-md" : "rounded-bl-md"
                            }`}
                            style={
                              mine
                                ? {
                                    color: "#1a1408",
                                    background:
                                      "linear-gradient(180deg, #ffe9b0 0%, #e8d19a 55%, #d5b16f 100%)",
                                  }
                                : {
                                    color: TEXT,
                                    background: "rgba(8,14,28,0.72)",
                                    boxShadow:
                                      "inset 0 0 0 1px rgba(255,255,255,0.1)",
                                  }
                            }
                          >
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}
                    {busy ? (
                      <div className="flex justify-start">
                        <div
                          className="rounded-[18px] rounded-bl-md px-3.5 py-2.5 text-[15px] font-medium"
                          style={{
                            color: MUTED,
                            background: "rgba(8,14,28,0.72)",
                            boxShadow:
                              "inset 0 0 0 1px rgba(255,255,255,0.1)",
                          }}
                        >
                          แม่กำลังคิด…
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {session.closed ? (
                    <div
                      className="border-t px-4 py-4 text-center"
                      style={{ borderColor: "rgba(255,255,255,0.08)" }}
                    >
                      <p
                        className="text-[15px] font-medium"
                        style={{ color: MUTED }}
                      >
                        รอบนี้ถามครบแล้ว
                      </p>
                      {loaded.remainingSessions > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setLoaded((prev) =>
                              prev ? { ...prev, session: null } : prev,
                            );
                            void startSession();
                          }}
                          className="wallpaper-dl-btn mt-3 inline-flex h-11 items-center justify-center rounded-full px-6 text-[15px] font-bold"
                        >
                          <span className="dd-btn-label">ถามต่อ</span>
                        </button>
                      ) : (
                        <p
                          className="mt-2 text-[15px] font-medium"
                          style={{ color: MUTED }}
                        >
                          วันนี้ถามครบแล้ว · กลับมาหลัง 00:00 น.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div
                      className="border-t px-3 py-3"
                      style={{ borderColor: "rgba(255,255,255,0.08)" }}
                    >
                      <div className="flex items-end gap-2">
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
                          className="min-h-[2.75rem] flex-1 resize-none bg-transparent px-2 py-2 text-[16px] font-medium leading-[1.5] text-white outline-none placeholder:text-white/35 disabled:opacity-50"
                        />
                        <button
                          type="button"
                          disabled={!canType || draft.trim().length < 2}
                          onClick={() => void sendMessage()}
                          className="mb-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full outline-none transition active:scale-[0.96] disabled:opacity-40"
                          style={{
                            color: "#1a1408",
                            background:
                              "linear-gradient(180deg, #ffe9b0 0%, #e8d19a 55%, #d5b16f 100%)",
                          }}
                          aria-label="ส่งข้อความ"
                        >
                          <Send className="h-4 w-4" strokeWidth={2.3} />
                        </button>
                      </div>
                      <p
                        className="mt-1 px-2 text-right text-[15px] font-medium tabular-nums"
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
                className="mt-4 text-center text-[15px] font-medium leading-snug"
                style={{ color: CAUTION }}
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </>
        )}
      </AnimatedPage>
    </div>
  );
}
