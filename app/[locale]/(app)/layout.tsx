import Sidebar from "@/components/Sidebar";
import ShellTopBar from "@/components/ShellTopBar";
import { UploadJobsProvider } from "@/lib/uploadJobsContext";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UploadJobsProvider>
      <div className="flex h-full">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full min-w-0 transition-[margin] duration-200 ease-out md:ms-[var(--sidebar-current)]">
          <ShellTopBar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </UploadJobsProvider>
  );
}
