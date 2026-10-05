"use client";

import { useEffect, useMemo, useState } from "react";
import { StoryLoginCta } from "@/components/story/story-login-cta";
import {
  drawTarotCard,
  tarotCardImageSrc,
  type TarotSideCopy,
} from "@/lib/fortune/tarot-deck";
import { bangkokTodayKey } from "@/lib/fortune/tarot-day-storage";
import { DAILY_TAROT_LANDING_ASSETS } from "@/lib/story/daily-tarot-landing-assets";
import "./daily-tarot-landing.css";

const LOGIN_CALLBACK = "/reading";
const CARD_BACK = "/images/tarot/card-back.webp?v=4";

type Phase = "ready" | "flipping" | "opened";

type Drawn = {
  nameTh: string;
  nameEn: string;
  upright: boolean;
  image: string;
  side: TarotSideCopy;
};

const FEATURES = [
  { key: "energy", label: "พลังงานในวันนี้", icon: "leaf" },
  { key: "advice", label: "คำแนะนำจากไพ่", icon: "heart" },
  { key: "focus", label: "สิ่งที่ควรโฟกัส", icon: "star" },
  { key: "message", label: "ข้อความถึงคุณ", icon: "moon" },
] as const;

const LOCKED_ROWS: Array<{
  key: keyof Pick<TarotSideCopy, "do" | "watch" | "message">;
  label: string;
}> = [
  { key: "do", label: "สิ่งที่ควรโฟกัส" },
  { key: "watch", label: "คำแนะนำจากไพ่" },
  { key: "message", label: "ข้อความถึงคุณ" },
];

function AssetSlot({
  src,
  label,
  className,
}: {
  src: string | null;
  label: string;
  className?: string;
}) {
  if (src) {
    return (
      <div className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" />
      </div>
    );
  }
  return (
    <div className={className} aria-label={`เว้นที่ใส่รูป: ${label}`}>
      <div className="dt-land__ph">{label}</div>
    </div>
  );
}

function FeatureIcon({ kind }: { kind: (typeof FEATURES)[number]["icon"] }) {
  if (kind === "leaf") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M5 19c8-1 12-7 13-14-7 1-13 5-14 13Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path d="M7 17c3-3 6-5 10-7" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  if (kind === "heart") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 19s-6.2-3.8-8.2-7.2C2.2 9.4 3.4 6.5 6.2 6c1.6-.3 3.1.4 3.8 1.6C10.7 6.4 12.2 5.7 13.8 6c2.8.5 4 3.4 2.4 5.8C14.2 15.2 12 19 12 19Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (kind === "star") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="m12 3.5 2.1 4.8 5.2.5-4 3.5 1.2 5.1L12 14.8 7.5 17.9l1.2-5.1-4-3.5 5.2-.5L12 3.5Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15.5 4.2A7.8 7.8 0 0 0 6.2 16.4 7.9 7.9 0 1 1 15.5 4.2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function drawTodayCard(dayKey: string): Drawn {
  const drawn = drawTarotCard(`tarot-landing-3-${dayKey}`);
  return {
    nameTh: drawn.card.nameTh,
    nameEn: drawn.card.nameEn,
    upright: drawn.upright,
    image: tarotCardImageSrc(drawn.card),
    side: drawn.side,
  };
}

