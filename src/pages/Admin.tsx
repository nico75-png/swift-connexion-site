import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, Loader2, Truck, Users, Zap } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClients, type ClientRecord } from "@/lib/clientStorage";
import { useDriversStore, useOrdersStore } from "@/providers/AdminDataProvider";

const Admin = () => {
  const { orders, ready } = useOrdersStore();
  const { drivers } = useDriversStore();
  const [clients, setClients] = useState<ClientRecord[]>([]);

  useEffect(() => {
    const refreshClients = () => {
      setClients(getClients());
    };

    refreshClients();
    if (typeof window === "undefined") {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "oc_clients") {
        refreshClients();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshClients);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshClients);
    };
  }, []);

  const currentMonth = useMemo(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  }, []);

  const monthlyOrdersCount = useMemo(() => {
    return orders.filter((order) => {
      const start = new Date(order.schedule?.start ?? "");
      return (
        !Number.isNaN(start.getTime()) &&
        start.getMonth() === currentMonth.month &&
        start.getFullYear() === currentMonth.year
      );
    }).length;
  }, [currentMonth, orders]);

  const urgentOrdersCount = useMemo(
    () => orders.filter((order) => order.options?.express).length,
    [orders],
  );

  const inProgressOrdersCount = useMemo(
    () => orders.filter((order) => order.status === "En cours").length,
    [orders],
  );

  const activeDriverCount = useMemo(
    () => drivers.filter((driver) => driver.active && driver.lifecycleStatus !== "INACTIF").length,
    [drivers],
  );

  const weeklyOrdersData = useMemo(() => {
    const labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;
    const counts = labels.map(() => 0);

    orders.forEach((order) => {
      const start = new Date(order.schedule?.start ?? "");
      if (Number.isNaN(start.getTime())) {
        return;
      }
      const day = start.getDay();
      const index = day === 0 ? 6 : day - 1;
      counts[index] += 1;
    });

    return labels.map((label, index) => ({
      day: label,
      commandes: counts[index],
    }));
  }, [orders]);

  const recentOrders = useMemo(
    () =>
      orders
        .slice()
        .sort((a, b) => {
          const aTime = a.schedule?.start ? new Date(a.schedule.start).getTime() : 0;
          const bTime = b.schedule?.start ? new Date(b.schedule.start).getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, 4),
    [orders],
  );

  const recentClients = useMemo(
    () =>
      clients
        .slice()
        .sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, 4),
    [clients],
  );

  const formatOrderSchedule = (value: string | undefined) => {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatClientDate = (value: string | undefined | null) => {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />} topbar={<Topbar title="Vue d'ensemble" />}>
      {!ready && (
        <div className="mb-6 rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          Chargement des données...
        </div>
      )}

      <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <Card className="border-none shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Commandes ce mois</p>
              <p className="text-3xl font-bold">{monthlyOrdersCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {orders.length === 0 ? "Aucune commande planifiée" : "Total des demandes confirmées"}
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Urgentes</p>
              <p className="text-3xl font-bold">{urgentOrdersCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Zap className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {urgentOrdersCount === 0
              ? "Aucune livraison express en attente"
              : "Commandes avec prise en charge express"}
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">En cours</p>
              <p className="text-3xl font-bold">{inProgressOrdersCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10 text-warning">
              <Loader2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {inProgressOrdersCount === 0
              ? "Aucune mission en cours actuellement"
              : "Courses suivies en temps réel"}
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Clients actifs</p>
              <p className="text-3xl font-bold">{clients.length}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {clients.length === 0 ? "Aucun client enregistré" : "Contacts prêts à commander"}
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Chauffeurs actifs</p>
              <p className="text-3xl font-bold">{activeDriverCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Truck className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {activeDriverCount === 0 ? "Aucun chauffeur actif" : "Chauffeurs prêts à intervenir"}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8 border-none shadow-soft">
        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Évolution hebdomadaire des commandes</CardTitle>
        </CardHeader>
        <CardContent className="h-[260px]">
          {orders.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Aucune donnée disponible pour le moment.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyOrdersData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1 }}
                  contentStyle={{
                    borderRadius: "0.75rem",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "var(--shadow-soft)",
                  }}
                />
                <Line type="monotone" dataKey="commandes" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-none shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Dernières commandes</CardTitle>
            <Link to="/admin/commandes">
              <Button variant="ghost" size="sm">Voir tout</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-muted-foreground">Vous n’avez encore aucune commande.</p>
            ) : (
              <ul className="space-y-4">
                {recentOrders.map((order) => {
                  const formattedSchedule = formatOrderSchedule(order.schedule?.start);
                  return (
                    <li
                      key={order.id}
                      className="flex items-center justify-between rounded-md border border-border bg-card p-3"
                    >
                      <div>
                        <p className="font-semibold">{order.client}</p>
                        <p className="text-sm text-muted-foreground">{order.id}</p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p className="font-semibold text-foreground">{order.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</p>
                        <p>{order.status}</p>
                        {formattedSchedule && <p>{formattedSchedule}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Nouveaux clients</CardTitle>
            <Link to="/admin/clients">
              <Button variant="ghost" size="sm">Voir tout</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <p className="text-muted-foreground">Aucun client actif.</p>
            ) : (
              <ul className="space-y-4">
                {recentClients.map((client) => {
                  const formattedDate = formatClientDate(client.createdAt);
                  return (
                    <li
                      key={client.id}
                      className="flex items-center justify-between rounded-md border border-border bg-card p-3"
                    >
                      <div>
                        <p className="font-semibold">{client.company}</p>
                        <p className="text-sm text-muted-foreground">{client.contact}</p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{client.sector}</p>
                        {formattedDate && <p>{formattedDate}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
