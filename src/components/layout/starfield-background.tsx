"use client";

import { usePathname } from "next/navigation";
import { isMaeCelestialPath } from "@/lib/mae-shell";
import {
  MaePageBackground,
  MAE_PAGE_BG_SRC,
} from "@/components/layout/mae-page-background";

/**
 * App sky — crisp on top, light clear blur down the page (no white wash).
 * Main `/` Mae landing owns its video; `/mae` Guanyin uses hero video;
 * premium / menu / tarot / reading use Mae night plate.
 */

const GUANYIN_SKY = {
  backgroundImage: "url(/images/bg/app-sky.webp?v=guanyin2)",
  backgroundSize: "cover" as const,
  backgroundPosition: "55% 0%",
  backgroundRepeat: "no-repeat" as const,
};

export function StarfieldBackground() {
  const pathname = usePathname() || "/";
  const isMaeHome = pathname === "/" || pathname === "";
  const isGuanyinHome =
    pathname === "/mae" || pathname.startsWith("/mae/");
  const isLoginAuth =
    pathname.startsWith("/login") || pathname.startsWith("/auth");
  const isMenuGate = pathname === "/menu" || pathname.startsWith("/menu/");
  const isReadingAny = pathname.startsWith("/reading");
  const isPremiumShell = pathname.startsWith("/premium");

  if (isMaeHome) return null;

  const celestial = isMaeCelestialPath(pathname);
  /** Premium / menu / reading — Mae night plate */
  const useMaePlate =
    isMenuGate ||
    isPremiumShell ||
    isReadingAny ||
    (celestial && !isLoginAuth && !isGuanyinHome);

  if (useMaePlate) {
    return (
      <div
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden [&_*]:pointer-events-none"
        aria-hidden
      >
        <MaePageBackground priority={isPremiumShell || isReadingAny} mode="fill" />
      </div>
    );
  }

  // Login / auth — same Mae night plate as home
  if (isLoginAuth) {
    return (
      <div
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden [&_*]:pointer-events-none"
        aria-hidden
      >
        <MaePageBackground priority mode="fill" scrollBlur={false} />
      </div>
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
          ...GUANYIN_SKY,
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

/** Soft star overlay — disabled when Mae plate already has stars in art */
export function SoftSkyStarsOverlay() {
  return null;
}

export { MAE_PAGE_BG_SRC };
