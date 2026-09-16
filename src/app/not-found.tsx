import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-full min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-[13px] font-semibold tracking-[0.2em] text-[#d5b16f]">
        404
      </p>
      <h1 className="mae-gold-text mt-2 text-[1.35rem] font-bold tracking-tight">
        ไม่พบหน้านี้
      </h1>
      <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-[#f7f4ec]/70">
        ลิงก์อาจพิมพ์ผิดหรือหน้านี้ถูกย้ายแล้ว
      </p>
      <Link
        href="/"
        className="mae-gold-cta mt-6 inline-flex h-11 items-center justify-center rounded-full px-6 text-[14px] font-semibold outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
      >
        กลับหน้าแม้มังมี
      </Link>
    </div>
  );
}
