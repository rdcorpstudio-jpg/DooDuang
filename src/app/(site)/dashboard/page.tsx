"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AccountDashboard } from "@/components/account/account-dashboard";
import { DEFAULT_LOGIN_CALLBACK } from "@/components/auth/google-sign-in-button";
import {
  readFortuneProfile,
  writeFortuneProfile,
} from "@/lib/fortune/profile-storage";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  credits?: number;
};

const PREVIEW_USER: SessionUser = {
  id: "preview-user",
  name: "แม่มั่งมี",
  email: "preview@maemangmee.local",
  image: null,
  credits: 0,
};

function seedPreviewProfile() {
  const existing = readFortuneProfile();
  if (!existing?.birthDate) {
    writeFortuneProfile({
      realName: "แม่มั่งมี",
      nickname: "แม่มั่งมี",
      birthDate: "1995-09-07",
      gender: "female",
      birthTime: "09:30",
      birthPlace: "กรุงเทพฯ",
    });
  }
}

function DashboardInner() {
  const router = useRouter();
  const search = useSearchParams();
  const preview = search.get("preview") === "1";
  const [user, setUser] = useState<SessionUser | null>(preview ? PREVIEW_USER : null);

  useEffect(() => {
    if (preview) {
      seedPreviewProfile();
      setUser(PREVIEW_USER);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = (await res.json()) as { user?: SessionUser | null };
        if (cancelled) return;
        if (!data.user?.id) {
          router.replace(
            `/login?callbackUrl=${encodeURIComponent(DEFAULT_LOGIN_CALLBACK)}`
          );
          return;
        }
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          image: data.user.image,
          credits: data.user.credits ?? 0,
        });
      } catch {
        if (!cancelled) {
          router.replace(
            `/login?callbackUrl=${encodeURIComponent(DEFAULT_LOGIN_CALLBACK)}`
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, preview]);

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 text-[13px] text-[#f7f4ec]/55">
        กำลังเปิด…
      </div>
    );
  }

  return (
    <>
      {preview ? (
        <div className="mx-auto max-w-[480px] px-4 pt-3">
          <p
            className="rounded-full px-3 py-1.5 text-center text-[11px] font-medium text-[#e8d19a]"
            style={{
              background: "rgba(213,177,111,0.12)",
              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.35)",
            }}
          >
            โหมดตัวอย่าง · ยังไม่ได้ล็อกอินจริง
          </p>
        </div>
      ) : null}
      <AccountDashboard
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          credits: user.credits ?? 0,
        }}
      />
    </>
  );
}

/** Client account page — use ?preview=1 to mock logged-in without Google */
export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center px-4 text-[13px] text-[#f7f4ec]/55">
          กำลังเปิด…
        </div>
      }
    >
      <DashboardInner />
    </Suspense>
  );
}
