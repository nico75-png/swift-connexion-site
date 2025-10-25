import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  FileText,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import Sidebar, { type SidebarItem } from "./Sidebar";
import { supabase } from "@/integrations/supabase/client";

const adminNavigation: SidebarItem[] = [
  { icon: BarChart3, label: "Vue d'ensemble", to: "/admin", end: true },
  { icon: Package, label: "Commandes", to: "/admin/commandes" },
  { icon: Users, label: "Clients", to: "/admin/clients" },
  { icon: Truck, label: "Chauffeurs", to: "/admin/chauffeurs" },
  { icon: FileText, label: "Factures", to: "/admin/factures" },
  { icon: TrendingUp, label: "Statistiques", to: "/admin/statistiques" },
  { icon: MessageSquare, label: "Messages", to: "/admin/messages" },
  { icon: Settings, label: "Paramètres", to: "/admin/parametres" },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isMobileOpen]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erreur lors de la déconnexion", error);
      return;
    }
    navigate("/auth");
  };

  const footer = (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center justify-center gap-[var(--space-2)] rounded-[var(--radius-sm)] border border-[color:var(--border-subtle)] px-[var(--space-3)] py-[var(--space-2)] text-sm font-medium text-[color:var(--text-secondary)] transition-colors duration-150 hover:bg-[color:var(--bg-subtle)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-accent)]"
    >
      <LogOut className="h-4 w-4" aria-hidden />
      <span>Déconnexion</span>
    </button>
  );

  const sidebar = (
    <Sidebar
      title="One Connexion"
      subtitle="Administration"
      items={adminNavigation}
      footer={footer}
      collapsed={collapsed}
      onToggleCollapse={setCollapsed}
      onNavigate={() => setIsMobileOpen(false)}
    />
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-[color:var(--text-secondary)] shadow-[var(--elevation-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-accent)]"
        aria-label="Ouvrir la navigation"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>
      <div className="hidden h-full md:flex">{sidebar}</div>
      {isMobileOpen ? (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[color:var(--bg-overlay)]"
            aria-label="Fermer la navigation"
            onClick={() => setIsMobileOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative ml-auto h-full w-[min(320px,100%)] bg-[color:var(--bg-surface)] shadow-[var(--elevation-3)]"
          >
            <div className="flex items-center justify-end px-[var(--space-3)] py-[var(--space-2)]">
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--border-subtle)] text-sm font-medium text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-subtle)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-accent)]"
              >
                Fermer
              </button>
            </div>
            <Sidebar
              title="One Connexion"
              subtitle="Administration"
              items={adminNavigation}
              footer={footer}
              collapsed={false}
              onNavigate={() => setIsMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
};

export default AdminSidebar;
