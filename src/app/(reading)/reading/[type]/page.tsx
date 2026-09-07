import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ type: string }>;
}

export default async function ReadingTypePage({ params }: PageProps) {
  await params;
  redirect("/reading");
}
