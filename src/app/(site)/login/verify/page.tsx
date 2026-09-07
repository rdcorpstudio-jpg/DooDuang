import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedPage } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { SacredDivider } from "@/components/ui/sacred-mark";

export default function VerifyPage() {
  return (
    <AnimatedPage className="px-4 py-12 pb-10">
      <PageHero
        align="center"
        title="ตรวจสอบ"
        accent="อีเมล"
        subtitle="คลิกลิงก์ในอีเมลเพื่อเข้าสู่ระบบ"
      />
      <SacredDivider className="mx-auto mb-7" />
      <Card className="ui-lift mx-auto max-w-md text-center">
        <p className="mb-5 text-[13px] leading-relaxed text-white/50">
          เปิดกล่องจดหมายแล้วกดลิงก์ยืนยันเพื่อเข้าใช้งานต่อ
        </p>
        <Link href="/">
          <Button variant="secondary" size="sm">
            กลับหน้าแรก
          </Button>
        </Link>
      </Card>
    </AnimatedPage>
  );
}
