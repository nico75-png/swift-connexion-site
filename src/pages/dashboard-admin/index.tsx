import { useMemo } from "react";
import { ShoppingCart, DollarSign, TrendingUp, Users } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import AdminStatsCard from "@/components/dashboard-admin/AdminStatsCards";
import RecentOrdersTable from "@/components/dashboard-admin/RecentOrdersTable";
import UpcomingEvents from "@/components/dashboard-admin/UpcomingEvents";
import { useAuth } from "@/providers/AuthProvider";

const DashboardAdmin = () => {
  const { resolvedDisplayName, fallbackEmail } = useAuth();
  const displayName = resolvedDisplayName ?? fallbackEmail ?? "Administrateur";

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  }, []);

  return (
    <DashboardLayout
      sidebar={<AdminSidebar />}
      topbar={<Topbar userName={displayName} title={`${greeting}, ${displayName}`} />}
    >
      <div className="space-y-6">
        {/* Section des statistiques principales */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <AdminStatsCard
            label="Commandes du mois"
            value={247}
            icon={ShoppingCart}
            trend={{ value: 12.5, isPositive: true }}
            color="text-blue-600"
          />
          <AdminStatsCard
            label="Chiffre d'affaires"
            value="12 450 €"
            icon={DollarSign}
            trend={{ value: 8.3, isPositive: true }}
            color="text-emerald-600"
          />
          <AdminStatsCard
            label="Courses en cours"
            value={23}
            icon={TrendingUp}
            trend={{ value: 5.2, isPositive: true }}
            color="text-orange-600"
          />
          <AdminStatsCard
            label="Nouveaux clients"
            value={18}
            icon={Users}
            trend={{ value: 15.7, isPositive: true }}
            color="text-purple-600"
          />
        </div>

        {/* Section principale avec tableau et événements */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentOrdersTable />
          </div>
          <div>
            <UpcomingEvents />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAdmin;
