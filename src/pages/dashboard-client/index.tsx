import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import TableauDeBord from "@/components/dashboard-client/TableauDeBord";
import Commandes from "@/components/dashboard-client/Commandes";
import Factures from "@/components/dashboard-client/Factures";
import Suivi from "@/components/dashboard-client/Suivi";
import Messages from "@/components/dashboard-client/Messages";
import Parametres from "@/components/dashboard-client/Parametres";

type Section = "tableau-de-bord" | "commandes" | "factures" | "suivi" | "messages" | "parametres";

const DashboardClient = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<Section>("tableau-de-bord");

  useEffect(() => {
    const tab = searchParams.get("tab") as Section | null;
    if (tab && ["tableau-de-bord", "commandes", "factures", "suivi", "messages", "parametres"].includes(tab)) {
      setActiveSection(tab);
    }
  }, [searchParams]);

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    setSearchParams({ tab: section });
  };

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
