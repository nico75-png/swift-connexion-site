import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import TableauDeBord from "@/components/dashboard-client/tableau-de-bord";
import Commandes from "@/components/dashboard-client/commandes";
import Factures from "@/components/dashboard-client/factures";
import Suivi from "@/components/dashboard-client/suivi";
import Messages from "@/components/dashboard-client/messages";
import Parametres from "@/components/dashboard-client/parametres";

type Section =
  | "tableau-de-bord"
  | "commandes"
  | "factures"
  | "suivi"
  | "messages"
  | "parametres";

const AVAILABLE_SECTIONS: Section[] = [
  "tableau-de-bord",
  "commandes",
  "factures",
  "suivi",
  "messages",
  "parametres",
];

const resolveSectionFromParams = (params: URLSearchParams): Section => {
  const tab = params.get("tab") as Section | null;
  return tab && AVAILABLE_SECTIONS.includes(tab) ? tab : "tableau-de-bord";
};

const DashboardClient = () => {
  const [searchParams] = useSearchParams();

  const [activeSection, setActiveSection] = useState<Section>(() => resolveSectionFromParams(searchParams));

  useEffect(() => {
    const section = resolveSectionFromParams(searchParams);
    if (section !== activeSection) {
      setActiveSection(section);
    }
  }, [searchParams, activeSection]);

  const renderSection = () => {
    switch (activeSection) {
      case "tableau-de-bord":
        return <TableauDeBord />;
      case "commandes":
        return <Commandes />;
      case "factures":
        return <Factures />;
      case "suivi":
        return <Suivi />;
      case "messages":
        return <Messages />;
      case "parametres":
        return <Parametres />;
      default:
        return <TableauDeBord />;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <ClientSidebar />
      <main className="flex-1 p-6 md:ml-[216px] md:p-8 lg:p-12">
        <div className="mx-auto max-w-7xl">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default DashboardClient;
