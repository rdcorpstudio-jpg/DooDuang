"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, ScrollText, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "หน้าแรก", Icon: Home, match: (p: string) => p === "/" },
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

/** Sacred gold bottom tab bar — fixed in phone frame */
export function BottomNav() {
  const pathname = usePathname() || "/";

  // Hide during reading wizard / immersive reading flows so the keyboard
  // does not crush the form against the tab bar.
  if (
    pathname === "/reading" ||
    pathname.startsWith("/reading/") ||
    pathname.startsWith("/r/") ||
    pathname.startsWith("/preview/")
  ) {
    return null;
  }

  return (
    <nav
      className="bottom-nav relative z-40 shrink-0 border-t border-[#F4BC52]/22"
      aria-label="เมนูหลัก"
      style={{
        background:
          "linear-gradient(180deg, rgba(14,12,28,0.72) 0%, rgba(10,8,22,0.92) 100%)",
        backdropFilter: "blur(18px) saturate(1.2)",
        WebkitBackdropFilter: "blur(18px) saturate(1.2)",
        boxShadow: "inset 0 1px 0 rgba(255,230,170,0.12), 0 -8px 24px rgba(0,0,0,0.25)",
        paddingBottom: "max(0.45rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto grid max-w-[480px] grid-cols-4 gap-0.5 px-1.5 pt-1.5">
        {TABS.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-2xl px-1 py-2 outline-none transition active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#F4BC52]/45",
                active ? "text-[#F4BC52]" : "text-[#9AB8DC]/70 hover:text-[#F7F8FF]"
              )}
            >
              {active ? (
                <span
                  className="absolute inset-x-3 top-0 h-0.5 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #F4BC52, transparent)",
                    boxShadow: "0 0 12px rgba(244,188,82,0.55)",
                  }}
                />
              ) : null}
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
                  active && "bg-[#F4BC52]/16 ring-1 ring-[#F4BC52]/4 shadow-[0_0_16px_rgba(244,188,82,0.25)]"
                )}
              >
                <Icon
                  className="h-[18px] w-[18px]"
                  strokeWidth={active ? 2.2 : 1.8}
                />
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium tracking-wide",
                  active && "font-semibold"
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
