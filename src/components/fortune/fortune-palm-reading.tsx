"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ImageIcon, Lock, RotateCcw, X } from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { GuidedScanCapture } from "@/components/fortune/guided-scan-capture";
import { ScanAnalyzingPanel } from "@/components/fortune/scan-analyzing-panel";
import { MaeBrandLink } from "@/components/layout/mae-brand-link";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { AnimatedPage } from "@/components/ui/reveal";
import {
  LockedPreviewTile,
  UnlockDetailBanner,
} from "@/components/fortune/locked-reading-teaser";
import {
  ShareReadingButton,
  buildPalmShareText,
} from "@/components/fortune/share-reading-button";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import { useObjectUrl } from "@/components/fortune/photo-source-sheet";
import {
  buildPalmReadingPack,
  type PalmReadingPack,
} from "@/lib/fortune/scan/build-palm-pack";
import {
  canRescanScan,
  clearSavedScan,
  hasSavedScan,
  readSavedPalmScan,
  savePalmScan,
  scanCooldownDaysLeft,
} from "@/lib/fortune/scan/scan-cooldown";
import { handElementArt } from "@/lib/fortune/scan/hand-element-art";
import { pickPalmLineCopy } from "@/lib/fortune/content/face-palm-library";
import type { PalmLineId } from "@/lib/fortune/scan/types";
import {
  requirePremiumFromServer,
  setPremiumUnlocked,
} from "@/lib/fortune/premium-unlock";
import { FORTUNE_UNLOCK_PRICE, APP_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

type Step = "ready" | "analyzing" | "result";

function isMetaDisclaimer(value: string) {
  const t = value.trim();
  if (!t) return true;
  if (t.length < 24 && t.includes("แนวทาง")) return true;
  return (
    /ใช้เป็นแนวทาง/.test(t) &&
    /คำตัดสิน|ประกอบการตัดสินใจ/.test(t) &&
    t.length < 48
  );
}

function resolvePalmLine(
  id: PalmLineId,
  copy: {
    title: string;
    blurb: string;
    body: string;
    meaning: string;
    advice: string;
  }
) {
  const lib = pickPalmLineCopy(id, "mid");
  const field = (value: string, fallback: string) =>
    isMetaDisclaimer(value) ? fallback : value.trim() || fallback;
  return {
    title: field(copy.title, lib.title),
    blurb: field(copy.blurb, lib.blurb),
    body: field(copy.body, lib.body),
    meaning: field(copy.meaning, lib.meaning),
    advice: field(copy.advice, lib.advice),
  };
}

/** ลายมือ — free teaser + soft-lock detail like daily tarot */
export function FortunePalmReading({
  seed,
  className,
}: {
  seed: string;
  className?: string;
}) {
  const router = useRouter();
  const uploadRef = useRef<HTMLInputElement>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [step, setStep] = useState<Step>("ready");
  const [photo, setPhoto] = useState<File | null>(null);
  const [pack, setPack] = useState<PalmReadingPack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canRescan, setCanRescan] = useState(true);
  const [cooldownDays, setCooldownDays] = useState(0);
  const [hasSaved, setHasSaved] = useState(false);

  const livePhotoUrl = useObjectUrl(photo);

  function refreshCooldown() {
    setCanRescan(canRescanScan("palm"));
    setCooldownDays(scanCooldownDaysLeft("palm"));
    setHasSaved(hasSavedScan("palm"));
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const access = await requirePremiumFromServer();
      if (cancelled) return;
      setUnlocked(access.ok);
      const saved = readSavedPalmScan();
      if (saved) {
        setPack(saved.pack);
      }
      refreshCooldown();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function handlePaid() {
    setPremiumUnlocked();
    setUnlocked(true);
    setPayOpen(false);
  }

  useStripePaymentReturn(handlePaid);

  async function analyze(files: File[]) {
    if (!canRescanScan("palm")) {
      setError(`สแกนได้อีกครั้งในอีก ${scanCooldownDaysLeft("palm")} วัน`);
      return;
    }
    const file = files[0];
    if (!file) return;
    setPhoto(file);
    setError(null);
    setStep("analyzing");
    try {
      const next = await buildPalmReadingPack(file, `${seed}-palm`);
      // ไม่เก็บรูป — เก็บเฉพาะผลอ่าน
      clearSavedScan("palm");
      savePalmScan(next);
      setPack(next);
      refreshCooldown();
      await new Promise((r) => setTimeout(r, 700));
      setPhoto(null);
      setStep("result");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "วิเคราะห์ด้วย AI ไม่สำเร็จ ลองใหม่อีกครั้ง"
      );
      setStep("ready");
    }
  }

  function analyzeDraft() {
    if (!photo) {
      setError("อัปโหลดรูปฝ่ามือก่อน");
      return;
    }
    void analyze([photo]);
  }

  function pickPhoto(file: File | undefined) {
    if (!canRescan) {
      setError(`สแกนได้อีกครั้งในอีก ${cooldownDays} วัน — กดดูผลล่าสุดได้`);
      return;
    }
    if (!file || !file.type.startsWith("image/")) {
      setError("เลือกรูปภาพฝ่ามืออีกครั้ง");
      return;
    }
    setError(null);
    setPhoto(file);
  }

  function goReady() {
    setPhoto(null);
    setError(null);
    setStep("ready");
    refreshCooldown();
    const saved = readSavedPalmScan();
    if (saved) {
      setPack(saved.pack);
    }
  }

  function viewSaved() {
    const saved = readSavedPalmScan();
    if (!saved) {
      setError("ยังไม่มีผลลายมือที่บันทึกไว้");
      return;
    }
    setPack(saved.pack);
    setPhoto(null);
    setError(null);
    setStep("result");
  }

  function startNewScan() {
    if (!canRescanScan("palm")) {
      setError(`สแกนได้อีกครั้งในอีก ${scanCooldownDaysLeft("palm")} วัน`);
      return;
    }
    // พร้อมสแกนใหม่ — ผลเก่าจะถูกลบและแทนที่เมื่อวิเคราะห์สำเร็จ
    setPhoto(null);
    setError(null);
    setStep("ready");
  }

  if (!unlocked) {
    return (
      <div className={cn("relative h-full overflow-y-auto text-white", className)}>
        <MaePageBackground />
        <AnimatedPage className="relative z-[1] mx-auto flex min-h-full w-full max-w-[480px] flex-col px-4 pb-12 pt-3 sm:px-5">
          <Header />
          <div
            className="mt-8 overflow-hidden rounded-[26px] px-5 py-8 text-center"
            style={{
              background:
                "linear-gradient(160deg, rgba(12,28,52,0.78) 0%, rgba(5,14,30,0.72) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 48px rgba(0,0,0,0.28)",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
            }}
          >
            <span
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                background:
                  "linear-gradient(155deg, rgba(232,209,154,0.2), rgba(184,146,79,0.12))",
                boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.45)",
              }}
            >
              <Lock className="h-6 w-6" style={{ color: "#e8d19a" }} strokeWidth={1.9} />
            </span>
            <h1
              className="mae-gold-text mt-4 text-[1.65rem] font-bold tracking-tight"
              style={{ paddingTop: "0.12em", paddingBottom: "0.06em" }}
            >
              อ่านลายมือ
            </h1>
            <p
              className="mx-auto mt-2 max-w-[18rem] text-[16px] font-medium leading-[1.55]"
              style={{ color: "rgba(220,230,245,0.82)" }}
            >
              ถ่ายฝ่ามือตามกรอบ แล้วให้แม่ช่วยอ่านธาตุมือและเส้นหลัก
            </p>
            <button
              type="button"
              onClick={() => setPayOpen(true)}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full text-[16.5px] font-semibold outline-none transition active:scale-[0.99]"
              style={{
                color: "#1a1408",
                background:
                  "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28)",
              }}
            >
              ปลดล็อก · {FORTUNE_UNLOCK_PRICE} บาท
            </button>
          </div>
        </AnimatedPage>
        <FortunePaymentSheet
          open={payOpen}
          onClose={() => setPayOpen(false)}
          onPaid={handlePaid}
          returnPath="/reading/palm"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative h-full overflow-y-auto text-white", className)}>
      <MaePageBackground />
      <AnimatedPage
        key={step}
        className="relative z-[1] mx-auto flex min-h-full w-full max-w-[480px] flex-col px-4 pb-12 pt-3 sm:px-5"
      >
        <Header />

        {step === "ready" ? (
          <>
            <header className="mt-4 text-center">
              <h1
                className="mae-gold-text text-[1.7rem] font-bold tracking-tight"
                style={{ paddingTop: "0.14em", paddingBottom: "0.06em" }}
              >
                อ่านลายมือ
              </h1>
              <p
                className="mt-1.5 text-[16px] font-medium"
                style={{ color: "rgba(232,209,154,0.92)" }}
              >
                ถ่ายฝ่ามือ แล้ววิเคราะห์ด้วย AI
              </p>
              <p
                className="mx-auto mt-2 max-w-[20rem] text-[14.5px] font-medium leading-snug"
                style={{ color: "rgba(186,204,230,0.72)" }}
              >
                {canRescan
                  ? "เปิดกล้องตามกรอบ หรืออัปโหลดรูป · สแกนได้ 1 ครั้ง / 7 วัน"
                  : `สแกนรอบถัดไปในอีก ${cooldownDays} วัน — ดูผลล่าสุดได้ตลอด`}
              </p>
            </header>

            {hasSaved ? (
              <button
                type="button"
                onClick={viewSaved}
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold outline-none transition active:scale-[0.99]"
                style={{
                  color: "#e8d19a",
                  background: "rgba(232,209,154,0.1)",
                  boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.35)",
                }}
              >
                ดูผลล่าสุดอีกครั้ง
              </button>
            ) : null}

            {canRescan ? (
              <>
                <div className="mt-5">
                  <PalmPhotoSlot
                    label="ฝ่ามือ"
                    url={livePhotoUrl}
                    onPick={() => uploadRef.current?.click()}
                    onClear={() => setPhoto(null)}
                  />
                </div>
                <input
                  ref={uploadRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    pickPhoto(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />

                {error ? (
                  <p className="mt-3 text-center text-[13.5px] text-[#ff8a9a]">
                    {error}
                  </p>
                ) : null}

                {photo ? (
                  <button
                    type="button"
                    onClick={analyzeDraft}
                    className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[16px] font-semibold outline-none transition active:scale-[0.99]"
                    style={{
                      color: "#1a1408",
                      background:
                        "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.28), 0 10px 24px rgba(143,110,56,0.28)",
                    }}
                  >
                    วิเคราะห์ลายมือ
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setScanOpen(true)}
                    className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[16px] font-semibold outline-none transition active:scale-[0.99]"
                    style={{
                      color: "#1a1408",
                      background:
                        "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.28), 0 10px 24px rgba(143,110,56,0.28)",
                    }}
                  >
                    <Camera className="h-5 w-5" strokeWidth={2} />
                    เปิดกล้องสแกน
                  </button>
                )}
                {photo ? (
                  <button
                    type="button"
                    onClick={() => setScanOpen(true)}
                    className="mt-2.5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15.5px] font-semibold outline-none transition active:scale-[0.99]"
                    style={{
                      color: "#e8d19a",
                      background: "rgba(8,16,32,0.45)",
                      boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.32)",
                    }}
                  >
                    <Camera className="h-4 w-4" strokeWidth={2} />
                    ถ่ายใหม่ด้วยกล้อง
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => uploadRef.current?.click()}
                    className="mt-2.5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15.5px] font-semibold outline-none transition active:scale-[0.99]"
                    style={{
                      color: "#e8d19a",
                      background: "rgba(8,16,32,0.45)",
                      boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.32)",
                    }}
                  >
                    <ImageIcon className="h-4 w-4" strokeWidth={2} />
                    อัปโหลดจากแกลเลอรี
                  </button>
                )}
                <p
                  className="mt-4 text-center text-[12.5px] leading-relaxed"
                  style={{ color: "rgba(186,204,230,0.5)" }}
                >
                  ใช้วิเคราะห์ผลเท่านั้น — ไม่เก็บรูปถาวร
                </p>
              </>
            ) : (
              <>
                {error ? (
                  <p className="mt-3 text-center text-[13.5px] text-[#ff8a9a]">
                    {error}
                  </p>
                ) : null}
                <div
                  className="mt-5 rounded-[20px] px-4 py-4 text-center"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(12,28,52,0.72), rgba(5,14,30,0.68))",
                    boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.2)",
                  }}
                >
                  <p
                    className="text-[15px] font-medium leading-snug"
                    style={{ color: "rgba(220,230,245,0.82)" }}
                  >
                    คูลดาวน์ 7 วัน · ดูผลเดิมได้ตลอดจนกว่าจะสแกนรอบใหม่
                  </p>
                </div>
              </>
            )}
          </>
        ) : null}

        {step === "analyzing" ? (
          <ScanAnalyzingPanel mode="palm" photoUrl={livePhotoUrl} />
        ) : null}

        {step === "result" && pack ? (
          <PalmResult
            pack={pack}
            unlocked={unlocked}
            onUnlock={() => setPayOpen(true)}
            canRescan={canRescan}
            cooldownDays={cooldownDays}
            onRescan={startNewScan}
          />
        ) : null}
      </AnimatedPage>

      <GuidedScanCapture
        open={scanOpen}
        mode="palm"
        onClose={() => setScanOpen(false)}
        onCaptured={analyze}
      />
      <FortunePaymentSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onPaid={handlePaid}
        returnPath="/reading/palm"
      />
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center justify-between gap-3">
      <MaeBrandLink />
    </div>
  );
}

