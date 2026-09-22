import { SpecialDraft } from "@/components/fortune/special-draft";
import { APP_NAME } from "@/lib/site";

export const metadata = {
  title: `ดวงพิเศษ — ${APP_NAME}`,
  description: "โหงวเฮ้ง ลายมือ และดวงคู่",
};

export default function SpecialPage() {
  return (
    <div className="preview-page-scroll relative h-full min-h-0 overflow-y-auto overscroll-contain">
      <SpecialDraft />
    </div>
  );
}
