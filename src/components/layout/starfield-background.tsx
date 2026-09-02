"use client";

const STAR_DUST = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  top: (i * 11.3) % 98,
  left: (i * 17.1 + 3) % 98,
  size: i % 7 === 0 ? 2 : i % 11 === 0 ? 1.5 : 1,
  opacity: 0.18 + (i % 5) * 0.1,
}));

const BRIGHT_STARS = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  top: (i * 19 + 7) % 92,
  left: (i * 27 + 11) % 92,
  duration: 2.2 + (i % 4) * 0.65,
  delay: (i * 0.33) % 4,
  gold: i % 3 === 0,
  size: i % 5 === 0 ? 2.5 : 2,
}));

export function StarfieldBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-brand-purple-deep via-[#2a0648] to-[#14032a]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_15%,rgba(168,85,247,0.35),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_85%_75%,rgba(88,28,135,0.28),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_12%_55%,rgba(192,132,252,0.15),transparent_50%)]" />

      {STAR_DUST.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
          }}
        />
      ))}

      {BRIGHT_STARS.map((star) => (
        <span
          key={star.id}
          className={`absolute rounded-full animate-twinkle ${star.gold ? "bg-amber-200/70" : "bg-purple-100/60"}`}
          style={
            {
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: star.size,
              height: star.size,
              "--twinkle-duration": `${star.duration}s`,
              "--twinkle-delay": `${star.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
