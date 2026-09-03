import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedPage } from "@/components/ui/reveal";
import { Mail } from "lucide-react";

export default function VerifyPage() {
  return (
    <AnimatedPage className="px-4 py-12">
      <Card className="text-center">
        <Mail className="mx-auto mb-3 h-10 w-10 animate-float text-purple-400" />
        <h1 className="mb-2 text-lg font-bold text-white">ตรวจสอบอีเมล</h1>
        <p className="mb-5 text-sm text-purple-300/60">คลิกลิงก์ในอีเมลเพื่อเข้าสู่ระบบ</p>
        <Link href="/">
          <Button variant="secondary" size="sm">
            กลับหน้าแรก
          </Button>
        </Link>
      </Card>
    </AnimatedPage>
  );
}
