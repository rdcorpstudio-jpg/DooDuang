import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { AnimatedPage } from "@/components/ui/reveal";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;

  return (
    <AnimatedPage className="px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <Sparkles className="mx-auto mb-3 h-8 w-8 animate-float text-purple-400" />
        <h1 className="mb-1 text-2xl font-bold text-white">
          เข้าสู่<span className="text-gradient">ระบบ</span>
        </h1>
        <p className="text-sm text-purple-300/50">เพื่อบันทึกประวัติและซื้อเครดิต</p>
      </div>

      <div className="mx-auto mt-8 max-w-md">
        <Card>
          <GoogleSignInButton callbackUrl={callbackUrl ?? "/dashboard"} />
          <p className="mt-5 text-center text-[11px] leading-relaxed text-purple-400/50">
            ดูดวงได้โดยไม่ต้องล็อกอิน{" "}
            <Link href="/reading" className="text-purple-200/70 hover:underline">
              ไปเปิดไพ่
            </Link>
          </p>
        </Card>
      </div>
    </AnimatedPage>
  );
}
