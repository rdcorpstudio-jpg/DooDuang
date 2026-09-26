import type { Metadata } from "next";
import { StoryHome } from "@/components/story/story-home";
import { APP_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `เรื่องเล่าก่อนเริ่มดูดวง · ${APP_NAME}`,
  description:
    "บางเรื่องในชีวิตแค่รู้จังหวะก็กล้าเดินต่อ ดูตัวอย่างผลทำนาย ฟีเจอร์รายวัน และพรีเมียม 1 ปีของแม่มั่งมี",
};

export default function StoryHomePage() {
  return <StoryHome />;
}
