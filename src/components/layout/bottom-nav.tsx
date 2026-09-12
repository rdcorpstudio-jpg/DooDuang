"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isMaeShellPath } from "@/lib/mae-shell";
import { isPremiumUnlocked } from "@/lib/fortune/premium-unlock";

type NavTab = {
  href: string;
  label: string;
  src: string;
  match: (p: string) => boolean;
};

const HOME_TAB: NavTab = {
  href: "/",
  label: "หน้าแรก",
  src: "/images/icons/nav/home.webp",
  match: (p) => p === "/" || p === "/mae" || p.startsWith("/mae/"),
};

/** หน้าดวง — ฟรีป้ายดูดวง / สมัครแล้วป้ายพรีเมียม */
const FORTUNE_FREE_TAB: NavTab = {
  href: "/premium",
  label: "ดูดวง",
  src: "/images/icons/nav/horoscope.webp",
  match: (p) => p === "/premium",
};

const FORTUNE_PREMIUM_TAB: NavTab = {
  ...FORTUNE_FREE_TAB,
  label: "พรีเมียม",
};

const MENU_TAB: NavTab = {
  href: "/menu",
  label: "เมนู",
  src: "/images/icons/nav/menu.webp",
  match: (p) =>
    p.startsWith("/menu") ||
    p.startsWith("/reading") ||
    p.startsWith("/r/") ||
    p.startsWith("/preview/") ||
    p.startsWith("/premium/couple") ||
    p.startsWith("/premium/self-map") ||
    p.startsWith("/premium/year") ||
    p.startsWith("/premium/outlook") ||
    p.startsWith("/premium/week") ||
    p.startsWith("/premium/report"),
};

const ACCOUNT_TAB: NavTab = {
  href: "/dashboard",
  label: "บัญชี",
  src: "/images/icons/nav/account.webp",
  match: (p) =>
    p.startsWith("/dashboard") ||
    p.startsWith("/login") ||
    p.startsWith("/auth/") ||
    p.startsWith("/pricing"),
};

/** Bottom nav — หน้าแรก · ดูดวง · เมนู · บัญชี */
export function BottomNav() {
  const pathname = usePathname() || "/";
  const maeNav = isMaeShellPath(pathname);
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    function sync() {
      setPremium(isPremiumUnlocked());
    }
    sync();
    window.addEventListener("dooduang-premium-changed", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("dooduang-premium-changed", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  const tabs: NavTab[] = [
    HOME_TAB,
    premium ? FORTUNE_PREMIUM_TAB : FORTUNE_FREE_TAB,
    MENU_TAB,
    ACCOUNT_TAB,
  ];

  return (
    <nav
      className="bottom-nav relative z-40 shrink-0"
      aria-label="เมนูหลัก"
      style={{
        background: maeNav
          ? "linear-gradient(180deg, rgba(23,36,58,0.96) 0%, rgba(16,24,39,0.98) 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,245,255,0.97) 100%)",
        borderTop: maeNav
          ? "1px solid rgba(213,177,111,0.22)"
          : "1px solid rgba(180,160,230,0.22)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        paddingBottom: "max(0.2rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto grid max-w-[480px] grid-cols-4 gap-0 px-1 pt-1 pb-0.5">
        {tabs.map(({ href, label, src, match }) => {
          const active = match(pathname);

          return (
            <Link
              key={`${href}-${label}`}
              href={href}
              className={cn(
                "fortune-tap relative flex min-h-[2.75rem] flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1 outline-none transition-all duration-200",
                "focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45",
                active ? "text-[#d5b16f]" : "text-[#b9a077]"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center transition duration-200",
                  active && "dd-nav-icon-pop"
                )}
              >
                <Image
                  src={`${src}?v=navgold1`}
                  alt=""
                  width={active ? 28 : 24}
                  height={active ? 28 : 24}
                  unoptimized
                  className={cn(
                    "object-contain transition duration-200",
                    active
                      ? "opacity-100 drop-shadow-[0_2px_6px_rgba(180,140,60,0.35)]"
                      : "opacity-80"
                  )}
                  style={{
                    width: active ? 28 : 24,
                    height: active ? 28 : 24,
                  }}
                />
              </span>
              <span
                className={cn(
                  "text-[10px] leading-none tracking-wide",
                  active
                    ? "font-semibold text-[#d5b16f]"
                    : "font-medium text-[#c4a86a]"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
