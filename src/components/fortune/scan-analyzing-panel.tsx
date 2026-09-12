"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const FACE_STEPS = [
  "อ่านโครงหน้าและสัดส่วน",
  "วิเคราะห์โหงวเฮ้งด้านหน้า",
  "เทียบมุมด้านข้าง",
  "สรุปคำทำนายด้วย AI",
] as const;

const PALM_STEPS = [
  "ประมาณธาตุมือและรูปฝ่ามือ",
  "อ่านความหนาแน่นเส้นชีวิต",
  "วิเคราะห์เส้นหัวใจและเส้นสมอง",
  "สรุปคำทำนายด้วย AI",
] as const;

function ScanFrame({
  src,
  className,
  wide,
}: {
  src: string | null;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "scan-analyze-frame relative overflow-hidden bg-[rgba(213,177,111,0.12)] ring-1 ring-[#d5b16f]/35",
        wide ? "h-28 w-28 rounded-[20px]" : "h-24 w-20 rounded-[16px]",
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : null}
      <span className="scan-analyze-corner scan-analyze-corner-tl" aria-hidden />
      <span className="scan-analyze-corner scan-analyze-corner-tr" aria-hidden />
      <span className="scan-analyze-corner scan-analyze-corner-bl" aria-hidden />
      <span className="scan-analyze-corner scan-analyze-corner-br" aria-hidden />
      <span className="scan-analyze-beam" aria-hidden />
    </div>
  );
}

/** Animated AI scan loader for face / palm analysis */
export function ScanAnalyzingPanel({
  mode,
  photoUrl,
  photoRightUrl,
}: {
  mode: "face" | "palm";
  photoUrl: string | null;
  photoRightUrl?: string | null;
}) {
  const steps = mode === "face" ? FACE_STEPS : PALM_STEPS;
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const started = Date.now();
    const duration = 9000;
    const tick = window.setInterval(() => {
      const t = Math.min(1, (Date.now() - started) / duration);
      const eased = 1 - Math.pow(1 - t, 1.55);
      setProgress(Math.min(94, 8 + eased * 86));
      setStepIndex(Math.min(steps.length - 1, Math.floor(t * steps.length)));
    }, 80);
    return () => window.clearInterval(tick);
  }, [steps.length]);

  return (
    <div className="mt-8 flex flex-1 flex-col items-center text-center">
      {mode === "face" ? (
        <div className="flex items-center gap-2.5">
          <ScanFrame src={photoUrl} />
          <ScanFrame src={photoRightUrl ?? null} className="scan-analyze-delay" />
        </div>
      ) : (
        <ScanFrame src={photoUrl} wide />
      )}

      <p className="mt-5 text-[15px] font-semibold text-[#f7f4ec]">
        กำลังวิเคราะห์ด้วย AI…
      </p>
      <p
        key={steps[stepIndex]}
        className="scan-analyze-step mt-2 max-w-[17rem] text-[13px] font-medium leading-snug text-[#d5b16f]"
      >
        {steps[stepIndex]}
      </p>

      <ul className="mt-4 w-full max-w-[17.5rem] space-y-1.5 text-left">
        {steps.map((label, i) => {
          const done = i < stepIndex;
          const active = i === stepIndex;
          return (
            <li
              key={label}
              className={cn(
                "flex items-center gap-2 rounded-[12px] px-2.5 py-1.5 text-[12px] transition-colors duration-300",
                active && "bg-[rgba(213,177,111,0.14)] text-[#e8d19a]",
                done && "text-[#d5b16f]",
                !done && !active && "text-[#9aa3b2]"
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
                  done && "bg-[#d5b16f] text-[#101827]",
                  active && "scan-analyze-dot bg-[#d5b16f] text-[#101827]",
                  !done && !active && "bg-[rgba(213,177,111,0.2)] text-transparent"
                )}
              >
                {done ? "✓" : active ? "•" : ""}
              </span>
              <span className={cn(active && "font-semibold")}>{label}</span>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 h-1.5 w-44 overflow-hidden rounded-full bg-[rgba(213,177,111,0.16)]">
        <div
          className="scan-analyze-bar h-full rounded-full bg-gradient-to-r from-[#b8924f] via-[#d5b16f] to-[#C9A227]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-[#9aa3b2]">
        {mode === "face"
          ? "อ่านโหงวเฮ้งจากรูปหน้าและด้านข้าง"
          : "อ่านลายมือจากรูปฝ่ามือ"}
      </p>
    </div>
  );
}
