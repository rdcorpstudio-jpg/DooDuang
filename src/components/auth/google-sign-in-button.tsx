"use client";

import { useEffect, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  type User,
  type UserCredential,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { OpenInBrowserBanner } from "@/components/auth/open-in-browser-banner";
import {
  isInAppBrowser,
  openInExternalBrowser,
} from "@/lib/browser/in-app-browser";
import { PREMIUM_UNLOCK } from "@/lib/stripe-catalog";
import { cn } from "@/lib/utils";

const CALLBACK_KEY = "dooduang-login-callback";
const OAUTH_PENDING_KEY = "dooduang-oauth-pending";

/** Shared across mounts — getRedirectResult is one-shot */
let redirectResultPromise: Promise<UserCredential | null> | null = null;

export function authCompletePath(callbackUrl: string) {
  const cb = encodeURIComponent(safeCallback(callbackUrl));
  // Return URL after Google — no start=1 middle hop
  return `/auth/complete?callbackUrl=${cb}`;
}

/** Open Safari/Chrome on the real login page — user taps Google (user gesture → popup). */
function loginHandoffUrl(callbackUrl: string) {
  if (typeof window === "undefined") return undefined;
  const cb = encodeURIComponent(safeCallback(callbackUrl));
  // Do NOT auto-start redirect — Safari loses redirect state → white error page
  return `${window.location.origin}/login?callbackUrl=${cb}`;
}

/** After login → premium checkout (not account) */
export const DEFAULT_LOGIN_CALLBACK = "/premium?checkout=1";

export function safeCallback(callbackUrl: string) {
  const raw = (callbackUrl || DEFAULT_LOGIN_CALLBACK).trim() || DEFAULT_LOGIN_CALLBACK;
  if (!raw.startsWith("/") || raw.startsWith("//")) return DEFAULT_LOGIN_CALLBACK;
  if (raw.startsWith("/login") || raw.startsWith("/auth/")) return DEFAULT_LOGIN_CALLBACK;
  if (raw === "/dashboard" || raw.startsWith("/dashboard?")) {
    return DEFAULT_LOGIN_CALLBACK;
  }
  return raw;
}

export function rememberCallback(callbackUrl: string) {
  try {
    sessionStorage.setItem(CALLBACK_KEY, safeCallback(callbackUrl));
  } catch {
    /* ignore */
  }
}

export function readCallback(fallback = DEFAULT_LOGIN_CALLBACK) {
  try {
    return sessionStorage.getItem(CALLBACK_KEY) || safeCallback(fallback);
  } catch {
    return safeCallback(fallback);
  }
}

export function clearCallback() {
  try {
    sessionStorage.removeItem(CALLBACK_KEY);
  } catch {
    /* ignore */
  }
}

export function markOAuthPending() {
  try {
    sessionStorage.setItem(OAUTH_PENDING_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearOAuthPending() {
  try {
    sessionStorage.removeItem(OAUTH_PENDING_KEY);
  } catch {
    /* ignore */
  }
}

export function wasOAuthPending() {
  try {
    return sessionStorage.getItem(OAUTH_PENDING_KEY) === "1";
  } catch {
    return false;
  }
}

function isMissingRedirectStateError(err: unknown) {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  return (
    raw.includes("missing initial state") ||
    raw.includes("sessionStorage is inaccessible") ||
    raw.includes("storage-partitioned")
  );
}

function getRedirectResultOnce() {
  if (!redirectResultPromise) {
    redirectResultPromise = getRedirectResult(getFirebaseAuth())
      .catch((err) => {
        redirectResultPromise = null;
        // Safari / ITP: redirect state gone — treat as no session, not a crash
        if (isMissingRedirectStateError(err)) {
          clearOAuthPending();
          return null;
        }
        throw err;
      });
  }
  return redirectResultPromise;
}

function makeProvider() {
  const provider = new GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

async function exchangeIdToken(
  idToken: string,
  opts?: { checkout?: boolean; returnPath?: string }
) {
  const res = await fetch("/api/auth/firebase", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idToken,
      checkout: Boolean(opts?.checkout),
      returnPath: opts?.returnPath || "/premium",
    }),
  });
  const text = await res.text();
  let data: { error?: string; checkoutUrl?: string; ok?: boolean } = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("เซิร์ฟเวอร์ล็อกอินตอบกลับผิดพลาด กรุณาลองใหม่");
  }
  if (!res.ok) {
    throw new Error(data.error || "เข้าสู่ระบบไม่สำเร็จ");
  }
  return data;
}

/** Safari often drops getRedirectResult — wait briefly for currentUser instead */
function waitForFirebaseUser(timeoutMs = 1200): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (auth.currentUser) return Promise.resolve(auth.currentUser);

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      unsub();
      resolve(auth.currentUser);
    }, timeoutMs);

    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      window.clearTimeout(timer);
      unsub();
      resolve(user);
    });
  });
}

