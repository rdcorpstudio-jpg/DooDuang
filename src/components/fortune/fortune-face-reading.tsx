"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ChevronLeft, ImageIcon, Lock, RotateCcw, X } from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { GuidedScanCapture } from "@/components/fortune/guided-scan-capture";
import { ScanAnalyzingPanel } from "@/components/fortune/scan-analyzing-panel";
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
  fileToStoredDataUrl,
  hasSavedScan,
  readSavedFaceScan,
  saveFaceScan,
  scanCooldownDaysLeft,
} from "@/lib/fortune/scan/scan-cooldown";
import {
  isPremiumUnlocked,
  setPremiumUnlocked,
} from "@/lib/fortune/premium-unlock";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
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
  const [savedPhotoUrls, setSavedPhotoUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [canRescan, setCanRescan] = useState(true);
  const [cooldownDays, setCooldownDays] = useState(0);
  const [hasSaved, setHasSaved] = useState(false);

  const frontPreviewUrl = useObjectUrl(frontFile);
  const sidePreviewUrl = useObjectUrl(sideFile);
  const livePhotoUrl = useObjectUrl(photos[0] ?? null);
  const livePhotoRightUrl = useObjectUrl(photos[1] ?? null);
  const photoUrl = livePhotoUrl ?? savedPhotoUrls[0] ?? null;
  const photoRightUrl = livePhotoRightUrl ?? savedPhotoUrls[1] ?? null;

  function refreshCooldown() {
    setCanRescan(canRescanScan("face"));
    setCooldownDays(scanCooldownDaysLeft("face"));
    setHasSaved(hasSavedScan("face"));
  }

  useEffect(() => {
    setUnlocked(isPremiumUnlocked());
    const saved = readSavedFaceScan();
    if (saved) {
      setPack(saved.pack);
      setSavedPhotoUrls(saved.photoDataUrls ?? []);
    }
    refreshCooldown();
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
      const thumbs = await Promise.all(
        files.slice(0, 2).map((f) => fileToStoredDataUrl(f))
      );
      // ลบผลเก่าแล้วเก็บผลใหม่แทน
      clearSavedScan("face");
      saveFaceScan(next, thumbs);
      setPack(next);
      setSavedPhotoUrls(thumbs);
      refreshCooldown();
      await new Promise((r) => setTimeout(r, 700));
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
      setSavedPhotoUrls(saved.photoDataUrls ?? []);
    }
  }

  function viewSaved() {
    const saved = readSavedFaceScan();
    if (!saved) {
      setError("ยังไม่มีผลโหงวเฮ้งที่บันทึกไว้");
      return;
    }
    setPack(saved.pack);
    setSavedPhotoUrls(saved.photoDataUrls ?? []);
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

  if (!unlocked) {
    return (
      <div className={cn("sky-copy relative h-full overflow-y-auto", className)}>
        <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col px-4 pb-10 pt-3">
          <Header onBack={() => router.back()} />
          <div className="fortune-glass mt-8 rounded-[24px] px-5 py-7 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#9B7FE8]/12 ring-1 ring-[#9B7FE8]/30">
              <Lock className="h-5 w-5 text-[#7B5FD4]" strokeWidth={1.9} />
            </span>
            <p className="mt-4 text-[11px] font-semibold tracking-[0.18em] text-[#7B5FD4]">
              PREMIUM
            </p>
            <h1 className="mt-1.5 text-[1.55rem] font-bold tracking-tight text-[#241C4F]">
              ดูโหงวเฮ้ง
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-[#5E5688]">
              ถ่ายใบหน้าด้านหน้าและด้านข้าง เพื่อวิเคราะห์รูปหน้าและจังหวะวันนี้
            </p>
            <button
              type="button"
              onClick={() => setPayOpen(true)}
              className="no-sky-lift dd-gold-glass-btn mt-5 w-full rounded-full py-3 text-[15px] font-semibold text-[#5C4810] outline-none transition active:scale-[0.99]"
            >
              ปลดล็อก · {FORTUNE_UNLOCK_PRICE} บาท
            </button>
          </div>
        </div>
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
    <div className={cn("sky-copy relative h-full overflow-y-auto", className)}>
      <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col px-4 pb-10 pt-3">
        <Header
          onBack={() => {
            if (step === "result" || step === "analyzing") goReady();
            else router.back();
          }}
        />

        {step === "ready" ? (
          <>
            <header className="mt-5">
              <h1 className="text-[1.55rem] font-bold tracking-tight text-[#241C4F]">
                โหงวเฮ้ง
              </h1>
              <p className="mt-1 text-[14px] font-medium text-[#7B5FD4]">
                ถ่ายด้านหน้า + ด้านข้าง แล้ววิเคราะห์ด้วย AI
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#6B6490]">
                {canRescan
                  ? "อัปโหลดทีละรูป หรือถ่ายด้วยกล้อง — ต้องครบ 2 มุม · สแกนได้ 1 ครั้ง / 7 วัน"
                  : `สแกนรอบถัดไปในอีก ${cooldownDays} วัน — กดดูผลล่าสุดได้`}
              </p>
            </header>

            {hasSaved ? (
              <button
                type="button"
                onClick={viewSaved}
                className="no-sky-lift mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#6A48C8] py-3.5 text-[15px] font-semibold text-white outline-none transition active:scale-[0.99]"
              >
                ดูผลล่าสุดอีกครั้ง
              </button>
            ) : null}

            {canRescan ? (
              <>
            <div className="mt-5 grid grid-cols-2 gap-3">
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
              <p className="mt-3 text-center text-[12px] text-[#E11D48]">{error}</p>
            ) : null}

            <button
              type="button"
              disabled={!frontFile || !sideFile}
              onClick={analyzeDraft}
              className="no-sky-lift dd-gold-glass-btn mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-semibold text-[#5C4810] outline-none transition enabled:active:scale-[0.99] disabled:opacity-45"
            >
              วิเคราะห์โหงวเฮ้ง
            </button>
            <button
              type="button"
              onClick={() => setScanOpen(true)}
              className="no-sky-lift mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/70 py-3.5 text-[15px] font-semibold text-[#5B45B8] ring-1 ring-[#9B7FE8]/30 outline-none transition active:scale-[0.99]"
            >
              <Camera className="h-4 w-4" strokeWidth={2} />
              เปิดกล้องสแกน · หน้า+ข้าง
            </button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-[#8A82B0]">
              ใช้วิเคราะห์ผลลัพธ์เท่านั้น — ไม่เก็บรูปถาวร
            </p>
              </>
            ) : (
              <>
                {error ? (
                  <p className="mt-3 text-center text-[12px] text-[#E11D48]">{error}</p>
                ) : null}
                <p className="mt-4 rounded-[16px] bg-white/65 px-3.5 py-3 text-center text-[12px] leading-relaxed text-[#5E5688] ring-1 ring-[#7B6BB0]/12">
                  คูลดาวน์ 7 วัน · ดูผลเดิมได้ตลอดจนกว่าจะสแกนรอบใหม่
                </p>
              </>
            )}
          </>
        ) : null}

        {step === "analyzing" ? (
          <ScanAnalyzingPanel
            mode="face"
            photoUrl={photoUrl}
            photoRightUrl={photoRightUrl}
          />
        ) : null}

        {step === "result" && pack ? (
          <FaceResult
            photoUrl={photoUrl}
            photoRightUrl={photoRightUrl}
            pack={pack}
            unlocked={unlocked}
            onUnlock={() => setPayOpen(true)}
            canRescan={canRescan}
            cooldownDays={cooldownDays}
            onRescan={startNewScan}
          />
        ) : null}
      </div>

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

function Header({ onBack }: { onBack: () => void }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-0.5 justify-self-start text-[15px] font-medium text-[#3A2F6B] outline-none transition active:opacity-60"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
        กลับ
      </button>
      <div className="flex flex-col items-center justify-self-center">
        <FortuneIcon name="moon" size={16} className="-mb-0.5" />
        <p className="font-sacred text-[12px] tracking-[0.26em] text-[#C9A227]">
          DOODUANG
        </p>
      </div>
      <span aria-hidden className="justify-self-end" />
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
    <div className="fortune-glass overflow-hidden rounded-[18px]">
      <div className="flex items-center justify-between px-3 pt-2.5">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-[#7B5FD4]">
          {label}
        </p>
        {url ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full p-1 text-[#8A82B0] outline-none transition active:opacity-60"
            aria-label={`ลบรูป${label}`}
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onPick}
        className="relative mt-1.5 flex aspect-[3/4] w-full flex-col items-center justify-center gap-1.5 bg-[#9B7FE8]/08 outline-none transition active:opacity-85"
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <>
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/70 ring-1 ring-[#9B7FE8]/25">
              <ImageIcon className="h-4 w-4 text-[#7B5FD4]" strokeWidth={1.9} />
            </span>
            <span className="text-[12px] font-medium text-[#5B45B8]">
              อัปโหลด
            </span>
          </>
        )}
      </button>
    </div>
  );
}

function FaceResult({
  photoUrl,
  photoRightUrl,
  pack,
  unlocked,
  onUnlock,
  onRescan,
  canRescan,
  cooldownDays,
}: {
  photoUrl: string | null;
  photoRightUrl: string | null;
  pack: FaceReadingPack;
  unlocked: boolean;
  onUnlock: () => void;
  onRescan: () => void;
  canRescan: boolean;
  cooldownDays: number;
}) {
  const { result, shapeLabel, shapeCopy, aspects } = pack;
  const clarity = result.metrics.clarity;
  const freeBody =
    shapeCopy.body.length > 90
      ? `${shapeCopy.body.slice(0, 90).trim()}…`
      : shapeCopy.body;

  return (
    <div className="mt-5 space-y-3 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[1.4rem] font-bold tracking-tight text-[#241C4F]">
            ผลโหงวเฮ้ง
          </h1>
          <p className="mt-0.5 text-[12px] text-[#7B5FD4]">{shapeCopy.blurb}</p>
          {!unlocked ? (
            <p className="mt-1 text-[11px] text-[#8A82B0]">
              ดูเบื้องต้นฟรี · รายละเอียดล็อกไว้
            </p>
          ) : null}
        </div>
        {canRescan ? (
          <button
            type="button"
            onClick={onRescan}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/70 px-2.5 py-1.5 text-[11px] font-medium text-[#5B45B8] ring-1 ring-[#9B7FE8]/25"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
            สแกนใหม่
          </button>
        ) : (
          <span className="inline-flex shrink-0 items-center rounded-full bg-[#F3EEFF] px-2.5 py-1.5 text-[11px] font-medium text-[#7A72A0]">
            สแกนใหม่ใน {cooldownDays} วัน
          </span>
        )}
      </div>

      <div className="fortune-glass overflow-hidden rounded-[20px] p-3.5">
        <div className="flex gap-3">
          <div className="flex shrink-0 gap-1.5">
            <div className="relative flex h-24 w-[4.5rem] items-center justify-center overflow-hidden rounded-[14px] bg-[#9B7FE8]/10">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/images/app-icon.png"
                  alt=""
                  className="h-12 w-12 object-contain"
                />
              )}
            </div>
            <div className="relative flex h-24 w-[4.5rem] items-center justify-center overflow-hidden rounded-[14px] bg-[#9B7FE8]/10">
              {photoRightUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoRightUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/images/app-icon.png"
                  alt=""
                  className="h-12 w-12 object-contain opacity-80"
                />
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-[#241C4F]">
              {shapeLabel}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#5E5688]">
              {shapeCopy.title}
            </p>
            <p className="mt-2 text-[11px] text-[#8A82B0]">หน้า · ข้าง</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[12px] text-[#5E5688]">ความชัดของสแกน</p>
          <p className="text-[12px] font-medium text-[#5B45B8]">{clarity}%</p>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#9B7FE8]/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7B5FD4] to-[#9B7FE8]"
            style={{ width: `${clarity}%` }}
          />
        </div>
      </div>

      <div className="fortune-glass rounded-[20px] px-4 py-4">
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-[#7B5FD4]">
          รูปหน้าของคุณ
        </h2>
        {unlocked ? (
          <ExpandableBody text={shapeCopy.body} />
        ) : (
          <p className="mt-1 text-[13px] leading-[1.75] text-[#3A3270]">
            {freeBody}
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
        <p className="text-[12px] font-semibold text-[#5B45B8]">จุดแข็ง</p>
        <ul className="mt-2 space-y-1.5">
          {shapeCopy.strengths.map((s) => (
            <li key={s} className="text-[12px] text-[#5E5688]">
              · {s}
            </li>
          ))}
        </ul>
        <div className="mt-3.5 space-y-3.5 border-t border-[#7B6BB0]/12 pt-3.5">
          {aspects.map((a) => (
            <div key={a.id}>
              <p className="text-[13px] font-semibold text-[#2C2458]">
                {a.copy.title}
              </p>
              <p className="mt-0.5 text-[11px] text-[#7B5FD4]">{a.copy.blurb}</p>
              <ExpandableBody text={a.copy.body} className="mt-1.5" />
              {a.copy.highlights.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {a.copy.highlights.map((h) => (
                    <li key={h} className="text-[12px] text-[#5E5688]">
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
          title="ผลโหงวเฮ้ง · DooDuang"
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
      <p className="text-[13px] leading-[1.75] text-[#3A3270]">{text}</p>
    </div>
  );
}
