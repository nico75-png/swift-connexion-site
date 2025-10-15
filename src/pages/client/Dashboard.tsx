import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import CreateOrderButton from "@/components/dashboard/CreateOrderButton";
import StatsCard from "@/components/dashboard/StatsCard";
import { Package, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

/**
 * Dashboard principal du client
 * Vue d'ensemble avec stats, graphique et dernières commandes
 */
const ClientDashboard = () => {
  const notifications = [
    { id: "1", message: "Votre commande 009 est en cours de livraison", time: "Il y a 5 min", read: false },
    { id: "2", message: "Nouveau message du chauffeur", time: "Il y a 1h", read: false },
    { id: "3", message: "Facture FACT-2025-01 disponible", time: "Il y a 2h", read: true },
  ];

  const stats = [
    { label: "En cours", value: 3, icon: Clock, color: "text-info", trend: { value: 15, isPositive: true } },
    { label: "Livrées", value: 47, icon: CheckCircle2, color: "text-success", trend: { value: 8, isPositive: true } },
    { label: "Urgentes", value: 1, icon: Package, color: "text-warning", trend: { value: -20, isPositive: false } },
    { label: "Annulées", value: 2, icon: XCircle, color: "text-destructive", trend: { value: 0, isPositive: true } },
  ];

  const recentOrders = [
    { id: "009", date: "15/01/2025", type: "Document juridique", status: "En cours", color: "info" },
    { id: "010", date: "14/01/2025", type: "Colis médical", status: "Livré", color: "success" },
    { id: "1000", date: "14/01/2025", type: "Monture optique", status: "Livré", color: "success" },
  ];

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
          {stats.map((stat, i) => (
            <StatsCard key={i} {...stat} />
          ))}
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
          </CardContent>
        </Card>

        {/* Notifications récentes */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.slice(0, 3).map((notif) => (
                <div key={notif.id} className={`p-3 rounded-lg ${!notif.read ? "bg-primary/5" : "bg-muted/30"}`}>
                  <p className="text-sm">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