export function DailyTarotLanding() {
  const assets = DAILY_TAROT_LANDING_ASSETS;
  const dayKey = useMemo(() => bangkokTodayKey(), []);
  const todayCard = useMemo(() => drawTodayCard(dayKey), [dayKey]);
  const cardBack = assets.cardBack || CARD_BACK;

  const [phase, setPhase] = useState<Phase>("ready");
  const [flipped, setFlipped] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (phase !== "flipping") return;
    const start = window.setTimeout(() => setFlipped(true), 40);
    const done = window.setTimeout(() => setPhase("opened"), 880);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(done);
    };
  }, [phase]);

  function openCard() {
    if (phase !== "ready") return;
    setPhase("flipping");
  }

  return (
    <div className={`dt-land${phase === "opened" ? " dt-land--opened" : ""}`}>
      <div className="dt-land__inner">
        <header className="dt-land__top">
          <div className="dt-land__corners">
            <span>Good things ahead</span>
            <span>Trust the universe</span>
          </div>

          {assets.crest ? (
            <div className="dt-land__crest">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="dt-land__crest-img" src={assets.crest} alt="" />
            </div>
          ) : null}

          {assets.moonPhases ? (
            <div className="dt-land__phases">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="dt-land__phases-img" src={assets.moonPhases} alt="" />
            </div>
          ) : null}

          <h1 className="dt-land__title">DAILY TAROT</h1>
          {phase === "opened" ? (
            <>
              <p className="dt-land__card-name">{todayCard.nameTh}</p>
              <p className="dt-land__card-en">
                {todayCard.nameEn}
                {todayCard.upright ? " · ตั้งตรง" : " · กลับหัว"}
              </p>
            </>
          ) : (
            <>
              <p className="dt-land__thai">ไพ่แห่งวันนี้… มีอะไรอยากบอกคุณ</p>
              <p className="dt-land__speak">— LET THE CARDS SPEAK —</p>
            </>
          )}
        </header>

        <div className="dt-land__stage">
          <div className="dt-land__stage-frame">
            <AssetSlot
              className="dt-land__scene"
              src={assets.scene}
              label="ใส่รูปฉาก (ปราสาท/พระจันทร์)"
            />
            <AssetSlot
              className="dt-land__slot dt-land__slot--books"
              src={assets.books}
              label="หนังสือ"
            />
            <AssetSlot
              className="dt-land__slot dt-land__slot--crystal"
              src={assets.crystal}
              label="ลูกแก้ว"
            />
            <AssetSlot
              className="dt-land__slot dt-land__slot--candle"
              src={assets.candle}
              label="เทียน"
            />
            <AssetSlot
              className="dt-land__slot dt-land__slot--stones"
              src={assets.stones}
              label="คริสตัล"
            />
            <AssetSlot
              className="dt-land__slot dt-land__slot--floor"
              src={assets.zodiacFloor}
              label="วงจักรราศี"
            />

            <button
              type="button"
              className="dt-land__card dt-land__card--flip"
              onClick={openCard}
              disabled={phase !== "ready"}
              aria-label={phase === "ready" ? "เปิดไพ่ประจำวัน" : todayCard.nameTh}
            >
              <div className={`dt-land__flip-inner${flipped ? " is-flipped" : ""}`}>
                <div className="dt-land__flip-side dt-land__flip-side--back">
                  <div className="dt-land__gold">
                    <div className="dt-land__gold-mid">
                      <div className="dt-land__gold-inner">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cardBack} alt="หลังไพ่" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="dt-land__flip-side dt-land__flip-side--front">
                  <div className="dt-land__gold">
                    <div className="dt-land__gold-mid">
                      <div className="dt-land__gold-inner">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={todayCard.image}
                          alt={todayCard.nameTh}
                          style={{
                            transform: todayCard.upright ? undefined : "rotate(180deg)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {phase === "opened" ? (
          <div className="dt-land__reading">
            {todayCard.side.keywords.length > 0 ? (
              <div className="dt-land__tags">
                {todayCard.side.keywords.slice(0, 4).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            ) : null}
            <p className="dt-land__summary">{todayCard.side.summary}</p>
            <div className="dt-land__locks">
              {LOCKED_ROWS.map((row) => (
                <div key={row.key} className="dt-land__lock">
                  <p className="dt-land__lock-label">{row.label}</p>
                  <p className="dt-land__lock-text">{todayCard.side[row.key]}</p>
                  <div className="dt-land__lock-veil">
                    <span>ล็อก · สมัครเพื่ออ่าน</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="dt-land__cta-wrap">
          {phase === "ready" ? (
            <button type="button" className="dt-land__cta" onClick={openCard}>
              เปิดไพ่ประจำวัน <span aria-hidden>›</span>
            </button>
          ) : null}

          {phase === "flipping" ? (
            <p className="dt-land__thai">กำลังเปิดไพ่…</p>
          ) : null}

          {phase === "opened" ? (
            showLogin ? (
              <div className="dt-land__login">
                <StoryLoginCta
                  callbackUrl={LOGIN_CALLBACK}
                  anchor
                  variant="hero"
                />
              </div>
            ) : (
              <button
                type="button"
                className="dt-land__cta"
                onClick={() => setShowLogin(true)}
              >
                สมัครเพื่ออ่านต่อ <span aria-hidden>›</span>
              </button>
            )
          ) : null}

          <p className="dt-land__quote">“Every day is a new chapter”</p>
        </div>

        {phase !== "opened" ? (
          <>
            <div className="dt-land__features">
              {FEATURES.map((item) => (
                <div key={item.key} className="dt-land__feature">
                  <div className="dt-land__feature-ico">
                    <FeatureIcon kind={item.icon} />
                  </div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <p className="dt-land__foot">TAROT ✦ A BRIGHTER YOU</p>
          </>
        ) : null}
      </div>
    </div>
  );
}
