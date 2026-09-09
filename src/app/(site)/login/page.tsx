import { redirect } from "next/navigation";
import { LoginScreen } from "@/components/auth/login-screen";
import { auth } from "@/lib/auth";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string; autologin?: string }>;
}

function safeCallback(callbackUrl?: string) {
  const raw = (callbackUrl || "/dashboard").trim() || "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  if (raw.startsWith("/login") || raw.startsWith("/auth/")) return "/dashboard";
  return raw;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl, autologin } = await searchParams;
  const next = safeCallback(callbackUrl);

  const session = await auth().catch(() => null);
  if (session?.user) {
    redirect(next);
  }

  // Legacy LINE handoff → dedicated auth complete (avoids login-page bounce)
  if (autologin === "1") {
    redirect(
      `/auth/complete?callbackUrl=${encodeURIComponent(next)}&start=1`
    );
  }

  return <LoginScreen callbackUrl={next} />;
}
