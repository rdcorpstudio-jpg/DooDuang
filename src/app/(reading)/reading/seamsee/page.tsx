import { FortuneSeamseePage } from "@/components/fortune/fortune-seamsee-page";
import { APP_NAME } from "@/lib/site";

export const metadata = {
  title: `เซียมซี — ${APP_NAME}`,
  description: "ตั้งจิต เขย่ากระบอก แล้วเปิดใบเซียมซีวันละหนึ่งใบ",
};

export default function SeamseePage() {
  return <FortuneSeamseePage />;
}
