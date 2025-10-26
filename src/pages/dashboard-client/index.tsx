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
    <div className="flex h-screen bg-[#F2F6FA] text-slate-900">
      <aside className="w-64 shrink-0 bg-[#0B2D55] p-6 text-white">
        <div className="mb-8">
          <p className="text-xs uppercase text-[#BBD4EF]">Swift Connexion</p>
          <p className="text-lg font-semibold">Espace client</p>
        </div>

        <nav className="flex flex-col gap-2" aria-label="Navigation du tableau de bord">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                  isActive
                    ? "bg-white/15 font-semibold text-white shadow-sm"
                    : "text-[#D0E3F9] hover:bg-white/10 hover:text-white"
                }`}
              >
                <span aria-hidden="true" className="text-lg">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-6xl">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default DashboardClient;
