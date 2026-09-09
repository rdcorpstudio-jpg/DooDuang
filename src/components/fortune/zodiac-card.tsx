import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ZodiacSignImage } from "@/components/fortune/zodiac-sign-image";
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
        className="cursor-pointer p-4 text-center transition-all duration-300 hover:scale-105 hover:border-brand-purple/40 group"
      >
        <div className="mb-1 flex justify-center transition-transform group-hover:scale-110">
          <ZodiacSignImage
            sign={zodiac.id}
            variant="orb"
            size={40}
            alt={zodiac.thaiName}
          />
        </div>
        <h3 className="text-sm font-semibold text-purple-100">{zodiac.thaiName}</h3>
        <p className="mt-0.5 text-[10px] text-purple-400/50">{zodiac.dateRange}</p>
      </Card>
    </Link>
  );
}
