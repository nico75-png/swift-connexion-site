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
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[#2C3E50] flex flex-col">
        {/* Logo et titre */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
              SC
            </div>
            <div>
              <p className="text-xs text-slate-400">Connexion Swift</p>
              <p className="text-sm font-semibold text-white">Tableau de bord</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1" aria-label="Navigation du tableau de bord">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeSection === item.id;

            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-300 ease-out ${
                  isActive
                    ? "bg-slate-700 font-medium text-white"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span aria-hidden="true" className="text-base">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-6 py-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-4">
            <div className="flex items-center gap-4">
              <button type="button" className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-600 transition-colors duration-200 ease-out hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40">
                <span aria-hidden="true">🔔</span>
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-600" />
                <span className="sr-only">Voir les notifications</span>
              </button>
              <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">Clara Dupont</p>
                  <p className="text-xs text-slate-500">clara.dupont@swift.fr</p>
                </div>
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                    CD
                  </div>
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="text-xs text-slate-600 sm:text-right">
                <div>
                  Profil <span className="font-semibold">72%</span>
                </div>
                <div className="mt-0.5 h-1.5 w-full min-w-[160px] rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full w-[72%] rounded-full bg-blue-600" />
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
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-transparent px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 ease-out hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
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
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
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
