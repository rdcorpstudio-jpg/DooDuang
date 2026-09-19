import { redirect } from "next/navigation";

/** เมนูเก่าเลิกใช้ — ส่งต่อไปบ้านหลัก */
export default function MenuPage() {
  redirect("/home");
}
