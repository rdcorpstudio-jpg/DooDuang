import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireDb } from "@/lib/db";
import { readings } from "@/lib/db/schema";
import { FortuneResultView } from "@/components/fortune/fortune-result-view";
import type { ExtendedFortuneResult } from "@/lib/fortune/extended";
import { READING_OPTIONS } from "@/lib/fortune/zodiac";
import type { FortuneProfile } from "@/lib/fortune/engine";

interface SavedReadingPageProps {
  params: Promise<{ token: string }>;
}

function parseFortune(raw: string): ExtendedFortuneResult | null {
  try {
    const data = JSON.parse(raw) as ExtendedFortuneResult;
    if (!data?.title || !Array.isArray(data.tabs)) return null;
    return data;
  } catch {
    return null;
  }
}

function parseProfile(raw: string | null): FortuneProfile | null {
  try {
    const data = raw ? (JSON.parse(raw) as FortuneProfile) : null;
    if (!data?.realName || !data.nickname || !data.birthDate || !data.gender) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export default async function SavedReadingPage({ params }: SavedReadingPageProps) {
  const { token } = await params;

  let reading;
  try {
    const db = requireDb();
    const rows = await db
      .select()
      .from(readings)
      .where(eq(readings.shareToken, token))
      .limit(1);
    reading = rows[0];
  } catch {
    notFound();
  }

  if (!reading) notFound();

  const result = parseFortune(reading.result);
  const profile = parseProfile(reading.input);
  const readingOption = READING_OPTIONS.find((option) => option.id === reading.type);

  if (!result || !profile || !readingOption) {
    return (
      <div className="relative flex h-full items-center justify-center px-6">
        <div className="relative z-10 text-center">
          <p className="text-purple-200/70">เปิดผลดูดวงนี้ไม่ได้</p>
          <Link href="/reading" className="mt-4 inline-block text-sm text-purple-400">
            ดูดวงใหม่
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="relative min-h-full px-5 py-6 pb-10">
        <div className="relative z-10">
          <FortuneResultView
            result={result}
            profile={profile}
            readingOption={readingOption}
            type={reading.type}
            shareToken={reading.shareToken}
          />
        </div>
      </div>
    </div>
  );
}
