import { PricingCard } from "@/components/fortune/pricing-card";
import { CREDIT_PACKAGES } from "@/lib/stripe";
import { APP_NAME } from "@/lib/site";

export const metadata = {
  title: `ซื้อเครดิต — ${APP_NAME}`,
};

export default function PricingPage() {
  return (
    <div className="px-4 py-6 pb-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          ซื้อ<span className="text-gradient">เครดิต</span>
        </h1>
        <p className="text-purple-300/50 text-sm">1 เครดิต = เปิดไพ่ 1 ครั้ง</p>
      </div>
      <div className="flex flex-col gap-4">
        {CREDIT_PACKAGES.map((pkg) => (
          <PricingCard
            key={pkg.id}
            packageId={pkg.id}
            name={pkg.name}
            credits={pkg.credits}
            price={pkg.price}
            description={pkg.description}
            popular={"popular" in pkg && pkg.popular}
          />
        ))}
      </div>
    </div>
  );
}
