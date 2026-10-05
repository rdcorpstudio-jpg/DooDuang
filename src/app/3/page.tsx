import type { Metadata } from "next";
import { StoryHome } from "@/components/story/story-home";
import { APP_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `สมัครแล้วเริ่มดูดวง · ${APP_NAME}`,
  description:
    "บางเรื่องในชีวิตแค่รู้จังหวะก็กล้าเดินต่อ สมัครด้วย Google LINE หรือเบอร์ แล้วเริ่มดูดวงกับแม่มั่งมี",
};

export default function StoryLoginHomePage() {
  return <StoryHome mode="login" />;
}
