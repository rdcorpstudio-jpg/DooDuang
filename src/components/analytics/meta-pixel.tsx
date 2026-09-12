"use client";

import Script from "next/script";

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

/** Load pixel + init only. PageView / Purchase fire separately. */
export function MetaPixel() {
  return (
    <Script id="meta-pixel-base" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');`}
    </Script>
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
