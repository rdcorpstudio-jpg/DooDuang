import type { Metadata, Viewport } from "next";
import { Sarabun, Srisakdi } from "next/font/google";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { APP_NAME } from "@/lib/site";
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
  title: `${APP_NAME} — ดูดวงออนไลน์ ไพ่ทาโรต์ ดวงความรัก`,
  description:
    "DooDuang เป็นเว็บดูดวงออนไลน์ เปิดไพ่ทาโรต์ ดวงความรัก การงาน การเงิน และสุขภาพได้ทันทีโดยไม่ต้องเข้าสู่ระบบ กรอกอีเมลเพื่อรับลิงก์ดูผลซ้ำ",
  keywords: ["ดูดวง", "ไพ่ทาโรต์", "ดวงความรัก", "ดวงการงาน", "ทำนาย"],
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
        <PhoneFrame>{children}</PhoneFrame>
      </body>
    </html>
  );
}
