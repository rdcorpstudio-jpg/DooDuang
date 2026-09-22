import { PredictDraft } from "@/components/fortune/predict-draft";
import { APP_NAME } from "@/lib/site";

export const metadata = {
  title: `ทำนาย — ${APP_NAME}`,
  description: "เลือกศาสตร์ทำนาย ไพ่ สีเสื้อ ปาจื้อ และอื่น ๆ",
};

export default function PredictPage() {
  return (
    <div className="preview-page-scroll relative h-full min-h-0 overflow-y-auto overscroll-contain">
      <PredictDraft />
    </div>
  );
}
