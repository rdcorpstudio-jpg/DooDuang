import { PricingCard } from "@/components/fortune/pricing-card";
import { AnimatedPage } from "@/components/ui/reveal";
import { CREDIT_PACKAGES } from "@/lib/stripe";
import { APP_NAME } from "@/lib/site";

export const metadata = {
  title: `ซื้อเครดิต — ${APP_NAME}`,
};

export default function PricingPage() {
  return (
    <AnimatedPage className="flex flex-col gap-4 px-4 py-6 pb-10">
      <div className="mb-4 text-center">
        <h1 className="mb-1 text-2xl font-bold text-white">
          ซื้อ<span className="text-gradient">เครดิต</span>
        </h1>
        <p className="text-sm text-purple-300/50">1 เครดิต = เปิดไพ่ 1 ครั้ง</p>
      </div>
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
    </AnimatedPage>
  );
}
