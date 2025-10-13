import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  topbar: ReactNode;
}

/**
 * Layout principal pour les dashboards (client & admin)
 * Sidebar fixe à gauche + Topbar + contenu principal
 */
const DashboardLayout = ({ children, sidebar, topbar }: DashboardLayoutProps) => {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar fixe */}
      {sidebar}
      
      {/* Zone principale avec topbar + contenu */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        {topbar}
        
        {/* Contenu principal scrollable */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
