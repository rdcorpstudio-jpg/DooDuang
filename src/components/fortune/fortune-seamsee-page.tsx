"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Briefcase,
  Clover,
  Heart,
  HeartPulse,
  Share2,
  Star,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { FixedAppBottomNav } from "@/components/layout/bottom-nav";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { PageBackButton } from "@/components/ui/page-back-button";
import { MAE_GLASS } from "@/lib/mae-glass";
import { cn } from "@/lib/utils";
import {
  drawSeamseeStick,
  readTodaySeamsee,
  saveTodaySeamsee,
  SEAMSEE_ART,
  SEAMSEE_SHAKE_STEPS,
  SEAMSEE_TOPICS,
  seamseeReading,
  seamseeStick,
  todaySeamseeKey,
  type SeamseeTopicId,
} from "@/lib/fortune/seamsee";

const GOLD = "#e8d19a";
const GOLD_SOFT = "#efc36c";
const TEXT = "rgba(240,244,250,0.94)";
const MUTED = "rgba(186,204,230,0.82)";

const TITLE_GOLD = {
  background:
    "linear-gradient(180deg, #fffef8 0%, #ffe9b0 24%, #f0d078 48%, #d5b16f 72%, #b8924f 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
} as const;

const GOLD_RING =
  "linear-gradient(155deg, rgba(255,248,228,0.78) 0%, rgba(213,177,111,0.55) 28%, rgba(184,146,79,0.32) 55%, rgba(213,177,111,0.5) 78%, rgba(255,248,228,0.62) 100%)";

const GLASS = {
  background: MAE_GLASS.bg,
  border: MAE_GLASS.border,
  boxShadow: `${MAE_GLASS.highlight}, 0 16px 36px rgba(0,0,0,0.22)`,
  backdropFilter: MAE_GLASS.blur,
  WebkitBackdropFilter: MAE_GLASS.blur,
} as const;

const TOPIC_ICON: Record<SeamseeTopicId, LucideIcon> = {
  life: Star,
  work: Briefcase,
  money: Wallet,
  love: Heart,
  luck: Clover,
  health: HeartPulse,
};

type Phase = "intro" | "topic" | "shake" | "result";

