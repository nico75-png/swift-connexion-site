import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  ShieldAlert,
  Truck,
  Users,
  Wallet,
  X,
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
}: AdminSidebarProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
        className={cn(
          "relative flex h-full flex-col bg-[#0F172A] text-slate-200 transition-transform duration-300 md:translate-x-0",
          "w-[88%] max-w-[290px] rounded-r-[32px] border-r border-white/5 shadow-[24px_0_60px_-30px_rgba(15,23,42,0.85)] md:w-full",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB]/15 text-[#60A5FA]">
              <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">swift connexion</p>
              <p className="text-xl font-semibold text-white">Espace Admin</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] md:hidden"
            aria-label="Fermer la navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-2">
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
                        "group flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-left text-sm font-semibold transition",
                        isActive
                          ? "bg-white text-[#0F172A] shadow-lg"
                          : "bg-white/5 text-slate-200 hover:bg-white/10",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-[#2563EB]" : "text-slate-400 group-hover:text-[#60A5FA]",
                        )}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.id === "messages" && unreadMessages > 0 && (
                        <span className="ml-auto inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-[#2563EB] px-2 text-xs font-semibold text-white">
                          {unreadLabel}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="space-y-4 px-5 pb-7">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200 shadow-inner">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Agenda</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">À venir</h3>
                </div>
                <CalendarClock className="h-5 w-5 text-[#60A5FA]" aria-hidden="true" />
              </div>
              <ul className="mt-4 space-y-3">
                {meetings.map((meeting) => (
                  <li key={meeting.id} className="rounded-2xl bg-black/10 px-3 py-3">
                    <p className="text-sm font-medium text-white">{meeting.title}</p>
                    <p className="text-xs text-slate-300">{meeting.schedule}</p>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
