import Link from "next/link";
import { APP_NAME_ACCENT, APP_NAME_PRIMARY } from "@/lib/site";

export function Footer() {
  return (
    <footer className="shrink-0 border-t sacred-chrome px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-0.5">
          <span className="font-sacred text-[12px] text-white/55">
            {APP_NAME_PRIMARY}
          </span>
          <span className="font-sacred intro-title-accent text-[12px] opacity-80">
            {" "}
            {APP_NAME_ACCENT}
          </span>
        </div>
        <div className="flex gap-3.5">
          <Link href="/reading" className="nav-link-mystic">
            ดูดวง
          </Link>
          <Link href="/premium" className="nav-link-mystic">
            พรีเมียม
          </Link>
          <Link href="/privacy" className="nav-link-mystic">
            ความเป็นส่วนตัว
          </Link>
          <Link href="/terms" className="nav-link-mystic">
            ข้อกำหนด
          </Link>
        </div>
      </div>
    </footer>
  );
}
