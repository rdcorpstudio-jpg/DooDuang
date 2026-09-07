import { PricingCard } from "@/components/fortune/pricing-card";
import { AnimatedPage } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { SacredDivider } from "@/components/ui/sacred-mark";
import { CREDIT_PACKAGES } from "@/lib/stripe";
import { APP_NAME } from "@/lib/site";

export const metadata = {
  title: `ซื้อเครดิต — ${APP_NAME}`,
};

export default function PricingPage() {
  return (
    <AnimatedPage className="flex flex-col gap-3.5 px-4 py-6 pb-10">
      <PageHero
        align="center"
        title="ซื้อ"
        accent="เครดิต"
        subtitle="1 เครดิต = เปิดไพ่ 1 ครั้ง"
      />
      <SacredDivider className="mx-auto mb-2 opacity-70" />
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
