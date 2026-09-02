import { cn } from "@/lib/utils";
import { StarfieldBackground } from "@/components/layout/starfield-background";

interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
}

export function PhoneFrame({ children, className }: PhoneFrameProps) {
  return (
    <div className="phone-shell">
      <div className={cn("phone-frame", className)}>
        <StarfieldBackground />
        <div className="relative z-[2] h-full">{children}</div>
      </div>
    </div>
  );
}
