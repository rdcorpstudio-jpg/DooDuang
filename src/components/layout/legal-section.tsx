import type { ReactNode } from "react";
import { MysticFrame } from "@/components/ui/mystic-frame";

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <MysticFrame radius={14} contentClassName="space-y-2.5 p-4">
      <h2 className="text-[14px] font-semibold text-white">{title}</h2>
      <div className="space-y-2 text-[13px] leading-relaxed text-white/55">{children}</div>
    </MysticFrame>
  );
}
