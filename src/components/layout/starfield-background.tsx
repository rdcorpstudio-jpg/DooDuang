"use client";

import { usePathname } from "next/navigation";
import { isMaeCelestialPath } from "@/lib/mae-shell";

/**
 * App sky — crisp on top, light clear blur down the page (no white wash).
 * Main `/` Mae landing owns its video; `/mae` Guanyin uses hero video; else celestial/Guanyin plate.
 */

const GUANYIN_SKY = {
  backgroundImage: "url(/images/bg/app-sky.webp?v=guanyin2)",
  backgroundSize: "cover" as const,
  backgroundPosition: "55% 0%",
  backgroundRepeat: "no-repeat" as const,
};

/** Free + premium shell — mountain night plate (dark sky / gold horizon) */
const CELESTIAL_SKY = {
  backgroundImage: "url(/images/bg/mae-mountain-night.webp?v=mtn1)",
  backgroundSize: "cover" as const,
  backgroundPosition: "50% 18%",
  backgroundRepeat: "no-repeat" as const,
};

export function StarfieldBackground() {
  const pathname = usePathname() || "/";
  const isMaeHome = pathname === "/" || pathname === "";
  const isGuanyinHome =
    pathname === "/mae" || pathname.startsWith("/mae/");

  // Mae main landing renders its own full-bleed video
  if (isMaeHome) return null;

  const celestial = isMaeCelestialPath(pathname);
  const sky = celestial ? CELESTIAL_SKY : GUANYIN_SKY;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden [&_*]:pointer-events-none"
      aria-hidden
    >
      {isGuanyinHome ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "55% 20%" }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/bg/app-sky.webp"
        >
          <source src="/videos/home-hero.mp4?v=wind0908" type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0" style={sky} />
      )}

      {/* Clear soft blur only — fades in from top → bottom, no white veil */}
      <div
        className="absolute inset-0 origin-center scale-[1.1]"
        style={{
          ...(isGuanyinHome ? GUANYIN_SKY : sky),
          filter: "blur(10px) saturate(1.02)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, transparent 12%, rgba(0,0,0,0.35) 38%, rgba(0,0,0,0.75) 68%, #000 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, transparent 12%, rgba(0,0,0,0.35) 38%, rgba(0,0,0,0.75) 68%, #000 100%)",
        }}
      />
    </div>
  );
}
