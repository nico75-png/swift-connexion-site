import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

import DashboardHome from "@/components/dashboard-client/DashboardHome";
import Commandes from "@/components/dashboard-client/Commandes";
import Suivi from "@/components/dashboard-client/Suivi";
import Factures from "@/components/dashboard-client/Factures";
import Messages from "@/components/dashboard-client/Messages";
import Parametres from "@/components/dashboard-client/Parametres";
import Aide from "@/components/dashboard-client/Aide";

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

  const activeItem = SIDEBAR_ITEMS.find((item) => item.id === activeSection);

  const handleSectionChange = (section: SectionKey) => {
    setActiveSection(section);
  };

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
    <div className="flex min-h-screen bg-[#F9FAFB] text-slate-900">
      <aside className="relative hidden w-72 shrink-0 flex-col bg-gradient-to-b from-[#1E3A8A] via-[#2563EB] to-[#1D4ED8] text-white shadow-xl lg:flex">
        <div className="px-6 pt-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-bold text-[#2563EB] shadow-lg shadow-black/10">
              OC
            </div>
            <div className="flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">One Connexion</p>
              <p className="text-sm text-white/90">L'efficacité logistique, en toute transparence.</p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4 text-xs leading-relaxed text-white/80">
            <p className="text-sm font-semibold text-white">Tableau de bord client</p>
            <p>Suivez vos indicateurs clés, vos flux et vos échanges en temps réel.</p>
          </div>
        </div>
        <nav className="mt-8 flex-1 space-y-1 px-4 pb-6" aria-label="Navigation du tableau de bord">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeSection === item.id;

            return (
              <div key={item.id} className="relative">
                {isActive ? (
                  <motion.span
                    layoutId="active-sidebar-item"
                    className="absolute inset-0 rounded-xl bg-white/15 shadow-[0_12px_32px_rgba(37,99,235,0.35)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    aria-hidden
                  />
                ) : null}
                <motion.button
                  type="button"
                  onClick={() => handleSectionChange(item.id)}
                  className={cn(
                    "relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-all duration-300",
                    isActive
                      ? "text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10",
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span aria-hidden="true" className="text-lg">
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              </div>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-6 py-6">
          <p className="text-sm font-semibold text-white">Support One Connexion</p>
          <p className="mt-1 text-xs leading-relaxed text-white/80">
            Besoin d'aide ? Notre équipe est joignable 7j/7.
          </p>
          <a
            href="mailto:support@one-connexion.com"
            className="mt-3 inline-flex items-center text-sm font-semibold text-white transition hover:text-blue-100"
          >
            support@one-connexion.com
          </a>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">One Connexion</p>
              <h1 className="mt-1 text-xl font-semibold text-slate-900">{activeItem?.label ?? "Tableau de bord"}</h1>
            </div>
            <div className="flex items-center gap-5">
              <motion.button
                type="button"
                className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500 transition hover:bg-[#E0F2FE] hover:text-[#2563EB]"
                whileTap={{ scale: 0.94 }}
                aria-label="Ouvrir les notifications"
              >
                <span aria-hidden>🔔</span>
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
              </motion.button>
              <div className="flex items-center gap-3 rounded-full bg-slate-100/80 px-3 py-2 shadow-inner">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">Clara Dupont</p>
                  <p className="text-xs text-slate-500">clara.dupont@one-connexion.com</p>
                </div>
                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2563EB] text-sm font-semibold text-white shadow-lg">
                    CD
                  </div>
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
                </div>
              </div>
              <div className="hidden sm:block text-xs text-slate-600">
                <div>
                  Profil <span className="font-semibold text-slate-900">72%</span>
                </div>
                <div className="mt-1 h-2 w-24 rounded-full bg-slate-200">
                  <div className="h-full w-[72%] rounded-full bg-[#2563EB]" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:hidden">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => handleSectionChange(item.id)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-[#2563EB] text-white shadow-lg shadow-blue-500/30"
                      : "bg-slate-100 text-slate-600 hover:bg-[#E0F2FE] hover:text-[#2563EB]",
                  )}
                  whileTap={{ scale: 0.97 }}
                >
                  <span aria-hidden>{item.icon}</span>
                  {item.label}
                </motion.button>
              );
            })}
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto bg-[#F9FAFB] px-4 pb-10 pt-6 md:px-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#1D4ED8] p-6 text-white shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">Accueil One Connexion</p>
                  <h2 className="mt-2 text-2xl font-semibold">Bienvenue dans votre hub opérationnel</h2>
                  <p className="mt-2 max-w-xl text-sm text-white/80">
                    Pilotez vos commandes, vos factures et votre assistance depuis un espace unique.
                    Vos données sont synchronisées en temps réel via api.one-connexion.com.
                  </p>
                </div>
                <div className="rounded-xl bg-white/15 px-4 py-3 text-sm font-medium text-white backdrop-blur">
                  Domaine sécurisé<br />
                  <span className="text-white/90">https://one-connexion.com</span>
                </div>
              </div>
            </section>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
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