function PalmPhotoSlot({
  label,
  url,
  onPick,
  onClear,
}: {
  label: string;
  url: string | null;
  onPick: () => void;
  onClear: () => void;
}) {
  return (
    <div
      className="relative mx-auto w-full overflow-hidden rounded-[24px]"
      style={{
        background:
          "linear-gradient(160deg, rgba(12,28,52,0.78) 0%, rgba(5,14,30,0.72) 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.06), 0 18px 40px rgba(0,0,0,0.28)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="flex items-center justify-between px-4 pt-3.5">
        <p
          className="text-[13px] font-semibold tracking-[0.14em]"
          style={{ color: "#e8d19a" }}
        >
          {label}
        </p>
        {url ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full p-1.5 outline-none transition active:opacity-60"
            style={{ color: "rgba(186,204,230,0.7)" }}
            aria-label={`ลบรูป${label}`}
          >
            <X className="h-4 w-4" strokeWidth={2.2} />
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onPick}
        className="relative mx-4 mb-4 mt-2 flex aspect-[4/5] w-[calc(100%-2rem)] flex-col items-center justify-center gap-2 overflow-hidden rounded-[18px] outline-none transition active:opacity-90"
        style={{
          background: url
            ? "#0b1220"
            : "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(232,209,154,0.12) 0%, rgba(8,16,32,0.5) 70%)",
          boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.22)",
        }}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-4 rounded-[14px]"
              style={{
                boxShadow:
                  "inset 18px 18px 0 -16px rgba(232,209,154,0.45), inset -18px 18px 0 -16px rgba(232,209,154,0.45), inset 18px -18px 0 -16px rgba(232,209,154,0.45), inset -18px -18px 0 -16px rgba(232,209,154,0.45)",
              }}
            />
            <span
              className="relative z-[1] flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                background: "rgba(8,16,32,0.72)",
                boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.35)",
              }}
            >
              <Camera
                className="h-6 w-6"
                style={{ color: "#e8d19a" }}
                strokeWidth={1.8}
              />
            </span>
            <span
              className="relative z-[1] text-[15px] font-semibold"
              style={{ color: "#e8d19a" }}
            >
              วางฝ่ามือในกรอบ
            </span>
            <span
              className="relative z-[1] max-w-[14rem] text-center text-[13px] font-medium leading-snug"
              style={{ color: "rgba(186,204,230,0.55)" }}
            >
              เปิดกล้องด้านล่าง หรือแตะที่นี่เพื่ออัปโหลด
            </span>
          </>
        )}
      </button>
    </div>
  );
}

