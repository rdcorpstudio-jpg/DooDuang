"use client";

/**
 * App sky — illustrated temple night scene, softly blurred behind UI.
 */

export function StarfieldBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden [&_*]:pointer-events-none"
      aria-hidden
    >
      <div
        className="absolute inset-[-18px]"
        style={{
          backgroundImage: "url(/images/bg/app-sky.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          filter: "blur(5px) saturate(1.08)",
          transform: "scale(1.03)",
        }}
      />
      {/* Soft center wash so cards/text stay readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 70% at 50% 42%, rgba(8,10,24,0.28) 0%, rgba(8,10,24,0.12) 45%, rgba(8,10,24,0.42) 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(8,10,22,0.55))",
        }}
      />
    </div>
  );
}
