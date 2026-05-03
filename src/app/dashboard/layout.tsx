import { Sidebar } from "@/components/layout/sidebar";
import { MobileDrawer } from "@/components/layout/mobile-drawer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <MobileDrawer />
      <main className="flex flex-1 flex-col overflow-hidden min-w-0">{children}</main>
    </div>
  );
}
