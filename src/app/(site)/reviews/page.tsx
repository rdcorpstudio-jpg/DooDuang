import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
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
        className="wallpaper-dl-btn group relative mx-auto mt-8 flex h-[3.55rem] w-full max-w-[300px] items-center gap-3 overflow-hidden rounded-[18px] px-2.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
      >
        <span className="wallpaper-dl-btn__icon relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
          <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </span>
        <span className="relative z-[1] min-w-0 flex-1">
          <span className="dd-btn-label block text-[15.5px] font-bold leading-tight tracking-wide">
            เลือกเรื่องที่อยากรู้
          </span>
          <span className="mt-0.5 block text-[12px] font-medium leading-tight opacity-70">
            เปิดทำนายกับแม่มั่งมี
          </span>
        </span>
        <ChevronRight
          className="relative z-[1] mr-1 h-5 w-5 shrink-0 opacity-80 transition-transform duration-200 group-hover:translate-x-0.5"
          strokeWidth={2.4}
        />
        <span
          className="wallpaper-dl-btn__shine pointer-events-none absolute inset-0"
          aria-hidden
        />
      </Link>
    </AnimatedPage>
  );
}
