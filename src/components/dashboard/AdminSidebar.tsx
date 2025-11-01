import { useMemo, useState } from "react";
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
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "commandes", label: "Commandes", icon: ClipboardList },
  { id: "clients", label: "Clients", icon: Users },
  { id: "chauffeurs", label: "Chauffeurs", icon: Truck },
  { id: "factures", label: "Factures", icon: Wallet },
  { id: "statistiques", label: "Statistiques", icon: BarChart3 },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "parametres", label: "Paramètres", icon: Settings },
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const meetings = useMemo(
    () =>
      upcomingMeetings ?? [
        { id: "1", title: "Briefing logistique Express", schedule: "Aujourd'hui • 14:00" },
        { id: "2", title: "Revue incidents région Nord", schedule: "Aujourd'hui • 17:30" },
        { id: "3", title: "Point facturation mensuel", schedule: "Demain • 09:30" },
      ],
    [upcomingMeetings],
  );

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
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
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
          "group/sidebar fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-white/10 text-white/90 shadow-[32px_0_90px_-40px_rgba(8,12,24,0.65)]",
          "bg-gradient-to-b from-[#0F172A] via-[#101B2F] to-[#1E293B] transition-all duration-300 ease-out",
          "w-[88%] max-w-[300px] md:left-4 md:top-4 md:h-[calc(100vh-2rem)] md:w-[320px] md:rounded-[28px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed && !isMobileOpen ? "md:w-[104px]" : "",
        )}
        aria-label="Navigation administrateur"
      >
        <div className="flex items-center justify-between px-5 pb-6 pt-7 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-base font-semibold text-white">
              {initials}
            </div>
            {showLabels && (
              <div className="leading-tight">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/60">Swift Connexion</p>
                <p className="text-lg font-semibold text-white">Espace Admin</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleCollapse}
              className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white md:flex"
              aria-label={isCollapsed ? "Déployer la barre latérale" : "Réduire la barre latérale"}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={closeMobileSidebar}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] md:hidden"
              aria-label="Fermer la navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="px-5 md:px-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-xs text-white/70">
              <p className="text-sm font-semibold text-white">{adminName ?? "Administrateur"}</p>
              {showLabels && <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-white/50">{roleLabel}</p>}
            </div>
          </div>
          <nav className="mt-6 flex-1 overflow-y-auto px-3 py-2 md:px-4" aria-label="Sections administrateur">
            <ul className="space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSectionChange(item.id);
                        closeMobileSidebar();
                      }}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]",
                        isActive
                          ? "bg-[#2563EB]/90 text-white shadow-[0_16px_40px_-20px_rgba(59,130,246,0.85)]"
                          : "text-white/80 hover:bg-white/10 hover:text-white",
                        !showLabels ? "justify-center" : "",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 flex-shrink-0 transition-colors",
                          isActive ? "text-white" : "text-white/75 group-hover:text-white",
                        )}
                        aria-hidden="true"
                      />
                      {showLabels && <span className="flex-1 truncate text-[15px]">{item.label}</span>}
                      {item.id === "messages" && unreadMessages > 0 && (
                        <span className="ml-auto inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-white/15 px-2 text-[11px] font-semibold text-white">
                          {unreadLabel}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {showLabels && (
            <div className="mt-2 space-y-4 px-5 pb-6 pt-2 md:px-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/80 shadow-[0_18px_32px_-24px_rgba(15,23,42,0.8)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">Agenda</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">À venir</h3>
                  </div>
                  <CalendarClock className="h-5 w-5 text-white/70" aria-hidden="true" />
                </div>
                <ul className="mt-4 space-y-3">
                  {meetings.map((meeting) => (
                    <li key={meeting.id} className="rounded-2xl border border-white/5 bg-black/20 px-3 py-3">
                      <p className="text-sm font-medium text-white">{meeting.title}</p>
                      <p className="text-xs text-white/60">{meeting.schedule}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4 text-xs text-white/60">
                <div className="flex items-center gap-3 text-white/70">
                  <LifeBuoy className="h-5 w-5 text-white/60" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-white">Assistance dédiée</p>
                    <p className="text-xs text-white/60">Contactez le support One Connexion à tout moment.</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                >
                  <HelpCircle className="h-4 w-4" aria-hidden="true" />
                  Contacter l'assistance
                </button>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
