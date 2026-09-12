"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  DEFAULT_LOGIN_CALLBACK,
  rememberCallback,
  safeCallback,
} from "@/components/auth/google-sign-in-button";
import { OpenInBrowserBanner } from "@/components/auth/open-in-browser-banner";
import {
  getInAppBrowserKind,
  isInAppBrowser,
  openInExternalBrowser,
} from "@/lib/browser/in-app-browser";
import { cn } from "@/lib/utils";

/** LINE brand mark — simple chat bubble glyph */
function LineMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("h-5 w-5", className)}
      fill="currentColor"
    >
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386a.63.63 0 0 1-.63-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94a.63.63 0 0 1-.63.629.63.63 0 0 1-.63-.629V8.108c0-.27.173-.51.43-.595.063-.022.136-.033.2-.033.211 0 .391.09.51.25l2.445 3.32V8.108c0-.345.282-.63.63-.63.348 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.63.629-.348 0-.63-.285-.63-.629V8.108c0-.345.282-.63.63-.63.348 0 .63.285.63.63v4.771zm-2.466.629H4.917c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.957 12 .957S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function loginPageUrl(callbackUrl: string) {
  if (typeof window === "undefined") return undefined;
  const next = encodeURIComponent(safeCallback(callbackUrl));
  return `${window.location.origin}/login?callbackUrl=${next}`;
}

/**
 * LINE login — navigates to `/api/auth/line/start` (backend redirects to LINE OAuth).
 * Inside IG/FB/TikTok WebView, hand off to Safari/Chrome first (OAuth often dies silently).
 */
export function LineSignInButton({
  callbackUrl = DEFAULT_LOGIN_CALLBACK,
  className,
  buttonClassName,
}: {
  callbackUrl?: string;
  className?: string;
  buttonClassName?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [needExternal, setNeedExternal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startLineLogin() {
    rememberCallback(callbackUrl);
    const next = encodeURIComponent(safeCallback(callbackUrl));
    const startPath = `/api/auth/line/start?callbackUrl=${next}`;

    // Inside LINE app WebView, LINE OAuth usually works via full navigation
    const kind = getInAppBrowserKind();
    if (isInAppBrowser() && kind !== "line") {
      setLoading(true);
      setError(null);
      setNeedExternal(false);
      openInExternalBrowser(loginPageUrl(callbackUrl));

      let left = false;
      const markLeft = () => {
        left = true;
      };
      window.addEventListener("pagehide", markLeft);
      const onVis = () => {
        if (document.visibilityState === "hidden") left = true;
      };
      document.addEventListener("visibilitychange", onVis);

      window.setTimeout(() => {
        window.removeEventListener("pagehide", markLeft);
        document.removeEventListener("visibilitychange", onVis);
        if (left) return;
        setLoading(false);
        setNeedExternal(true);
        setError("แอปนี้บล็อกการเข้าสู่ระบบ — เปิดในเบราว์เซอร์หลักก่อน");
      }, 850);
      return;
    }

    setLoading(true);
    // Full navigation so Set-Cookie (state) from start route is kept for callback
    window.location.assign(startPath);
  }

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <button
        type="button"
        onClick={startLineLogin}
        disabled={loading}
        className={cn(
          "inline-flex h-10 w-full items-center justify-center gap-2 rounded-full text-[13.5px] font-semibold text-white outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#06C755]/45 disabled:opacity-60",
          buttonClassName
        )}
        style={{
          background: "#06C755",
          boxShadow: "0 6px 14px rgba(6,199,85,0.2)",
        }}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.2} />
        ) : (
          <LineMark className="h-4 w-4" />
        )}
        {loading ? "กำลังเปิด…" : "เข้าสู่ระบบด้วย LINE"}
      </button>
      {error ? (
        <p className="text-center text-xs text-red-500/80">{error}</p>
      ) : null}
      {needExternal ? (
        <OpenInBrowserBanner compact pageUrl={loginPageUrl(callbackUrl)} />
      ) : null}
    </div>
  );
}
