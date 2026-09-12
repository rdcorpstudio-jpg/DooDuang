"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isAdminPath, isMaeShellPath } from "@/lib/mae-shell";
import { StarfieldBackground } from "@/components/layout/starfield-background";
import { BottomNav } from "@/components/layout/bottom-nav";
import { syncPremiumFromServer } from "@/lib/fortune/premium-unlock";
import { syncFortuneProfileWithServer } from "@/lib/fortune/profile-storage";

interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
}

/** Sync app shell to visualViewport so iOS keyboard doesn't crush inputs. */
export function PhoneFrame({ children, className }: PhoneFrameProps) {
  const pathname = usePathname() || "/";
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const adminShell = isAdminPath(pathname);
  const maeShell = !adminShell && isMaeShellPath(pathname);
  const isAuthPath =
    pathname.startsWith("/auth") || pathname.startsWith("/login");
  const hideNav =
    adminShell ||
    isAuthPath ||
    pathname === "/" ||
    pathname === "" ||
    keyboardOpen;
  /* CSS zoom on ancestors breaks iOS caret / focus for phone OTP fields.
     Home hero is a tight 1-screen composition — comfort zoom crushes it on real phones. */
  const disableComfortZoom =
    adminShell ||
    isAuthPath ||
    keyboardOpen ||
    pathname === "/" ||
    pathname === "";

  useEffect(() => {
    if (adminShell) return;
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

  return (
    <div className={cn("phone-shell", adminShell && "phone-shell--admin")}>
      <div
        className={cn(
          "phone-frame",
          keyboardOpen && "phone-frame--keyboard",
          maeShell && "phone-frame--mae",
          adminShell && "phone-frame--admin",
          className
        )}
      >
        {adminShell ? null : <StarfieldBackground />}
        <div
          className={cn(
            "phone-comfort relative z-[2] flex h-full min-w-0 w-full max-w-full flex-col overflow-x-hidden",
            disableComfortZoom && "phone-comfort--no-zoom"
          )}
        >
          <div
            className={cn(
              "min-h-0 min-w-0 w-full max-w-full flex-1 overflow-x-hidden",
              adminShell ? "overflow-y-auto" : "overflow-y-hidden"
            )}
          >
            {children}
          </div>
          {hideNav ? null : <BottomNav />}
        </div>
      </div>
    </div>
  );
}
