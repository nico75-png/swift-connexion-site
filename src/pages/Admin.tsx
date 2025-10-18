import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Users, Truck } from "lucide-react";

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

  const activeDriverCount = useMemo(
    () => drivers.filter((driver) => driver.active && driver.lifecycleStatus !== "INACTIF").length,
    [drivers],
  );

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

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-soft">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{orders.length}</p>
            <p className="text-sm text-muted-foreground">
              {orders.length === 0 ? "Aucune commande pour le moment" : "Commandes enregistrées"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
              <Users className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{clients.length}</p>
            <p className="text-sm text-muted-foreground">
              {clients.length === 0 ? "Aucun client enregistré" : "Clients actifs"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Truck className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Chauffeurs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeDriverCount}</p>
            <p className="text-sm text-muted-foreground">
              {activeDriverCount === 0 ? "Aucun chauffeur actif" : "Chauffeurs prêts à intervenir"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-none shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Commandes</CardTitle>
            <Link to="/admin/commandes">
              <Button variant="ghost" size="sm">Accéder</Button>
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
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.client}</p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
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
            <CardTitle>Clients</CardTitle>
            <Link to="/admin/clients">
              <Button variant="ghost" size="sm">Gérer</Button>
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

      <Card className="mt-8 border-none shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Chauffeurs</CardTitle>
          <Link to="/admin/chauffeurs">
            <Button variant="ghost" size="sm">Voir</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {drivers.length === 0 ? (
            <p className="text-muted-foreground">Aucun chauffeur disponible pour le moment.</p>
          ) : (
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>
                Chauffeurs actifs : <span className="font-semibold text-foreground">{activeDriverCount}</span>
              </span>
              <span>
                Chauffeurs inactifs :
                <span className="font-semibold text-foreground"> {drivers.length - activeDriverCount}</span>
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Admin;
