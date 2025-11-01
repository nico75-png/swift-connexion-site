import TableauDeBord from "@/components/dashboard-admin/tableau-de-bord";
import DashboardAdminLayout from "@/components/layout/DashboardAdminLayout";

export default function TableauDeBordAdmin() {
  return (
    <DashboardAdminLayout>
      <TableauDeBord
        onOpenOrderForm={() => {}}
        onOpenMessageComposer={() => {}}
        onOpenIncidentReport={() => {}}
      />
    </DashboardAdminLayout>
  );
}
