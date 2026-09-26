"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isAdminPath, isMaeShellPath } from "@/lib/mae-shell";
import { StarfieldBackground, SoftSkyStarsOverlay } from "@/components/layout/starfield-background";
import { BottomNav } from "@/components/layout/bottom-nav";
import { NavigationLoading } from "@/components/layout/navigation-loading";
import { syncPremiumFromServer } from "@/lib/fortune/premium-unlock";
import { syncFortuneProfileWithServer } from "@/lib/fortune/profile-storage";

interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
}

/** Sync app shell to visualViewport so iOS keyboard doesn't crush inputs. */
export function PhoneFrame({ children, className }: PhoneFrameProps) {
  const pathname = usePathname() || "/";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [rail, setRail] = useState({ top: 0, height: 0, visible: false });
  const adminShell = isAdminPath(pathname);
  const maeShell = !adminShell && isMaeShellPath(pathname);
  const isAuthPath =
    pathname.startsWith("/auth") || pathname.startsWith("/login");
  const hideNav =
    adminShell ||
    isAuthPath ||
    pathname === "/" ||
    pathname === "" ||
    pathname === "/2" ||
    pathname === "/home" ||
    pathname === "/reading" ||
    pathname.startsWith("/reading/seamsee") ||
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/premium/pay") ||
    pathname.startsWith("/premium/thanks") ||
    pathname.startsWith("/predict") ||
    pathname.startsWith("/special") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/preview/home") ||
    pathname.startsWith("/preview/special") ||
    pathname.startsWith("/preview/calendar") ||
    pathname.startsWith("/preview/predict") ||
    keyboardOpen;
  /* CSS zoom on ancestors breaks iOS caret / focus for phone OTP fields.
     Home hero is a tight 1-screen composition — comfort zoom crushes it on real phones.
     Draft pages (home / calendar / predict / special) share the same raw 17.5 type scale. */
  const disableComfortZoom =
    adminShell ||
    isAuthPath ||
    keyboardOpen ||
    pathname === "/" ||
    pathname === "" ||
    pathname === "/2" ||
    pathname === "/home" ||
    pathname.startsWith("/reading") ||
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/predict") ||
    pathname.startsWith("/special") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/preview/home") ||
    pathname.startsWith("/preview/special") ||
    pathname.startsWith("/preview/calendar") ||
    pathname.startsWith("/preview/predict");

  useEffect(() => {
    if (adminShell) return;
    // Throttled inside syncPremiumFromServer — once per navigation is enough
    void syncPremiumFromServer();
    void syncFortuneProfileWithServer();
  }, [pathname, adminShell]);

  useEffect(() => {
    const root = document.documentElement;
    const vv = window.visualViewport;

    const update = () => {
      const height = vv?.height ?? window.innerHeight;
      const offsetTop = vv?.offsetTop ?? 0;
      const inset = Math.max(0, window.innerHeight - height - offsetTop);
      const open = inset > 72;

      setKeyboardOpen(open);
      root.dataset.keyboardOpen = open ? "true" : "false";
      root.style.setProperty("--vv-height", `${height}px`);
      root.style.setProperty("--vv-top", `${offsetTop}px`);
      root.style.setProperty("--wizard-keyboard-inset", `${inset}px`);
    };

    update();
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    window.addEventListener("focusin", update);
    window.addEventListener("focusout", update);

    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("focusin", update);
      window.removeEventListener("focusout", update);
      delete root.dataset.keyboardOpen;
      root.style.removeProperty("--vv-height");
      root.style.removeProperty("--vv-top");
      root.style.removeProperty("--wizard-keyboard-inset");
    };
  }, []);

  const allowPageScroll =
    adminShell ||
    pathname === "/home" ||
    pathname === "/reading" ||
    pathname.startsWith("/reading/") ||
    /* /welcome intake is one screen — outer scroll lets content disappear on desktop */
    pathname.startsWith("/welcome/preview") ||
    pathname.startsWith("/premium/pay") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/predict") ||
    pathname.startsWith("/special") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/preview/home") ||
    pathname.startsWith("/preview/special") ||
    pathname.startsWith("/preview/calendar") ||
    pathname.startsWith("/preview/predict");

  const useCustomHomeBg =
    pathname === "/home" ||
    pathname.startsWith("/predict") ||
    pathname.startsWith("/special") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/preview/home") ||
    pathname.startsWith("/preview/special") ||
    pathname.startsWith("/preview/calendar") ||
    pathname.startsWith("/preview/predict");

  /* เฉพาะ /preview/* — ฟัง .preview-page-scroll (เลเยอร์ที่เลื่อนได้จริง) */
  useEffect(() => {
    if (!useCustomHomeBg) {
      setRail({ top: 0, height: 0, visible: false });
      return;
    }
    const root = scrollRef.current;
    if (!root) return;

    const el: HTMLElement | null = root.querySelector(".preview-page-scroll");
    if (!el) {
      setRail({ top: 0, height: 0, visible: false });
      return;
    }

    let hideTimer = 0;
    const syncRail = () => {
      const { scrollTop, scrollHeight, clientHeight } = el!;
      if (scrollHeight <= clientHeight + 2) {
        setRail({ top: 0, height: 0, visible: false });
        return;
      }
      const track = clientHeight;
      const thumbH = Math.max(28, (clientHeight / scrollHeight) * track);
      const maxTop = track - thumbH;
      const top =
        (scrollTop / (scrollHeight - clientHeight)) * maxTop;
      setRail({ top, height: thumbH, visible: true });
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        setRail((r) => ({ ...r, visible: false }));
      }, 700);
    };

    el.addEventListener("scroll", syncRail, { passive: true });
    return () => {
      el!.removeEventListener("scroll", syncRail);
      window.clearTimeout(hideTimer);
    };
  }, [useCustomHomeBg, pathname]);

  return (
    <div
      className={cn(
        "phone-shell",
        adminShell && "phone-shell--admin",
        (maeShell || useCustomHomeBg) && "phone-shell--preview-draft",
      )}
    >
      <div
        className={cn(
          "phone-frame",
          keyboardOpen && "phone-frame--keyboard",
          maeShell && "phone-frame--mae",
          adminShell && "phone-frame--admin",
          (maeShell || useCustomHomeBg) && "phone-frame--preview-draft",
          className
        )}
      >
        {adminShell || useCustomHomeBg ? null : <StarfieldBackground />}
        <div className="relative z-[2] flex h-full min-h-0 min-w-0 w-full max-w-full flex-col overflow-x-hidden">
          <div
            className={cn(
              "phone-comfort relative flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-x-hidden",
              disableComfortZoom && "phone-comfort--no-zoom"
            )}
          >
            <div
              ref={scrollRef}
              className={cn(
                "min-h-0 min-w-0 w-full max-w-full flex-1 overflow-x-hidden",
                /* preview เลื่อนที่ .preview-page-scroll ในหน้า — ไม่ซ้อนสองชั้น */
                useCustomHomeBg
                  ? "overflow-y-hidden"
                  : allowPageScroll
                    ? "overflow-y-auto overscroll-contain"
                    : "overflow-y-hidden",
              )}
            >
              {children}
            </div>
            {adminShell ? null : <NavigationLoading />}
            {useCustomHomeBg ? (
              <div
                className={cn(
                  "pointer-events-none absolute right-1 top-0 z-40 w-[3px] transition-opacity duration-300",
                  rail.visible ? "opacity-100" : "opacity-0",
                )}
                style={{ height: "100%" }}
                aria-hidden
              >
                <span
                  className="absolute right-0 block w-full rounded-full"
                  style={{
                    top: rail.top,
                    height: rail.height,
                    background: "rgba(110, 160, 255, 0.7)",
                    boxShadow: "0 0 8px rgba(80, 140, 255, 0.4)",
                  }}
                />
              </div>
            ) : null}
          </div>
          {hideNav ? null : <BottomNav />}
        </div>
        {adminShell || useCustomHomeBg ? null : <SoftSkyStarsOverlay />}
      </div>
    </div>
  );
}
