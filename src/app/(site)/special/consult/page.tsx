import { FortuneConsultPage } from "@/components/fortune/fortune-consult-page";
import { APP_NAME } from "@/lib/site";

export const metadata = {
  title: `ปรึกษาแม่ — ${APP_NAME}`,
  description: "คุยกับแม่เรื่องที่อยู่ในใจ รัก งาน เงิน หรืออะไรก็ได้",
};

export default function ConsultMaePage() {
  return (
    <div className="preview-page-scroll relative h-full overflow-y-auto overscroll-contain">
      <FortuneConsultPage />
    </div>
  );
}
