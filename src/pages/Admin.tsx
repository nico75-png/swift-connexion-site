import { Link } from "react-router-dom";
import { Users, Package, TrendingUp, Activity, AlertCircle, Clock } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import StatsCard from "@/components/dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/**
 * Dashboard admin - Vue d'ensemble
 * KPIs, graphique hebdo, dernières commandes et nouveaux clients
 */
const Admin = () => {
  // KPIs du mois
  const stats = [
    { label: "Commandes ce mois", value: 247, icon: Package, color: "text-primary", trend: { value: 12, isPositive: true } },
    { label: "Urgentes", value: 23, icon: AlertCircle, color: "text-warning" },
    { label: "En cours", value: 18, icon: Clock, color: "text-info" },
    { label: "Clients actifs", value: 156, icon: Users, color: "text-success", trend: { value: 8, isPositive: true } },
  ];

  // Données graphique hebdomadaire
  const weeklyData = [
    { name: "Lun", commandes: 32 },
    { name: "Mar", commandes: 45 },
    { name: "Mer", commandes: 38 },
    { name: "Jeu", commandes: 52 },
    { name: "Ven", commandes: 48 },
    { name: "Sam", commandes: 18 },
    { name: "Dim", commandes: 14 },
  ];

  // Dernières commandes
  const recentOrders = [
    { id: "010", client: "Cabinet Dupont", status: "En cours", driver: "Marc D.", amount: 45.5, time: "Il y a 15 min" },
    { id: "009", client: "Optique Vision", status: "Livré", driver: "Julie L.", amount: 38, time: "Il y a 1h" },
    { id: "1000", client: "Lab Médical", status: "En attente", driver: "-", amount: 52, time: "Il y a 2h" },
    { id: "1001", client: "Avocat & Associés", status: "Enlevé", driver: "Pierre M.", amount: 41, time: "Il y a 3h" },
  ];

  // Nouveaux clients
  const newClients = [
    { name: "Pharmacie Centrale", sector: "Santé", signupDate: "Aujourd'hui", orders: 0 },
    { name: "Cabinet Martin", sector: "Juridique", signupDate: "Hier", orders: 2 },
    { name: "Opticien Plus", sector: "Optique", signupDate: "Il y a 2j", orders: 5 },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Livré": "bg-success/10 text-success border-success/20",
      "En cours": "bg-info/10 text-info border-info/20",
      "Enlevé": "bg-secondary/10 text-secondary border-secondary/20",
      "En attente": "bg-warning/10 text-warning border-warning/20",
      "Annulé": "bg-destructive/10 text-destructive border-destructive/20",
    };
    return colors[status] || "";
  };

  return (
    <DashboardLayout
      sidebar={<AdminSidebar />}
      topbar={<Topbar title="Vue d'ensemble" />}
    >
      {/* KPIs */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      {/* Graphique hebdo */}
      <Card className="mb-8 border-none shadow-soft">
        <CardHeader>
          <CardTitle>Évolution hebdomadaire des commandes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line type="monotone" dataKey="commandes" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Dernières commandes */}
        <Card className="border-none shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Dernières commandes</CardTitle>
            <Link to="/admin/commandes">
              <Button variant="ghost" size="sm">Voir tout</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-base">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-sm font-semibold">{order.id}</span>
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.client} • {order.driver}</p>
                    <p className="text-xs text-muted-foreground">{order.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{order.amount}€</p>
                    <Link to={`/admin/commandes/${order.id}`}>
                      <Button variant="ghost" size="sm">Détails</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nouveaux clients */}
        <Card className="border-none shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Nouveaux clients</CardTitle>
            <Link to="/admin/clients">
              <Button variant="ghost" size="sm">Voir tout</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {newClients.map((client, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-base">
                  <div className="flex-1">
                    <p className="font-semibold mb-1">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.sector}</p>
                    <p className="text-xs text-muted-foreground mt-1">{client.signupDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-2">{client.orders} commandes</p>
                    <Link to={`/admin/clients/${i + 1}`}>
                      <Button variant="outline" size="sm">Voir fiche</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
