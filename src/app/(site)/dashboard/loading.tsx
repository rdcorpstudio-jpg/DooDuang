import { APP_BRAND_MARK } from "@/lib/site";
import { FortuneIcon } from "@/components/fortune/fortune-icon";

/** Shown while /dashboard (บัญชี) server data loads */
export default function DashboardLoading() {
  return (
    <div className="sky-copy mx-auto flex min-h-[70vh] w-full max-w-[480px] flex-col items-center justify-center px-4 pb-24 pt-10">
      <div className="account-load-spin relative flex h-16 w-16 items-center justify-center">
        <span
          className="account-load-ring absolute inset-0 rounded-full"
          aria-hidden
        />
        <FortuneIcon name="profile" size={34} plain />
      </div>

      <p className="mt-5 font-sacred text-[12px] tracking-[0.22em] text-[#C9A227]">{APP_BRAND_MARK}</p>
      <p className="mt-2 text-[15px] font-semibold text-[#241C4F]">
        กำลังเปิดบัญชี…
      </p>
      <p className="mt-1.5 text-center text-[12px] text-[#8A82B0]">
        โหลดโปรไฟล์และประวัติของคุณ
      </p>

      <div className="mt-6 h-1.5 w-36 overflow-hidden rounded-full bg-[#9B7FE8]/20">
        <div className="account-load-bar h-full w-1/2 rounded-full bg-gradient-to-r from-[#7B5FD4] to-[#9B7FE8]" />
      </div>
    </div>
  );
}
