/** Page enter handled by root `app/template.tsx` — avoid double fade. */
export default function SiteTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
