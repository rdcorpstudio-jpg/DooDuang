"use client";

export function AstroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Zodiac wheel — intro-only accent over global starfield */}
      <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="astro-zodiac-wheel relative h-[340px] w-[340px] opacity-70">
          <div className="absolute inset-0 rounded-full border border-brand-purple-light/15" />
          <div className="absolute inset-4 rounded-full border border-dashed border-amber-200/8" />
          <div className="absolute inset-10 rounded-full border border-brand-purple-light/10" />
          <div className="absolute inset-[72px] rounded-full border border-white/5" />

          {Array.from({ length: 36 }).map((_, i) => (
            <span
              key={i}
              className="absolute top-1/2 left-1/2 h-[170px] w-px origin-bottom"
              style={{
                transform: `translate(-50%, -100%) rotate(${i * 10}deg)`,
                background: i % 3 === 0
                  ? "linear-gradient(to top, transparent, rgba(251,191,36,0.15), transparent)"
                  : "linear-gradient(to top, transparent, rgba(168,85,247,0.1), transparent)",
              }}
            />
          ))}

          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const r = 155;
            const x = 170 + r * Math.cos(angle);
            const y = 170 + r * Math.sin(angle);
            return (
              <span
                key={i}
                className="absolute h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-purple-light/25"
                style={{ left: x, top: y }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
