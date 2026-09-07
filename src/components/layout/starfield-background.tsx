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
          filter: "blur(2px) saturate(1.1)",
          transform: "scale(1.02)",
        }}
      />
      {/* Light wash — keep art visible, text readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 70% at 50% 42%, rgba(8,10,24,0.16) 0%, rgba(8,10,24,0.06) 48%, rgba(8,10,24,0.32) 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-36"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(8,10,22,0.4))",
        }}
      />
    </div>
  );
}
