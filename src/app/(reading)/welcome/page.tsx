import { redirect } from "next/navigation";

/** ชื่อเล่นกับเลือกเรื่องถูกตัด — ไปโชว์พรีเมียมเลย */
export default function WelcomePage() {
  redirect("/welcome/preview");
}
