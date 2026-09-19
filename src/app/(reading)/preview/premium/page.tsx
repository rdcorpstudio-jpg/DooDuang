import { redirect } from "next/navigation";

/** เทมเพลตหน้าดวงเก่าเลิกใช้ — ส่งต่อไปบ้านหลัก */
export default function PreviewPremiumPage() {
  redirect("/home");
}
