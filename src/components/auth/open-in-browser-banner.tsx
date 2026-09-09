"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Copy } from "lucide-react";
import {
  copyPageUrl,
  getInAppBrowserKind,
  inAppBrowserLabel,
  openInExternalBrowser,
  type InAppBrowserKind,
} from "@/lib/browser/in-app-browser";
import { cn } from "@/lib/utils";

/** Prompt users stuck in LINE/FB WebView to open Safari / Chrome for Google login */
export function OpenInBrowserBanner({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const [kind, setKind] = useState<InAppBrowserKind>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setKind(getInAppBrowserKind());
  }, []);

  if (!kind) return null;

  const appName = inAppBrowserLabel(kind);

  return (
    <div
      className={cn(
        "rounded-[16px] border border-[#E8C86A]/55 bg-gradient-to-b from-[#FFF8E8] to-[#F8F0FF] text-left",
        compact ? "px-3 py-2.5" : "px-3.5 py-3",
        className
      )}
      role="status"
    >
      <p
        className={cn(
          "font-semibold text-[#5C4810]",
          compact ? "text-[12px]" : "text-[13px]"
        )}
      >
        เปิดใน Safari / เบราว์เซอร์ก่อนล็อกอิน
      </p>
      <p
        className={cn(
          "mt-1 leading-snug text-[#7A6A40]",
          compact ? "text-[11px]" : "text-[12px]"
        )}
      >
        ตอนนี้อยู่ในเบราว์เซอร์ของ{appName} ซึ่งมักบล็อกหน้าต่าง Google
        ทำให้เข้าสู่ระบบไม่สำเร็จ
      </p>
      <div className={cn("flex flex-col gap-2", compact ? "mt-2" : "mt-2.5")}>
        <button
          type="button"
          onClick={() => openInExternalBrowser()}
          className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-[#241C4F] text-[13px] font-semibold text-white outline-none transition active:scale-[0.99]"
        >
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.2} />
          เปิดในเบราว์เซอร์หลัก
        </button>
        <button
          type="button"
          onClick={() => {
            void copyPageUrl().then((ok) => {
              if (ok) {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              }
            });
          }}
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-white/80 text-[12px] font-medium text-[#5C4810] ring-1 ring-[#E8C86A]/45 outline-none transition active:scale-[0.99]"
        >
          <Copy className="h-3.5 w-3.5" strokeWidth={2.2} />
          {copied ? "คัดลอกลิงก์แล้ว" : "คัดลอกลิงก์ แล้วเปิด Safari เอง"}
        </button>
      </div>
      {kind === "line" ? (
        <p className="mt-2 text-[10px] leading-snug text-[#9A8A60]">
          หรือใน LINE: แตะ ⋯ มุมขวา → เปิดในเบราว์เซอร์
        </p>
      ) : null}
    </div>
  );
}
