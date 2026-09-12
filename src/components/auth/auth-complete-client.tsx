"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  clearOAuthPending,
  completeAppLogin,
  GoogleSignInButton,
  readCallback,
  rememberCallback,
  resolveFirebaseUserAfterRedirect,
  safeCallback,
} from "@/components/auth/google-sign-in-button";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";

/** Only handles return from Google — never starts OAuth (no middle hop). */
let completeLoginPromise: Promise<void> | null = null;

export function AuthCompleteClient({
  callbackUrl,
}: {
  callbackUrl?: string;
  start?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const next = safeCallback(callbackUrl || "/dashboard");

  useEffect(() => {
    if (!isFirebaseClientConfigured()) {
      setError("ยังไม่ได้ตั้งค่า Firebase");
      return;
    }

    let cancelled = false;
    const target = safeCallback(
      callbackUrl || readCallback("/dashboard")
    );
    rememberCallback(target);

    void (async () => {
      try {
        if (!completeLoginPromise) {
          completeLoginPromise = (async () => {
            const user = await resolveFirebaseUserAfterRedirect();
            if (!user) {
              clearOAuthPending();
              // No result — send to login instead of hanging
              window.location.replace(
                `/login?callbackUrl=${encodeURIComponent(target)}`
              );
              return;
            }
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
        const friendly =
          raw.includes("missing initial state") ||
          raw.includes("sessionStorage")
            ? "เซสชันล็อกอินหมดอายุ — กดเข้าสู่ระบบด้วย Google อีกครั้ง"
            : raw;
        setError(friendly);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [callbackUrl]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-10 text-center">
      {!error ? (
        <p className="text-[13px] text-[#9aa3b2]">กำลังเข้าสู่ระบบ…</p>
      ) : (
        <div
          className="w-full max-w-sm rounded-[22px] px-5 py-7"
          style={{
            background: "#141c2b",
            boxShadow:
              "inset 0 0 0 1px rgba(213,177,111,0.28), 0 16px 40px rgba(0,0,0,0.28)",
          }}
        >
          <p className="text-[15px] font-semibold text-[#f7f4ec]">
            เข้าสู่ระบบไม่สำเร็จ
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-[#9aa3b2]">
            {error}
          </p>
          <GoogleSignInButton
            callbackUrl={next}
            label="เข้าสู่ระบบด้วย Google"
            coloredIcon
            className="mt-5 w-full space-y-2"
            buttonClassName="h-12 text-[15px]"
          />
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(next)}`}
            className="mt-3 inline-flex h-10 w-full items-center justify-center text-[13px] font-medium text-[#9aa3b2]"
          >
            กลับหน้าเข้าสู่ระบบ
          </Link>
        </div>
      )}
    </div>
  );
}
