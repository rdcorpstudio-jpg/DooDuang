import { cn } from "@/lib/utils";
import { StarfieldBackground } from "@/components/layout/starfield-background";
import { BottomNav } from "@/components/layout/bottom-nav";

interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
}

export function PhoneFrame({ children, className }: PhoneFrameProps) {
  return (
    <div className="phone-shell">
      <div className={cn("phone-frame", className)}>
        <StarfieldBackground />
        <div className="relative z-[2] flex h-full flex-col">
          <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
