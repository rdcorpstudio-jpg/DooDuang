import { redirect } from "next/navigation";
import { LoginScreen } from "@/components/auth/login-screen";
import { auth } from "@/lib/auth";
import { parseHomeTopicId } from "@/lib/home-topics";

interface LoginPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
    autologin?: string;
    lineError?: string;
    topic?: string;
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
  const { callbackUrl, autologin, lineError, topic } = await searchParams;
  const next = safeCallback(callbackUrl);
  const homeTopic = parseHomeTopicId(topic);

  const session = await auth().catch(() => null);
  if (session?.user) {
    if (next.includes("checkout=1")) {
      redirect("/premium/pay");
    }
    redirect(next);
  }

  return (
    <LoginScreen
      callbackUrl={next}
      autoStartGoogle={autologin === "1"}
      lineError={lineError}
      topic={homeTopic}
    />
  );
}
