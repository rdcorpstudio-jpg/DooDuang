import { isAdminPath } from "@/lib/mae-shell";

/**
 * v3 mobile-app screen kinds:
 * - home first-run `/` — immersive, hide tabs
 * - tab-root: `/premium` `/menu` `/dashboard` — tabs on
 * - stack: subpages with back — tabs stay unless listed below
 * - paywall: `/premium/pay` — hide tabs
 * - auth / admin / preview home — hide tabs
 */

export function isHomePath(pathname: string) {
  return pathname === "/" || pathname === "";
}

export function isAuthPath(pathname: string) {
  return pathname.startsWith("/auth") || pathname.startsWith("/login");
}

export function isPaywallPath(pathname: string) {
  return pathname.startsWith("/premium/pay");
}

export function isPreviewHomePath(pathname: string) {
  return pathname.startsWith("/preview/home");
}

export function isChoosePath(pathname: string) {
  return pathname === "/choose" || pathname.startsWith("/choose/");
}

/** Hide tab bar on first-run home, topic pick, paywall, auth, admin, keyboard. */
export function shouldHideBottomNav(pathname: string, keyboardOpen: boolean) {
  if (keyboardOpen) return true;
  if (isAdminPath(pathname)) return true;
  if (isAuthPath(pathname)) return true;
  if (isPaywallPath(pathname)) return true;
  if (isPreviewHomePath(pathname)) return true;
  if (isHomePath(pathname)) return true;
  if (isChoosePath(pathname)) return true;
  return false;
}

/** Document scroll only on long forms — Home is a single app screen. */
export function shouldAllowDocumentScroll(pathname: string) {
  if (isAdminPath(pathname)) return true;
  if (isPaywallPath(pathname)) return true;
  if (isAuthPath(pathname)) return true;
  if (isPreviewHomePath(pathname)) return true;
  return false;
}

export function shouldDisableComfortZoom(
  pathname: string,
  keyboardOpen: boolean
) {
  if (keyboardOpen) return true;
  if (isAdminPath(pathname)) return true;
  if (isAuthPath(pathname)) return true;
  if (isHomePath(pathname)) return true;
  if (isChoosePath(pathname)) return true;
  if (isPreviewHomePath(pathname)) return true;
  return false;
}
