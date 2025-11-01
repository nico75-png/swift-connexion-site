import { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar, { AdminSectionKey } from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import TableauDeBord from "@/components/dashboard-admin/tableau-de-bord";
import Commandes from "@/components/dashboard-admin/commandes";
import Clients from "@/components/dashboard-admin/clients";
import Chauffeurs from "@/components/dashboard-admin/chauffeurs";
import Factures from "@/components/dashboard-admin/factures";
import Statistiques from "@/components/dashboard-admin/statistiques";
import Messages from "@/components/dashboard-admin/messages";
import Parametres from "@/components/dashboard-admin/parametres";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

const notifications = [
  { id: "notif-1", message: "3 commandes express en cours", time: "Il y a 5 min", read: false },
  { id: "notif-2", message: "Nouveau message du dispatch Sud", time: "Il y a 18 min", read: false },
  { id: "notif-3", message: "Facture FAC-2025-125 en retard", time: "Il y a 32 min", read: true },
];

const SECTION_LABELS: Record<AdminSectionKey, string> = {
  dashboard: "Tableau de bord",
  commandes: "Commandes",
  clients: "Clients",
  chauffeurs: "Chauffeurs",
  factures: "Factures",
  statistiques: "Statistiques",
  messages: "Messages",
  parametres: "Paramètres",
};

const DashboardAdmin = () => {
  const { resolvedDisplayName, fallbackEmail, avatarUrl } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSectionKey>("dashboard");
  const displayName = resolvedDisplayName ?? fallbackEmail ?? "Administrateur";

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  }, []);

  const renderSection = useMemo(() => {
    switch (activeSection) {
      case "dashboard":
        return <TableauDeBord />;
      case "commandes":
        return <Commandes />;
      case "clients":
        return <Clients />;
      case "chauffeurs":
        return <Chauffeurs />;
      case "factures":
        return <Factures />;
      case "statistiques":
        return <Statistiques />;
      case "messages":
        return <Messages />;
      case "parametres":
        return <Parametres />;
      default:
        return <TableauDeBord />;
    }
  }, [activeSection]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <DashboardLayout
      sidebar={
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          unreadMessages={3}
          onLogout={handleLogout}
          adminName={displayName}
          adminRole="Gestion opérationnelle"
        />
      }
      topbar={
        <Topbar
          userName={displayName}
          title={`${greeting}, ${displayName}`}
          notifications={notifications}
          avatarUrl={avatarUrl}
          onCreateOrder={() => setActiveSection("commandes")}
          onScheduleReview={() => setActiveSection("statistiques")}
          className="border-none bg-transparent px-0"
        />
      }
    >
      <div className="relative isolate min-h-full bg-[#F8FAFC]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_60%)]" />
        <div className="mx-auto max-w-[1500px] space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200/70 bg-white/90 px-6 py-5 shadow-lg">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2563EB]">Espace administrateur</p>
              <h1 className="mt-2 font-['Inter'] text-3xl font-semibold text-slate-900">
                {SECTION_LABELS[activeSection]}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Survolez l'activité opérationnelle et prenez des décisions rapides et éclairées.
              </p>
            </div>
            <div className="rounded-3xl bg-[#2563EB]/10 px-4 py-3 text-sm font-semibold text-[#2563EB]">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </div>
          </div>
          <ScrollArea className="max-h-[calc(100vh-220px)] rounded-[32px] border border-slate-200/70 bg-white/70 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
            <div className="space-y-8 pb-10">{renderSection}</div>
          </ScrollArea>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAdmin;
