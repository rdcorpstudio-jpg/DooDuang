import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { MaeBrandLink } from "@/components/layout/mae-brand-link";

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
        <MaeBrandLink href="/" />

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
