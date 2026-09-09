/** Detect restrictive in-app browsers (LINE / FB / IG) that break Google popup login */

export type InAppBrowserKind =
  | "line"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "other"
  | null;

export function getInAppBrowserKind(
  ua = typeof navigator !== "undefined" ? navigator.userAgent : ""
): InAppBrowserKind {
  const s = ua.toLowerCase();
  if (!s) return null;

  // LINE WebView — UA usually contains "Line/x.y"
  if (s.includes("line/") || /\bline\/\d/.test(s)) return "line";

  if (s.includes("fban") || s.includes("fbav") || s.includes("fb_iab"))
    return "facebook";
  if (s.includes("instagram")) return "instagram";
  if (s.includes("tiktok") || s.includes("bytedance") || s.includes("musical_ly"))
    return "tiktok";

  // Android WebView
  if (s.includes("; wv)") || s.includes("webview")) return "other";

  // iOS embedded WebView (not full Safari): AppleWebKit without Version/ + Safari/
  if (
    isIOS(ua) &&
    s.includes("applewebkit") &&
    !s.includes("crios") &&
    !s.includes("fxios") &&
    !s.includes("edgios") &&
    !(s.includes("version/") && s.includes("safari/"))
  ) {
    return "other";
  }

  return null;
}

export function isInAppBrowser(ua?: string) {
  return getInAppBrowserKind(ua) !== null;
}

export function isIOS(ua = typeof navigator !== "undefined" ? navigator.userAgent : "") {
  return /iphone|ipad|ipod/i.test(ua);
}

export function isAndroid(
  ua = typeof navigator !== "undefined" ? navigator.userAgent : ""
) {
  return /android/i.test(ua);
}

/** Build a URL that asks the OS to open the system / Safari / Chrome browser */
export function buildExternalBrowserUrl(pageUrl: string) {
  const url = pageUrl.startsWith("http")
    ? pageUrl
    : typeof window !== "undefined"
      ? new URL(pageUrl, window.location.origin).href
      : pageUrl;

  if (isIOS()) {
    // Undocumented but widely used: hand off from in-app WebView → Safari
    return url.replace(/^https:\/\//i, "x-safari-https://").replace(
      /^http:\/\//i,
      "x-safari-http://"
    );
  }

  if (isAndroid()) {
    const stripped = url.replace(/^https?:\/\//i, "");
    return `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;action=android.intent.action.VIEW;end`;
  }

  return url;
}

/**
 * Try to leave LINE/FB WebView and open the same page in Safari / default browser.
 * Returns false if we could not initiate a handoff (caller should show copy-link fallback).
 */
export function openInExternalBrowser(pageUrl?: string): boolean {
  if (typeof window === "undefined") return false;
  const target = pageUrl || window.location.href;
  const deep = buildExternalBrowserUrl(target);

  try {
    // Prefer top-level navigation so LINE cannot swallow a popup
    window.location.href = deep;
    return true;
  } catch {
    try {
      window.open(target, "_blank", "noopener,noreferrer");
      return true;
    } catch {
      return false;
    }
  }
}

export async function copyPageUrl(pageUrl?: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const target = pageUrl || window.location.href;
  try {
    await navigator.clipboard.writeText(target);
    return true;
  } catch {
    return false;
  }
}

export function inAppBrowserLabel(kind: InAppBrowserKind) {
  switch (kind) {
    case "line":
      return "LINE";
    case "facebook":
      return "Facebook";
    case "instagram":
      return "Instagram";
    case "tiktok":
      return "TikTok";
    case "other":
      return "แอปนี้";
    default:
      return "แอป";
  }
}