function PalmResult({
  pack,
  unlocked,
  onUnlock,
  onRescan,
  canRescan,
  cooldownDays,
}: {
  pack: PalmReadingPack;
  unlocked: boolean;
  onUnlock: () => void;
  onRescan: () => void;
  canRescan: boolean;
  cooldownDays: number;
}) {
  const { result, natureCopy, lines } = pack;
  const clarity = result.metrics.clarity;
  const elementSrc = handElementArt(result.nature);
  const ELEMENT_TITLE_TH = {
    earth: "ธาตุดิน",
    air: "ธาตุลม",
    fire: "ธาตุไฟ",
    water: "ธาตุน้ำ",
  } as const;
  const elementTitle = ELEMENT_TITLE_TH[result.nature] ?? "ธาตุมือ";

  return (
    <div className="mt-5 space-y-3 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[1.4rem] font-bold tracking-tight text-[#f7f4ec]">
            ผลอ่านลายมือ
          </h1>
          <p className="mt-0.5 text-[12px] text-[#d5b16f]">
            อ่านจากฝ่ามือ · ธาตุและเส้นหลัก
          </p>
          {!unlocked ? (
            <p className="mt-1 text-[11px] text-[#9aa3b2]">
              ดูเบื้องต้นฟรี · รายละเอียดล็อกไว้
            </p>
          ) : null}
        </div>
        {canRescan ? (
          <button
            type="button"
            onClick={onRescan}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[rgba(16,24,39,0.72)] px-2.5 py-1.5 text-[11px] font-medium text-[#d5b16f] ring-1 ring-[#d5b16f]/30"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
            สแกนใหม่
          </button>
        ) : (
          <span className="inline-flex shrink-0 items-center rounded-full bg-[rgba(213,177,111,0.12)] px-2.5 py-1.5 text-[11px] font-medium text-[#9aa3b2]">
            สแกนใหม่ใน {cooldownDays} วัน
          </span>
        )}
      </div>

      <div className="fortune-glass flex gap-3 rounded-[20px] p-3.5">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[14px] bg-[rgba(213,177,111,0.1)] ring-1 ring-[#C9A227]/25">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={elementSrc}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-bold tracking-tight text-[#f7f4ec]">
            {elementTitle}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-[#c5cdd9]/80">
            {unlocked ? natureCopy.strength : natureCopy.personality}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-[11px] text-[#c5cdd9]/75">ความชัดของสแกน</p>
            <p className="text-[11px] font-medium text-[#d5b16f]">{clarity}%</p>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-[rgba(213,177,111,0.16)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${clarity}%`,
                background:
                  "linear-gradient(90deg, #b8924f 0%, #d5b16f 55%, #e8d19a 100%)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="fortune-glass rounded-[20px] px-4 py-4">
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-[#d5b16f]">
          ธาตุมือของคุณ
        </h2>
        {unlocked ? (
          <ExpandableBody text={natureCopy.personality} />
        ) : (
          <p className="mt-1 text-[13px] leading-[1.75] text-[#c5cdd9]/88">
            {natureCopy.personality}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <LockedPreviewTile
          title="จุดแข็ง"
          unlocked={unlocked}
          preview={natureCopy.strength}
          onUnlock={onUnlock}
        />
        <LockedPreviewTile
          title="เงา"
          unlocked={unlocked}
          preview={natureCopy.shadow}
          onUnlock={onUnlock}
        />
      </div>
      <LockedPreviewTile
        title="คำแนะนำ"
        unlocked={unlocked}
        preview={natureCopy.advice}
        onUnlock={onUnlock}
      />

      <div className="grid grid-cols-1 gap-2.5">
        {lines.map((line) => {
          const copy = resolvePalmLine(line.id, line.copy);
          return (
            <LockedPreviewTile
              key={line.id}
              title={line.label}
              unlocked={unlocked}
              preview={`${copy.title} — ${copy.blurb}`}
              onUnlock={onUnlock}
            />
          );
        })}
      </div>

      <UnlockDetailBanner
        unlocked={unlocked}
        onUnlock={onUnlock}
        subtitle={`เส้นชีวิต หัวใจ สมอง · ${FORTUNE_UNLOCK_PRICE} บาท`}
      >
        <div className="space-y-3.5">
          {lines.map((line, i) => {
            const copy = resolvePalmLine(line.id, line.copy);
            const titleDup =
              copy.title.trim() === line.label.trim() || !copy.title.trim();
            return (
              <div
                key={line.id}
                className={
                  i > 0 ? "border-t border-[#d5b16f]/18 pt-3.5" : undefined
                }
              >
                <p className="text-[17px] font-bold tracking-tight text-[#d5b16f]">
                  {line.label}
                </p>
                {!titleDup ? (
                  <p className="mt-1 text-[13px] font-semibold text-[#e8d19a]">
                    {copy.title}
                  </p>
                ) : null}
                {copy.blurb ? (
                  <p className="mt-1 text-[12px] text-[#c5cdd9]/8">{copy.blurb}</p>
                ) : null}
                <ExpandableBody text={copy.body} className="mt-1" />
                {copy.meaning ? (
                  <p className="mt-1.5 text-[12px] leading-relaxed text-[#c5cdd9]/85">
                    <span className="font-semibold text-[#d5b16f]">ความหมาย: </span>
                    {copy.meaning}
                  </p>
                ) : null}
                {copy.advice ? (
                  <p className="mt-1.5 text-[12px] leading-relaxed text-[#c5cdd9]/85">
                    <span className="font-semibold text-[#d5b16f]">คำแนะนำ: </span>
                    {copy.advice}
                  </p>
                ) : null}
              </div>
            );
          })}
          <p className="border-t border-[#d5b16f]/15 pt-3 text-[11px] leading-relaxed text-[#9aa3b2]">
            อ่านลายมือเพื่อทบทวนจังหวะชีวิต — ใช้ประกอบการคิด ไม่ใช่คำตัดสินชี้ขาด
          </p>
        </div>
      </UnlockDetailBanner>

      {unlocked ? (
        <ShareReadingButton
          title={`ผลอ่านลายมือ · ${APP_NAME}`}
          text={buildPalmShareText(pack)}
          variant="primary"
          className="mt-1"
        />
      ) : null}
    </div>
  );
}

function ExpandableBody({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mt-2 text-[13px] leading-[1.75] text-[#c5cdd9]/88">{text}</p>
    </div>
  );
}
