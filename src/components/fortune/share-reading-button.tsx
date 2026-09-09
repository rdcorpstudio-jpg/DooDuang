"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import type {
  FaceReadingPack,
  PalmReadingPack,
} from "@/lib/fortune/scan/types";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

function appOrigin() {
  if (typeof window !== "undefined") return window.location.origin;
  return SITE_URL;
}

export function buildFaceShareText(pack: FaceReadingPack) {
  const { shapeLabel, shapeCopy, aspects } = pack;
  const aspectLines = aspects
    .map(
      (a) =>
        `• ${a.copy.title}: ${a.copy.blurb}\n  ${a.copy.body}${
          a.copy.highlights.length
            ? `\n  ${a.copy.highlights.map((h) => `· ${h}`).join(" ")}`
            : ""
        }`
    )
    .join("\n\n");

  return [
    `ผลโหงวเฮ้งจาก DooDuang`,
    `${shapeLabel} — ${shapeCopy.title}`,
    shapeCopy.blurb,
    "",
    shapeCopy.body,
    "",
    `จุดแข็ง: ${shapeCopy.strengths.join(" · ")}`,
    `ระวัง: ${shapeCopy.watch}`,
    `คำแนะนำ: ${shapeCopy.advice}`,
    "",
    "จังหวะวันนี้",
    aspectLines,
    "",
    `ลองดูโหงวเฮ้งที่ ${appOrigin()}/reading/face`,
  ].join("\n");
}

export function buildPalmShareText(pack: PalmReadingPack) {
  const { natureLabel, natureCopy, lines } = pack;
  const lineBlocks = lines
    .map(
      (line) =>
        `• ${line.label}: ${line.copy.title}\n  ${line.copy.blurb}\n  ${line.copy.body}\n  ความหมาย: ${line.copy.meaning}\n  คำแนะนำ: ${line.copy.advice}`
    )
    .join("\n\n");

  return [
    `ผลอ่านลายมือจาก DooDuang`,
    `ธาตุมือ: ${natureLabel}`,
    "",
    natureCopy.personality,
    `จุดแข็ง: ${natureCopy.strength}`,
    `เงา: ${natureCopy.shadow}`,
    `คำแนะนำ: ${natureCopy.advice}`,
    "",
    "เส้นหลัก",
    lineBlocks,
    "",
    `ลองอ่านลายมือที่ ${appOrigin()}/reading/palm`,
  ].join("\n");
}

async function shareOrCopy(title: string, text: string) {
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title, text });
      return "shared" as const;
    }
  } catch (err) {
    // User cancelled share sheet
    if (err instanceof DOMException && err.name === "AbortError") {
      return "cancelled" as const;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return "copied" as const;
  } catch {
    return "failed" as const;
  }
}

export function ShareReadingButton({
  title,
  text,
  className,
  variant = "secondary",
}: {
  title: string;
  text: string;
  className?: string;
  variant?: "primary" | "secondary";
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function onShare() {
    const result = await shareOrCopy(title, text);
    if (result === "copied") {
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2200);
    } else if (result === "failed") {
      setStatus("failed");
      window.setTimeout(() => setStatus("idle"), 2200);
    }
  }

  const label =
    status === "copied"
      ? "คัดลอกข้อความแล้ว"
      : status === "failed"
        ? "แชร์ไม่สำเร็จ"
        : "แชร์ผล";

  return (
    <button
      type="button"
      onClick={() => void onShare()}
      className={cn(
        "no-sky-lift inline-flex items-center justify-center gap-2 rounded-full py-3 text-[14px] font-semibold outline-none transition active:scale-[0.99]",
        variant === "primary"
          ? "dd-gold-glass-btn w-full text-[#5C4810]"
          : "w-full bg-white/70 text-[#5B45B8] ring-1 ring-[#9B7FE8]/30",
        className
      )}
    >
      {status === "copied" ? (
        <Check className="h-4 w-4" strokeWidth={2} />
      ) : (
        <Share2 className="h-4 w-4" strokeWidth={2} />
      )}
      {label}
    </button>
  );
}
