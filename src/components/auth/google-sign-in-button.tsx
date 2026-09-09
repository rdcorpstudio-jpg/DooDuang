"use client";

import { useEffect, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import {
  isInAppBrowser,
  isIOS,
  openInExternalBrowser,
} from "@/lib/browser/in-app-browser";
import { cn } from "@/lib/utils";

const CALLBACK_KEY = "dooduang-login-callback";

function loginHandoffUrl(callbackUrl: string) {
  if (typeof window === "undefined") return undefined;
  const cb = encodeURIComponent(callbackUrl || "/dashboard");
  // autologin=1 → Safari continues with redirect login (no popup)
  return `${window.location.origin}/login?callbackUrl=${cb}&autologin=1`;
}

function rememberCallback(callbackUrl: string) {
  try {
    sessionStorage.setItem(CALLBACK_KEY, callbackUrl || "/dashboard");
  } catch {
    /* ignore */
  }
}

function readCallback(fallback: string) {
  try {
    return sessionStorage.getItem(CALLBACK_KEY) || fallback;
  } catch {
    return fallback;
  }
}

function clearAutologinFromUrl() {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has("autologin")) {
      url.searchParams.delete("autologin");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  } catch {
    /* ignore */
  }
}

async function exchangeIdToken(idToken: string) {
  const res = await fetch("/api/auth/firebase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const text = await res.text();
  let data: { error?: string } = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("เซิร์ฟเวอร์ล็อกอินตอบกลับผิดพลาด กรุณาลองใหม่");
  }
  if (!res.ok) {
    throw new Error(data.error || "เข้าสู่ระบบไม่สำเร็จ");
  }
}

function makeProvider() {
  const provider = new GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

/** Prefer redirect on iOS Safari — popups are often blocked */
function shouldUseRedirect(force = false) {
  if (force) return true;
  if (typeof window === "undefined") return false;
  if (isIOS()) return true;
  const sp = new URLSearchParams(window.location.search);
  return sp.get("autologin") === "1";
}

export function GoogleSignInButton({
  callbackUrl = "/dashboard",
  onSuccess,
  className,
  buttonClassName,
  label = "เข้าสู่ระบบด้วย Google",
  variant = "secondary",
  coloredIcon = false,
  showIconDivider = false,
}: {
  callbackUrl?: string;
  onSuccess?: () => void | Promise<void>;
  className?: string;
  buttonClassName?: string;
  label?: string;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  coloredIcon?: boolean;
  showIconDivider?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirectHandled = useRef(false);
  const autoStarted = useRef(false);

  async function finishLogin(idToken: string) {
    await exchangeIdToken(idToken);
    clearAutologinFromUrl();
    const next = readCallback(callbackUrl);

    if (onSuccess) {
      await onSuccess();
      setLoading(false);
      return;
    }

    window.location.href = next || "/dashboard";
  }

  async function startRedirectLogin() {
    const auth = getFirebaseAuth();
    rememberCallback(callbackUrl);
    try {
      await auth.signOut();
    } catch {
      /* ignore */
    }
    await signInWithRedirect(auth, makeProvider());
  }

  async function runGoogleSignIn(opts?: { forceRedirect?: boolean }) {
    if (!isFirebaseClientConfigured()) {
      setError("ยังไม่ได้ตั้งค่า Firebase");
      return;
    }

    // LINE / FB: open Safari first
    if (isInAppBrowser()) {
      openInExternalBrowser(loginHandoffUrl(callbackUrl));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (shouldUseRedirect(opts?.forceRedirect)) {
        await startRedirectLogin();
        return; // page will navigate away
      }

      const auth = getFirebaseAuth();
      try {
        await auth.signOut();
      } catch {
        /* ignore */
      }
      const result = await signInWithPopup(auth, makeProvider());
      const idToken = await result.user.getIdToken();
      await finishLogin(idToken);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ";
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code?: string }).code ?? "")
          : "";
      let message = raw;
      if (
        code === "auth/invalid-credential" ||
        raw.includes("auth/invalid-credential") ||
        raw.includes("UNAUTHENTICATED")
      ) {
        message =
          "ล็อกอิน Google ไม่สำเร็จ — ตรวจว่าเปิด Google Sign-in ใน Firebase แล้ว และเพิ่มโดเมนเว็บใน Authorized domains";
      } else if (code === "auth/popup-closed-by-user") {
        message = "ปิดหน้าต่างล็อกอินก่อนสำเร็จ";
      } else if (
        code === "auth/popup-blocked" ||
        raw.toLowerCase().includes("popup")
      ) {
        // Fallback: full-page redirect (not blocked like popups)
        try {
          await startRedirectLogin();
          return;
        } catch {
          message = "เบราว์เซอร์บล็อกหน้าต่างล็อกอิน — กำลังลองวิธีอื่น";
        }
      } else if (code === "auth/unauthorized-domain") {
        message =
          "โดเมนนี้ยังไม่อนุญาตใน Firebase — เพิ่มโดเมนใน Authentication → Settings → Authorized domains";
      }
      setError(message);
      setLoading(false);
    }
  }

  // Complete redirect return from Google
  useEffect(() => {
    if (redirectHandled.current) return;
    if (!isFirebaseClientConfigured()) return;
    redirectHandled.current = true;

    let cancelled = false;
    void (async () => {
      try {
        const auth = getFirebaseAuth();
        const result = await getRedirectResult(auth);
        if (cancelled || !result?.user) return;
        setLoading(true);
        const idToken = await result.user.getIdToken();
        await finishLogin(idToken);
      } catch (err) {
        if (cancelled) return;
        const raw = err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ";
        setError(raw);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After LINE → Safari: start redirect login (no popup = no block)
  useEffect(() => {
    if (autoStarted.current) return;
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("autologin") !== "1") return;
    if (isInAppBrowser()) return;
    autoStarted.current = true;
    const t = window.setTimeout(() => {
      void runGoogleSignIn({ forceRedirect: true });
    }, 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("space-y-3", className)}>
      <Button
        type="button"
        variant={variant}
        size="lg"
        className={cn(
          "w-full outline-none focus:outline-none focus-visible:ring-0",
          buttonClassName
        )}
        onClick={() => void runGoogleSignIn()}
        disabled={loading}
      >
        {coloredIcon ? (
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        ) : (
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {showIconDivider ? (
          <span className="h-4 w-px shrink-0 bg-[#D4CEE8]" aria-hidden />
        ) : null}
        {loading ? "กำลังเข้าสู่ระบบ..." : label}
      </Button>
      {error && <p className="text-center text-xs text-red-500/80">{error}</p>}
    </div>
  );
}
