import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Package,
  Users,
  Truck,
  FileText,
  TrendingUp,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

/**
 * Sidebar pour le dashboard admin
 * Navigation complète avec toutes les sections
 */
const AdminSidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

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
    }
    closeMobileSidebar();
    navigate("/auth");
  };

  const menuItems = [
    { icon: BarChart3, label: "Vue d'ensemble", path: "/admin" },
    { icon: Package, label: "Commandes", path: "/admin/commandes" },
    { icon: Users, label: "Clients", path: "/admin/clients" },
    { icon: Truck, label: "Chauffeurs", path: "/admin/chauffeurs" },
    { icon: FileText, label: "Factures", path: "/admin/factures" },
    { icon: TrendingUp, label: "Statistiques", path: "/admin/statistiques" },
    { icon: MessageSquare, label: "Messages", path: "/admin/messages" },
    { icon: Settings, label: "Paramètres", path: "/admin/parametres" },
  ];

  return (
    <>
      {!isMobileOpen && (
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="fixed left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors duration-200 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-ring md:hidden"
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
          "fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r border-border bg-primary text-primary-foreground shadow-large transition-transform duration-300 md:relative md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-6">
          <div>
            <h1 className="font-sans text-xl font-semibold text-primary-foreground">One Connexion</h1>
            <p className="mt-1 text-xs text-primary-foreground/70">Administration</p>
          </div>
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors duration-200 hover:bg-primary-foreground/20 focus:outline-none focus:ring-2 focus:ring-ring md:hidden"
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
              end={item.path === "/admin"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-5 py-4 text-sm font-medium transition-colors duration-200 border-l-2 border-transparent",
                  isActive
                    ? "bg-primary-dark text-cta border-cta"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground hover:border-primary-foreground/40"
                )
              }
              onClick={closeMobileSidebar}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

          <div className="border-t border-border px-4 py-5">
            <button
              className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-primary-foreground/80 transition-colors duration-200 hover:bg-primary-foreground/10 hover:text-primary-foreground"
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

export default AdminSidebar;
