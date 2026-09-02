export default function ReadingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-full overflow-hidden sacred-page-bg">
      {children}
    </div>
  );
}
