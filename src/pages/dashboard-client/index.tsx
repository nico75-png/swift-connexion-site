import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, Loader2 } from "lucide-react";

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

type SectionKey =
  | "dashboard"
  | "commandes"
  | "suivi"
  | "factures"
  | "messages"
  | "parametres"
  | "aide";

type SidebarItem = {
  id: SectionKey;
  label: string;
  icon: string;
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "dashboard", label: "Tableau de bord", icon: "🏠" },
  { id: "commandes", label: "Commandes", icon: "📦" },
  { id: "suivi", label: "Suivi", icon: "📍" },
  { id: "factures", label: "Factures", icon: "🧾" },
  { id: "messages", label: "Messages", icon: "💬" },
  { id: "parametres", label: "Paramètres", icon: "⚙️" },
  { id: "aide", label: "Centre d'aide", icon: "❓" },
];

const DashboardClient = () => {
  const [activeSection, setActiveSection] = useState<SectionKey>("dashboard");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const hasHydratedSection = useRef(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedSection = session.get("activeSection");

    if (
      typeof savedSection === "string" &&
      SIDEBAR_ITEMS.some((item) => item.id === savedSection)
    ) {
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
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      toast({
        title: "Déconnexion effectuée",
        description: "Vous avez été déconnecté avec succès 👋",
      });

      session.clearAll();
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      toast({
        variant: "destructive",
        title: "Impossible de vous déconnecter",
        description: "Une erreur est survenue. Veuillez réessayer dans un instant.",
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

      if (
        !isTypingField &&
        event.ctrlKey &&
        event.shiftKey &&
        (event.key === "q" || event.key === "Q")
      ) {
        event.preventDefault();
        void handleLogout();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handleLogout]);

  const handleSectionChange = useCallback((section: SectionKey) => {
    setActiveSection(section);

    if (sidebarRef.current) {
      const activeButton = sidebarRef.current.querySelector<HTMLButtonElement>(
        `button[data-section="${section}"]`
      );

      activeButton?.focus({ preventScroll: true });
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

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900">
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
              <p className="text-sm font-semibold text-white/90">Espace client</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          ref={sidebarRef}
          className="relative flex-1 space-y-2 overflow-y-auto px-4 py-6"
          aria-label="Navigation du tableau de bord"
        >
          <div className="space-y-1.5">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <div key={item.id} className="relative">
                  {isActive ? (
                    <motion.span
                      layoutId="activeSidebarItem"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/90 via-indigo-500/90 to-blue-700/90 shadow-lg shadow-blue-600/25"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      aria-hidden="true"
                    />
                  ) : null}

                  <motion.button
                    type="button"
                    data-section={item.id}
                    onClick={() => handleSectionChange(item.id)}
                    className={`group relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${
                      isActive
                        ? "text-white"
                        : "text-slate-300 hover:text-white focus-visible:text-white"
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span
                      aria-hidden="true"
                      className={`text-lg transition-transform duration-300 ${isActive ? "scale-110" : "scale-100"}`}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {!isActive ? (
                      <span
                        className="h-2 w-2 rounded-full bg-white/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    ) : null}
                  </motion.button>
                </div>
              );
            })}
          </div>
        </nav>

        <div className="relative border-t border-white/10 px-6 py-6 text-xs text-slate-300">
          <p className="font-medium uppercase tracking-[0.28em] text-blue-200/70">Assistance</p>
          <p className="mt-2 text-sm text-slate-200/90">Support disponible 7j/7 via le centre d'aide One connexion.</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile brand + navigation */}
        <div className="border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-600/25">
              OC
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500/80">One connexion</p>
              <p className="text-sm font-semibold text-slate-900">Espace client</p>
            </div>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto" aria-label="Navigation principale mobile">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSectionChange(item.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Top bar */}
        <header className="flex flex-col gap-3 border-b border-slate-200/80 bg-white/70 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-end">
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/5 text-xl text-slate-600 transition-all duration-200 ease-out hover:bg-slate-900/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              >
                <span aria-hidden="true">🔔</span>
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500" />
                <span className="sr-only">Voir les notifications</span>
              </button>
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
              <div className="text-xs text-slate-600 sm:text-right">
                <div>
                  Profil <span className="font-semibold">72%</span>
                </div>
                <div className="mt-1 h-1.5 w-full min-w-[160px] overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isSigningOut) {
                    return;
                  }

                  void handleLogout();
                }}
                disabled={isSigningOut}
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/60 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 ease-out hover:border-red-100 hover:bg-red-50/80 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {isSigningOut ? (
                  <Loader2 className="h-4 w-4 animate-spin text-red-600" aria-hidden="true" />
                ) : (
                  <LogOut className="h-4 w-4 text-gray-500 transition-colors duration-200 group-hover:text-red-600" aria-hidden="true" />
                )}
                <span>Se déconnecter</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
          <div className="mx-auto w-full max-w-7xl">
            {/* Transition fluide entre les sections du tableau de bord */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="h-full"
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardClient;
