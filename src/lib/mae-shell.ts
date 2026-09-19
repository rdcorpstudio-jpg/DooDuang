/** Routes that use Mae navy–gold shell (celestial bg + phone-frame--mae).
 * Main `/` is Mae landing; classic Guanyin lives at `/mae`.
 */

export function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isMaeShellPath(pathname: string) {
  if (isAdminPath(pathname)) return false;
  if (pathname === "/" || pathname === "") return true;
  return (
    pathname.startsWith("/mae") ||
    pathname.startsWith("/home") ||
    pathname.startsWith("/reading") ||
    pathname.startsWith("/r/") ||
    pathname.startsWith("/premium") ||
    pathname.startsWith("/predict") ||
    pathname.startsWith("/special") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/menu") ||
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/preview/") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/reviews") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/daily") ||
    pathname.startsWith("/logout")
  );
}

/** Celestial plate under the shell — `/` owns its video; `/mae` uses Guanyin. */
export function isMaeCelestialPath(pathname: string) {
  if (isAdminPath(pathname)) return false;
  if (pathname === "/" || pathname === "") return false;
  if (pathname === "/mae" || pathname.startsWith("/mae/")) return false;
  return isMaeShellPath(pathname);
}
