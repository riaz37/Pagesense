import Sidebar from "@/components/Sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 md:ml-[var(--sidebar-width)] h-full pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
