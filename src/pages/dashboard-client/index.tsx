import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import TableauDeBord from "@/components/dashboard-client/TableauDeBord";
import Commandes from "@/components/dashboard-client/Commandes";
import Factures from "@/components/dashboard-client/Factures";
import Suivi from "@/components/dashboard-client/Suivi";
import Messages from "@/components/dashboard-client/Messages";
import Parametres from "@/components/dashboard-client/Parametres";
import PageVierge from "@/components/dashboard-client/PageVierge";
import { cn } from "@/lib/utils";

type Section =
  | "tableau-de-bord"
  | "commandes"
  | "factures"
  | "suivi"
  | "messages"
  | "parametres"
  | "page-vierge";

const AVAILABLE_SECTIONS: Section[] = [
  "tableau-de-bord",
  "commandes",
  "factures",
  "suivi",
  "messages",
  "parametres",
  "page-vierge",
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

  if (activeSection === "page-vierge") {
    return <PageVierge />;
  }

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
      case "page-vierge":
        return <PageVierge />;
      default:
        return <TableauDeBord />;
    }
  };

  return (
    <div className={cn("flex min-h-screen w-full", activeSection === "page-vierge" ? "bg-white" : "bg-background")}>
      <ClientSidebar />
      <main className={cn("flex-1 p-6 md:ml-[216px] md:p-8 lg:p-12", activeSection === "page-vierge" && "p-0")}>
        <div className={cn("mx-auto max-w-7xl", activeSection === "page-vierge" && "max-w-none")}>
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default DashboardClient;
