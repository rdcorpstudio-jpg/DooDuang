"use client";

import { usePathname } from "next/navigation";

/**
 * App sky — home uses looping hero video; other routes keep Guanyin still.
 */

export function StarfieldBackground() {
  const pathname = usePathname() || "/";
  const isHome = pathname === "/";

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden [&_*]:pointer-events-none"
      aria-hidden
    >
      {isHome ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "55% 20%" }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/bg/app-sky.jpg"
        >
          <source src="/videos/home-hero.mp4?v=wind0908" type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/images/bg/app-sky.jpg?v=guanyin2)",
            backgroundSize: "cover",
            backgroundPosition: "55% 0%",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
    </div>
  );
}
