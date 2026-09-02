import Link from "next/link";
import { Sparkles } from "lucide-react";
import { APP_NAME } from "@/lib/site";

export function Footer() {
  return (
    <footer className="shrink-0 border-t sacred-chrome py-4 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-brand-purple-light" />
          <span className="text-xs font-medium text-purple-300/60">{APP_NAME}</span>
        </div>
        <div className="flex gap-4 text-xs text-purple-400/50">
          <Link href="/#fortune" className="hover:text-purple-300 transition-colors">
            ไพ่
          </Link>
        </div>
      </div>
    </footer>
  );
}
