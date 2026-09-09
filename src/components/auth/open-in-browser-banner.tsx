"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Copy } from "lucide-react";
import {
  copyPageUrl,
  getInAppBrowserKind,
  openInExternalBrowser,
  type InAppBrowserKind,
} from "@/lib/browser/in-app-browser";
import { cn } from "@/lib/utils";

/** In-app WebView (LINE/FB): only action buttons — no explanatory copy */
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

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <button
        type="button"
        onClick={() => openInExternalBrowser()}
        className={cn(
          "inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#241C4F] font-semibold text-white outline-none transition active:scale-[0.99]",
          compact ? "h-10 text-[13px]" : "h-11 text-[14px]"
        )}
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
        className={cn(
          "inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-white/85 font-medium text-[#3A2F6B] ring-1 ring-[#C8B8F0]/55 outline-none transition active:scale-[0.99]",
          compact ? "h-9 text-[12px]" : "h-10 text-[13px]"
        )}
      >
        <Copy className="h-3.5 w-3.5" strokeWidth={2.2} />
        {copied ? "คัดลอกลิงก์แล้ว" : "คัดลอกลิงก์"}
      </button>
    </div>
  );
}
