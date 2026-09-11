import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { FORTUNE_PACKAGE_MONTHS } from "@/lib/site";

interface PricingCardProps {
  name: string;
  credits?: number;
  months?: number;
  price: number;
  description: string;
  popular?: boolean;
  packageId: string;
}

export function PricingCard({
  name,
  months = FORTUNE_PACKAGE_MONTHS,
  price,
  description,
  popular,
  packageId,
}: PricingCardProps) {
  return (
    <Card
      className={cn("ui-lift relative flex flex-col", popular && "pt-5")}
      glow={popular}
    >
      {popular ? (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#b8860b] via-[#e8c547] to-[#c9a227] px-3 py-0.5 text-[10px] font-semibold text-[#1f1704]">
          แนะนำ
        </span>
      ) : null}
      <h3 className="text-[15px] font-semibold text-white">{name}</h3>
      <p className="mt-1 text-[12px] text-white/40">{description}</p>
      <div className="my-4">
        <span className="text-[1.75rem] font-semibold tabular-nums text-white">
          {formatPrice(price)}
        </span>
        <span className="ml-2 text-[13px] text-white/45">
          / {months} เดือน
        </span>
      </div>
      <form action="/api/stripe/checkout" method="POST" className="mt-auto">
        <input type="hidden" name="packageId" value={packageId} />
        <input type="hidden" name="returnPath" value="/premium" />
        <Button
          type="submit"
          className={cn(
            "mae-gold-cta w-full border-0 text-[#101827] shadow-none hover:brightness-105",
            !popular && "opacity-95"
          )}
        >
          ปลดล็อกพรีเมียม
        </Button>
      </form>
    </Card>
  );
}
