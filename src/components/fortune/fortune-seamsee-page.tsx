"use client";

import { useEffect, useRef, useState } from "react";
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
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { PageBackButton } from "@/components/ui/page-back-button";
import { MAE_GLASS } from "@/lib/mae-glass";
import { cn } from "@/lib/utils";
import {
  drawSeamseeStick,
  readTodaySeamsee,
  saveTodaySeamsee,
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
  const shakesRef = useRef(0);
  const lockRef = useRef(false);
  const lastBump = useRef(0);
  const phaseRef = useRef<Phase>("intro");
  const topicRef = useRef<SeamseeTopicId>("life");
  phaseRef.current = phase;
  topicRef.current = topic;

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
      window.setTimeout(() => reveal(), 640);
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
    setPhase("shake");
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
      <MaePageBackground blur={8} scrollBlur={false} />
      <style>{`
        @keyframes seamsee-rattle {
          0%, 100% { transform: translate3d(0,0,0) rotate(0deg); }
          18% { transform: translate3d(-8px, 1px, 0) rotate(-5deg); }
          36% { transform: translate3d(9px, -1px, 0) rotate(5deg); }
          54% { transform: translate3d(-6px, 0, 0) rotate(-3deg); }
          72% { transform: translate3d(5px, 1px, 0) rotate(3deg); }
        }
        .seamsee-rattle { animation: seamsee-rattle 0.46s ease-in-out; }
      `}</style>

      <div className="relative z-[2] mx-auto flex min-h-full w-full max-w-[480px] flex-col px-4 pb-16 pt-4 sm:px-5">
        <div className="mb-3 flex items-center justify-between">
          <PageBackButton
            href={phase === "intro" || phase === "result" ? "/predict" : undefined}
            onClick={
              phase === "topic"
                ? () => setPhase("intro")
                : phase === "shake"
                  ? () => setPhase("topic")
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
        ) : phase === "intro" ? (
          <Intro onStart={() => setPhase("topic")} />
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
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-1 flex-col pt-6">
      <p
        className="mae-thai-safe text-center text-[12px] font-semibold tracking-[0.22em]"
        style={{ color: GOLD_SOFT }}
      >
        วันละ 1 ใบ
      </p>
      <h1
        className="mae-thai-safe mt-1 text-center text-[2rem] font-bold tracking-wide"
        style={{ color: GOLD }}
      >
        เซียมซี
      </h1>
      <p
        className="mae-thai-safe mx-auto mt-2 max-w-[18rem] text-center text-[15px] font-medium"
        style={{ color: MUTED }}
      >
        ตั้งจิตถึงเรื่องที่อยากรู้
        <br />
        แล้วเขย่ากระบอกเพื่อเปิดคำทำนาย
      </p>

      <ol className="mx-auto mt-6 w-full max-w-[20rem] list-none space-y-3 pl-0">
        <RitualStep n="01" title="เลือกเรื่อง" blurb="ภาพรวม หรือเจาะเรื่องที่สนใจ" />
        <RitualStep n="02" title="เขย่าเปิดใบ" blurb="แตะหรือเขย่าโทรศัพท์ 5 ครั้ง" />
      </ol>

      <button
        type="button"
        onClick={onStart}
        className="mae-gold-cta mt-8 flex h-12 w-full items-center justify-center rounded-full text-[16px] font-bold"
      >
        <span className="dd-btn-label">เริ่มเสี่ยงเซียมซี</span>
      </button>
    </div>
  );
}

function RitualStep({
  n,
  title,
  blurb,
}: {
  n: string;
  title: string;
  blurb: string;
}) {
  return (
    <li className="flex items-center gap-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
        style={{
          color: "#1a1408",
          background:
            "linear-gradient(160deg, #fff4d2 0%, #e8d19a 42%, #b8924f 100%)",
        }}
      >
        {n}
      </span>
      <span>
        <span className="mae-thai-safe block text-[16px] font-semibold text-white">
          {title}
        </span>
        <span className="mae-thai-safe block text-[13.5px]" style={{ color: MUTED }}>
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
  onTap,
}: {
  shakes: number;
  rattling: boolean;
  onTap: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="flex flex-1 flex-col items-center px-1 pb-2 pt-8 text-center outline-none"
    >
      <p
        className="mae-thai-safe text-[12px] font-semibold tracking-[0.2em]"
        style={{ color: GOLD_SOFT }}
      >
        ตั้งจิต
      </p>
      <h1
        className="mae-thai-safe mt-1 text-[1.7rem] font-bold"
        style={{ color: GOLD }}
      >
        เขย่ากระบอก
      </h1>
      <p className="mae-thai-safe mt-1 text-[14.5px]" style={{ color: MUTED }}>
        ทำใจให้สงบ แล้วแตะหรือเขย่าโทรศัพท์
      </p>
      <div className="mt-1 flex items-center justify-center gap-1.5">
        {Array.from({ length: SEAMSEE_SHAKE_STEPS }, (_, i) => (
          <span
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i < shakes ? 22 : 7,
              background: i < shakes ? GOLD : "rgba(186,204,230,0.28)",
            }}
          />
        ))}
      </div>
      <p className="mae-thai-safe mt-3 text-[14px] font-medium" style={{ color: MUTED }}>
        {shakes}/{SEAMSEE_SHAKE_STEPS} · แตะกระบอกเพื่อเขย่า
      </p>
    </button>
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
