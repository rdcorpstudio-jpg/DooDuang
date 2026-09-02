import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { ZodiacInfo } from "@/lib/fortune/zodiac";

interface ZodiacCardProps {
  zodiac: ZodiacInfo;
  href: string;
}

export function ZodiacCard({ zodiac, href }: ZodiacCardProps) {
  return (
    <Link href={href}>
      <Card
        glow
        className="text-center cursor-pointer hover:border-brand-purple/40 hover:scale-105 transition-all duration-300 group p-4"
      >
        <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">
          {zodiac.symbol}
        </div>
        <h3 className="font-semibold text-purple-100 text-sm">{zodiac.thaiName}</h3>
        <p className="text-[10px] text-purple-400/50 mt-0.5">{zodiac.dateRange}</p>
      </Card>
    </Link>
  );
}
