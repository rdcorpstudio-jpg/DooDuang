import { CalendarDraft } from "@/components/fortune/calendar-draft";
import { APP_NAME } from "@/lib/site";

export const metadata = {
  title: `ปฏิทินฤกษ์ — ${APP_NAME}`,
  description: "ดูฤกษ์รายวัน ภาพรวมเดือนและปี",
};

export default function CalendarPage() {
  return (
    <div className="preview-page-scroll relative h-full overflow-y-auto overscroll-contain">
      <CalendarDraft />
    </div>
  );
}
