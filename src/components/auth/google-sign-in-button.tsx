"use client";

import { useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirebaseAuth, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { OpenInBrowserBanner } from "@/components/auth/open-in-browser-banner";
import { Button } from "@/components/ui/button";
import {
  isInAppBrowser,
  openInExternalBrowser,
} from "@/lib/browser/in-app-browser";
import { cn } from "@/lib/utils";

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
  /** Official multicolor Google G */
  coloredIcon?: boolean;
  /** Thin vertical rule between G and label (login mockup) */
  showIconDivider?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inApp, setInApp] = useState(false);

  useEffect(() => {
    setInApp(isInAppBrowser());
  }, []);

  async function handleClick() {
    if (!isFirebaseClientConfigured()) {
      setError("ยังไม่ได้ตั้งค่า Firebase");
      return;
    }

    // LINE / FB in-app browsers block Google popup — hand off to Safari/Chrome first
    if (isInAppBrowser()) {
      setError(
        "เบราว์เซอร์ในแอปบล็อกหน้าต่างล็อกอิน — กดปุ่มเปิดในเบราว์เซอร์หลักด้านบน"
      );
      openInExternalBrowser(
        typeof window !== "undefined"
          ? `${window.location.origin}/login?callbackUrl=${encodeURIComponent(callbackUrl || "/dashboard")}`
          : undefined
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const auth = getFirebaseAuth();
      // Clear stale Firebase/Google session on this browser before popup
      // (common cause of auth/invalid-credential when another device works)
      try {
        await auth.signOut();
      } catch {
        // ignore
      }
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

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

      if (onSuccess) {
        await onSuccess();
        setLoading(false);
        return;
      }

      window.location.href = callbackUrl || "/dashboard";
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
        message =
          "เบราว์เซอร์บล็อกหน้าต่างล็อกอิน — ลองเปิดใน Safari / Chrome แล้วล็อกอินใหม่";
        if (isInAppBrowser()) {
          openInExternalBrowser();
        }
      } else if (code === "auth/unauthorized-domain") {
        message =
          "โดเมนนี้ยังไม่อนุญาตใน Firebase — เพิ่มโดเมนใน Authentication → Settings → Authorized domains";
      }
      setError(message);
      setLoading(false);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      {inApp ? <OpenInBrowserBanner compact /> : null}
      <Button
        type="button"
        variant={variant}
        size="lg"
        className={cn(
          "w-full outline-none focus:outline-none focus-visible:ring-0",
          buttonClassName
        )}
        onClick={() => void handleClick()}
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
        {loading
          ? "กำลังเข้าสู่ระบบ..."
          : inApp
            ? "เปิด Safari แล้วล็อกอิน Google"
            : label}
      </Button>
      {error && <p className="text-center text-xs text-red-500/80">{error}</p>}
    </div>
  );
}
