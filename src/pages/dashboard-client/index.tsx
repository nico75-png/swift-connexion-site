import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, BellRing, CalendarClock, CheckCircle, LogOut, Loader2, MessageSquare, type LucideIcon } from "lucide-react";
import DashboardHome from "@/components/dashboard-client/DashboardHome";
import Commandes from "@/components/dashboard-client/Commandes";
import Suivi from "@/components/dashboard-client/Suivi";
import Factures from "@/components/dashboard-client/Factures";
import Messages from "@/components/dashboard-client/Messages";
import Parametres from "@/components/dashboard-client/Parametres";
import Aide from "@/components/dashboard-client/Aide";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { session } from "@/utils/session";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
const DashboardAdminLazy = lazy(() => import("@/pages/dashboard-admin"));

type SectionKey = "dashboard" | "commandes" | "suivi" | "factures" | "messages" | "parametres" | "aide";
type DashboardExperienceRole = "admin" | "user";
type SidebarItem = {
  id: SectionKey;
  label: string;
  icon: string;
};
type NotificationCategory = "messages" | "reminders" | "system";
type NotificationPriority = "high" | "medium" | "low";
type NotificationBadgeTone = "info" | "success" | "alert";
type NotificationItem = {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  timeLabel: string;
  occurredAt: Date;
  isRead: boolean;
  priority: NotificationPriority;
  badgeLabel?: string;
  badgeTone?: NotificationBadgeTone;
};
const SIDEBAR_ITEMS: SidebarItem[] = [{
  id: "dashboard",
  label: "Tableau de bord",
  icon: "🏠"
}, {
  id: "commandes",
  label: "Commandes",
  icon: "📦"
}, {
  id: "suivi",
  label: "Suivi",
  icon: "📍"
}, {
  id: "factures",
  label: "Factures",
  icon: "🧾"
}, {
  id: "messages",
  label: "Messages",
  icon: "💬"
}, {
  id: "parametres",
  label: "Paramètres",
  icon: "⚙️"
}, {
  id: "aide",
  label: "Centre d'aide",
  icon: "❓"
}];
const NOTIFICATION_SECTIONS: Array<{
  id: NotificationCategory;
  title: string;
  subtitle: string;
  defaultOrder: number;
}> = [{
  id: "messages",
  title: "Messages récents",
  subtitle: "Suivez les conversations directes et réponses rapides",
  defaultOrder: 0
}, {
  id: "reminders",
  title: "Rappels & événements",
  subtitle: "Ne manquez aucun rendez-vous ou suivi important",
  defaultOrder: 1
}, {
  id: "system",
  title: "Activité système",
  subtitle: "Historique des opérations et confirmations",
  defaultOrder: 2
}];
const NOTIFICATION_VISUALS: Record<NotificationCategory, {
  icon: LucideIcon;
  iconClassName: string;
  backgroundClassName: string;
}> = {
  messages: {
    icon: MessageSquare,
    iconClassName: "text-sky-600",
    backgroundClassName: "bg-sky-500/10"
  },
  reminders: {
    icon: CalendarClock,
    iconClassName: "text-violet-600",
    backgroundClassName: "bg-violet-500/10"
  },
  system: {
    icon: CheckCircle,
    iconClassName: "text-emerald-600",
    backgroundClassName: "bg-emerald-500/10"
  }
};
const BADGE_TONE_CLASSNAME: Record<NotificationBadgeTone, string> = {
  info: "border-sky-200 bg-sky-100 text-sky-700",
  success: "border-emerald-200 bg-emerald-100 text-emerald-700",
  alert: "border-rose-200 bg-rose-100 text-rose-700"
};
const PRIORITY_VALUE: Record<NotificationPriority, number> = {
  high: 3,
  medium: 2,
  low: 1
};

const DashboardAccessLoader = ({ label }: { label: string }) => (
  <div
    className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-100 text-slate-900"
    role="status"
    aria-live="polite"
  >
    <Loader2 className="h-10 w-10 animate-spin text-slate-400" aria-hidden="true" />
    <p className="text-sm font-medium text-slate-600">{label}</p>
  </div>
);

