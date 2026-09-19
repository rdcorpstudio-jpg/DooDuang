"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Moon, Sparkles, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const GOLD = "#e8d19a";
const MUTED = "#7d8eaa";

/** สีจาก maemangmee-horoscope-html */
export const APP_BAR_BG = "rgba(3, 13, 31, 0.97)";
export const APP_BAR_NAVY = "#030d1f";
export const APP_PAGE_BG = "#06142a";
export const APP_FRAME_BG =
  "linear-gradient(145deg, rgba(8, 30, 57, 0.94), rgba(3, 12, 29, 0.92))";

export const APP_NAV_TABS: readonly {
  id: "home" | "predict" | "special" | "profile";
  href: string;
  label: string;
  Icon: LucideIcon;
  match: (p: string) => boolean;
}[] = [
  {
    id: "home",
    href: "/home",
    label: "หน้าหลัก",
    Icon: Home,
    match: (p) => p === "/" || p === "/home",
  },
  {
    id: "predict",
    href: "/predict",
    label: "ทำนาย",
    Icon: Moon,
    match: (p) =>
      p.startsWith("/predict") ||
      p.startsWith("/menu") ||
      (p.startsWith("/reading") &&
        !p.startsWith("/reading/face") &&
        !p.startsWith("/reading/palm")),
  },
  {
    id: "special",
    href: "/special",
    label: "ดวงพิเศษ",
    Icon: Sparkles,
    match: (p) =>
      p.startsWith("/special") ||
      p.startsWith("/reading/face") ||
      p.startsWith("/reading/palm") ||
      p.startsWith("/premium/couple"),
  },
  {
    id: "profile",
    href: "/dashboard",
    label: "โปรไฟล์",
    Icon: User,
    match: (p) =>
      p.startsWith("/dashboard") ||
      p.startsWith("/login") ||
      p.startsWith("/auth/") ||
      p.startsWith("/pricing") ||
      p.startsWith("/calendar"),
  },
];

export type AppNavActiveId = (typeof APP_NAV_TABS)[number]["id"];

function NavTabs({ forceActiveId }: { forceActiveId?: AppNavActiveId }) {
  const pathname = usePathname() || "/";

  return (
    <div
      className="mx-auto grid max-w-[480px] grid-cols-4 gap-1 px-2.5 py-2"
      role="tablist"
    >
      {APP_NAV_TABS.map(({ id, href, label, Icon, match }) => {
        const active = forceActiveId ? forceActiveId === id : match(pathname);
        return (
          <Link
            key={id}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex min-h-[3.15rem] flex-col items-center justify-center gap-0.5 rounded-[14px] px-1 outline-none transition-colors duration-200",
              active ? "text-[#e8d19a]" : "text-[#7d8eaa] hover:text-[#c5d2e6]",
            )}
          >
            <Icon
              size={active ? 21 : 19}
              strokeWidth={active ? 2.25 : 1.8}
              color={active ? GOLD : MUTED}
              absoluteStrokeWidth
              aria-hidden
            />
            <span
              className={cn(
                "text-[12px] leading-none tracking-wide",
                active ? "font-semibold" : "font-medium",
              )}
              style={{
                color: active ? GOLD : MUTED,
                WebkitFontSmoothing: "antialiased",
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/**
 * Bottom nav — floating dock โทนกรม–ขาวน้ำแข็ง
 */
export function BottomNav({
  forceActiveId,
  framed = false,
}: {
  forceActiveId?: AppNavActiveId;
  /** @deprecated โทนเดียวแล้ว — คงไว้เพื่อไม่พัง call site เก่า */
  framed?: boolean;
}) {
  void framed;
  return (
    <nav
      className="bottom-nav relative z-40 shrink-0 px-2.5 pb-[max(0.35rem,env(safe-area-inset-bottom,0px))] pt-1"
      aria-label="เมนูหลัก"
    >
      <div
        className="overflow-hidden rounded-full"
        style={{
          background:
            "linear-gradient(165deg, rgba(12,28,52,0.72) 0%, rgba(5,14,30,0.78) 100%)",
          boxShadow: "0 -6px 24px rgba(0,0,0,0.22)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
        }}
      >
        <NavTabs forceActiveId={forceActiveId} />
      </div>
    </nav>
  );
}

/**
 * กรอบบาร์ล่างแบบ fixed — หน้า draft ที่เลื่อนเต็มจอ
 */
export function FixedAppBottomNav({
  activeId,
}: {
  activeId: AppNavActiveId;
}) {
  return (
    <div className="pointer-events-none fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2">
      <div className="pointer-events-auto">
        <BottomNav forceActiveId={activeId} />
      </div>
    </div>
  );
}
