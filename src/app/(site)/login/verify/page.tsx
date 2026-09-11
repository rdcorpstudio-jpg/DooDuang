import Link from "next/link";
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
      <div
        className="mx-auto max-w-md rounded-[22px] px-5 py-6 text-center"
        style={{
          background: "#141c2b",
          boxShadow:
            "inset 0 0 0 1px rgba(213,177,111,0.28), 0 12px 32px rgba(0,0,0,0.22)",
        }}
      >
        <p className="mb-5 text-[13px] leading-relaxed text-[#9aa3b2]">
          เปิดกล่องจดหมายแล้วกดลิงก์ยืนยันเพื่อเข้าใช้งานต่อ
        </p>
        <Link
          href="/"
          className="mae-gold-cta inline-flex h-10 items-center justify-center rounded-full px-5 text-[14px] font-semibold"
        >
          กลับหน้าแรก
        </Link>
      </div>
    </AnimatedPage>
  );
}
