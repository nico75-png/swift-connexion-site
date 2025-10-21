import { useState } from "react";
import { NavLink } from "react-router-dom";
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

/**
 * Sidebar pour le dashboard admin
 * Navigation complète avec toutes les sections
 */
const AdminSidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
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
          className="fixed left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-[#0F3556] text-white shadow-lg transition-colors duration-200 hover:bg-[#113C63] focus:outline-none focus:ring-2 focus:ring-white/40 md:hidden"
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
          "fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r border-white/10 bg-[#0F3556] text-white shadow-[4px_0_12px_rgba(0,0,0,0.18)] transition-transform duration-300 md:relative md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
          <div>
            <h1 className="font-sans text-xl font-semibold text-white">One Connexion</h1>
            <p className="mt-1 text-xs text-white/70">Administration</p>
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
              end={item.path === "/admin"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-5 py-4 text-sm font-medium transition-colors duration-200 border-l-2 border-transparent",
                  isActive
                    ? "bg-[#113C63] text-[#FFB800] border-[#FFB800]"
                    : "text-white/80 hover:bg-white/10 hover:text-white hover:border-white/40"
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
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-white/80 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            type="button"
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
