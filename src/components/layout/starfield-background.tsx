"use client";

/**
 * Shared app sky — same navy starfield + soft nebula as the home screen.
 */

const HOME_BG = [
  "radial-gradient(ellipse 80% 58% at 90% 0%, rgba(180,95,200,0.48) 0%, transparent 54%)",
  "radial-gradient(ellipse 55% 40% at 10% 18%, rgba(70,80,160,0.38) 0%, transparent 52%)",
  "radial-gradient(ellipse 70% 48% at 50% 42%, rgba(70,55,140,0.28) 0%, transparent 62%)",
  "radial-gradient(ellipse 95% 45% at 50% 100%, rgba(28,24,70,0.55) 0%, transparent 58%)",
  "linear-gradient(180deg, #16143a 0%, #12102e 45%, #0e0c24 100%)",
].join(", ");

const STAR_DUST = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  top: (i * 7.1 + 2.3) % 100,
  left: (i * 13.7 + 5.1) % 100,
  size: i % 11 === 0 ? 2.2 : i % 5 === 0 ? 1.5 : 1,
      opacity: 0.32 + (i % 7) * 0.1,
}));

const BRIGHT_STARS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  top: (i * 17.3 + 6) % 96,
  left: (i * 23.9 + 8) % 96,
  size: i % 4 === 0 ? 2.6 : 1.7,
  duration: 2.4 + (i % 5) * 0.55,
  delay: (i * 0.37) % 4,
}));

export function StarfieldBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden [&_*]:pointer-events-none"
      aria-hidden
    >
      <div className="absolute inset-0" style={{ backgroundImage: HOME_BG }} />

      {STAR_DUST.map((s) => (
        <span
          key={`d-${s.id}`}
          className="absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity * 0.85,
            backgroundColor: s.id % 5 === 0 ? "#c8d4ff" : undefined,
          }}
        />
      ))}

      {BRIGHT_STARS.map((star) => (
        <span
          key={`b-${star.id}`}
          className="absolute rounded-full bg-white animate-twinkle"
          style={
            {
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: star.size,
              height: star.size,
              boxShadow: "0 0 6px rgba(255,255,255,0.65)",
              "--twinkle-duration": `${star.duration}s`,
              "--twinkle-delay": `${star.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}

      <div className="intro-mesh absolute inset-0">
        <span className="intro-mesh-blob intro-mesh-blob-a" />
        <span className="intro-mesh-blob intro-mesh-blob-b" />
        <span className="intro-mesh-blob intro-mesh-blob-c" />
        <span className="intro-mesh-blob intro-mesh-blob-d" />
        <span className="intro-mesh-vignette" />
      </div>

      <div
        className="absolute inset-0 z-[2]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 58%, rgba(10,10,28,0.28) 100%)",
        }}
      />
    </div>
  );
}
