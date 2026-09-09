"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  clearOAuthPending,
  completeAppLogin,
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

  useEffect(() => {
    if (!isFirebaseClientConfigured()) {
      setError("ยังไม่ได้ตั้งค่า Firebase");
      return;
    }

    let cancelled = false;
    const next = safeCallback(callbackUrl || readCallback("/dashboard"));
    rememberCallback(next);

    void (async () => {
      try {
        // Fresh start — strip start=1 so Google cannot return into another redirect loop
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
          await startGoogleRedirect(next);
          return;
        }

        if (!completeLoginPromise) {
          completeLoginPromise = (async () => {
            setStatus("กำลังยืนยันบัญชี…");
            const user = await resolveFirebaseUserAfterRedirect();
            if (!user) {
              clearOAuthPending();
              throw new Error("ไม่พบบัญชี Google หลังล็อกอิน — กดลองใหม่");
            }
            setStatus("กำลังบันทึกเซสชัน…");
            await completeAppLogin(user, { callbackUrl: next });
          })().catch((err) => {
            completeLoginPromise = null;
            throw err;
          });
        }

        await completeLoginPromise;
      } catch (err) {
        if (cancelled) return;
        clearOAuthPending();
        setError(err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ");
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
          <p className="mt-2 text-[13px] leading-relaxed text-red-500/90">{error}</p>
          <Link
            href={`/auth/complete?callbackUrl=${encodeURIComponent(safeCallback(callbackUrl || "/dashboard"))}&start=1`}
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#7B5FD4] text-[14px] font-semibold text-white"
            onClick={() => {
              redirectStartLock = false;
              completeLoginPromise = null;
            }}
          >
            ลองเข้าสู่ระบบอีกครั้ง
          </Link>
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
