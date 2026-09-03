import type { ReactNode } from "react";

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-purple-100">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-purple-300/70">
        {children}
      </div>
    </section>
  );
}
