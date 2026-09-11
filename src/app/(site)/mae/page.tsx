import type { Metadata } from "next";
import { HomeScroll } from "@/components/home/home-scroll";
import { APP_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `${APP_NAME} พามู — ดูดวงออนไลน์`,
  description:
    "พามู พามูดูดวง พามั่งมี — ค้นพบแนวทางเรื่องงาน เงิน และความรัก",
};

/** Guanyin / classic landing — alternate entry at /mae */
export default function MaeClassicHomePage() {
  return <HomeScroll />;
}
