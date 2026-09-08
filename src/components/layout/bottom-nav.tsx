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
    match: (p) => p === "/",
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
      p.startsWith("/pricing"),
  },
];

/** Bottom nav — home mockup labels */
export function BottomNav() {
  const pathname = usePathname() || "/";

  return (
    <nav
      className="bottom-nav relative z-40 shrink-0"
      aria-label="เมนูหลัก"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,245,255,0.97) 100%)",
        borderTop: "1px solid rgba(180,160,230,0.22)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto grid max-w-[480px] grid-cols-4 gap-0.5 px-1.5 pt-1.5">
        {TABS.map(({ href, label, icon, match }) => {
          const active = match(pathname);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-2xl px-1 py-1 outline-none transition-all duration-200",
                "active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/35",
                active ? "text-[#5B45B8]" : "text-[#8A82B0]"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition",
                  active && "bg-[#7B5FD4]/18 ring-1 ring-[#9B7FE8]/35"
                )}
              >
                <FortuneIcon
                  name={icon}
                  size={active ? 30 : 28}
                  className={cn(
                    "transition duration-200",
                    active ? "opacity-100" : "opacity-75"
                  )}
                />
              </span>
              <span
                className={cn(
                  "text-[10px] tracking-wide",
                  active ? "font-semibold text-[#5B45B8]" : "font-medium"
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
