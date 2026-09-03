import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatedPage } from "@/components/ui/reveal";
import { sacredInputClassName } from "@/components/ui/sacred-form";
import { Sparkles, Mail } from "lucide-react";

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
        <p className="text-sm text-purple-300/50">เพื่อเปิดไพ่พิเศษ</p>
      </div>

      <div className="mx-auto mt-8 max-w-md">
        <Card>
          <form
            action={async (formData) => {
              "use server";
              const email = formData.get("email") as string;
              await signIn("resend", {
                email,
                redirectTo: callbackUrl ?? "/dashboard",
              });
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs text-purple-300/70">
                อีเมล
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className={sacredInputClassName}
              />
            </div>
            <Button type="submit" className="w-full">
              <Mail className="h-4 w-4" />
              ส่งลิงก์เข้าสู่ระบบ
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-purple-dark/30" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-brand-purple-dark/40 px-4 text-xs text-brand-purple-light/60">หรือ</span>
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: callbackUrl ?? "/dashboard" });
            }}
          >
            <Button type="submit" variant="secondary" className="w-full">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              เข้าสู่ระบบด้วย Google
            </Button>
          </form>
        </Card>
      </div>
    </AnimatedPage>
  );
}
