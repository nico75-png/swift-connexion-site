import Commandes from "@/components/dashboard-admin/commandes";
import DashboardAdminLayout from "@/components/layout/DashboardAdminLayout";

export default function CommandesAdmin() {
  return (
    <DashboardAdminLayout>
      <Commandes onCreateOrder={() => {}} />
    </DashboardAdminLayout>
  );
}
