import { ReactNode } from "react";
import ClientSidebar from "@/components/dashboard/ClientSidebar";

interface DashboardClientLayoutProps {
  children: ReactNode;
}

export default function DashboardClientLayout({ children }: DashboardClientLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-100">
      <ClientSidebar />
      <main className="flex-1 overflow-y-auto md:ml-[236px]">
        {children}
      </main>
    </div>
  );
}