export async function resolveFirebaseUserAfterRedirect(): Promise<User | null> {
  const cred = await getRedirectResultOnce();
  if (cred?.user) return cred.user;

  const auth = getFirebaseAuth();
  if (auth.currentUser) return auth.currentUser;

  if (wasOAuthPending()) {
    return waitForFirebaseUser();
  }
  return null;
}

export function wantsCheckoutAfterLogin(callbackUrl: string) {
  const next = safeCallback(callbackUrl);
  if (next.includes("checkout=1")) return true;
  if (next === "/premium" || next.startsWith("/premium?")) return true;
  return next === DEFAULT_LOGIN_CALLBACK;
}

/** Create Stripe session and leave the app — no intermediate pay button page */
export async function goToStripeCheckout(returnPath = "/premium") {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      packageId: PREMIUM_UNLOCK.id,
      returnPath,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
    code?: string;
  };
  if (res.status === 401 || data.code === "UNAUTHENTICATED") {
    throw new Error("ต้องเข้าสู่ระบบก่อนชำระเงิน");
  }
  if (!res.ok || !data.url) {
    throw new Error(data.error || "สร้างลิงก์ชำระเงินไม่สำเร็จ");
  }
  window.location.replace(data.url);
}

export async function completeAppLogin(
  user: User,
  opts?: { callbackUrl?: string; onSuccess?: () => void | Promise<void> }
) {
  const next = readCallback(opts?.callbackUrl || DEFAULT_LOGIN_CALLBACK);
  const wantPay = !opts?.onSuccess && wantsCheckoutAfterLogin(next);
  const idToken = await user.getIdToken();

  // Login only (fast) — then browser navigates to Stripe via /api/stripe/checkout
  const data = await exchangeIdToken(idToken, {
    checkout: false,
    returnPath: "/premium",
  });
  clearOAuthPending();
  clearCallback();

  if (opts?.onSuccess) {
    await opts.onSuccess();
    return { navigated: false as const, next };
  }

  if (wantPay) {
    // Leave this page immediately; Stripe session is created on the next hop
    window.location.replace("/api/stripe/checkout");
    return { navigated: true as const, next };
  }

  if (data.checkoutUrl) {
    window.location.replace(data.checkoutUrl);
    return { navigated: true as const, next };
  }

  window.location.replace(next || DEFAULT_LOGIN_CALLBACK);
  return { navigated: true as const, next };
}

export async function startGoogleRedirect(callbackUrl: string) {
  // Kept for rare callers — prefer popup; redirect often white-screens on Safari
  rememberCallback(callbackUrl);
  markOAuthPending();
  await signInWithRedirect(getFirebaseAuth(), makeProvider());
}

export async function startGooglePopup(callbackUrl: string) {
  rememberCallback(callbackUrl);
  const result = await signInWithPopup(getFirebaseAuth(), makeProvider());
  return result.user;
}

export const GOOGLE_WHITE_BUTTON_CLASS =
  "!flex h-11 w-full min-w-0 flex-row flex-nowrap items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full border border-[#dadce0] bg-white px-3 py-0 text-[14px] font-semibold leading-none text-[#3c4043] shadow-none outline-none transition hover:bg-[#f8f9fa] hover:text-[#3c4043] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:scale-[0.99]";

