import { ReactNode } from "react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { useLocation } from "react-router-dom";

interface DashboardAdminLayoutProps {
  children: ReactNode;
}

const SECTION_MAP: Record<string, string> = {
  "tableau-de-bord": "dashboard",
  "commandes": "commandes",
  "chauffeurs": "chauffeurs",
  "clients": "clients",
  "statistiques": "statistiques",
  "factures": "factures",
  "messagerie": "messages",
  "parametres": "parametres",
};

export default function DashboardAdminLayout({ children }: DashboardAdminLayoutProps) {
  const location = useLocation();
  
  const activeSection = (() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    return SECTION_MAP[lastSegment] || "dashboard";
  })();

  return (
    <div className="flex h-screen bg-slate-100">
      <AdminSidebar 
        activeSection={activeSection as any}
        onSectionChange={() => {}}
        adminName="Administrateur"
        adminRole="Gestion opérationnelle"
      />
      <main className="flex-1 overflow-y-auto md:ml-[236px]">
        {children}
      </main>
    </div>
  );
}
