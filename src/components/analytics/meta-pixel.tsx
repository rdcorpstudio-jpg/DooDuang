"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

/** Meta / Facebook Pixel ID from ads setup */
export const META_PIXEL_ID = "27463772329963641";

/** Purchase value from Meta event snippet (THB) */
export const META_PURCHASE_VALUE = 390;
export const META_PURCHASE_CURRENCY = "THB";

function MetaPixelRoutePv() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    // Base snippet already sends the first PageView on script load
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    trackMetaPageView();
  }, [pathname, searchParams]);

  return null;
}

/** Site-wide Meta Pixel (init + PageView). Purchase fires on paid unlock. */
export function MetaPixel() {
  return (
    <>
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <Suspense fallback={null}>
        <MetaPixelRoutePv />
      </Suspense>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height={1}
          width={1}
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

/** Fire once per Stripe session_id after confirmed unlock. */
export function trackMetaPurchase(sessionId?: string | null) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;

  if (sessionId) {
    try {
      const key = `meta-purchase-${sessionId}`;
      if (sessionStorage.getItem(key) === "1") return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
  }

  window.fbq("track", "Purchase", {
    currency: META_PURCHASE_CURRENCY,
    value: META_PURCHASE_VALUE,
  });
}

export function trackMetaPageView() {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", "PageView");
}
