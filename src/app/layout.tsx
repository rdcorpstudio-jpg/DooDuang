import type { Metadata, Viewport } from "next";
import { Sarabun, Srisakdi } from "next/font/google";
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

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sarabun",
});

const srisakdi = Srisakdi({
  subsets: ["thai", "latin"],
  weight: ["400"],
  variable: "--font-srisakdi",
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
    <html lang="th">
      <body className={`${sarabun.variable} ${srisakdi.variable} font-sans`}>
        <LineTag />
        <MetaPixel />
        <StripePurchaseReturnListener />
        <PhoneFrame>{children}</PhoneFrame>
      </body>
    </html>
  );
}
