import { redirect } from "next/navigation";

/** พรีวิวดวงฟรีเก่าเลิกใช้ — ส่งต่อไปบ้านหลัก */
export default function PreviewDailyFreePage() {
  redirect("/home");
}
