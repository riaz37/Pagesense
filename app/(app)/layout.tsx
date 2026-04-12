import Sidebar from "@/components/Sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 ml-[var(--sidebar-width)] h-full">
        {children}
      </main>
    </div>
  );
}
