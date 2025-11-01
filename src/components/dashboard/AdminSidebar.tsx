import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck2,
  ChartPie,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Share2,
  Truck,
  Users,
  Waypoints,
  X,
  ClipboardList,
  Bell,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { resetAuthState } from "@/lib/stores/auth.store";

export type AdminSectionKey =
  | "dashboard"
  | "commandes"
  | "clients"
  | "chauffeurs"
  | "suivi"
  | "planification"
  | "factures"
  | "statistiques"
  | "messages"
  | "parametres";

interface AdminSidebarProps {
  activeSection?: AdminSectionKey;
  onSectionChange?: (section: AdminSectionKey) => void;
  onLogout?: () => Promise<void> | void;
  unreadMessages?: number;
  upcomingMeetings?: Array<{ id: string; title: string; schedule: string }>;
  adminName?: string;
  adminRole?: string;
}

const SIDEBAR_BG = "bg-[rgba(11,45,85,0.35)]";
const SIDEBAR_BORDER = "border-white/10";

const NAV_ITEMS: Array<{
  id: AdminSectionKey;
  label: string;
  icon: LucideIcon;
  path: string;
}> = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, path: "/dashboard-admin/tableau-de-bord" },
  { id: "commandes", label: "Commandes", icon: ClipboardList, path: "/dashboard-admin/commandes" },
  { id: "chauffeurs", label: "Chauffeurs", icon: Truck, path: "/dashboard-admin/chauffeurs" },
  { id: "clients", label: "Clients", icon: Users, path: "/dashboard-admin/clients" },
  { id: "statistiques", label: "Statistiques", icon: ChartPie, path: "/dashboard-admin/statistiques" },
  { id: "factures", label: "Factures", icon: FileText, path: "/dashboard-admin/factures" },
  { id: "messages", label: "Messagerie", icon: MessageSquare, path: "/dashboard-admin/messagerie" },
  { id: "parametres", label: "Paramètres", icon: Settings, path: "/dashboard-admin/parametres" },
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
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : false,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

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
    resetAuthState();
    navigate("/login");
  };

  const toggleMobileSidebar = () => setIsMobileOpen((value) => !value);
  const closeMobileSidebar = () => setIsMobileOpen(false);
  const toggleCollapse = () => setIsCollapsed((value) => !value);

  const showLabels = !isCollapsed || isMobileOpen;
  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 12]);

  const SidebarContent = (
    <motion.aside
      key="admin-sidebar"
      data-collapsed={isCollapsed}
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: isMobileOpen || isDesktop ? 0 : -320, opacity: 1 }}
      exit={{ x: -320, opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 32 }}
      className={cn(
        "glassmorphic fixed inset-y-0 left-0 z-40 flex h-screen flex-col border border-transparent md:top-4 md:left-4",
        "md:h-[calc(100vh-2rem)]",
        "rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.15)]",
        SIDEBAR_BG,
        SIDEBAR_BORDER,
        "text-[#F2F6FA] backdrop-blur-2xl transition-[width] duration-300",
        isCollapsed ? "w-[92px]" : "w-[236px]",
      )}
      aria-label="Navigation administrateur"
    >
      <div className="relative flex h-full flex-col overflow-hidden">
        <motion.div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/5" initial={{ opacity: 0 }} animate={{ opacity: 0.75 }} />

        <div className="relative flex items-center justify-between gap-2 px-6 pb-4 pt-6">
          <div className={cn("flex items-center gap-3", isCollapsed && "md:hidden")}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl font-semibold text-white shadow-inner">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Swift Connexion</p>
              <p className="text-lg font-semibold text-white">{adminName ?? "Administrateur"}</p>
              <p className="text-[11px] text-white/60">{roleLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleCollapse}
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:scale-105 hover:border-[#FFCC00]/60 hover:bg-[#FFCC00]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00] md:flex"
              aria-label={isCollapsed ? "Déplier la barre latérale" : "Réduire la barre latérale"}
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={closeMobileSidebar}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:scale-105 hover:border-[#FFCC00]/60 hover:bg-[#FFCC00]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00] md:hidden"
              aria-label="Fermer la navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative mx-6 mb-4 mt-2 h-px bg-white/20" />

        <motion.nav className="relative flex-1 overflow-y-auto px-3" style={{ y: parallaxY }}>
          <motion.ul
            className="space-y-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.05, delayChildren: 0.12 },
              },
            }}
          >
            {NAV_ITEMS.map((item) => {
              const link = (
                <NavLink
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    cn(
                      "group flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-left text-sm font-medium text-white/80 transition-all duration-300",
                      "hover:border-[#FFCC00]/60 hover:bg-[rgba(255,204,0,0.08)] hover:text-white",
                      isCollapsed && "justify-center px-0",
                      isActive && "border-[#FFCC00] bg-[rgba(255,204,0,0.2)] text-white",
                    )
                  }
                  onClick={closeMobileSidebar}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-all duration-300",
                      "group-hover:border-[#FFCC00] group-hover:bg-[#FFCC00]/20 group-hover:text-[#FFCC00]",
                      isCollapsed && "h-12 w-12",
                      "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className={cn("truncate text-base tracking-wide", isCollapsed && "hidden")}>{item.label}</span>
                  {item.id === "messages" && unreadMessages > 0 && !isCollapsed && (
                    <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#EF4444] px-1.5 text-[11px] font-semibold text-white">
                      {unreadLabel}
                    </span>
                  )}
                </NavLink>
              );

              return (
                <motion.li
                  key={item.id}
                  variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                  whileHover={{ scale: 1.04, boxShadow: "0 0 12px rgba(255,204,0,0.35)" }}
                >
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    link
                  )}
                </motion.li>
              );
            })}
          </motion.ul>

          {upcomingMeetings && upcomingMeetings.length > 0 && (
            <motion.div
              className={cn("mt-6 space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-xs text-white/80", isCollapsed && "hidden")}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/60">
                <CalendarCheck2 className="h-4 w-4" /> Agenda
              </p>
              <ul className="space-y-2">
                {upcomingMeetings.map((meeting) => (
                  <li key={meeting.id} className="rounded-2xl bg-white/10 px-3 py-2">
                    <p className="text-sm font-semibold text-white">{meeting.title}</p>
                    <p className="text-[11px] text-white/60">{meeting.schedule}</p>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </motion.nav>

        <div className="relative mt-auto px-4 pb-6 pt-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-inner">
            <div className="flex items-center justify-between gap-3 text-sm">
              <div className={cn("flex items-center gap-3", isCollapsed && "hidden")}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#0B2D55]/60 text-white shadow-inner">
                  <Bell className="h-4 w-4" />
                </span>
                <div className="text-left text-white">
                  <p className="text-sm font-semibold">Alertes smart dispatch</p>
                  <p className="text-xs text-white/60">Activez les notifications critiques</p>
                </div>
              </div>
              {!isCollapsed && (
                <button
                  type="button"
                  className="rounded-full border border-[#FFCC00]/40 bg-[#FFCC00]/10 px-3 py-1 text-xs font-semibold text-[#FFCC00] transition hover:border-[#FFCC00] hover:bg-[#FFCC00]/20"
                  onClick={closeMobileSidebar}
                >
                  Voir
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className={cn(
                "mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-transparent bg-[rgba(255,204,0,0.12)] px-4 py-3 text-sm font-semibold text-[#FFCC00] transition-all duration-300 hover:bg-[rgba(255,204,0,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]",
                isCollapsed && "justify-center px-0",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FFCC00]/40 bg-[#FFCC00]/10 text-[#FFCC00]">
                  <LogOut className="h-5 w-5" />
                </span>
                {!isCollapsed && <span className="text-base">Déconnexion</span>}
              </div>
              {!isCollapsed && <Share2 className="h-4 w-4 text-[#FFCC00]" />}
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <button
        type="button"
        onClick={toggleMobileSidebar}
        className="fixed left-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#0B2D55] text-white shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-[#0a274b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00] md:hidden"
        aria-label="Ouvrir la navigation"
      >
        <Menu className="h-6 w-6" />
      </button>

      <AnimatePresence>{(isMobileOpen || isDesktop) && SidebarContent}</AnimatePresence>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileSidebar}
          />
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
};

export default AdminSidebar;
