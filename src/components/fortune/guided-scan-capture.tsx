"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImageIcon, SwitchCamera, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ScanGuideMode = "face" | "palm";

type CaptureStep = {
  id: string;
  title: string;
  hint: string;
};

type Props = {
  open: boolean;
  mode: ScanGuideMode;
  onClose: () => void;
  /** Face: [front, side]. Palm: [one]. */
  onCaptured: (files: File[]) => void;
};

const MODE_STEPS: Record<ScanGuideMode, CaptureStep[]> = {
  face: [
    {
      id: "front",
      title: "ถ่ายด้านหน้า",
      hint: "หันหน้าตรงเข้าหากล้อง ให้เห็นใบหน้าเต็ม",
    },
    {
      id: "side",
      title: "ถ่ายด้านข้าง",
      hint: "หันข้างให้กล้องเห็นโปรไฟล์ชัด",
    },
  ],
  palm: [
    {
      id: "palm",
      title: "ถ่ายฝ่ามือ",
      hint: "หงายฝ่ามือให้ชัด แสงสม่ำเสมอ",
    },
  ],
};

const DEFAULT_FACING: Record<ScanGuideMode, "user" | "environment"> = {
  face: "user",
  palm: "environment",
};

/** Full-screen camera capture for face / palm scan */
export function GuidedScanCapture({
  open,
  mode,
  onClose,
  onCaptured,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const shotsRef = useRef<File[]>([]);

  const steps = MODE_STEPS[mode];
  const [stepIndex, setStepIndex] = useState(0);
  const [facing, setFacing] = useState<"user" | "environment">(
    DEFAULT_FACING[mode]
  );
  const [camError, setCamError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setCamError(null);
      setFacing(DEFAULT_FACING[mode]);
      setStepIndex(0);
      shotsRef.current = [];
      return;
    }
    setFacing(DEFAULT_FACING[mode]);
    setStepIndex(0);
    shotsRef.current = [];
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setStarting(true);
    setCamError(null);

    (async () => {
      try {
        stopCamera();
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 1280 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
      } catch {
        if (!cancelled) {
          setCamError(
            "เปิดกล้องไม่ได้ — อนุญาตสิทธิ์กล้อง หรือใช้อัปโหลดจากคลังรูปแทน"
          );
        }
      } finally {
        if (!cancelled) setStarting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, facing]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  function handleClose() {
    stopCamera();
    shotsRef.current = [];
    setStepIndex(0);
    onClose();
  }

  function finishWithShot(file: File) {
    const nextShots = [...shotsRef.current, file];
    shotsRef.current = nextShots;

    if (nextShots.length >= steps.length) {
      onCaptured(nextShots);
      handleClose();
      return;
    }

    setStepIndex(nextShots.length);
  }

  function takePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facing === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    const step = steps[stepIndex];
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File(
          [blob],
          `scan-${mode}-${step.id}-${Date.now()}.jpg`,
          { type: "image/jpeg" }
        );
        finishWithShot(file);
      },
      "image/jpeg",
      0.92
    );
  }

  if (!open) return null;

  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const multi = steps.length > 1;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#050810]">
      <div className="relative flex h-full w-full max-w-[480px] flex-col">
        <div className="relative z-[2] flex items-center justify-between gap-2 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1.5 text-[13px] text-white/85 backdrop-blur-sm"
          >
            <X className="h-3.5 w-3.5" />
            ปิด
          </button>
          <div className="min-w-0 text-center">
            <p className="text-[14px] font-semibold text-white">{step.title}</p>
            {multi ? (
              <p className="mt-0.5 text-[11px] text-white/55">
                ขั้นที่ {stepIndex + 1}/{steps.length}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="สลับกล้อง"
            onClick={() =>
              setFacing((f) => (f === "user" ? "environment" : "user"))
            }
            className="rounded-full bg-black/35 p-2 text-white/85 backdrop-blur-sm"
          >
            <SwitchCamera className="h-4 w-4" strokeWidth={1.9} />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 bg-black">
          {camError ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-[13px] leading-relaxed text-white/70">
                {camError}
              </p>
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2.5 text-[13px] font-medium text-white"
              >
                <ImageIcon className="h-4 w-4" />
                อัปโหลดจากคลัง
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={cn(
                "h-full w-full object-cover",
                facing === "user" && "scale-x-[-1]"
              )}
            />
          )}

          {!camError && !starting ? (
            <p className="pointer-events-none absolute inset-x-4 bottom-4 z-[2] rounded-[14px] bg-black/45 px-3 py-2 text-center text-[12px] leading-snug text-white/85 backdrop-blur-sm">
              {step.hint}
            </p>
          ) : null}

          {starting ? (
            <div className="absolute inset-0 z-[3] flex items-center justify-center bg-black/45 text-[13px] text-white/75">
              กำลังเปิดกล้อง…
            </div>
          ) : null}
        </div>

        <div className="relative z-[2] flex items-center justify-between gap-4 bg-[#0A1020] px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="flex w-16 flex-col items-center gap-1 text-white/70 outline-none"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
              <ImageIcon className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span className="text-[10px]">คลังรูป</span>
          </button>

          <button
            type="button"
            disabled={!!camError || starting}
            onClick={takePhoto}
            className="flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full border-[3px] border-white/85 bg-white outline-none transition enabled:active:scale-95 disabled:opacity-40"
            aria-label="กดถ่าย"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#d5b16f] to-[#b8924f]">
              <Camera className="h-6 w-6 text-white" strokeWidth={1.9} />
            </span>
          </button>

          <span className="w-16" aria-hidden />
        </div>

        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          multiple={mode === "face"}
          className="hidden"
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []).filter((f) =>
              f.type.startsWith("image/")
            );
            e.target.value = "";
            if (picked.length === 0) return;

            const need = steps.length - shotsRef.current.length;
            const batch = picked.slice(0, Math.max(need, 1));
            for (const file of batch) {
              finishWithShot(file);
            }
          }}
        />
      </div>
    </div>
  );
}
