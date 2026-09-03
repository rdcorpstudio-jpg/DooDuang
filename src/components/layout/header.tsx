import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { APP_NAME } from "@/lib/site";

export async function Header() {
  const session = await auth();

  return (
    <header className="shrink-0 z-50 border-b sacred-chrome">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-1.5 group">
          <Sparkles className="h-4 w-4 text-brand-purple-light" />
          <span className="font-sacred text-base text-purple-200">{APP_NAME}</span>
        </Link>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">แดชบอร์ด</Button>
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button variant="ghost" size="sm" type="submit">
                  ออก
                </Button>
              </form>
            </>
          ) : (
            <Link href="/reading">
              <Button size="sm">ดูดวง</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
