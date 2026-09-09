import { LoginScreen } from "@/components/auth/login-screen";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string; autologin?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;

  return <LoginScreen callbackUrl={callbackUrl ?? "/dashboard"} />;
}
