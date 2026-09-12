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

/** LINE Ads Platform tag — base + page view */
export const LINE_TAG_ID = "67b0794a-95c0-40c6-bf68-6f17e52e7fdd";

/** LINE purchase / conversion tag — fire only after paid unlock */
export const LINE_PURCHASE_TAG_ID = "16f50e85-230a-49e6-9e00-5454eb15b6c0";

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
  if (typeof window === "undefined" || typeof window._lt !== "function") return;

  if (sessionId) {
    try {
      const key = `line-purchase-cv-${sessionId}`;
      if (sessionStorage.getItem(key) === "1") return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
  }

  // Purchase-page snippet: init purchase tag, then Purchase + Conversion
  window._lt("init", {
    customerType: "lap",
    tagId: LINE_PURCHASE_TAG_ID,
  });
  window._lt("send", "cv", { type: "Purchase" }, [LINE_PURCHASE_TAG_ID]);
  window._lt("send", "cv", { type: "Conversion" }, [LINE_PURCHASE_TAG_ID]);
}
