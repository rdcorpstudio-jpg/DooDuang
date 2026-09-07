import Link from "next/link";
import { Card } from "@/components/ui/card";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { AnimatedPage } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { SacredDivider } from "@/components/ui/sacred-mark";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;

  return (
    <AnimatedPage className="px-4 py-12 pb-10">
      <PageHero
        align="center"
        title="เข้าสู่"
        accent="ระบบ"
        subtitle="บันทึกประวัติและซื้อเครดิตได้หลังเข้าสู่ระบบ"
      />
      <SacredDivider className="mx-auto mb-7" />

      <Card className="ui-lift mx-auto max-w-md">
        <GoogleSignInButton callbackUrl={callbackUrl ?? "/dashboard"} />
        <p className="mt-5 text-center text-[12px] leading-relaxed text-white/40">
          ดูดวงได้โดยไม่ต้องล็อกอิน{" "}
          <Link
            href="/reading"
            className="text-[#d4b8ff]/80 transition-colors hover:text-[#e9ddff]"
          >
            ไปเปิดไพ่
          </Link>
        </p>
      </Card>
    </AnimatedPage>
  );
}