export function GoogleSignInButton({
  callbackUrl = DEFAULT_LOGIN_CALLBACK,
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
  const [needExternal, setNeedExternal] = useState(false);
  const bootstrapped = useRef(false);

  async function runGoogleSignIn() {
    if (!isFirebaseClientConfigured()) {
      setError("ยังไม่ได้ตั้งค่า Firebase");
      return;
    }

    // IG / LINE / FB WebView: Google popup/redirect fails — leave to Safari/Chrome
    if (isInAppBrowser()) {
      const handoff = loginHandoffUrl(callbackUrl);
      setLoading(true);
      setError(null);
      setNeedExternal(false);
      openInExternalBrowser(handoff);

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
        // Still in WebView — IG often swallows deep links with no UI
        setLoading(false);
        setNeedExternal(true);
        setError("แอปนี้บล็อกการเข้าสู่ระบบ — เปิดในเบราว์เซอร์หลักก่อน");
      }, 850);
      return;
    }

    setLoading(true);
    setError(null);
    setNeedExternal(false);

    try {
      // Prefer popup on direct tap (user gesture). iOS often allows this.
      const result = await signInWithPopup(getFirebaseAuth(), makeProvider());
      await completeAppLogin(result.user, { callbackUrl, onSuccess });
      setLoading(false);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ";
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code?: string }).code ?? "")
          : "";

      if (
        code === "auth/popup-blocked" ||
        code === "auth/cancelled-popup-request" ||
        (raw.toLowerCase().includes("popup") &&
          code !== "auth/popup-closed-by-user")
      ) {
        // Avoid signInWithRedirect — causes Safari “missing initial state” white page
        setError("เบราว์เซอร์บล็อกป๊อปอัป — อนุญาตป๊อปอัปแล้วกดเข้าสู่ระบบอีกครั้ง");
        setLoading(false);
        return;
      }

      let message = raw;
      if (isMissingRedirectStateError(err) || raw.includes("missing initial state")) {
        message = "เซสชันล็อกอินหมดอายุ — กดเข้าสู่ระบบด้วย Google อีกครั้ง";
        clearOAuthPending();
      } else if (
        code === "auth/invalid-credential" ||
        raw.includes("auth/invalid-credential") ||
        raw.includes("UNAUTHENTICATED")
      ) {
        message =
          "ล็อกอิน Google ไม่สำเร็จ — ตรวจว่าเปิด Google Sign-in ใน Firebase แล้ว และเพิ่มโดเมนเว็บใน Authorized domains";
      } else if (code === "auth/popup-closed-by-user") {
        message = "ปิดหน้าต่างล็อกอินก่อนสำเร็จ";
      } else if (code === "auth/unauthorized-domain") {
        message =
          "โดเมนนี้ยังไม่อนุญาตใน Firebase — เพิ่มโดเมนใน Authentication → Settings → Authorized domains";
      }
      setError(message);
      setLoading(false);
    }
  }

  // If user lands back on a page that still has this button after redirect
  useEffect(() => {
    if (bootstrapped.current) return;
    if (!isFirebaseClientConfigured()) return;
    if (!wasOAuthPending()) return;
    bootstrapped.current = true;

    let cancelled = false;
    void (async () => {
      try {
        const user = await resolveFirebaseUserAfterRedirect();
        if (cancelled || !user) return;
        setLoading(true);
        await completeAppLogin(user, { callbackUrl, onSuccess });
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ");
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("space-y-3", className)}>
      <Button
        type="button"
        variant={coloredIcon ? "outline" : variant}
        size="lg"
        className={cn(
          "w-full outline-none focus:outline-none focus-visible:ring-0",
          coloredIcon && GOOGLE_WHITE_BUTTON_CLASS,
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
          <span
            className="h-4 w-px shrink-0 bg-[rgba(213,177,111,0.35)]"
            aria-hidden
          />
        ) : null}
        <span className="min-w-0 shrink truncate text-center">
          {loading ? "กำลังเข้าสู่ระบบ..." : label}
        </span>
      </Button>
      {error && <p className="text-center text-xs text-red-500/80">{error}</p>}
      {needExternal ? (
        <OpenInBrowserBanner
          compact
          pageUrl={loginHandoffUrl(callbackUrl)}
        />
      ) : null}
    </div>
  );
}