export function FortuneSeamseePage() {
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [topic, setTopic] = useState<SeamseeTopicId>("life");
  const [stickNo, setStickNo] = useState<number | null>(null);
  const [shakes, setShakes] = useState(0);
  const [rattling, setRattling] = useState(false);
  const [veil, setVeil] = useState<"off" | "in" | "out">("off");
  const [stepDir, setStepDir] = useState<"forward" | "back">("forward");
  const shakesRef = useRef(0);
  const lockRef = useRef(false);
  const lastBump = useRef(0);
  const phaseRef = useRef<Phase>("intro");
  const topicRef = useRef<SeamseeTopicId>("life");
  phaseRef.current = phase;
  topicRef.current = topic;

  function movePhase(next: Phase) {
    const order = { intro: 0, topic: 1, shake: 2, result: 3 } as const;
    setStepDir(order[next] < order[phaseRef.current] ? "back" : "forward");
    setPhase(next);
  }

  const bump = useRef(() => {});
  bump.current = () => {
    if (lockRef.current) return;
    if (phaseRef.current !== "shake") return;
    const now = Date.now();
    if (now - lastBump.current < 380) return;
    lastBump.current = now;
    const next = Math.min(SEAMSEE_SHAKE_STEPS, shakesRef.current + 1);
    shakesRef.current = next;
    setShakes(next);
    setRattling(true);
    window.setTimeout(() => setRattling(false), 460);
    try {
      navigator.vibrate?.([28, 36, 28]);
    } catch {
      /* ignore */
    }
    if (next >= SEAMSEE_SHAKE_STEPS) {
      lockRef.current = true;
      setVeil("in");
      window.setTimeout(() => {
        reveal();
        setVeil("out");
      }, 980);
      window.setTimeout(() => setVeil("off"), 1460);
    }
  };

  function reveal() {
    const chosen = topicRef.current;
    const nonce = Math.random().toString(36).slice(2, 10);
    const stick = drawSeamseeStick(`${todaySeamseeKey()}|${chosen}|${nonce}`);
    saveTodaySeamsee({
      dayKey: todaySeamseeKey(),
      topic: chosen,
      stickNo: stick.no,
    });
    setStickNo(stick.no);
    setPhase("result");
  }

  useEffect(() => {
    const saved = readTodaySeamsee();
    if (saved) {
      setTopic(saved.topic);
      setStickNo(saved.stickNo);
      setPhase("result");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (phase !== "shake") return;
    let last = 0;
    const onMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const mag = Math.hypot(acc.x ?? 0, acc.y ?? 0, acc.z ?? 0);
      const delta = Math.abs(mag - last);
      const primed = last !== 0;
      last = mag;
      if (primed && delta > 8) bump.current();
    };
    window.addEventListener("devicemotion", onMotion, { passive: true });
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [phase]);

  async function goShake() {
    shakesRef.current = 0;
    lockRef.current = false;
    lastBump.current = 0;
    setShakes(0);
    setVeil("off");
    movePhase("shake");
    const motion = DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (typeof motion.requestPermission === "function") {
      try {
        await motion.requestPermission();
      } catch {
        /* tap still works */
      }
    }
  }

  async function share() {
    const stick = stickNo != null ? seamseeStick(stickNo) : null;
    if (!stick) return;
    const reading = seamseeReading(stick, topic);
    const text = [
      `เซียมซีใบที่ ${stick.no} · ${reading.title}`,
      stick.poem.join("\n"),
      "",
      reading.paragraphs.join("\n\n"),
      "",
      "— แม่มั่งมี",
    ].join("\n");
    try {
      if (navigator.share) {
        await navigator.share({ title: "เซียมซี", text });
        return;
      }
    } catch {
      /* cancelled */
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }

  const stick = stickNo != null ? seamseeStick(stickNo) : null;
  const reading = stick ? seamseeReading(stick, topic) : null;

  return (
    <div className="relative h-full overflow-x-hidden overflow-y-auto overscroll-contain text-white">
      {phase === "shake" ? (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <Image
            src="/images/bg/seamsee-night.webp"
            alt=""
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(3,8,20,0.38) 0%, rgba(3,8,20,0.08) 24%, rgba(3,8,20,0.04) 52%, rgba(3,8,20,0.22) 78%, rgba(3,8,20,0.5) 100%)",
            }}
          />
        </div>
      ) : (
        <MaePageBackground blur={8} scrollBlur={false} />
      )}
      <style>{`
        @keyframes seamsee-rattle {
          0%, 100% { transform: translate3d(0,0,0) rotate(0deg); }
          18% { transform: translate3d(-8px, 1px, 0) rotate(-5deg); }
          36% { transform: translate3d(9px, -1px, 0) rotate(5deg); }
          54% { transform: translate3d(-6px, 0, 0) rotate(-3deg); }
          72% { transform: translate3d(5px, 1px, 0) rotate(3deg); }
        }
        @keyframes seamsee-idle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .seamsee-rattle { animation: seamsee-rattle 0.46s ease-in-out; }
        .seamsee-idle { animation: seamsee-idle 3.4s ease-in-out infinite; }
        @keyframes seamsee-glow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .seamsee-glow {
          animation: seamsee-glow 3.2s ease-in-out infinite;
        }
        @keyframes seamsee-burst {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.72); }
          40% { opacity: 1; transform: translate(-50%, -50%) scale(0.96); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.16); }
        }
        .seamsee-burst { animation: seamsee-burst 0.9s cubic-bezier(0.22, 0.61, 0.18, 1) forwards; }
        @keyframes seamsee-rays {
          0% { opacity: 0; transform: translate(-50%, -50%) rotate(-20deg) scale(0.84); }
          32% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -50%) rotate(64deg) scale(1.08); }
        }
        .seamsee-rays { animation: seamsee-rays 0.95s cubic-bezier(0.16, 0.8, 0.18, 1) forwards; }
        @keyframes seamsee-rays-outer {
          0% { opacity: 0; transform: translate(-50%, -50%) rotate(16deg) scale(0.9); }
          40% { opacity: 0.7; }
          100% { opacity: 0; transform: translate(-50%, -50%) rotate(-48deg) scale(1.12); }
        }
        .seamsee-rays-outer { animation: seamsee-rays-outer 1.05s cubic-bezier(0.16, 0.8, 0.18, 1) forwards; }
        @keyframes seamsee-open {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .seamsee-open { animation: seamsee-open 0.95s cubic-bezier(0.22, 0.61, 0.18, 1) forwards; }
        @keyframes seamsee-open-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .seamsee-open-out { animation: seamsee-open-out 0.4s ease-out forwards; }
        @keyframes seamsee-reveal {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: none; }
        }
        .seamsee-reveal { animation: seamsee-reveal 0.45s ease-out both; }
      `}</style>

      <div
        className={cn(
          "relative z-[2] mx-auto flex min-h-full w-full max-w-[480px] flex-col px-4 pt-4 sm:px-5 pb-28",
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <PageBackButton
            href={phase === "intro" || phase === "result" ? "/predict" : undefined}
            onClick={
              phase === "topic"
                ? () => movePhase("intro")
                : phase === "shake"
                  ? () => movePhase("topic")
                  : undefined
            }
          />
          {phase === "result" ? (
            <button
              type="button"
              onClick={() => void share()}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full outline-none transition active:scale-95"
              style={{
                color: GOLD,
                background: "rgba(16,24,39,0.92)",
                boxShadow: "inset 0 0 0 1.5px rgba(232,209,154,0.7)",
              }}
              aria-label="แชร์เซียมซี"
            >
              <Share2 className="h-4 w-4" strokeWidth={2.2} />
            </button>
          ) : (
            <span className="w-11" />
          )}
        </div>

        {!ready ? (
          <p className="mt-16 text-center text-[15px]" style={{ color: MUTED }}>
            กำลังเปิดตำรา…
          </p>
        ) : (
          <div
            key={phase}
            className={cn(
              "flex min-h-0 flex-1 flex-col",
              stepDir === "back" ? "wizard-step-back" : "wizard-step-forward",
              "wizard-step-panel",
            )}
          >
            {phase === "intro" ? (
              <Intro onStart={() => movePhase("topic")} />
            ) : phase === "topic" ? (
              <TopicStep
                topic={topic}
                onPick={setTopic}
                onNext={goShake}
              />
            ) : phase === "shake" ? (
              <ShakeStep
                shakes={shakes}
                rattling={rattling}
                onTap={() => bump.current()}
              />
            ) : stick && reading ? (
              <Result
                stickNo={stick.no}
                poem={stick.poem}
                title={reading.title}
                paragraphs={reading.paragraphs}
                onShare={() => void share()}
              />
            ) : null}
          </div>
        )}
      </div>
      {veil !== "off" ? (
        <div
          className={cn(
            "pointer-events-auto absolute inset-0 z-30",
            veil === "in" ? "seamsee-open" : "seamsee-open-out",
          )}
          style={{
            background:
              "radial-gradient(circle at 50% 46%, rgba(255,236,196,0.55) 0%, rgba(214,176,98,0.28) 32%, rgba(70,48,18,0.16) 58%, transparent 78%)",
          }}
          aria-hidden
        />
      ) : null}
      <FixedAppBottomNav activeId="predict" />
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="pt-3 text-center">
        <GoldDiamond />
        <p
          className="mae-thai-safe mt-3 text-[12px] font-semibold tracking-[0.28em]"
          style={{ color: GOLD_SOFT }}
        >
          วันละ 1 ใบ
        </p>
        <h1
          className="mae-thai-safe mt-1 text-[2.35rem] font-bold tracking-wide"
          style={{ color: GOLD, lineHeight: 1.35 }}
        >
          เซียมซี
        </h1>
        <p
          className="mae-thai-safe mx-auto mt-2 max-w-[17rem] text-[15px] font-medium"
          style={{ color: MUTED, lineHeight: 1.55 }}
        >
          ตั้งจิตถึงเรื่องที่อยากรู้
          <br />
          แล้วเขย่ากระบอกเพื่อเปิดคำทำนาย
        </p>
      </div>

      <section
        className="mt-7 rounded-[22px] px-4 pb-2 pt-4"
        style={{
          ...GLASS,
          boxShadow:
            "inset 0 0 0 1px rgba(232,209,154,0.28), 0 16px 36px rgba(0,0,0,0.22)",
        }}
      >
        <p
          className="mae-thai-safe text-center text-[13px] font-semibold tracking-[0.16em]"
          style={{ color: GOLD_SOFT }}
        >
          ลำดับการเสี่ยง
        </p>
        <ol className="mt-3 list-none pl-0">
          <RitualStep
            n="01"
            title="เลือกเรื่อง"
            blurb="ภาพรวม หรือเจาะเรื่องที่สนใจ"
            last={false}
          />
          <RitualStep
            n="02"
            title="เขย่าเปิดใบ"
            blurb="แตะหรือเขย่าโทรศัพท์ 5 ครั้ง"
            last
          />
        </ol>
      </section>

      <button
        type="button"
        onClick={onStart}
        className="mae-gold-cta mt-auto flex h-[3.25rem] w-full items-center justify-center rounded-full text-[16px] font-bold"
      >
        <span className="dd-btn-label">เริ่มเสี่ยงเซียมซี</span>
      </button>
      <p
        className="mae-thai-safe mt-3 text-center text-[13px] font-medium"
        style={{ color: "rgba(186,204,230,0.62)" }}
      >
        เสี่ยงได้วันละหนึ่งใบ
      </p>
    </div>
  );
}

function GoldDiamond() {
  return (
    <svg aria-hidden viewBox="0 0 168 28" className="mx-auto h-7 w-[10.5rem]">
      <path
        d="M8 14 H74"
        stroke="rgba(232,209,154,0.45)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <path
        d="M94 14 H160"
        stroke="rgba(232,209,154,0.45)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <path d="M84 4 L92 14 L84 24 L76 14 Z" fill="#e8d19a" />
      <path d="M84 8 L88 14 L84 20 L80 14 Z" fill="#fff8e8" />
    </svg>
  );
}

function RitualStep({
  n,
  title,
  blurb,
  last,
}: {
  n: string;
  title: string;
  blurb: string;
  last?: boolean;
}) {
  return (
    <li className="flex gap-3">
      <span className="flex w-10 shrink-0 flex-col items-center">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold"
          style={{
            color: "#1a1408",
            background:
              "linear-gradient(160deg, #fff4d2 0%, #e8d19a 42%, #b8924f 100%)",
          }}
        >
          {n}
        </span>
        {last ? null : (
          <span
            aria-hidden
            className="my-1 w-px flex-1"
            style={{ background: "rgba(232,209,154,0.35)", minHeight: 18 }}
          />
        )}
      </span>
      <span className={cn("min-w-0 pt-1.5", last ? "pb-3" : "pb-1")}>
        <span className="mae-thai-safe block text-[16.5px] font-semibold text-white">
          {title}
        </span>
        <span
          className="mae-thai-safe mt-0.5 block text-[14px]"
          style={{ color: MUTED, lineHeight: 1.45 }}
        >
          {blurb}
        </span>
      </span>
    </li>
  );
}

function TopicStep({
  topic,
  onPick,
  onNext,
}: {
  topic: SeamseeTopicId;
  onPick: (id: SeamseeTopicId) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <h1
        className="mae-thai-safe text-center text-[1.35rem] font-bold"
        style={{ color: GOLD }}
      >
        เลือกเรื่องที่อยากรู้
      </h1>
      <ul className="mt-4 space-y-2.5">
        {SEAMSEE_TOPICS.map((item) => {
          const Icon = TOPIC_ICON[item.id];
          const active = topic === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onPick(item.id)}
                aria-pressed={active}
                className="flex w-full items-center gap-3 rounded-[16px] px-3.5 py-3 text-left outline-none transition active:scale-[0.99]"
                style={{
                  ...GLASS,
                  boxShadow: active
                    ? "inset 0 0 0 1.5px rgba(232,209,154,0.85), 0 10px 24px rgba(0,0,0,0.2)"
                    : GLASS.boxShadow,
                }}
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                  style={{
                    color: GOLD,
                    background: "rgba(232,209,154,0.12)",
                    boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.35)",
                  }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mae-thai-safe block text-[16px] font-semibold text-white">
                    {item.title}
                  </span>
                  <span
                    className="mae-thai-safe mt-0.5 block text-[13.5px]"
                    style={{ color: MUTED }}
                  >
                    {item.blurb}
                  </span>
                </span>
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  )}
                  style={{
                    boxShadow: active
                      ? "inset 0 0 0 6px #e8d19a"
                      : "inset 0 0 0 1.5px rgba(186,204,230,0.45)",
                  }}
                  aria-hidden
                />
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={onNext}
        className="mae-gold-cta mt-6 flex h-12 w-full items-center justify-center rounded-full text-[16px] font-bold"
      >
        <span className="dd-btn-label">ถัดไป</span>
      </button>
    </div>
  );
}

function ShakeStep({
  shakes,
  rattling,
  onTap,
}: {
  shakes: number;
  rattling: boolean;
  onTap: () => void;
}) {
  const left = Math.max(0, SEAMSEE_SHAKE_STEPS - shakes);

  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <p
        className="mae-thai-safe text-[15px] font-semibold tracking-[0.32em]"
        style={{ color: GOLD_SOFT }}
      >
        เซียมซี
      </p>
      <h1
        className="mae-thai-safe mt-1 font-sacred text-[2.45rem] font-bold leading-none"
        style={{
          ...TITLE_GOLD,
          filter: "drop-shadow(0 8px 18px rgba(184,146,79,0.28))",
        }}
      >
        เขย่ากระบอก
      </h1>
      <span
        aria-hidden
        className="mt-3 h-px w-10"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,236,190,0.9), transparent)",
        }}
      />
      <p className="mae-thai-safe mt-3 text-[15.5px] font-medium leading-[1.55] text-white/78">
        แตะกระบอก{" "}
        <span style={{ color: GOLD }}>5</span> ครั้ง
        <br />
        ใบจะเปิดให้เอง
      </p>

      <button
        type="button"
        onClick={onTap}
        className="relative mx-auto mt-1 h-[min(54vh,470px)] w-full max-w-[24rem] outline-none"
        aria-label="แตะกระบอกเพื่อเขย่า"
      >
        {rattling ? (
          <span key={shakes} aria-hidden className="pointer-events-none absolute inset-0 z-[2]">
            <span
              className="seamsee-burst absolute left-1/2 top-[40%] h-[min(78vw,320px)] w-[min(78vw,320px)] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,236,196,0.42) 0%, rgba(214,176,98,0.16) 42%, transparent 70%)",
              }}
            />
            <span
              className="seamsee-rays absolute left-1/2 top-[40%] h-[min(62vw,250px)] w-[min(62vw,250px)] rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(140,98,42,0.2) 0deg, rgba(255,248,226,0.98) 24deg, rgba(232,197,122,0.72) 78deg, rgba(120,82,36,0.28) 150deg, rgba(255,236,196,0.55) 210deg, rgba(184,140,62,0.22) 270deg, rgba(255,246,220,0.92) 328deg, rgba(140,98,42,0.2) 360deg)",
                maskImage:
                  "radial-gradient(circle, transparent 58%, #000 63%, #000 68%, transparent 73%)",
                WebkitMaskImage:
                  "radial-gradient(circle, transparent 58%, #000 63%, #000 68%, transparent 73%)",
                filter: "drop-shadow(0 0 12px rgba(232,197,122,0.55))",
              }}
            />
            <span
              className="seamsee-rays-outer absolute left-1/2 top-[40%] h-[min(82vw,330px)] w-[min(82vw,330px)] rounded-full"
              style={{
                background:
                  "conic-gradient(from 120deg, rgba(140,98,42,0.15) 0deg, rgba(255,246,220,0.85) 40deg, rgba(184,140,62,0.25) 140deg, rgba(255,236,196,0.7) 230deg, rgba(140,98,42,0.15) 360deg)",
                maskImage:
                  "radial-gradient(circle, transparent 66%, #000 69%, #000 72%, transparent 75%)",
                WebkitMaskImage:
                  "radial-gradient(circle, transparent 66%, #000 69%, #000 72%, transparent 75%)",
                filter: "drop-shadow(0 0 10px rgba(214,176,98,0.4))",
              }}
            />
          </span>
        ) : null}
        <span
          className={cn(
            "absolute inset-0",
            rattling ? "seamsee-rattle" : "seamsee-idle",
          )}
        >
          <span
            aria-hidden
            className="seamsee-glow pointer-events-none absolute left-1/2 top-[42%] h-[min(78vw,300px)] w-[min(78vw,300px)] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,214,140,0.34) 0%, rgba(232,186,96,0.14) 38%, rgba(232,186,96,0.04) 58%, transparent 72%)",
            }}
          />
          <svg
            aria-hidden
            viewBox="0 0 360 96"
            className="pointer-events-none absolute bottom-1 left-1/2 z-0 w-[min(84vw,320px)] -translate-x-1/2"
          >
            <defs>
              <linearGradient id="seamsee-ring" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8a6a32" stopOpacity="0.35" />
                <stop offset="22%" stopColor="#fff6d4" />
                <stop offset="50%" stopColor="#e8c56a" />
                <stop offset="78%" stopColor="#fff6d4" />
                <stop offset="100%" stopColor="#8a6a32" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            <ellipse cx="180" cy="58" rx="162" ry="22" fill="none" stroke="url(#seamsee-ring)" strokeWidth="2.4" />
            <ellipse cx="180" cy="50" rx="132" ry="16" fill="none" stroke="url(#seamsee-ring)" strokeWidth="1.8" opacity="0.9" />
            <ellipse cx="180" cy="43" rx="102" ry="11" fill="none" stroke="#fff6d4" strokeWidth="1.3" opacity="0.75" />
            <ellipse cx="180" cy="38" rx="74" ry="7" fill="none" stroke="url(#seamsee-ring)" strokeWidth="1.1" opacity="0.55" />
          </svg>
          <Image
            src={SEAMSEE_ART}
            alt=""
            width={575}
            height={1244}
            priority
            unoptimized
            className="absolute bottom-8 left-1/2 z-[1] h-[84%] w-auto max-w-[68%] -translate-x-1/2 object-contain object-bottom drop-shadow-[0_18px_16px_rgba(0,0,0,0.35)]"
          />
        </span>
      </button>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        {Array.from({ length: SEAMSEE_SHAKE_STEPS }, (_, i) => (
          <span
            key={i}
            className="h-2 w-8 rounded-full transition-all duration-300"
            style={{
              background:
                i < shakes
                  ? "linear-gradient(180deg, #fff6d4, #e8c56a 55%, #c4923a)"
                  : "rgba(90,110,145,0.55)",
              boxShadow: i < shakes ? "0 0 10px rgba(232,197,106,0.55)" : undefined,
            }}
          />
        ))}
      </div>
      <p className="mae-thai-safe mt-3 text-[15.5px] font-medium text-white/88">
        {shakes === 0
          ? "ยังไม่ได้เขย่า"
          : `เขย่าแล้ว ${shakes} จาก ${SEAMSEE_SHAKE_STEPS} ครั้ง`}
      </p>
      <span
        className="mae-thai-safe mt-2.5 inline-flex items-center rounded-full px-4 py-2 text-[15px] font-semibold"
        style={{
          color: GOLD_SOFT,
          boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.72)",
          background: "rgba(6,12,24,0.35)",
        }}
      >
        {shakes === 0
          ? "แตะกระบอกเพื่อเริ่ม"
          : left === 0
            ? "กำลังเปิดใบ"
            : `แตะกระบอกอีก ${left} ครั้ง`}
      </span>
    </div>
  );
}

