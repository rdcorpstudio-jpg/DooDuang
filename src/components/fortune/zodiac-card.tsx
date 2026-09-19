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
        className="cursor-pointer p-4 text-center transition-all duration-300 hover:scale-105 hover:border-[#d5b16f]/40 group"
      >
        <div className="mb-1 flex justify-center transition-transform group-hover:scale-110">
          <ZodiacSignImage
            sign={zodiac.id}
            variant="orb"
            size={40}
            alt={zodiac.thaiName}
          />
        </div>
        <h3 className="text-[15.5px] font-semibold text-[#e8d19a]">{zodiac.thaiName}</h3>
        <p className="mt-0.5 text-[15.5px] font-medium text-[#bacce6]/70">
          {zodiac.dateRange}
        </p>
      </Card>
    </Link>
  );
}
