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
  const raw =
    (callbackUrl || "/premium?checkout=1").trim() || "/premium?checkout=1";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/premium?checkout=1";
  if (raw.startsWith("/login") || raw.startsWith("/auth/")) {
    return "/premium?checkout=1";
  }
  if (raw === "/dashboard" || raw.startsWith("/dashboard?")) {
    return "/premium?checkout=1";
  }
  return raw;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl, autologin, lineError } = await searchParams;
  const next = safeCallback(callbackUrl);

  const session = await auth().catch(() => null);
  if (session?.user) {
    // Already logged in → pay (not account)
    redirect(next.includes("checkout=1") ? next : "/api/stripe/checkout");
  }

  return (
    <LoginScreen
      callbackUrl={next}
      autoStartGoogle={autologin === "1"}
      lineError={lineError}
    />
  );
}
