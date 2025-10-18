import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { useOrdersStore } from "@/providers/AdminDataProvider";

const Admin = () => {
  const { ready } = useOrdersStore();

  return (
    <DashboardLayout sidebar={<AdminSidebar />} topbar={<Topbar title="Vue d'ensemble" />}>
      {!ready && (
        <div className="mb-6 rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          Chargement des données...
        </div>
      )}

      <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center text-muted-foreground">
        Aucune donnée disponible dans la vue d'ensemble.
      </div>
    </DashboardLayout>
  );
};

export default Admin;
