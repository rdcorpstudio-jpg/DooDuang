/** Routes that use Mae navy–gold shell (celestial bg + phone-frame--mae). Home `/` stays Guanyin. */

export function isMaeShellPath(pathname: string) {
  if (pathname === "/" || pathname === "") return false;
  return (
    pathname.startsWith("/mae") ||
    pathname.startsWith("/reading") ||
    pathname.startsWith("/r/") ||
    pathname.startsWith("/premium") ||
    pathname.startsWith("/preview/") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/auth")
  );
}

/** Celestial plate (not Guanyin) under the shell — same set minus `/mae` (landing owns its video). */
export function isMaeCelestialPath(pathname: string) {
  if (pathname === "/mae" || pathname.startsWith("/mae/")) return false;
  return isMaeShellPath(pathname);
}
