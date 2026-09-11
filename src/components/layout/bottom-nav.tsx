"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isMaeShellPath } from "@/lib/mae-shell";

const TABS: Array<{
  href: string;
  label: string;
  src: string;
  match: (p: string) => boolean;
}> = [
  {
    href: "/",
    label: "หน้าแรก",
    src: "/images/icons/home.png",
    match: (p) => p === "/" || p === "/mae" || p.startsWith("/mae/"),
  },
  {
    href: "/reading",
    label: "ดูดวง",
    src: "/images/icons/crystal-ball.png",
    match: (p) => p.startsWith("/reading") || p.startsWith("/r/"),
  },
  {
    href: "/premium",
    label: "พรีเมียม",
    src: "/images/icons/sparkle.png",
    match: (p) => p.startsWith("/premium"),
  },
  {
    href: "/dashboard",
    label: "บัญชี",
    src: "/images/icons/profile.png",
    match: (p) =>
      p.startsWith("/dashboard") ||
      p.startsWith("/login") ||
      p.startsWith("/auth/") ||
      p.startsWith("/pricing"),
  },
];

/** Bottom nav — compact for phone screens */
export function BottomNav() {
  const pathname = usePathname() || "/";
  const maeNav = isMaeShellPath(pathname);

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
        {TABS.map(({ href, label, src, match }) => {
          const active = match(pathname);

          return (
            <Link
              key={href}
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
                  src={`${src}?v=gold3d`}
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
