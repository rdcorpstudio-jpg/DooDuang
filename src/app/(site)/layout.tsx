import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col sacred-page-bg">
      <Header />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
      <Footer />
    </div>
  );
}
