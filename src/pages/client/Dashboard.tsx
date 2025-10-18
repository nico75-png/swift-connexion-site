import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import CreateOrderButton from "@/components/dashboard/CreateOrderButton";
import StatsCard from "@/components/dashboard/StatsCard";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

/**
 * Dashboard principal du client
 * Vue d'ensemble avec stats, graphique et dernières commandes
 */
const ClientDashboard = () => {
  const notifications: Array<{ id: string; message: string; time: string; read: boolean }> = [];

  const stats: Array<{
    label: string;
    value: string | number;
    icon: LucideIcon;
    color?: string;
    trend?: { value: number; isPositive: boolean };
  }> = [];

  const recentOrders: Array<{ id: string; date: string; type: string; status: string; color: string }> = [];

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      info: "bg-info/10 text-info border-info/20",
      success: "bg-success/10 text-success border-success/20",
      warning: "bg-warning/10 text-warning border-warning/20",
    };
    return colors[color] || colors.info;
  };

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={<Topbar userName="Jean Dupont" notifications={notifications} />}
    >
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
            <p className="text-muted-foreground">Aperçu de votre activité</p>
          </div>
          <CreateOrderButton className="mt-3 sm:mt-0" />
        </div>

        {/* Stats KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.length > 0 ? (
            stats.map((stat, i) => <StatsCard key={i} {...stat} />)
          ) : (
            <div className="col-span-full rounded-lg border border-dashed border-muted-foreground/40 p-6 text-center text-sm text-muted-foreground">
              Aucune statistique disponible pour le moment.
            </div>
          )}
        </div>

        {/* Graphique activité (placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle>Activité des 30 derniers jours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Graphique des commandes par jour</p>
            </div>
          </CardContent>
        </Card>

        {/* Dernières commandes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Dernières commandes</CardTitle>
            <Button variant="outline" asChild>
              <Link to="/espace-client/commandes">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="rounded-lg border border-dashed border-muted-foreground/40 p-6 text-center text-sm text-muted-foreground">
                Aucune commande récente à afficher.
              </p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.type} • {order.date}</p>
                    </div>
                    <Badge className={getStatusColor(order.color)}>{order.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications récentes */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="rounded-lg border border-dashed border-muted-foreground/40 p-4 text-center text-sm text-muted-foreground">
                Aucune notification récente.
              </p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notif) => (
                  <div key={notif.id} className={`p-3 rounded-lg ${!notif.read ? "bg-primary/5" : "bg-muted/30"}`}>
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
