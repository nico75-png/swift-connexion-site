import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import TableauDeBord from "@/components/dashboard-admin/TableauDeBord";
import Commandes from "@/components/dashboard-admin/Commandes";
import Clients from "@/components/dashboard-admin/Clients";
import Chauffeurs from "@/components/dashboard-admin/Chauffeurs";
import Factures from "@/components/dashboard-admin/Factures";
import Statistiques from "@/components/dashboard-admin/Statistiques";
import Messages from "@/components/dashboard-admin/Messages";
import Parametres from "@/components/dashboard-admin/Parametres";

type Section = "tableau-de-bord" | "commandes" | "clients" | "chauffeurs" | "factures" | "statistiques" | "messages" | "parametres";

const DashboardAdmin = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<Section>("tableau-de-bord");

  useEffect(() => {
    const tab = searchParams.get("tab") as Section | null;
    if (tab && ["tableau-de-bord", "commandes", "clients", "chauffeurs", "factures", "statistiques", "messages", "parametres"].includes(tab)) {
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
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 md:ml-[260px] md:p-8 lg:p-12">
        <div className="mx-auto max-w-7xl">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default DashboardAdmin;