function Result({
  stickNo,
  poem,
  title,
  paragraphs,
  onShare,
}: {
  stickNo: number;
  poem: readonly string[];
  title: string;
  paragraphs: readonly string[];
  onShare: () => void;
}) {
  const notes = [
    { label: "คำทำนาย", body: paragraphs[0] },
    { label: "คำแนะนำ", body: paragraphs[1] },
  ].filter((row) => row.body);

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative mx-auto mt-2 w-full max-w-[22rem]">
        <div
          className="rounded-[26px] p-[1.5px]"
          style={{
            background: GOLD_RING,
            boxShadow: "0 18px 40px rgba(0,0,0,0.32)",
          }}
        >
          <div
            className="rounded-[24.5px] px-3.5 py-3.5"
            style={{
              background: "linear-gradient(180deg, #1a1016 0%, #0c101c 100%)",
            }}
          >
            <div
              className="rounded-[16px] px-4 pb-5 pt-4 text-center"
              style={{
                boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.38)",
              }}
            >
              <p
                className="mae-thai-safe text-[15px] font-semibold tracking-[0.28em]"
                style={{ color: GOLD_SOFT }}
              >
                เซียมซี
              </p>
              <p
                className="mae-thai-safe mt-1.5 text-[1.85rem] font-bold leading-none"
                style={{
                  ...TITLE_GOLD,
                  paddingTop: "0.1em",
                  paddingBottom: "0.08em",
                }}
              >
                ใบที่ {stickNo}
              </p>
              <span
                aria-hidden
                className="mx-auto mt-3 block h-1.5 w-1.5 rotate-45"
                style={{ background: GOLD_SOFT }}
              />
              <div className="mx-auto mt-3.5 max-w-[16.5rem] space-y-3">
                {poem.map((line) => (
                  <p
                    key={line}
                    className="mae-thai-safe text-[16.5px] font-medium leading-[1.6]"
                    style={{ color: "rgba(255,248,236,0.96)" }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 px-0.5">
        <p
          className="mae-thai-safe text-[15px] font-semibold tracking-[0.14em]"
          style={{ color: GOLD }}
        >
          ผลการทำนาย
        </p>
        <h2
          className="mae-thai-safe mt-1.5 text-[1.65rem] font-bold leading-[1.3]"
          style={{
            ...TITLE_GOLD,
            paddingTop: "0.08em",
            paddingBottom: "0.04em",
          }}
        >
          {title}
        </h2>
      </div>

      <div className="mt-4 space-y-3">
        {notes.map((row) => (
          <article
            key={row.label}
            className="rounded-[18px] px-4 py-3.5"
            style={{
              background: "rgba(8,16,32,0.42)",
              boxShadow: "inset 3px 0 0 #d5b16f, inset 0 0 0 1px rgba(232,209,154,0.16)",
            }}
          >
            <p
              className="mae-thai-safe text-[15px] font-semibold"
              style={{ color: GOLD_SOFT }}
            >
              {row.label}
            </p>
            <p
              className="mae-thai-safe mt-1.5 text-[15.5px] font-medium leading-[1.7]"
              style={{ color: TEXT }}
            >
              {row.body}
            </p>
          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={onShare}
        className="wallpaper-dl-btn group relative mt-6 flex h-[3.55rem] w-full items-center gap-3 overflow-hidden rounded-[18px] px-2.5 text-left outline-none transition active:scale-[0.99]"
      >
        <span className="wallpaper-dl-btn__icon relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
          <Share2 className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </span>
        <span className="relative z-[1] min-w-0 flex-1">
          <span className="dd-btn-label block text-[16px] font-bold leading-tight tracking-wide">
            แชร์เซียมซี
          </span>
          <span className="mt-0.5 block text-[15px] font-medium leading-tight opacity-70">
            ส่งใบนี้ให้คนที่อยากให้ดู
          </span>
        </span>
        <span
          className="wallpaper-dl-btn__shine pointer-events-none absolute inset-0"
          aria-hidden
        />
      </button>
      <p
        className="mae-thai-safe mt-3 text-center text-[15px] font-medium"
        style={{ color: MUTED }}
      >
        เสี่ยงได้วันละ 1 ใบ กลับมาเขย่าใหม่ได้พรุ่งนี้
      </p>
    </div>
  );
}
