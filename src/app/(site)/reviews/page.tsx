import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { APP_NAME } from "@/lib/site";
import { AnimatedPage } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { ReviewCard } from "@/components/home/review-card";
import { MAE_REVIEWS } from "@/lib/reviews";

export const metadata: Metadata = {
  title: `รีวิว — ${APP_NAME}`,
  description: `รีวิวจากคนที่เคยอ่านดวงกับ ${APP_NAME}`,
};

export default function ReviewsPage() {
  return (
    <AnimatedPage className="px-5 py-6 pb-12">
      <PageHero title="รีวิว" subtitle="จากคนที่เคยเข้ามาอ่าน ไม่ได้รับรองผลดวงหรือผลลัพธ์ในชีวิตจริง" />

      <div
        className="divide-y rounded-[16px] px-3"
        style={{
          background: "rgba(255,255,255,0.04)",
          boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.18)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        {MAE_REVIEWS.map((r) => (
          <div key={r.id} className="py-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <ReviewCard review={r} />
          </div>
        ))}
      </div>

      <Link
        href="/welcome"
        className="mae-gold-cta group relative mx-auto mt-8 flex h-12 w-full max-w-[280px] items-center justify-center gap-2 overflow-hidden rounded-full px-6 outline-none transition active:scale-[0.98]"
      >
        <span className="text-[15px] font-semibold tracking-wide">
          เลือกเรื่องที่อยากรู้
        </span>
        <ArrowRight
          className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
          strokeWidth={2.2}
        />
      </Link>
    </AnimatedPage>
  );
}
