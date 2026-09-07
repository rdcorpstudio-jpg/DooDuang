"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, ScrollText, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  {
    href: "/",
    label: "หน้าแรก",
    Icon: Home,
    match: (p: string) => p === "/",
  },
  {
    href: "/reading",
    label: "ดูดวง",
    Icon: ScrollText,
    match: (p: string) => p.startsWith("/reading") || p.startsWith("/r/"),
  },
  {
    href: "/premium",
    label: "พรีเมียม",
    Icon: Sparkles,
    match: (p: string) => p.startsWith("/premium"),
  },
  {
    href: "/dashboard",
    label: "บัญชี",
    Icon: UserRound,
    match: (p: string) =>
      p.startsWith("/dashboard") ||
      p.startsWith("/login") ||
      p.startsWith("/pricing"),
  },
] as const;

/** Quiet luxury tab bar */
export function BottomNav() {
  const pathname = usePathname() || "/";

  return (
    <nav
      className="bottom-nav relative z-40 shrink-0 border-t border-white/[0.07]"
      aria-label="เมนูหลัก"
      style={{
        background: "rgba(12, 16, 32, 0.94)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        paddingBottom: "max(0.45rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto grid max-w-[480px] grid-cols-4 gap-0.5 px-2 pt-1.5">
        {TABS.map(({ href, label, Icon, match }) => {
          const active = match(pathname);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-2xl px-1 py-2 outline-none transition-colors duration-150",
                "active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#D4AF55]/35",
                active ? "text-[#F3F5FA]" : "text-[#8A97AE]"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-150",
                  active && "bg-[#D4AF55]/14"
                )}
              >
                <Icon
                  className={cn(
                    "h-[19px] w-[19px]",
                    active ? "text-[#E4C56A]" : "text-current"
                  )}
                  strokeWidth={active ? 2.2 : 1.7}
                />
              </span>
              <span
                className={cn(
                  "text-[10px] tracking-wide",
                  active ? "font-semibold text-[#E4C56A]" : "font-medium"
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
