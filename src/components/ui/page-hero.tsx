import { cn } from "@/lib/utils";

/** Shared page title block — modern mystic look */
export function PageHero({
  title,
  accent,
  subtitle,
  className,
  align = "left",
}: {
  title: string;
  accent?: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "page-hero relative mb-6",
        align === "center" && "text-center",
        className
      )}
    >
      <div className="page-hero-glow" aria-hidden />
      <h1 className="font-sacred relative text-[1.65rem] leading-tight tracking-wide text-white sm:text-[1.75rem]">
        {title}
        {accent ? <span className="intro-title-accent">{accent}</span> : null}
      </h1>
      {subtitle ? (
        <p className="relative mt-2 text-[13px] leading-relaxed text-white/45">{subtitle}</p>
      ) : null}
    </div>
  );
}
