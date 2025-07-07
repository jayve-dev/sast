export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <aside>Side bar</aside>
      <main>{children}</main>
    </div>
  );
}