"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImageIcon, SwitchCamera, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Pick camera capture or gallery upload */
export function PhotoSourceSheet({
  open,
  onClose,
  onPicked,
  capture = "user",
}: {
  open: boolean;
  onClose: () => void;
  onPicked: (file: File) => void;
  /** Prefer front camera for face selfies */
  capture?: "user" | "environment";
}) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<"pick" | "camera">("pick");
  const [facing, setFacing] = useState<"user" | "environment">(capture);
  const [camError, setCamError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setMode("pick");
      setCamError(null);
      setFacing(capture);
    }
  }, [open, capture]);

  useEffect(() => {
    if (!open || mode !== "camera") return;

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
  }, [open, mode, facing]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  function handleClose() {
    stopCamera();
    setMode("pick");
    onClose();
  }

  function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    onPicked(file);
    handleClose();
  }

  function takePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror selfie when using front camera
    if (facing === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onPicked(file);
        handleClose();
      },
      "image/jpeg",
      0.92
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="ปิด"
        className="absolute inset-0 bg-[#050810]/72 backdrop-blur-[4px]"
        onClick={handleClose}
      />

      {mode === "pick" ? (
        <div className="relative z-[1] w-full max-w-[420px] rounded-t-[22px] border border-white/10 bg-[#121A2E] px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:rounded-[22px]">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
          <p className="text-center text-[15px] font-semibold text-white">
            เลือกแหล่งรูป
          </p>
          <p className="mt-1 text-center text-[12px] text-white/45">
            ถ่ายด้วยกล้อง หรืออัปโหลดจากคลังรูป
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setMode("camera")}
              className="flex flex-col items-center gap-2 rounded-[16px] border border-white/12 bg-white/[0.05] px-3 py-4 outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/30"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#46DDED]/15 text-[#46DDED]">
                <Camera className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <span className="text-[13px] font-semibold text-white">ถ่ายรูป</span>
            </button>
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="flex flex-col items-center gap-2 rounded-[16px] border border-white/12 bg-white/[0.05] px-3 py-4 outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/30"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#BB6CF0]/15 text-[#BB6CF0]">
                <ImageIcon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <span className="text-[13px] font-semibold text-white">อัปโหลด</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-full py-2.5 text-[13px] text-white/45"
          >
            <X className="h-3.5 w-3.5" />
            ยกเลิก
          </button>

          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      ) : (
        <div className="relative z-[1] flex h-[min(90dvh,640px)] w-full max-w-[420px] flex-col overflow-hidden rounded-t-[22px] border border-white/10 bg-[#0A1020] sm:rounded-[22px]">
          <div className="flex items-center justify-between gap-2 px-3 py-2.5">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setMode("pick");
                setCamError(null);
              }}
              className="rounded-full px-2 py-1 text-[13px] text-white/70"
            >
              กลับ
            </button>
            <p className="text-[14px] font-semibold text-white">ถ่ายรูป</p>
            <button
              type="button"
              aria-label="สลับกล้อง"
              onClick={() =>
                setFacing((f) => (f === "user" ? "environment" : "user"))
              }
              className="rounded-full p-1.5 text-white/70 hover:bg-white/10"
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
                  className="rounded-full bg-white/10 px-4 py-2 text-[13px] font-medium text-white"
                >
                  อัปโหลดจากคลังแทน
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
            {starting ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[13px] text-white/70">
                กำลังเปิดกล้อง…
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-center gap-6 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              disabled={!!camError || starting}
              onClick={takePhoto}
              className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/80 bg-white outline-none transition enabled:active:scale-95 disabled:opacity-40"
              aria-label="กดถ่าย"
            >
              <span className="h-12 w-12 rounded-full bg-white ring-2 ring-[#0A1020]" />
            </button>
          </div>

          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}

export function PhotoSlot({
  label,
  hint,
  badge,
  badgeTone = "required",
  previewUrl,
  onPick,
  onClear,
  error,
  className,
}: {
  label: string;
  hint?: string;
  badge: string;
  badgeTone?: "required" | "optional";
  previewUrl?: string | null;
  onPick: () => void;
  onClear?: () => void;
  error?: string | null;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <button
        type="button"
        onClick={onPick}
        className="relative block w-full overflow-hidden rounded-[16px] outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/45"
        style={{
          aspectRatio: "1 / 1",
          border: "1.5px dashed rgba(123,95,212,0.45)",
          background: "rgba(255,255,255,0.78)",
          boxShadow:
            "0 8px 22px rgba(80,55,150,0.12), inset 0 1px 0 rgba(255,255,255,0.95)",
        }}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#5B45B8]">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full text-[24px] font-light text-[#7B5FD4]"
              style={{
                border: "1.5px dashed rgba(123,95,212,0.4)",
                background: "rgba(155,127,232,0.12)",
              }}
            >
              +
            </span>
            <span className="px-2 text-center text-[12px] font-medium leading-snug text-[#3A3270]">
              ถ่ายหรืออัปโหลด
            </span>
          </span>
        )}
        <span
          className={cn(
            "absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold",
            badgeTone === "required"
              ? "bg-[#E11D48] text-white"
              : "bg-white text-[#5E5688] ring-1 ring-[#7B6BB0]/25"
          )}
        >
          {badge}
        </span>
      </button>
      <p className="mt-1.5 text-[13px] font-semibold text-[#241C4F]">{label}</p>
      {error ? (
        <p className="mt-0.5 text-[11px] leading-snug text-[#E11D48]">{error}</p>
      ) : hint ? (
        <p className="mt-0.5 text-[11px] leading-snug text-[#6B6490]">{hint}</p>
      ) : null}
      {previewUrl && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-1 text-[11px] text-[#7B5FD4] underline-offset-2 hover:underline"
        >
          ลบรูป
        </button>
      ) : null}
    </div>
  );
}

export function useObjectUrl(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  return url;
}
