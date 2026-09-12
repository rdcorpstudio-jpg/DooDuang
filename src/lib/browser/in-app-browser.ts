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

  // Only clear in-app browsers — do NOT guess generic iOS WebView
  // (false positives break Google login in real Safari)
  if (s.includes("line/") || /\bline\/\d/.test(s)) return "line";
  if (s.includes("fban") || s.includes("fbav") || s.includes("fb_iab"))
    return "facebook";
  if (s.includes("instagram")) return "instagram";
  if (s.includes("tiktok") || s.includes("bytedance") || s.includes("musical_ly"))
    return "tiktok";
  if (s.includes("; wv)")) return "other";

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

function absolutePageUrl(pageUrl?: string) {
  if (!pageUrl) {
    return typeof window !== "undefined" ? window.location.href : "";
  }
  if (pageUrl.startsWith("http")) return pageUrl;
  if (typeof window === "undefined") return pageUrl;
  return new URL(pageUrl, window.location.origin).href;
}

function clickAnchor(href: string, target: "_self" | "_blank" | "_top" = "_top") {
  const a = document.createElement("a");
  a.href = href;
  a.target = target;
  a.rel = "noopener noreferrer";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Build a URL that asks the OS to open the system / Safari / Chrome browser */
export function buildExternalBrowserUrl(pageUrl: string) {
  const url = absolutePageUrl(pageUrl);

  if (isIOS()) {
    // Undocumented but widely used: hand off from in-app WebView → Safari
    return url
      .replace(/^https:\/\//i, "x-safari-https://")
      .replace(/^http:\/\//i, "x-safari-http://");
  }

  if (isAndroid()) {
    const stripped = url.replace(/^https?:\/\//i, "");
    return `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;action=android.intent.action.VIEW;end`;
  }

  return url;
}

/**
 * Try to leave LINE/FB/IG WebView and open the same page in Safari / Chrome.
 * IG often swallows a single assign — we fire several strategies.
 * Returns false only if we could not initiate any handoff.
 */
export function openInExternalBrowser(pageUrl?: string): boolean {
  if (typeof window === "undefined") return false;
  const target = absolutePageUrl(pageUrl);
  if (!target) return false;

  const deep = buildExternalBrowserUrl(target);
  let started = false;

  const go = (href: string, how: "assign" | "anchor" | "open" = "assign") => {
    try {
      if (how === "open") {
        const w = window.open(href, "_blank", "noopener,noreferrer");
        if (w) started = true;
        return;
      }
      if (how === "anchor") {
        clickAnchor(href, "_top");
        started = true;
        return;
      }
      window.location.assign(href);
      started = true;
    } catch {
      /* try next */
    }
  };

  if (isAndroid()) {
    // Chrome intent is the most reliable Android in-app exit
    go(deep, "assign");
    window.setTimeout(() => go(target, "open"), 200);
    window.setTimeout(() => go(target, "anchor"), 400);
    return true;
  }

  if (isIOS()) {
    // IG/FB often block x-safari silently — try scheme, then chrome, then https
    go(deep, "anchor");
    go(deep, "assign");
    window.setTimeout(() => {
      const chrome = target.replace(/^https:\/\//i, "googlechrome://");
      go(chrome, "assign");
    }, 180);
    window.setTimeout(() => go(target, "open"), 360);
    return true;
  }

  go(deep, "assign");
  if (!started) go(target, "open");
  return started;
}

export async function copyPageUrl(pageUrl?: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const target = absolutePageUrl(pageUrl);
  try {
    await navigator.clipboard.writeText(target);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = target;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
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
