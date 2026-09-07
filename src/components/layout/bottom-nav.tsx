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

/** Gold-frame tab bar */
export function BottomNav() {
  const pathname = usePathname() || "/";

  return (
    <nav
      className="bottom-nav relative z-40 shrink-0"
      aria-label="เมนูหลัก"
      style={{
        background:
          "linear-gradient(180deg, rgba(22,16,48,0.9) 0%, rgba(12,10,28,0.96) 100%)",
        borderTop: "1px solid rgba(228,197,106,0.28)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
        boxShadow: "inset 0 1px 0 rgba(255,236,190,0.08)",
      }}
    >
      <div className="mx-auto grid max-w-[480px] grid-cols-4 gap-0.5 px-2.5 pt-2">
        {TABS.map(({ href, label, Icon, match }) => {
          const active = match(pathname);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 outline-none transition-all duration-200",
                "active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#E4C56A]/4",
                active ? "text-[#F5F2EA]" : "text-[#9AA3C0]"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-200",
                  active &&
                    "bg-[rgba(228,197,106,0.14)] ring-1 ring-[rgba(228,197,106,0.4)]"
                )}
              >
                <Icon
                  className={cn(
                    "h-[19px] w-[19px]",
                    active ? "text-[#E4C56A]" : "text-current"
                  )}
                  strokeWidth={active ? 2.25 : 1.7}
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
