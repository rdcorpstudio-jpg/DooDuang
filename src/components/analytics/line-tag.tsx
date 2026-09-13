"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

declare global {
  interface Window {
    _lt?: (...args: unknown[]) => void;
    _ltq?: unknown[];
  }
}

/** LINE Ads Platform tag — base + page view (homepage / site-wide) */
export const LINE_TAG_ID = "366d48f5-0b4f-406e-91d4-8206a7b0df14";

/** LINE purchase / conversion tag — fire only after paid unlock (thank-you) */
export const LINE_PURCHASE_TAG_ID = "0f7d0234-5cad-4de7-8bd2-4112ed3c08c7";

function LineTagRoutePv() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    // Base snippet already sends the first pv on script load
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    window._lt?.("send", "pv", [LINE_TAG_ID]);
  }, [pathname, searchParams]);

  return null;
}

/** Site-wide LINE Tag (init + PageView). Conversion events fire on paid unlock. */
export function LineTag() {
  return (
    <>
      <Script id="line-tag-base" strategy="afterInteractive">
        {`(function(g,d,o){
  g._ltq=g._ltq||[];g._lt=g._lt||function(){g._ltq.push(arguments)};
  var h=location.protocol==='https:'?'https://d.line-scdn.net':'http://d.line-cdn.net';
  var s=d.createElement('script');s.async=1;
  s.src=o||h+'/n/line_tag/public/release/v1/lt.js';
  var t=d.getElementsByTagName('script')[0];t.parentNode.insertBefore(s,t);
})(window, document);
_lt('init', {
  customerType: 'lap',
  tagId: '${LINE_TAG_ID}'
});
_lt('send', 'pv', ['${LINE_TAG_ID}']);`}
      </Script>
      <Suspense fallback={null}>
        <LineTagRoutePv />
      </Suspense>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height={1}
          width={1}
          style={{ display: "none" }}
          src={`https://tr.line.me/tag.gif?c_t=lap&t_id=${LINE_TAG_ID}&e=pv&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

/** Purchase + Conversion — once per Stripe session after confirmed unlock. */
export function trackLinePurchaseConversions(sessionId?: string | null) {
  if (typeof window === "undefined") return;

  const key = sessionId ? `line-purchase-cv-${sessionId}` : null;
  if (key) {
    try {
      if (sessionStorage.getItem(key) === "1") return;
    } catch {
      /* ignore */
    }
  }

  const send = () => {
    if (typeof window._lt !== "function") return false;
    // Match LINE purchase-page snippet order: init → Conversion → Purchase
    window._lt("init", {
      customerType: "lap",
      tagId: LINE_PURCHASE_TAG_ID,
    });
    window._lt("send", "cv", { type: "Conversion" }, [LINE_PURCHASE_TAG_ID]);
    window._lt("send", "cv", { type: "Purchase" }, [LINE_PURCHASE_TAG_ID]);
    if (key) {
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        /* ignore */
      }
    }
    return true;
  };

  if (send()) return;

  let tries = 0;
  const timer = window.setInterval(() => {
    tries += 1;
    if (send() || tries >= 25) window.clearInterval(timer);
  }, 120);
}
