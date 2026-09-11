import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { APP_NAME_ACCENT, APP_NAME_PRIMARY } from "@/lib/site";

export async function Header() {
  const session = await auth();

  async function handleSignOut() {
    "use server";
    await signOut();
    redirect("/");
  }

  return (
    <header className="z-50 shrink-0 border-b sacred-chrome">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="group flex items-center gap-2">
          <Image
            src="/images/icons/star-gold.webp"
            alt=""
            width={22}
            height={22}
            className="object-contain"
            style={{ mixBlendMode: "screen" }}
            unoptimized
          />
          <span className="flex items-baseline gap-1">
            <span className="font-sacred text-[1.05rem] text-white transition-opacity group-hover:opacity-90">
              {APP_NAME_PRIMARY}
            </span>
            <span className="font-sacred intro-title-accent text-[1.05rem]">
              {APP_NAME_ACCENT}
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          {session?.user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  แดชบอร์ด
                </Button>
              </Link>
              <form action={handleSignOut}>
                <Button variant="ghost" size="sm" type="submit">
                  ออก
                </Button>
              </form>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">เข้าสู่ระบบ</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
