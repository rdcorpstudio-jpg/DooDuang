import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

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
      className={`relative flex flex-col ${popular ? "border-purple-500/50 ring-1 ring-purple-500/20" : ""}`}
      glow={popular}
    >
      {popular && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 text-[10px] font-medium bg-brand-purple text-white rounded-full">
          ยอดนิยม
        </span>
      )}
      <h3 className="text-base font-semibold text-purple-100">{name}</h3>
      <p className="text-purple-400/50 text-xs mt-0.5">{description}</p>
      <div className="my-4">
        <span className="text-2xl font-bold text-white">{formatPrice(price)}</span>
        <span className="text-purple-400/60 text-sm ml-2">{credits} เครดิต</span>
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
