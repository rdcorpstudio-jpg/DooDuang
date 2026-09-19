"use client";

import { usePathname } from "next/navigation";
import { isMaeCelestialPath } from "@/lib/mae-shell";

/**
 * App sky — crisp on top, light clear blur down the page (no white wash).
 * Main `/` Mae home owns its video; `/mae` Guanyin uses hero video;
 * premium / menu / tarot use night-sky photo plate.
 */

const GUANYIN_SKY = {
  backgroundImage: "url(/images/bg/app-sky.webp?v=guanyin2)",
  backgroundSize: "cover" as const,
  backgroundPosition: "55% 0%",
  backgroundRepeat: "no-repeat" as const,
};

const NIGHT_SKY_PLATE = {
  backgroundColor: "#050b14",
  backgroundImage: "url(/images/brand/night-sky-plate.png?v=sky1)",
  backgroundSize: "cover" as const,
  backgroundPosition: "center center",
  backgroundRepeat: "no-repeat" as const,
};

/** Photo night sky plate — deep navy + soft stars */
function NightSkyPlate() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0" style={NIGHT_SKY_PLATE} />
    </div>
  );
}

export function StarfieldBackground() {
  const pathname = usePathname() || "/";
  const isMaeHome = pathname === "/" || pathname === "";
  const isGuanyinHome =
    pathname === "/mae" || pathname.startsWith("/mae/");
  const isLoginAuth =
    pathname.startsWith("/login") || pathname.startsWith("/auth");
  const isMenuGate = pathname === "/menu" || pathname.startsWith("/menu/");
  const isPayPage = pathname.startsWith("/premium/pay");
  const isTarotPage =
    pathname === "/reading/tarot" || pathname.startsWith("/reading/tarot/");
  const isReadingWizard =
    pathname === "/reading" || pathname === "/reading/";
  const isPremiumShell =
    pathname.startsWith("/premium") && !pathname.startsWith("/premium/pay");

  if (isMaeHome) return null;

  const celestial = isMaeCelestialPath(pathname);
  /** Premium / menu / reading wizard — night sky (never Guanyin flash) */
  const useCodedNight =
    isMenuGate ||
    isPremiumShell ||
    isPayPage ||
    isReadingWizard ||
    (celestial &&
      !isLoginAuth &&
      !isTarotPage &&
      !isGuanyinHome);

  // Daily tarot — night sky plate
  if (isTarotPage) {
    return (
      <div
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden [&_*]:pointer-events-none"
        aria-hidden
      >
        <NightSkyPlate />
      </div>
    );
  }

  // Premium / menu / celestial shell — night sky plate
  if (useCodedNight) {
    return (
      <div
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden [&_*]:pointer-events-none"
        aria-hidden
      >
        <NightSkyPlate />
      </div>
    );
  }

  // Login / auth — page owns its own hero art
  if (isLoginAuth) {
    return (
      <div
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden bg-[#02060c] [&_*]:pointer-events-none"
        aria-hidden
      />
    );
  }

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
        <div className="absolute inset-0" style={GUANYIN_SKY} />
      )}

      <div
        className="absolute inset-0 origin-center scale-[1.1]"
        style={{
          ...(isGuanyinHome ? GUANYIN_SKY : GUANYIN_SKY),
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

/** Soft stars off when night-sky photo plate already has stars */
export function SoftSkyStarsOverlay() {
  return null;
}
