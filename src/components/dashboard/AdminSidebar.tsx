import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Radar,
  Receipt,
  Settings,
  Sun,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

/**
 * Sidebar pour le dashboard admin
 * Navigation inspirée des dashboards SaaS modernes
 */
const AdminSidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileSidebar = () => {
    setIsMobileOpen((previous) => !previous);
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
    navigate("/login");
  };

  const menuItems = useMemo(
    () => [
      { icon: LayoutDashboard, label: "Tableau de bord", path: "/dashboard-admin" },
      { icon: ClipboardList, label: "Mes commandes", path: "/dashboard-admin/commandes" },
      { icon: Radar, label: "Suivi en temps réel", path: "/dashboard-admin/statistiques" },
      { icon: Receipt, label: "Mes factures", path: "/dashboard-admin/factures" },
      { icon: MessageCircle, label: "Messages", path: "/dashboard-admin/messages" },
      { icon: Settings, label: "Paramètres", path: "/dashboard-admin/parametres" },
    ],
    [],
  );

  const events = useMemo(
    () => [
      { id: 1, title: "Briefing client transport", time: "Aujourd'hui • 14:00", color: "bg-[#f97316]" },
      { id: 2, title: "Suivi des colis express", time: "Dans 2 h", color: "bg-[#2563eb]" },
      { id: 3, title: "Relance factures en attente", time: "Demain • 09:30", color: "bg-[#10b981]" },
    ],
    [],
  );

  const toggleTheme = () => {
    setIsDarkMode((previous) => !previous);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((previous) => !previous);
  };

  const sidebarPalette = isDarkMode
    ? {
        background: "bg-[#0f172a]",
        card: "bg-white/10",
        hover: "hover:bg-white/10 hover:border-white/30",
        text: "text-white",
        secondaryText: "text-white/70",
        border: "border-white/10",
        active: "bg-white/10 text-white border-white/40",
        shadow: "shadow-[0_24px_60px_-25px_rgba(15,23,42,0.7)]",
      }
    : {
        background: "bg-[#f9fafb]",
        card: "bg-white",
        hover: "hover:bg-white/80 hover:border-[#2563eb]/20",
        text: "text-[#333]",
        secondaryText: "text-[#6b7280]",
        border: "border-[#e5e7eb]",
        active: "bg-white text-[#2563eb] border-[#2563eb]/50",
        shadow: "shadow-[0_20px_45px_-20px_rgba(15,23,42,0.35)]",
      };

  const themeIcon = isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />;

  return (
    <>
      {!isMobileOpen && (
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="fixed left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-lg transition-all duration-300 hover:bg-[#1d4ed8] focus:outline-none focus:ring-4 focus:ring-[#2563eb]/30 md:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {isMobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden" onClick={closeMobileSidebar} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full w-[88%] max-w-[280px] flex-col transition-transform duration-300 md:relative md:w-full md:max-w-[260px]",
          sidebarPalette.background,
          sidebarPalette.shadow,
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className={cn("sidebar-header flex items-center gap-3 border-b px-6 py-6", sidebarPalette.border)}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563eb]/10 text-[#2563eb]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="flex flex-1 flex-col">
            <span className={cn("font-['Inter'] text-sm font-medium uppercase tracking-[0.12em]", sidebarPalette.secondaryText)}>
              swift connexion
            </span>
            <span className={cn("font-['Inter'] text-xl font-semibold", sidebarPalette.text)}>Tableau pro</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-medium transition-all duration-300",
                sidebarPalette.border,
                sidebarPalette.hover,
                sidebarPalette.text,
              )}
              aria-label="Changer de thème"
            >
              {themeIcon}
            </button>
            <button
              type="button"
              onClick={closeMobileSidebar}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-black/5 text-current transition-all duration-300 hover:bg-black/10 focus:outline-none focus:ring-4 focus:ring-black/10 md:hidden"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex h-full flex-1 flex-col overflow-hidden">
          <nav className="menu-list flex-1 overflow-y-auto px-4 py-6">
            <ul className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/dashboard-admin"}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-300",
                        sidebarPalette.border,
                        sidebarPalette.text,
                        isActive ? sidebarPalette.active : sidebarPalette.hover,
                        "hover:translate-x-1",
                      )
                    }
                    onClick={closeMobileSidebar}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className={cn("events-section mx-4 mb-6 rounded-3xl border px-5 py-5 shadow-sm", sidebarPalette.border, sidebarPalette.card)}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-['Inter'] text-xs font-semibold uppercase tracking-[0.22em] text-[#2563eb]">événements</p>
                <h3 className={cn("mt-1 font-['Inter'] text-base font-semibold", sidebarPalette.text)}>À ne pas manquer</h3>
              </div>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563eb]/10 text-[#2563eb] transition-transform duration-300 hover:scale-105"
                aria-label="Voir le calendrier"
              >
                <CalendarCheck2 className="h-5 w-5" />
              </button>
            </div>
            <ul className="space-y-4">
              {events.map((event) => (
                <li key={event.id} className="flex items-start gap-3">
                  <span className={cn("mt-1 inline-flex h-2.5 w-2.5 rounded-full", event.color)} aria-hidden />
                  <div className="flex flex-col">
                    <p className={cn("font-['Inter'] text-sm font-medium", sidebarPalette.text)}>{event.title}</p>
                    <span className={cn("text-xs", sidebarPalette.secondaryText)}>{event.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={cn("user-profile mx-4 mb-6 rounded-3xl border px-4 py-4", sidebarPalette.border, sidebarPalette.card)}>
            <button type="button" onClick={toggleProfileMenu} className="flex w-full items-center gap-3 text-left">
              <span className="relative h-12 w-12 overflow-hidden rounded-2xl bg-[#2563eb]/10">
                <img
                  src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80"
                  alt="Profil utilisateur"
                  className="h-full w-full object-cover"
                />
              </span>
              <div className="flex-1">
                <p className={cn("font-['Inter'] text-sm font-semibold", sidebarPalette.text)}>Mila Laurent</p>
                <span className={cn("text-xs", sidebarPalette.secondaryText)}>Operations Manager</span>
              </div>
              {isProfileMenuOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {isProfileMenuOpen && (
              <div className="mt-4 space-y-2 text-sm">
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 rounded-2xl px-3 py-2 transition-colors duration-200",
                    sidebarPalette.hover,
                  )}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Support</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left transition-colors duration-200",
                    sidebarPalette.hover,
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
