import { PricingCard } from "@/components/fortune/pricing-card";
import { AnimatedPage } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { SacredDivider } from "@/components/ui/sacred-mark";
import { CREDIT_PACKAGES } from "@/lib/stripe-catalog";
import { APP_NAME, FORTUNE_PACKAGE_MONTHS, FORTUNE_UNLOCK_PRICE } from "@/lib/site";

export const metadata = {
  title: `แพ็กเกจพรีเมียม — ${APP_NAME}`,
};

export default function PricingPage() {
  return (
    <AnimatedPage className="flex flex-col gap-3.5 px-4 py-6 pb-10">
      <PageHero
        align="center"
        title="แพ็กเกจ"
        accent="พรีเมียม"
        subtitle={`ใช้งานได้ ${FORTUNE_PACKAGE_MONTHS} เดือน · ${FORTUNE_UNLOCK_PRICE} บาท`}
      />
      <SacredDivider className="mx-auto mb-2 opacity-70" />
      {CREDIT_PACKAGES.map((pkg) => (
        <PricingCard
          key={pkg.id}
          packageId={pkg.id}
          name={pkg.name}
          months={"months" in pkg ? pkg.months : FORTUNE_PACKAGE_MONTHS}
          price={pkg.price}
          description={pkg.description}
          popular={"popular" in pkg && Boolean(pkg.popular)}
        />
      ))}
    </AnimatedPage>
  );
}
