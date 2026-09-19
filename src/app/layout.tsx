import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai, Noto_Serif_Thai } from "next/font/google";
import { LineTag } from "@/components/analytics/line-tag";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { StripePurchaseReturnListener } from "@/components/analytics/stripe-purchase-return-listener";
import { PhoneFrame } from "@/components/layout/phone-frame";
import {
  LAYOUT_META_DESCRIPTION,
  LAYOUT_META_KEYWORDS,
  LAYOUT_META_TITLE,
} from "@/lib/site";
import "./globals.css";

/**
 * เนื้อหา/UI: IBM Plex Sans Thai
 * หัวข้อ: Noto Serif Thai
 */
const plexThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-app",
  display: "swap",
});

const notoSerifThai = Noto_Serif_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: LAYOUT_META_TITLE,
  description: LAYOUT_META_DESCRIPTION,
  keywords: [...LAYOUT_META_KEYWORDS],
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${plexThai.variable} ${notoSerifThai.variable} ${plexThai.className}`}
    >
      <body className={plexThai.className}>
        <LineTag />
        <MetaPixel />
        <StripePurchaseReturnListener />
        <PhoneFrame>{children}</PhoneFrame>
      </body>
    </html>
  );
}
