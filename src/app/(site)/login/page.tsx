import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedPage } from "@/components/ui/reveal";

export default function LoginPage() {
  return (
    <AnimatedPage className="px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <Sparkles className="mx-auto mb-3 h-8 w-8 animate-float text-purple-400" />
        <h1 className="mb-1 text-2xl font-bold text-white">
          ดูผล<span className="text-gradient">ซ้ำ</span>
        </h1>
        <p className="text-sm text-purple-300/50">ไม่ต้องล็อกอินด้วย Google</p>
      </div>

      <div className="mx-auto mt-8 max-w-md">
        <Card>
          <p className="text-sm leading-relaxed text-purple-200/70">
            หลังดูดวง ให้กรอกอีเมลเพื่อรับลิงก์เปิดผลอีกครั้ง หรือคัดลอกลิงก์จากหน้าผลดูดวงเก็บไว้เอง
          </p>
          <Link href="/reading" className="mt-6 block">
            <Button className="w-full">ไปดูดวง</Button>
          </Link>
        </Card>
      </div>
    </AnimatedPage>
  );
}
