"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  dailyDrawCardBack,
  daySeed,
  pickFanCards,
  type DailyDrawCard,
} from "@/lib/gate/daily-draw-deck";
import { APP_NAME } from "@/lib/site";
import "./daily-draw-gate.css";

type Phase = "pick" | "flipping" | "revealed";

const LOCKED_ROWS: Array<{
  key: keyof DailyDrawCard["locked"];
  label: string;
}> = [
  { key: "love", label: "ความรัก" },
  { key: "work", label: "การงาน" },
  { key: "luck", label: "โชคลาภวันนี้" },
];

export function DailyDrawGate() {
  const fan = useMemo(() => pickFanCards(5, daySeed()), []);
  const cardBack = dailyDrawCardBack();
  const [phase, setPhase] = useState<Phase>("pick");
  const [picked, setPicked] = useState<DailyDrawCard | null>(null);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (phase !== "flipping" || !picked) return;
    const start = window.setTimeout(() => setFlipped(true), 80);
    const done = window.setTimeout(() => setPhase("revealed"), 920);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(done);
    };
  }, [phase, picked]);

  function onPick(card: DailyDrawCard) {
    if (phase !== "pick") return;
    setPicked(card);
    setPhase("flipping");
  }

  return (
    <div className="dd-gate">
      <div className="dd-gate__glow" aria-hidden />
      <div className="dd-gate__inner">
        <header className="dd-gate__brand">
          <Image
            src="/images/brand/mae-wordmark.webp"
            alt={APP_NAME}
            width={220}
            height={56}
            priority
          />
          <h1 className="dd-gate__title">
            เปิดไพ่<span>ดูดวงรายวัน</span>
          </h1>
          {phase === "pick" ? (
            <p className="dd-gate__sub">เลือกไพ่อันหนึ่งใบที่ดึงสายตาคุณวันนี้</p>
          ) : null}
        </header>

        <div className="dd-gate__stage">
          {phase === "pick" ? (
            <div className="dd-gate__fan" role="list" aria-label="ไพ่ให้เลือก">
              {fan.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className="dd-gate__fan-card"
                  aria-label="เลือกไพ่ใบนี้"
                  onClick={() => onPick(card)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="dd-gate__fan-face"
                    src={cardBack}
                    alt=""
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          ) : null}

          {picked && (phase === "flipping" || phase === "revealed") ? (
            <div className="dd-gate__reveal">
              <div className="dd-gate__flip" aria-live="polite">
                <div
                  className={`dd-gate__flip-inner${flipped ? " is-flipped" : ""}`}
                >
                  <div className="dd-gate__flip-side dd-gate__flip-side--back">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cardBack} alt="หลังไพ่" />
                  </div>
                  <div className="dd-gate__flip-side dd-gate__flip-side--front">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={picked.image} alt={picked.nameTh} />
                  </div>
                </div>
              </div>

              {phase === "revealed" ? (
                <>
                  <div className="dd-gate__card-meta">
                    <h2 className="dd-gate__card-name">{picked.nameTh}</h2>
                    <p className="dd-gate__card-en">{picked.nameEn}</p>
                  </div>
                  <p className="dd-gate__tease">{picked.tease}</p>

                  <div className="dd-gate__sections">
                    {LOCKED_ROWS.map((row) => (
                      <div key={row.key} className="dd-gate__lock-block">
                        <p className="dd-gate__lock-label">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/images/icons/lock.webp" alt="" />
                          {row.label}
                        </p>
                        <p className="dd-gate__lock-text">
                          {picked.locked[row.key]}
                        </p>
                        <div className="dd-gate__lock-veil">
                          <span className="dd-gate__lock-pill">ล็อก · สมัครเพื่ออ่าน</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="dd-gate__sub">กำลังเปิดไพ่…</p>
              )}
            </div>
          ) : null}
        </div>

        {phase === "revealed" ? (
          <div className="dd-gate__cta-wrap">
            <Link href="/3" className="dd-gate__cta">
              สมัครเพื่ออ่านต่อ
            </Link>
            <p className="dd-gate__hint">เลือกช่องทางสมัครได้ที่หน้าถัดไป</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
