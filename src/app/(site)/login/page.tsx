import { redirect } from "next/navigation";
import { LoginScreen } from "@/components/auth/login-screen";
import { auth } from "@/lib/auth";

interface LoginPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
    autologin?: string;
    lineError?: string;
  }>;
}

function safeCallback(callbackUrl?: string) {
  const fallback = "/dashboard";
  const raw = (callbackUrl || fallback).trim() || fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (raw.startsWith("/login") || raw.startsWith("/auth/")) return fallback;
  return raw;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl, autologin, lineError } = await searchParams;
  const next = safeCallback(callbackUrl);

  const session = await auth().catch(() => null);
  if (session?.user) {
    if (next.includes("checkout=1")) {
      redirect("/api/stripe/checkout");
    }
    redirect(next);
  }

  return (
    <LoginScreen
      callbackUrl={next}
      autoStartGoogle={autologin === "1"}
      lineError={lineError}
    />
  );
}
