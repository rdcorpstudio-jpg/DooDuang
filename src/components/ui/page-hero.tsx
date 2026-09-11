import { cn } from "@/lib/utils";

/** Shared page title block — Mae navy–gold */
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
        "page-hero relative mb-5",
        align === "center" && "text-center",
        className
      )}
    >
      <h1 className="relative font-sans text-[1.55rem] font-bold leading-tight tracking-tight text-[#f7f4ec] sm:text-[1.65rem]">
        {title}
        {accent ? (
          <span className="ml-1.5 font-semibold text-[#d5b16f]">{accent}</span>
        ) : null}
      </h1>
      {subtitle ? (
        <p className="relative mt-2 text-[13px] leading-relaxed text-[#9aa3b2]">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
