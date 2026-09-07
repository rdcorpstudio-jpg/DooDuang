import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  credits: number;
  price: number;
  description: string;
  popular?: boolean;
  packageId: string;
}

export function PricingCard({
  name,
  credits,
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
          ยอดนิยม
        </span>
      ) : null}
      <h3 className="text-[15px] font-semibold text-white">{name}</h3>
      <p className="mt-1 text-[12px] text-white/40">{description}</p>
      <div className="my-4">
        <span className="text-[1.75rem] font-semibold tabular-nums text-white">
          {formatPrice(price)}
        </span>
        <span className="ml-2 text-[13px] text-white/45">{credits} เครดิต</span>
      </div>
      <form action="/api/stripe/checkout" method="POST" className="mt-auto">
        <input type="hidden" name="packageId" value={packageId} />
        <Button type="submit" variant={popular ? "primary" : "secondary"} className="w-full">
          ซื้อเลย
        </Button>
      </form>
    </Card>
  );
}
