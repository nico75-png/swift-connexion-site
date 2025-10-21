import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FileText,
  TrendingUp,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthProfile } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

/**
 * Sidebar pour l'espace client
 * Navigation principale avec icônes et labels
 */
const ClientSidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { resolvedDisplayName, fallbackEmail } = useAuthProfile();
  const sidebarName = resolvedDisplayName ?? fallbackEmail ?? "Profil client";

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erreur lors de la déconnexion", error);
      return;
    }

    closeMobileSidebar();
    navigate("/connexion");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Tableau de bord", path: "/espace-client" },
    { icon: Package, label: "Mes commandes", path: "/espace-client/commandes" },
    { icon: FileText, label: "Factures", path: "/espace-client/factures" },
    { icon: TrendingUp, label: "Dépenses", path: "/espace-client/depenses" },
    { icon: MessageSquare, label: "Messages", path: "/espace-client/messages" },
    { icon: User, label: "Profil", path: "/espace-client/profil" },
    { icon: Settings, label: "Préférences", path: "/espace-client/preferences" },
  ];

  return (
    <>
      {!isMobileOpen && (
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="fixed left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-colors duration-200 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-white/40 md:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r border-white/10 bg-primary text-white shadow-[4px_0_12px_rgba(0,0,0,0.18)] transition-transform duration-300 md:relative md:border-white/10 md:translate-x-0 md:shadow-[4px_0_12px_rgba(0,0,0,0.18)]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
          <div>
            <h1 className="font-sans text-xl font-semibold text-white">One Connexion</h1>
            <p className="mt-1 text-xs text-white/70">Espace Client</p>
            <div className="mt-3">
              <p className="text-sm font-medium text-white truncate">{sidebarName}</p>
              {fallbackEmail && (
                <p className="text-xs text-white/70 truncate">{fallbackEmail}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 md:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/espace-client"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "bg-primary-dark text-[#FFB800]"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )
              }
              onClick={closeMobileSidebar}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-5">
          <button
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            type="button"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ClientSidebar;
