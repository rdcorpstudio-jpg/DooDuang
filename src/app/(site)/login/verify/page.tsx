import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function VerifyPage() {
  return (
    <div className="px-4 py-12">
      <Card className="text-center">
        <Mail className="h-10 w-10 text-purple-400 mx-auto mb-3" />
        <h1 className="text-lg font-bold text-white mb-2">ตรวจสอบอีเมล</h1>
        <p className="text-purple-300/60 text-sm mb-5">
          คลิกลิงก์ในอีเมลเพื่อเข้าสู่ระบบ
        </p>
        <Link href="/">
          <Button variant="secondary" size="sm">กลับหน้าแรก</Button>
        </Link>
      </Card>
    </div>
  );
}
