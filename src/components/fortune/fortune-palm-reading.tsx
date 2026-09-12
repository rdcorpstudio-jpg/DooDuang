"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ImageIcon, Lock, RotateCcw, X } from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { GuidedScanCapture } from "@/components/fortune/guided-scan-capture";
import { ScanAnalyzingPanel } from "@/components/fortune/scan-analyzing-panel";
import { PageBackButton } from "@/components/ui/page-back-button";
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
  isPremiumUnlocked,
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
    setUnlocked(isPremiumUnlocked());
    const saved = readSavedPalmScan();
    if (saved) {
      setPack(saved.pack);
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
      <div className={cn("sky-copy relative h-full overflow-y-auto", className)}>
        <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col px-4 pb-10 pt-3">
          <Header onBack={() => router.back()} />
          <div className="fortune-glass mt-8 rounded-[22px] px-4 py-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(213,177,111,0.12)] ring-1 ring-[#d5b16f]/35">
              <Lock className="h-5 w-5 text-[#d5b16f]" strokeWidth={1.9} />
            </span>
            <h1 className="mt-3 text-[1.4rem] font-bold tracking-tight text-[#f7f4ec]">
              ดูลายมือ · พรีเมียม
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-[#c5cdd9]/80">
              ถ่ายฝ่ามือตามกรอบนำทาง เพื่ออ่านธาตุมือและเส้นหลัก
            </p>
            <button
              type="button"
              onClick={() => setPayOpen(true)}
              className="mae-gold-cta no-sky-lift mt-5 w-full rounded-full py-3 text-[15px] font-semibold outline-none transition active:scale-[0.99]"
            >
              ปลดล็อก · {FORTUNE_UNLOCK_PRICE} บาท
            </button>
          </div>
        </div>
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
              <h1 className="text-[1.55rem] font-bold tracking-tight text-[#f7f4ec]">
                อ่านลายมือ
              </h1>
              <p className="mt-1 text-[14px] font-medium text-[#d5b16f]">
                ถ่ายฝ่ามือแล้ววิเคราะห์ด้วย AI
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#c5cdd9]/75">
                {canRescan
                  ? "อัปโหลดรูปดูพรีวิวก่อน หรือถ่ายด้วยกล้อง · สแกนได้ 1 ครั้ง / 7 วัน"
                  : `สแกนรอบถัดไปในอีก ${cooldownDays} วัน — กดดูผลล่าสุดได้`}
              </p>
            </header>

            {hasSaved ? (
              <button
                type="button"
                onClick={viewSaved}
                className="mae-gold-cta no-sky-lift mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold outline-none transition active:scale-[0.99]"
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
              <p className="mt-3 text-center text-[12px] text-[#E11D48]">{error}</p>
            ) : null}

            <button
              type="button"
              disabled={!photo}
              onClick={analyzeDraft}
              className="no-sky-lift dd-gold-glass-btn mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-semibold text-[#5C4810] outline-none transition enabled:active:scale-[0.99] disabled:opacity-45"
            >
              วิเคราะห์ลายมือ
            </button>
            <button
              type="button"
              onClick={() => setScanOpen(true)}
              className="no-sky-lift mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/70 py-3.5 text-[15px] font-semibold text-[#d5b16f] ring-1 ring-[#d5b16f]/35 outline-none transition active:scale-[0.99]"
            >
              <Camera className="h-4 w-4" strokeWidth={2} />
              เปิดกล้องสแกน
            </button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-[#9aa3b2]">
              ใช้วิเคราะห์ผลลัพธ์เท่านั้น — ไม่เก็บรูปถาวร
            </p>
              </>
            ) : (
              <>
                {error ? (
                  <p className="mt-3 text-center text-[12px] text-[#E11D48]">{error}</p>
                ) : null}
                <p className="mt-4 rounded-[16px] bg-white/65 px-3.5 py-3 text-center text-[12px] leading-relaxed text-[#c5cdd9]/80 ring-1 ring-[#d5b16f]/18">
                  คูลดาวน์ 7 วัน · ดูผลเดิมได้ตลอดจนกว่าจะสแกนรอบใหม่
                </p>
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
      </div>

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

function Header({ onBack }: { onBack: () => void }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <PageBackButton onClick={onBack} className="justify-self-start" />
      <span className="justify-self-center" aria-hidden />
      <span aria-hidden className="justify-self-end" />
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
    <div className="fortune-glass mx-auto w-full max-w-[220px] overflow-hidden rounded-[18px]">
      <div className="flex items-center justify-between px-3 pt-2.5">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-[#d5b16f]">
          {label}
        </p>
        {url ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full p-1 text-[#9aa3b2] outline-none transition active:opacity-60"
            aria-label={`ลบรูป${label}`}
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onPick}
        className="relative mt-1.5 flex aspect-[3/4] w-full flex-col items-center justify-center gap-1.5 bg-[rgba(213,177,111,0.08)] outline-none transition active:opacity-85"
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
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/70 ring-1 ring-[#d5b16f]/30">
              <ImageIcon className="h-4 w-4 text-[#d5b16f]" strokeWidth={1.9} />
            </span>
            <span className="text-[12px] font-medium text-[#d5b16f]">
              อัปโหลด
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
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/70 px-2.5 py-1.5 text-[11px] font-medium text-[#d5b16f] ring-1 ring-[#d5b16f]/30"
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
