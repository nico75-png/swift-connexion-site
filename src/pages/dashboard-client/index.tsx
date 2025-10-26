import { useState } from "react";

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
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-slate-700 font-medium text-white"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                }`}
              >
                <span aria-hidden="true" className="text-base">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button className="relative">
              <span className="text-xl">🔔</span>
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-600" />
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">Clara Dupont</p>
                <p className="text-xs text-slate-500">clara.dupont@swift.fr</p>
              </div>
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  CD
                </div>
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
              </div>
            </div>
            <div className="text-xs text-slate-600">
              <div>Profil <span className="font-semibold">72%</span></div>
              <div className="mt-0.5 h-1.5 w-20 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full w-[72%] bg-blue-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="mx-auto w-full max-w-7xl">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardClient;
