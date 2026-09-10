"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  clearOAuthPending,
  completeAppLogin,
  GoogleSignInButton,
  readCallback,
  rememberCallback,
  resolveFirebaseUserAfterRedirect,
  safeCallback,
  startGoogleRedirect,
} from "@/components/auth/google-sign-in-button";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";

/** Prevent double signInWithRedirect from React Strict Mode */
let redirectStartLock = false;
let completeLoginPromise: Promise<void> | null = null;

export function AuthCompleteClient({
  callbackUrl,
  start,
}: {
  callbackUrl?: string;
  start?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("กำลังเข้าสู่ระบบ…");
  const next = safeCallback(callbackUrl || "/premium?checkout=1");

  useEffect(() => {
    if (!isFirebaseClientConfigured()) {
      setError("ยังไม่ได้ตั้งค่า Firebase");
      return;
    }

    let cancelled = false;
    const target = safeCallback(callbackUrl || readCallback("/premium?checkout=1"));
    rememberCallback(target);

    void (async () => {
      try {
        // Fresh start — strip start=1 so return URL cannot restart redirect
        if (start === "1") {
          if (redirectStartLock) return;
          redirectStartLock = true;
          try {
            const url = new URL(window.location.href);
            url.searchParams.delete("start");
            window.history.replaceState({}, "", url.pathname + url.search);
          } catch {
            /* ignore */
          }
          setStatus("กำลังเปิด Google…");
          await startGoogleRedirect(target);
          return;
        }

        if (!completeLoginPromise) {
          completeLoginPromise = (async () => {
            setStatus("กำลังยืนยันบัญชี…");
            const user = await resolveFirebaseUserAfterRedirect();
            if (!user) {
              clearOAuthPending();
              throw new Error("NO_GOOGLE_USER");
            }
            setStatus("กำลังบันทึกเซสชัน…");
            await completeAppLogin(user, { callbackUrl: target });
          })().catch((err) => {
            completeLoginPromise = null;
            throw err;
          });
        }

        await completeLoginPromise;
      } catch (err) {
        if (cancelled) return;
        clearOAuthPending();
        const raw = err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ";
        setError(
          raw === "NO_GOOGLE_USER"
            ? "Safari บล็อกการล็อกอินแบบเปลี่ยนหน้า — กดปุ่มด้านล่างเพื่อเข้าสู่ระบบอีกครั้ง"
            : raw
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [callbackUrl, start]);

  return (
    <div className="sky-copy flex min-h-full flex-col items-center justify-center px-6 py-10 text-center">
      {!error ? (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-[#7B5FD4]" />
          <p className="mt-4 text-[15px] font-medium text-[#3A2F6B]">{status}</p>
          <p className="mt-1 text-[12px] text-[#8A82B0]">กรุณารอสักครู่</p>
        </>
      ) : (
        <div className="fortune-glass w-full max-w-sm rounded-[24px] px-5 py-7">
          <p className="text-[15px] font-semibold text-[#241C4F]">เข้าสู่ระบบไม่สำเร็จ</p>
          <p className="mt-2 text-[13px] leading-relaxed text-[#5E5688]">{error}</p>
          <GoogleSignInButton
            callbackUrl={next}
            label="เข้าสู่ระบบด้วย Google"
            coloredIcon
            showIconDivider
            variant="outline"
            className="mt-5 space-y-2"
            buttonClassName="h-12 gap-2.5 rounded-full border-0 bg-white text-[15px] font-semibold text-[#3A2F6B]"
          />
          <Link
            href="/login"
            className="mt-3 inline-flex h-10 w-full items-center justify-center text-[13px] font-medium text-[#5E5688]"
          >
            กลับหน้าเข้าสู่ระบบ
          </Link>
        </div>
      )}
    </div>
  );
}
