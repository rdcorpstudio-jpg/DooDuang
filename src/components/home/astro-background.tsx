"use client";

/** Soft glow only — zodiac chart lives in global StarfieldBackground */
export function AstroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute left-1/2 top-[40%] h-[45%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,160,144,0.12)_0%,transparent_70%)] blur-2xl" />
    </div>
  );
}
