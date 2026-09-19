"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MaePageLoading } from "@/components/layout/mae-page-loading";

const NAV_START = "mae:nav-start";
const MIN_MS = 420;
const MAX_MS = 5200;

/** Call before `router.push` / `router.replace` so the loading plate shows. */
export function startMaeNavigation() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NAV_START));
}

function isInternalNavAnchor(anchor: HTMLAnchorElement): boolean {
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    const next = `${url.pathname}${url.search}${url.hash}`;
    const cur = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    return next !== cur;
  } catch {
    return false;
  }
}

/**
 * Full-screen Mae loading plate while routes change —
 * covers both `<Link>` clicks and programmatic `startMaeNavigation()`.
 */
export function NavigationLoading() {
  const pathname = usePathname() || "/";
  const [visible, setVisible] = useState(false);
  const startedAt = useRef(0);
  const hideTimer = useRef<number | null>(null);
  const maxTimer = useRef<number | null>(null);
  const pathWhenStarted = useRef(pathname);

  function clearTimers() {
    if (hideTimer.current != null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (maxTimer.current != null) {
      window.clearTimeout(maxTimer.current);
      maxTimer.current = null;
    }
  }

  function show() {
    clearTimers();
    startedAt.current = Date.now();
    pathWhenStarted.current = `${window.location.pathname}${window.location.search}`;
    setVisible(true);
    maxTimer.current = window.setTimeout(() => {
      setVisible(false);
      clearTimers();
    }, MAX_MS);
  }

  function hideSoon() {
    const elapsed = Date.now() - startedAt.current;
    const wait = Math.max(0, MIN_MS - elapsed);
    if (hideTimer.current != null) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      setVisible(false);
      clearTimers();
    }, wait);
  }

  useEffect(() => {
    const onStart = () => show();

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const el = event.target;
      if (!(el instanceof Element)) return;
      const anchor = el.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalNavAnchor(anchor)) return;
      show();
    };

    window.addEventListener(NAV_START, onStart);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener(NAV_START, onStart);
      document.removeEventListener("click", onClick, true);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once; show/hide use refs
  }, []);

  useEffect(() => {
    if (!visible) return;
    const now = `${pathname}${typeof window !== "undefined" ? window.location.search : ""}`;
    if (now === pathWhenStarted.current) return;
    hideSoon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, visible]);

  if (!visible) return null;

  return (
      <div className="pointer-events-auto absolute inset-0 z-[80] mae-nav-loading-overlay">
      <MaePageLoading label="กำลังเปิดหน้า…" hint="รอสักครู่ ไม่กี่วินาทีเอง" />
    </div>
  );
}
