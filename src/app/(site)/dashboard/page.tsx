"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountDashboard } from "@/components/account/account-dashboard";
import { DEFAULT_LOGIN_CALLBACK } from "@/components/auth/google-sign-in-button";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  credits?: number;
};

/** Client account page — avoids slow server DB wait on "กำลังเปิดบัญชี" */
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
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
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 text-[13px] text-[#8A82B0]">
        กำลังเปิด…
      </div>
    );
  }

  return (
    <AccountDashboard
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        credits: user.credits ?? 0,
      }}
    />
  );
}
