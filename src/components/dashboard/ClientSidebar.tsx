import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  PhoneCall,
  Settings,
  Truck,
} from "lucide-react";
import Sidebar, { type SidebarItem } from "./Sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuthProfile } from "@/providers/AuthProvider";

const primaryNavigation: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Tableau de bord", to: "/dashboard", end: true },
  { icon: Package, label: "Mes commandes", to: "/commandes" },
  { icon: Truck, label: "Suivi en temps réel", to: "/suivi" },
  { icon: FileText, label: "Mes factures", to: "/factures" },
  { icon: MessageSquare, label: "Messages", to: "/messages" },
  { icon: Settings, label: "Paramètres", to: "/parametres" },
];

const secondaryNavigation: SidebarItem[] = [
  { icon: PhoneCall, label: "Support client", to: "/support" },
  { icon: HelpCircle, label: "Centre d'aide", to: "/aide" },
];

const ClientSidebar = () => {
  const { resolvedDisplayName, fallbackEmail } = useAuthProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  const sidebarName = resolvedDisplayName ?? fallbackEmail ?? "Profil client";
  const greeting = useMemo(() => {
    const firstName = sidebarName.split(" ")[0] ?? sidebarName;
    return `Bonjour, ${firstName}`;
  }, [sidebarName]);

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
      subtitle={greeting}
      items={primaryNavigation}
      secondaryItems={secondaryNavigation}
      footer={footer}
      collapsed={collapsed && isHydrated}
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
              subtitle={greeting}
              items={primaryNavigation}
              secondaryItems={secondaryNavigation}
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

export default ClientSidebar;
