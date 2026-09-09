import { AuthCompleteClient } from "@/components/auth/auth-complete-client";

interface AuthCompletePageProps {
  searchParams: Promise<{ callbackUrl?: string; start?: string }>;
}

export default async function AuthCompletePage({
  searchParams,
}: AuthCompletePageProps) {
  const { callbackUrl, start } = await searchParams;
  return <AuthCompleteClient callbackUrl={callbackUrl} start={start} />;
}
