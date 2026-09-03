import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="px-4 py-16">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-8">
          <Sparkles className="h-8 w-8 text-purple-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white mb-1">
            เข้าสู่<span className="text-gradient">ระบบ</span>
          </h1>
          <p className="text-purple-300/50 text-sm">เพื่อบันทึกประวัติและซื้อเครดิต</p>
        </div>

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
    </div>
  );
}
