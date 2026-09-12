/** Routes that use Mae navy–gold shell (celestial bg + phone-frame--mae).
 * Main `/` is Mae landing; classic Guanyin lives at `/mae`.
 */

export function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isMaeShellPath(pathname: string) {
  if (isAdminPath(pathname)) return false;
  if (pathname === "/mae" || pathname.startsWith("/mae/")) return false;
  if (pathname === "/" || pathname === "") return true;
  return (
    pathname.startsWith("/reading") ||
    pathname.startsWith("/r/") ||
    pathname.startsWith("/premium") ||
    pathname.startsWith("/menu") ||
    pathname.startsWith("/preview/") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/auth")
  );
}

/** Celestial plate under the shell — `/` owns its video; `/mae` uses Guanyin. */
export function isMaeCelestialPath(pathname: string) {
  if (isAdminPath(pathname)) return false;
  if (pathname === "/" || pathname === "") return false;
  if (pathname === "/mae" || pathname.startsWith("/mae/")) return false;
  return isMaeShellPath(pathname);
}