const ClientDashboardView = ({ role }: { role: DashboardExperienceRole }) => {
  const [activeSection, setActiveSection] = useState<SectionKey>("dashboard");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationItems, setNotificationItems] = useState<NotificationItem[]>([{
    id: "notif-1",
    category: "messages",
    title: "Nouveau message reçu",
    description: "Alex Martin vous a écrit il y a 2 min",
    timeLabel: "Il y a 2 min",
    occurredAt: new Date(Date.now() - 2 * 60 * 1000),
    isRead: false,
    priority: "high",
    badgeLabel: "Nouveau",
    badgeTone: "info"
  }, {
    id: "notif-2",
    category: "reminders",
    title: "Rappel de rendez-vous",
    description: "Visio One connexion demain à 10:30",
    timeLabel: "Demain à 10:30",
    occurredAt: new Date(Date.now() - 60 * 60 * 1000),
    isRead: false,
    priority: "high",
    badgeLabel: "Prioritaire",
    badgeTone: "alert"
  }, {
    id: "notif-3",
    category: "system",
    title: "Livraison confirmée",
    description: "Commande #45879 livrée avec succès",
    timeLabel: "Il y a 1 heure",
    occurredAt: new Date(Date.now() - 60 * 60 * 1000),
    isRead: false,
    priority: "medium",
    badgeLabel: "Commande",
    badgeTone: "success"
  }, {
    id: "notif-4",
    category: "messages",
    title: "Retour client traité",
    description: "Votre réponse à Sarah Lopez a été envoyée",
    timeLabel: "Il y a 3 heures",
    occurredAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    isRead: true,
    priority: "medium"
  }, {
    id: "notif-5",
    category: "reminders",
    title: "Suivi de commande",
    description: "Planifiez l'appel de suivi pour la commande #45874",
    timeLabel: "Dans 2 jours",
    occurredAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    isRead: true,
    priority: "low"
  }]);
  const navigate = useNavigate();
  const location = useLocation();
  const hasHydratedSection = useRef(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const unreadCount = useMemo(() => notificationItems.filter(notification => !notification.isRead).length, [notificationItems]);
  const sortedSections = useMemo(() => {
    const sectionsWithNotifications = NOTIFICATION_SECTIONS.map(section => {
      const notifications = notificationItems.filter(notification => notification.category === section.id).sort((a, b) => {
        if (a.isRead !== b.isRead) {
          return a.isRead ? 1 : -1;
        }
        if (PRIORITY_VALUE[a.priority] !== PRIORITY_VALUE[b.priority]) {
          return PRIORITY_VALUE[b.priority] - PRIORITY_VALUE[a.priority];
        }
        return b.occurredAt.getTime() - a.occurredAt.getTime();
      });
      const hasUnread = notifications.some(notification => !notification.isRead);
      const highestPriority = notifications.reduce<number>((max, notification) => {
        return Math.max(max, PRIORITY_VALUE[notification.priority]);
      }, 0);
      return {
        ...section,
        notifications,
        hasUnread,
        highestPriority
      };
    });
    return sectionsWithNotifications.filter(section => section.notifications.length > 0).sort((a, b) => {
      if (a.hasUnread !== b.hasUnread) {
        return a.hasUnread ? -1 : 1;
      }
      if (a.highestPriority !== b.highestPriority) {
        return b.highestPriority - a.highestPriority;
      }
      return a.defaultOrder - b.defaultOrder;
    });
  }, [notificationItems]);
  const handleNotificationClick = useCallback((notificationId: string) => {
    setNotificationItems(previous => previous.map(notification => notification.id === notificationId ? {
      ...notification,
      isRead: true
    } : notification));
    setIsNotificationsOpen(false);
  }, []);
  const handleMarkAllAsRead = useCallback(() => {
    setNotificationItems(previous => previous.map(notification => ({
      ...notification,
      isRead: true
    })));
  }, []);
  useEffect(() => {
    const savedSection = session.get("activeSection");
    if (typeof savedSection === "string" && SIDEBAR_ITEMS.some(item => item.id === savedSection)) {
      setActiveSection(savedSection as SectionKey);
    }
    hasHydratedSection.current = true;
  }, []);
  useEffect(() => {
    if (!hasHydratedSection.current) {
      return;
    }
    session.set("activeSection", activeSection);
  }, [activeSection]);
  useEffect(() => {
    session.set("lastRoute", location.pathname);
  }, [location.pathname]);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    sessionStorage.setItem("dash:brandName", "One connexion");
    sessionStorage.setItem("dash:lastScan", new Date().toISOString());
    const lastScan = sessionStorage.getItem("dash:lastScan");
    if (lastScan) {
      // Garder une trace côté console pour les audits de marque
      console.log("Dernier audit de marque effectué le :", lastScan);
    }
  }, []);
  const handleLogout = useCallback(async () => {
    if (isSigningOut) {
      return;
    }
    setIsSigningOut(true);
    try {
      const {
        error
      } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast({
        title: "Déconnexion effectuée",
        description: "Vous avez été déconnecté avec succès 👋"
      });
      session.clearAll();
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      toast({
        variant: "destructive",
        title: "Impossible de vous déconnecter",
        description: "Une erreur est survenue. Veuillez réessayer dans un instant."
      });
    } finally {
      setIsSigningOut(false);
    }
  }, [isSigningOut, navigate]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTypingField = tagName && ["input", "textarea"].includes(tagName);
      if (!isTypingField && event.ctrlKey && event.shiftKey && (event.key === "q" || event.key === "Q")) {
        event.preventDefault();
        void handleLogout();
        return;
      }
      if (event.key === "Escape") {
        setIsNotificationsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handleLogout]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isNotificationsOpen) {
        return;
      }
      const target = event.target as Node | null;
      if (notificationsRef.current && target instanceof Node) {
        if (!notificationsRef.current.contains(target)) {
          setIsNotificationsOpen(false);
        }
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationsOpen]);
  useEffect(() => {
    if (!isNotificationsOpen) {
      return;
    }
    const firstNotificationButton = notificationsRef.current?.querySelector<HTMLButtonElement>("button[data-notification-item]");
    firstNotificationButton?.focus({
      preventScroll: true
    });
  }, [isNotificationsOpen]);
  const handleSectionChange = useCallback((section: SectionKey) => {
    setActiveSection(section);
    if (sidebarRef.current) {
      const activeButton = sidebarRef.current.querySelector<HTMLButtonElement>(`button[data-section="${section}"]`);
      activeButton?.focus({
        preventScroll: true
      });
    }
  }, []);
  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardHome />;
      case "commandes":
        return <Commandes />;
      case "suivi":
        return <Suivi />;
      case "factures":
        return <Factures />;
      case "messages":
        return <Messages />;
      case "parametres":
        return <Parametres />;
      case "aide":
        return <Aide />;
      default:
        return <DashboardHome />;
    }
  };
  const roleTitle = role === "admin" ? "👑 Espace Administrateur" : "👤 Espace Utilisateur";
  const roleDescription = role === "admin"
    ? "Gérez l'ensemble de la plateforme, des utilisateurs et des opérations clés."
    : "Retrouvez vos commandes, messages et outils personnalisés en un clin d'œil.";
  const roleBadgeClassName = role === "admin"
    ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-[0_12px_28px_-18px_rgba(217,119,6,0.55)]"
    : "bg-slate-900 text-white shadow-[0_12px_28px_-18px_rgba(15,23,42,0.55)]";
  return <div className="flex h-screen bg-slate-100 text-slate-900">
      {/* Sidebar */}
      <aside className="relative hidden w-72 shrink-0 bg-slate-950/95 text-slate-100 shadow-2xl lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_transparent_55%)]" />
        {/* Logo et titre */}
        <div className="relative border-b border-white/10 px-6 py-7">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 text-base font-semibold text-white shadow-lg shadow-blue-600/30">
              OC
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.28em] text-blue-200/80">One connexion</p>
              <p className="text-sm font-semibold text-white/90">{roleTitle}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav ref={sidebarRef} className="relative flex-1 space-y-2 overflow-y-auto px-4 py-6" aria-label="Navigation du tableau de bord">
          <div className="space-y-1.5">
            {SIDEBAR_ITEMS.map(item => {
            const isActive = activeSection === item.id;
            return <div key={item.id} className="relative">
                  {isActive ? <motion.span layoutId="activeSidebarItem" className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/90 via-indigo-500/90 to-blue-700/90 shadow-lg shadow-blue-600/25" transition={{
                type: "spring",
                stiffness: 380,
                damping: 32
              }} aria-hidden="true" /> : null}

                  <motion.button type="button" data-section={item.id} onClick={() => handleSectionChange(item.id)} className={`group relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${isActive ? "text-white" : "text-slate-300 hover:text-white focus-visible:text-white"}`} whileHover={{
                x: 4
              }} whileTap={{
                scale: 0.98
              }} aria-current={isActive ? "page" : undefined}>
                    <span aria-hidden="true" className={`text-lg transition-transform duration-300 ${isActive ? "scale-110" : "scale-100"}`}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {!isActive ? <span className="h-2 w-2 rounded-full bg-white/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true" /> : null}
                  </motion.button>
                </div>;
          })}
          </div>
        </nav>

        <div className="relative border-t border-white/10 px-6 py-6 text-xs text-slate-300">
          <p className="font-medium uppercase tracking-[0.28em] text-blue-200/70">Assistance</p>
          <p className="mt-2 text-sm text-slate-200/90">Support disponible 7j/7 via le centre d'aide One connexion.</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-visible">
        {/* Mobile brand + navigation */}
        <div className="border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-600/25">
              OC
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500/80">One connexion</p>
              <p className="text-sm font-semibold text-slate-900">{roleTitle}</p>
            </div>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto" aria-label="Navigation principale mobile">
            {SIDEBAR_ITEMS.map(item => {
            const isActive = activeSection === item.id;
            return <button key={item.id} type="button" onClick={() => handleSectionChange(item.id)} className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${isActive ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`} aria-current={isActive ? "page" : undefined}>
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </button>;
          })}
          </nav>
        </div>

        {/* Top bar */}
        <header className="flex flex-col gap-3 border-b border-slate-200/80 bg-white/70 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-end">
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-4">
            <div className="flex items-center gap-4">
              <div className="relative" ref={notificationsRef}>
                

                <AnimatePresence>
                  {isNotificationsOpen ? <motion.div id="dashboard-notifications-menu" initial={{
                  opacity: 0,
                  y: -10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -10
                }} transition={{
                  duration: 0.2,
                  ease: "easeOut"
                }} className="absolute right-0 mt-3 w-96 max-w-[90vw] origin-top-right focus:outline-none z-[9999]" tabIndex={-1}>
                      <motion.div className="overflow-hidden rounded-2xl border border-border/40 bg-white/90 shadow-xl shadow-primary/10 backdrop-blur-md" initial={{
                    opacity: 0.9,
                    y: -6
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} exit={{
                    opacity: 0.9,
                    y: -6
                  }} transition={{
                    duration: 0.2,
                    ease: "easeOut"
                  }}>
                        <div className="flex items-start justify-between gap-4 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-5 py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-900">Vos notifications</p>
                            <p className="text-xs text-slate-500">Priorisez vos actions en un coup d'œil</p>
                          </div>
                          <button type="button" onClick={handleMarkAllAsRead} disabled={unreadCount === 0} className={cn("inline-flex items-center justify-center rounded-full border border-slate-200/70 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors duration-200", "hover:border-slate-300 hover:bg-slate-100/80 hover:text-slate-900", "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40", unreadCount === 0 ? "opacity-60" : "")}>
                            Tout marquer comme lu
                          </button>
                        </div>

                        <ScrollArea className="max-h-[500px]" role="menu" aria-label="Notifications récentes">
                          <div className="space-y-6 px-5 py-5">
                            {sortedSections.length > 0 ? sortedSections.map(section => <div key={section.id} className="space-y-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500/80">
                                        {section.title}
                                      </p>
                                      <p className="mt-1 text-xs text-slate-500">{section.subtitle}</p>
                                    </div>
                                    {section.hasUnread ? <Badge variant="secondary" className="border border-blue-200 bg-blue-100 text-[11px] font-medium uppercase tracking-wide text-blue-600">
                                        {section.notifications.filter(notification => !notification.isRead).length} non lues
                                      </Badge> : null}
                                  </div>

                                  <div className="space-y-2">
                                    {section.notifications.map(notification => {
                              const visuals = NOTIFICATION_VISUALS[notification.category];
                              const Icon = visuals.icon;
                              return <Card key={notification.id} className="group overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-0 shadow-none transition-all duration-200 hover:border-slate-200 hover:bg-slate-50/80 hover:shadow-[0_12px_30px_-18px_rgba(15,23,42,0.4)]">
                                          <button type="button" className="flex w-full items-start gap-3 px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40" data-notification-item role="menuitem" onClick={() => handleNotificationClick(notification.id)}>
                                            <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", visuals.backgroundClassName)}>
                                              <Icon className={cn("h-5 w-5 transition-transform duration-200", visuals.iconClassName, !notification.isRead ? "scale-[1.02]" : "scale-100")} aria-hidden="true" />
                                            </span>
                                            <span className="flex flex-1 flex-col gap-1">
                                              <span className="flex flex-wrap items-center gap-2">
                                                <span className={cn("text-sm font-semibold text-slate-900", notification.isRead ? "text-slate-700" : "text-slate-900")}>
                                                  {notification.title}
                                                </span>
                                                {notification.badgeLabel ? <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide", notification.badgeTone ? BADGE_TONE_CLASSNAME[notification.badgeTone] : "border-slate-200 bg-slate-100 text-slate-600")}>
                                                    {notification.badgeLabel}
                                                  </span> : null}
                                              </span>
                                              <span className="text-xs text-slate-500">{notification.description}</span>
                                              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
                                                {notification.timeLabel}
                                              </span>
                                            </span>
                                            <span aria-hidden="true" className={cn("mt-1 h-2 w-2 rounded-full transition-all duration-200", notification.isRead ? "bg-slate-200" : "bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.18)]")} />
                                          </button>
                                        </Card>;
                            })}
                                  </div>
                                </div>) : <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center text-sm text-slate-500">
                                <BellRing className="mb-3 h-6 w-6 text-slate-400" aria-hidden="true" />
                                <p className="font-medium text-slate-600">Aucune nouvelle notification</p>
                                <p className="mt-1 text-xs text-slate-400">Tout est à jour, revenez plus tard pour de nouvelles alertes.</p>
                              </div>}
                          </div>
                        </ScrollArea>

                        <div className="flex items-center justify-end gap-2 border-t border-slate-200/70 bg-gradient-to-r from-white via-slate-50 to-white px-5 py-3">
                          <button type="button" className="text-sm font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40" onClick={() => setIsNotificationsOpen(false)}>
                            Voir toutes les notifications
                          </button>
                        </div>
                      </motion.div>
                    </motion.div> : null}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">Clara Dupont</p>
                  <p className="text-xs text-slate-500">clara.dupont@one-connexion.com</p>
                </div>
                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-500 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/20">
                    CD
                  </div>
                  <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <button type="button" onClick={() => {
              if (isSigningOut) {
                return;
              }
              void handleLogout();
            }} disabled={isSigningOut} className="group flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/60 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 ease-out hover:border-red-100 hover:bg-red-50/80 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto">
                {isSigningOut ? <Loader2 className="h-4 w-4 animate-spin text-red-600" aria-hidden="true" /> : <LogOut className="h-4 w-4 text-gray-500 transition-colors duration-200 group-hover:text-red-600" aria-hidden="true" />}
                <span>Se déconnecter</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-lg shadow-blue-900/5 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Votre espace</p>
                  <h1 className="text-2xl font-semibold text-slate-900">{roleTitle}</h1>
                  <p className="text-sm text-slate-500">{roleDescription}</p>
                </div>
                <Badge className={cn("rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide", roleBadgeClassName)}>
                  {role === "admin" ? "Administrateur" : "Utilisateur"}
                </Badge>
              </div>
            </div>
            {/* Transition fluide entre les sections du tableau de bord */}
            <AnimatePresence mode="wait">
              <motion.div key={activeSection} initial={{
              opacity: 0,
              y: 12
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -12
            }} transition={{
              duration: 0.35,
              ease: "easeOut"
            }} className="h-full">
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>;
};

const DashboardClient = () => {
  const { status, userRole } = useAuth();
  const resolvedRole: DashboardExperienceRole = userRole === "admin" ? "admin" : "user";

  if (status === "loading") {
    return <DashboardAccessLoader label="Chargement de votre espace sécurisé…" />;
  }

  if (resolvedRole === "admin") {
    return (
      <Suspense fallback={<DashboardAccessLoader label="Chargement de l'espace administrateur…" />}>
        <DashboardAdminLazy />
      </Suspense>
    );
  }

  return <ClientDashboardView role={resolvedRole} />;
};

export default DashboardClient;

