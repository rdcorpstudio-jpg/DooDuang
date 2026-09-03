import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="px-4 py-16">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-8">
          <Sparkles className="h-8 w-8 text-purple-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white mb-1">
            ดูผล<span className="text-gradient">ซ้ำ</span>
          </h1>
          <p className="text-purple-300/50 text-sm">ไม่ต้องล็อกอินด้วย Google</p>
        </div>

        <Card>
          <p className="text-sm leading-relaxed text-purple-200/70">
            หลังดูดวง ให้กรอกอีเมลเพื่อรับลิงก์เปิดผลอีกครั้ง
            หรือคัดลอกลิงก์จากหน้าผลดูดวงเก็บไว้เอง
          </p>
          <Link href="/reading" className="mt-6 block">
            <Button className="w-full">ไปดูดวง</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
