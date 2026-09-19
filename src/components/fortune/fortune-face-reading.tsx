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
  buildFaceShareText,
} from "@/components/fortune/share-reading-button";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import { useObjectUrl } from "@/components/fortune/photo-source-sheet";
import {
  buildFaceReadingPack,
  type FaceReadingPack,
} from "@/lib/fortune/scan/build-face-pack";
import {
  canRescanScan,
  clearSavedScan,
  hasSavedScan,
  readSavedFaceScan,
  saveFaceScan,
  scanCooldownDaysLeft,
} from "@/lib/fortune/scan/scan-cooldown";
import { FaceResultIconTiles } from "@/components/fortune/face-shape-icons";
import {
  requirePremiumFromServer,
  setPremiumUnlocked,
} from "@/lib/fortune/premium-unlock";
import { FORTUNE_UNLOCK_PRICE, APP_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

type Step = "ready" | "analyzing" | "result";

/** โหงวเฮ้ง — free teaser + soft-lock detail like daily tarot */
export function FortuneFaceReading({
  seed,
  className,
}: {
  seed: string;
  className?: string;
}) {
  const router = useRouter();
  const frontInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [step, setStep] = useState<Step>("ready");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [sideFile, setSideFile] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [pack, setPack] = useState<FaceReadingPack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canRescan, setCanRescan] = useState(true);
  const [cooldownDays, setCooldownDays] = useState(0);
  const [hasSaved, setHasSaved] = useState(false);

  const frontPreviewUrl = useObjectUrl(frontFile);
  const sidePreviewUrl = useObjectUrl(sideFile);
  const livePhotoUrl = useObjectUrl(photos[0] ?? null);
  const livePhotoRightUrl = useObjectUrl(photos[1] ?? null);

  function refreshCooldown() {
    setCanRescan(canRescanScan("face"));
    setCooldownDays(scanCooldownDaysLeft("face"));
    setHasSaved(hasSavedScan("face"));
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const access = await requirePremiumFromServer();
      if (cancelled) return;
      setUnlocked(access.ok);
      const saved = readSavedFaceScan();
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
    if (!canRescanScan("face")) {
      setError(`สแกนได้อีกครั้งในอีก ${scanCooldownDaysLeft("face")} วัน`);
      return;
    }
    if (files.length < 2) {
      setError("ต้องมีรูปด้านหน้าและด้านข้าง");
      return;
    }
    setFrontFile(files[0] ?? null);
    setSideFile(files[1] ?? null);
    setPhotos(files.slice(0, 2));
    setError(null);
    setStep("analyzing");
    try {
      const next = await buildFaceReadingPack(files.slice(0, 2), `${seed}-face`);
      // ลบผลเก่าแล้วเก็บผลใหม่แทน — ไม่เก็บรูป (กัน localStorage บวม)
      clearSavedScan("face");
      saveFaceScan(next);
      setPack(next);
      refreshCooldown();
      await new Promise((r) => setTimeout(r, 700));
      setPhotos([]);
      setFrontFile(null);
      setSideFile(null);
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
    if (!frontFile || !sideFile) {
      setError("อัปโหลดรูปด้านหน้าและด้านข้างให้ครบก่อน");
      return;
    }
    void analyze([frontFile, sideFile]);
  }

  function pickSlot(
    slot: "front" | "side",
    file: File | undefined
  ) {
    if (!canRescan) {
      setError(`สแกนได้อีกครั้งในอีก ${cooldownDays} วัน — กดดูผลล่าสุดได้`);
      return;
    }
    if (!file || !file.type.startsWith("image/")) {
      setError("เลือกรูปภาพอีกครั้ง");
      return;
    }
    setError(null);
    if (slot === "front") setFrontFile(file);
    else setSideFile(file);
  }

  function goReady() {
    setFrontFile(null);
    setSideFile(null);
    setPhotos([]);
    setError(null);
    setStep("ready");
    refreshCooldown();
    const saved = readSavedFaceScan();
    if (saved) {
      setPack(saved.pack);
    }
  }

  function viewSaved() {
    const saved = readSavedFaceScan();
    if (!saved) {
      setError("ยังไม่มีผลโหงวเฮ้งที่บันทึกไว้");
      return;
    }
    setPack(saved.pack);
    setPhotos([]);
    setFrontFile(null);
    setSideFile(null);
    setError(null);
    setStep("result");
  }

  function startNewScan() {
    if (!canRescanScan("face")) {
      setError(`สแกนได้อีกครั้งในอีก ${scanCooldownDaysLeft("face")} วัน`);
      return;
    }
    // พร้อมสแกนใหม่ — ผลเก่าจะถูกลบและแทนที่เมื่อวิเคราะห์สำเร็จ
    setFrontFile(null);
    setSideFile(null);
    setPhotos([]);
    setError(null);
    setStep("ready");
  }

  const bothReady = Boolean(frontFile && sideFile);

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
              โหงวเฮ้ง
            </h1>
            <p
              className="mx-auto mt-2 max-w-[18rem] text-[16px] font-medium leading-[1.55]"
              style={{ color: "rgba(220,230,245,0.82)" }}
            >
              ถ่ายหน้า + ข้าง ตามกรอบ แล้วให้แม่ช่วยอ่านรูปหน้าและจังหวะ
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
          returnPath="/reading/face"
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
                โหงวเฮ้ง
              </h1>
              <p
                className="mt-1.5 text-[16px] font-medium"
                style={{ color: "rgba(232,209,154,0.92)" }}
              >
                ถ่ายด้านหน้า + ด้านข้าง แล้ววิเคราะห์ด้วย AI
              </p>
              <p
                className="mx-auto mt-2 max-w-[20rem] text-[14.5px] font-medium leading-snug"
                style={{ color: "rgba(186,204,230,0.72)" }}
              >
                {canRescan
                  ? "เปิดกล้องครบ 2 มุม หรืออัปโหลดทีละรูป · สแกนได้ 1 ครั้ง / 7 วัน"
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
                <div
                  className="mt-5 overflow-hidden rounded-[24px] px-3.5 pb-3.5 pt-3"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(12,28,52,0.78) 0%, rgba(5,14,30,0.72) 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.06), 0 18px 40px rgba(0,0,0,0.28)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                  }}
                >
                  <p
                    className="px-1 text-[13px] font-semibold tracking-[0.14em]"
                    style={{ color: "#e8d19a" }}
                  >
                    2 มุมใบหน้า
                  </p>
                  <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                    <PhotoSlot
                      label="ด้านหน้า"
                      url={frontPreviewUrl}
                      onPick={() => frontInputRef.current?.click()}
                      onClear={() => setFrontFile(null)}
                    />
                    <PhotoSlot
                      label="ด้านข้าง"
                      url={sidePreviewUrl}
                      onPick={() => sideInputRef.current?.click()}
                      onClear={() => setSideFile(null)}
                    />
                  </div>
                </div>
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    pickSlot("front", e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <input
                  ref={sideInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    pickSlot("side", e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />

                {error ? (
                  <p className="mt-3 text-center text-[13.5px] text-[#ff8a9a]">
                    {error}
                  </p>
                ) : null}

                {bothReady ? (
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
                    วิเคราะห์โหงวเฮ้ง
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
                    เปิดกล้องสแกน · หน้า+ข้าง
                  </button>
                )}
                {bothReady ? (
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
                  <p
                    className="mt-3 text-center text-[13px] font-medium leading-snug"
                    style={{ color: "rgba(186,204,230,0.55)" }}
                  >
                    หรือแตะช่องด้านบนเพื่ออัปโหลดจากแกลเลอรี
                  </p>
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
          <ScanAnalyzingPanel
            mode="face"
            photoUrl={livePhotoUrl}
            photoRightUrl={livePhotoRightUrl}
          />
        ) : null}

        {step === "result" && pack ? (
          <FaceResult
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
        mode="face"
        onClose={() => setScanOpen(false)}
        onCaptured={analyze}
      />
      <FortunePaymentSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onPaid={handlePaid}
        returnPath="/reading/face"
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

function PhotoSlot({
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
    <div className="overflow-hidden rounded-[16px]">
      <div className="flex items-center justify-between px-1 pb-1.5">
        <p
          className="text-[12px] font-semibold tracking-[0.08em]"
          style={{ color: "#e8d19a" }}
        >
          {label}
        </p>
        {url ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full p-1 outline-none transition active:opacity-60"
            style={{ color: "rgba(186,204,230,0.7)" }}
            aria-label={`ลบรูป${label}`}
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onPick}
        className="relative flex aspect-[3/4] w-full flex-col items-center justify-center gap-1.5 overflow-hidden rounded-[14px] outline-none transition active:opacity-90"
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
              className="pointer-events-none absolute inset-3 rounded-[10px]"
              style={{
                boxShadow:
                  "inset 14px 14px 0 -12px rgba(232,209,154,0.45), inset -14px 14px 0 -12px rgba(232,209,154,0.45), inset 14px -14px 0 -12px rgba(232,209,154,0.45), inset -14px -14px 0 -12px rgba(232,209,154,0.45)",
              }}
            />
            <span
              className="relative z-[1] flex h-11 w-11 items-center justify-center rounded-full"
              style={{
                background: "rgba(8,16,32,0.72)",
                boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.35)",
              }}
            >
              <ImageIcon
                className="h-5 w-5"
                style={{ color: "#e8d19a" }}
                strokeWidth={1.8}
              />
            </span>
            <span
              className="relative z-[1] text-[12.5px] font-semibold"
              style={{ color: "#e8d19a" }}
            >
              อัปโหลด
            </span>
          </>
        )}
      </button>
    </div>
  );
}

function FaceResult({
  pack,
  unlocked,
  onUnlock,
  onRescan,
  canRescan,
  cooldownDays,
}: {
  pack: FaceReadingPack;
  unlocked: boolean;
  onUnlock: () => void;
  onRescan: () => void;
  canRescan: boolean;
  cooldownDays: number;
}) {
  const { result, shapeLabel, shapeCopy, aspects } = pack;
  const clarity = result.metrics.clarity;

  return (
    <div className="mt-5 space-y-3 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[1.4rem] font-bold tracking-tight text-[#f7f4ec]">
            ผลโหงวเฮ้ง
          </h1>
          <p className="mt-0.5 text-[12px] text-[#d5b16f]">{shapeCopy.blurb}</p>
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

      <div className="fortune-glass overflow-hidden rounded-[20px] p-3.5">
        <div className="flex gap-3">
          <FaceResultIconTiles shape={result.shape} />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-[#f7f4ec]">
              {shapeLabel}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#c5cdd9]/80">
              {shapeCopy.title}
            </p>
            <p className="mt-2 text-[11px] text-[#9aa3b2]">หน้า · ข้าง</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[12px] text-[#c5cdd9]/80">ความชัดของสแกน</p>
          <p className="text-[12px] font-medium text-[#d5b16f]">{clarity}%</p>
        </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[rgba(213,177,111,0.16)]">
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

      <div className="fortune-glass rounded-[20px] px-4 py-4">
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-[#d5b16f]">
          รูปหน้าของคุณ
        </h2>
        {unlocked ? (
          <ExpandableBody text={shapeCopy.body} />
        ) : (
          <p className="mt-1 text-[13px] leading-[1.75] text-[#c5cdd9]/88">
            {shapeCopy.body}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <LockedPreviewTile
          title="ระวัง"
          unlocked={unlocked}
          preview={shapeCopy.watch}
          onUnlock={onUnlock}
        />
        <LockedPreviewTile
          title="คำแนะนำ"
          unlocked={unlocked}
          preview={shapeCopy.advice}
          onUnlock={onUnlock}
        />
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {aspects.map((a) => (
          <LockedPreviewTile
            key={a.id}
            title={a.copy.title}
            unlocked={unlocked}
            preview={`${a.copy.blurb} ${a.copy.body}`}
            onUnlock={onUnlock}
          />
        ))}
      </div>

      <UnlockDetailBanner
        unlocked={unlocked}
        onUnlock={onUnlock}
        subtitle={`จุดแข็ง การงาน ความรัก ภาพลักษณ์ · ${FORTUNE_UNLOCK_PRICE} บาท`}
      >
        <p className="text-[12px] font-semibold text-[#d5b16f]">จุดแข็ง</p>
        <ul className="mt-2 space-y-1.5">
          {shapeCopy.strengths.map((s) => (
            <li key={s} className="text-[12px] text-[#c5cdd9]/80">
              · {s}
            </li>
          ))}
        </ul>
        <div className="mt-3.5 space-y-3.5 border-t border-[rgba(213,177,111,0.18)] pt-3.5">
          {aspects.map((a) => (
            <div key={a.id}>
              <p className="text-[13px] font-semibold text-[#e8d19a]">
                {a.copy.title}
              </p>
              <p className="mt-0.5 text-[11px] text-[#d5b16f]">{a.copy.blurb}</p>
              <ExpandableBody text={a.copy.body} className="mt-1.5" />
              {a.copy.highlights.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {a.copy.highlights.map((h) => (
                    <li key={h} className="text-[12px] text-[#c5cdd9]/80">
                      · {h}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </UnlockDetailBanner>

      {unlocked ? (
        <ShareReadingButton
          title={`ผลโหงวเฮ้ง · ${APP_NAME}`}
          text={buildFaceShareText(pack)}
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
      <p className="text-[13px] leading-[1.75] text-[#c5cdd9]/88">{text}</p>
    </div>
  );
}
