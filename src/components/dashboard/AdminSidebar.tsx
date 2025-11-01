import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  CalendarClock,
  ClipboardList,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Truck,
  Users,
  Wallet,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export type AdminSectionKey =
  | "dashboard"
  | "commandes"
  | "clients"
  | "chauffeurs"
  | "factures"
  | "statistiques"
  | "messages"
  | "parametres";

interface AdminSidebarProps {
  activeSection: AdminSectionKey;
  onSectionChange: (section: AdminSectionKey) => void;
  onLogout?: () => Promise<void> | void;
  unreadMessages?: number;
  upcomingMeetings?: Array<{ id: string; title: string; schedule: string }>;
  adminName?: string;
  adminRole?: string;
}

const NAV_ITEMS: Array<{
  id: AdminSectionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }> | string;
  isEmoji?: boolean;
}> = [
  { id: "dashboard", label: "Tableau de bord", icon: "🏠", isEmoji: true },
  { id: "commandes", label: "Commandes", icon: "📦", isEmoji: true },
  { id: "statistiques", label: "Suivi", icon: "📍", isEmoji: true },
  { id: "factures", label: "Factures", icon: "📄", isEmoji: true },
  { id: "messages", label: "Messages", icon: "💬", isEmoji: true },
  { id: "parametres", label: "Paramètres", icon: Settings, isEmoji: false },
];

/**
 * Sidebar pour le dashboard admin avec navigation interactive
 */
const AdminSidebar = ({
  activeSection,
  onSectionChange,
  onLogout,
  unreadMessages = 0,
  upcomingMeetings,
  adminName,
  adminRole,
}: AdminSidebarProps) => {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const unreadLabel = unreadMessages > 9 ? "9+" : String(unreadMessages);

  const initials = useMemo(() => {
    if (!adminName) {
      return "AD";
    }
    const parts = adminName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);
    if (parts.length === 0) {
      return "AD";
    }
    return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "AD";
  }, [adminName]);

  const roleLabel = adminRole ?? "Administrateur principal";

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    } else {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erreur lors de la déconnexion", error);
        return;
      }
    }
    navigate("/login");
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen((previous) => !previous);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed((previous) => !previous);
  };

  const showLabels = !isCollapsed || isMobileOpen;

  return (
    <>
      <button
        type="button"
        onClick={toggleMobileSidebar}
        className="fixed left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-lg transition hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2563EB]/40 md:hidden"
        aria-label="Ouvrir la navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={closeMobileSidebar}
          role="presentation"
        />
      )}
      <aside
        data-collapsed={isCollapsed}
              className={cn(
                "group/sidebar fixed inset-y-0 left-0 z-40 flex h-screen flex-col text-white/90",
                "bg-[#2C4A7C] transition-all duration-300 ease-out",
                "w-[280px]",
                isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                isCollapsed && !isMobileOpen ? "md:w-[80px]" : "",
              )}
        aria-label="Navigation administrateur"
      >
        <div className="px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4A6FA5] text-xl font-bold text-white">
              {initials}
            </div>
            {showLabels && (
              <div className="leading-tight">
                <p className="text-xs font-medium uppercase tracking-wider text-white/60">UNE CONNEXION</p>
                <p className="mt-1 flex items-center gap-1 text-base font-semibold text-white">
                  👑 Espace
                </p>
                <p className="text-base font-semibold text-white">Administrateur</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center text-white/60 transition hover:text-white md:hidden"
            aria-label="Fermer la navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <nav className="flex-1 overflow-y-auto px-4 py-2" aria-label="Sections administrateur">
            <ul className="space-y-2">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                const IconComponent = !item.isEmoji ? item.icon as React.ComponentType<{ className?: string }> : null;
                
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSectionChange(item.id);
                        closeMobileSidebar();
                      }}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-medium transition-all duration-200",
                        isActive
                          ? "bg-[#4A6FA5] text-white"
                          : "text-white/80 hover:bg-white/10 hover:text-white",
                        !showLabels ? "justify-center" : "",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.isEmoji ? (
                        <span className="text-xl" aria-hidden="true">{item.icon as string}</span>
                      ) : IconComponent ? (
                        <IconComponent className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                      ) : null}
                      {showLabels && <span className="flex-1 truncate">{item.label}</span>}
                      {item.id === "messages" && unreadMessages > 0 && showLabels && (
                        <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                          {unreadLabel}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            
            {showLabels && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {}}
                  className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-medium text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white"
                >
                  <HelpCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <span className="flex-1 truncate">Centre d'aide</span>
                </button>
              </div>
            )}
          </nav>

          {showLabels && (
            <div className="mt-auto border-t border-white/10 px-4 py-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">ASSISTANCE</p>
                  <p className="mt-2 text-sm text-white/70">
                    Support disponible 7j/7 via le centre d'aide Une connexion.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
