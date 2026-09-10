"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FortuneIcon,
  type FortuneIconName,
} from "@/components/fortune/fortune-icon";
import { cn } from "@/lib/utils";

const TABS: Array<{
  href: string;
  label: string;
  icon: FortuneIconName;
  match: (p: string) => boolean;
}> = [
  {
    href: "/",
    label: "หน้าแรก",
    icon: "home",
    match: (p) => p === "/" || p === "/mae" || p.startsWith("/mae/"),
  },
  {
    href: "/reading",
    label: "ดูดวง",
    icon: "crystal-ball",
    match: (p) => p.startsWith("/reading") || p.startsWith("/r/"),
  },
  {
    href: "/premium",
    label: "พรีเมียม",
    icon: "sparkle",
    match: (p) => p.startsWith("/premium"),
  },
  {
    href: "/dashboard",
    label: "บัญชี",
    icon: "profile",
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

  return (
    <nav
      className="bottom-nav relative z-40 shrink-0"
      aria-label="เมนูหลัก"
      style={{
        background: pathname.startsWith("/mae")
          ? "linear-gradient(180deg, rgba(23,36,58,0.98) 0%, rgba(16,24,39,0.99) 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,245,255,0.97) 100%)",
        borderTop: pathname.startsWith("/mae")
          ? "1px solid rgba(213,177,111,0.22)"
          : "1px solid rgba(180,160,230,0.22)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        paddingBottom: "max(0.2rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto grid max-w-[480px] grid-cols-4 gap-0 px-1 pt-1 pb-0.5">
        {TABS.map(({ href, label, icon, match }) => {
          const active = match(pathname);
          const maeTone = pathname.startsWith("/mae");

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "fortune-tap relative flex min-h-[2.6rem] flex-col items-center justify-center gap-0 rounded-xl px-0.5 py-1 outline-none transition-all duration-200",
                maeTone
                  ? "focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
                  : "focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/35",
                active
                  ? maeTone
                    ? "text-[#d5b16f]"
                    : "text-[#5B45B8]"
                  : maeTone
                    ? "text-[#8a94a3]"
                    : "text-[#8A82B0]"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full transition duration-200",
                  active &&
                    (maeTone
                      ? "dd-nav-icon-pop bg-[#d5b16f]/18 ring-1 ring-[#d5b16f]/35"
                      : "dd-nav-icon-pop bg-[#7B5FD4]/18 ring-1 ring-[#9B7FE8]/35")
                )}
              >
                <FortuneIcon
                  name={icon}
                  size={active ? 22 : 20}
                  plain={maeTone}
                  className={cn(
                    "transition duration-200",
                    maeTone &&
                      (active ? "mae-nav-icon-active" : "mae-nav-icon"),
                    active ? "opacity-100" : maeTone ? "opacity-70" : "opacity-75"
                  )}
                />
              </span>
              <span
                className={cn(
                  "text-[10px] leading-none tracking-wide",
                  active
                    ? maeTone
                      ? "font-semibold text-[#d5b16f]"
                      : "font-semibold text-[#5B45B8]"
                    : maeTone
                      ? "font-medium text-[#9aa3b2]"
                      : "font-medium"
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
