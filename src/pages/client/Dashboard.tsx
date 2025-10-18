import { useEffect, useMemo, useState } from "react";
import { differenceInDays, isAfter, subDays } from "date-fns";
import { Activity, Package, TrendingUp, Wallet } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import CreateOrderButton from "@/components/dashboard/CreateOrderButton";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ClientOrderListItem,
  listOrdersByClient,
} from "@/lib/stores/clientOrders.store";
import { ensureStoragePrimitives, formatDateTime } from "@/lib/reorder";
import { useAuth } from "@/lib/stores/auth.store";
import { getNotifications } from "@/lib/stores/driversOrders.store";
import type { NotificationEntry } from "@/lib/stores/driversOrders.store";

/**
 * Dashboard principal du client
 * Vue d'ensemble avec stats, graphique et dernières commandes
 */
const ClientDashboard = () => {
  const { currentClient, currentUser } = useAuth();
  const [orders, setOrders] = useState<ClientOrderListItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (typeof window !== "undefined") {
          ensureStoragePrimitives();
        }

        const [ordersResult, notificationsResult] = await Promise.all([
          currentClient?.id ? listOrdersByClient(currentClient.id) : Promise.resolve([]),
          Promise.resolve(getNotifications()),
        ]);

        if (!mounted) return;

        setOrders(ordersResult);
        setNotifications(notificationsResult);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [currentClient?.id]);

  const recentOrders = useMemo(() => orders.slice(0, 4), [orders]);

  const lastThirtyDaysOrders = useMemo(() => {
    const cutoff = subDays(new Date(), 30);
    return orders.filter((order) => {
      if (!order.createdAt) return false;
      const created = new Date(order.createdAt);
      return isAfter(created, cutoff);
    });
  }, [orders]);

  const totalAmountLast30Days = useMemo(() => {
    return lastThirtyDaysOrders.reduce((sum, order) => sum + (order.amountTTC ?? 0), 0);
  }, [lastThirtyDaysOrders]);

  const deliveredOrdersLast30Days = useMemo(
    () => lastThirtyDaysOrders.filter((order) => order.status.toLowerCase().includes("livr")),
    [lastThirtyDaysOrders],
  );

  const averageDeliveryDelay = useMemo(() => {
    if (lastThirtyDaysOrders.length === 0) return 0;
    const today = new Date();
    const total = lastThirtyDaysOrders.reduce((sum, order) => {
      if (!order.createdAt) return sum;
      return sum + differenceInDays(today, new Date(order.createdAt));
    }, 0);
    return Math.round((total / lastThirtyDaysOrders.length) * 10) / 10;
  }, [lastThirtyDaysOrders]);

  const stats = useMemo(() => {
    const deliveredRatio = lastThirtyDaysOrders.length
      ? Math.round((deliveredOrdersLast30Days.length / lastThirtyDaysOrders.length) * 100)
      : 0;

    return [
      {
        label: "Commandes sur 30 jours",
        value: lastThirtyDaysOrders.length,
        icon: Package,
        color: "text-primary",
        trend: {
          value: Math.min(120, lastThirtyDaysOrders.length * 12),
          isPositive: lastThirtyDaysOrders.length >= 1,
        },
      },
      {
        label: "Taux de livraison",
        value: `${deliveredRatio}%`,
        icon: Activity,
        color: "text-success",
        trend: {
          value: deliveredRatio - 60,
          isPositive: deliveredRatio >= 60,
        },
      },
      {
        label: "Montant dépensé",
        value: `${totalAmountLast30Days.toFixed(2)} €`,
        icon: Wallet,
        color: "text-secondary",
      },
      {
        label: "Délai moyen",
        value: `${averageDeliveryDelay} j`,
        icon: TrendingUp,
        color: "text-info",
      },
    ];
  }, [
    lastThirtyDaysOrders.length,
    deliveredOrdersLast30Days.length,
    totalAmountLast30Days,
    averageDeliveryDelay,
  ]);

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      info: "bg-info/10 text-info border-info/20",
      success: "bg-success/10 text-success border-success/20",
      warning: "bg-warning/10 text-warning border-warning/20",
    };
    return colors[color] || colors.info;
  };

  const formattedNotifications = useMemo(
    () =>
      notifications.map((notif) => ({
        id: notif.id,
        message: notif.message,
        time: new Intl.DateTimeFormat("fr-FR", {
          day: "2-digit",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(notif.createdAt)),
        read: notif.read,
      })),
    [notifications],
  );

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={<Topbar userName={currentUser?.name ?? "Client"} notifications={formattedNotifications} />}
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
            <div className="h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-6">
              <div className="grid h-full w-full grid-cols-15 items-end gap-1">
                {Array.from({ length: 15 }).map((_, index) => {
                  const factor = lastThirtyDaysOrders[index]?.amountTTC ?? 0;
                  const height = Math.min(100, Math.round((factor / 120) * 100));
                  return (
                    <div
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      className="bg-primary/60 transition-all duration-500 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
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
            {isLoading ? (
              <p className="rounded-lg border border-dashed border-muted-foreground/40 p-6 text-center text-sm text-muted-foreground">
                Chargement des dernières commandes…
              </p>
            ) : recentOrders.length === 0 ? (
              <p className="rounded-lg border border-dashed border-muted-foreground/40 p-6 text-center text-sm text-muted-foreground">
                Aucune commande récente à afficher.
              </p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/espace-client/commandes/${order.id}`}
                    className="flex items-center justify-between rounded-lg border border-transparent bg-muted/30 p-4 transition hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.transportLabel}
                        {order.createdAt && ` • ${formatDateTime(order.createdAt, "fr-FR")}`}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status.toLowerCase().includes("livr") ? "success" : "info")}>
                      {order.status}
                    </Badge>
                  </Link>
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
            {isLoading ? (
              <p className="rounded-lg border border-dashed border-muted-foreground/40 p-4 text-center text-sm text-muted-foreground">
                Chargement des notifications…
              </p>
            ) : formattedNotifications.length === 0 ? (
              <p className="rounded-lg border border-dashed border-muted-foreground/40 p-4 text-center text-sm text-muted-foreground">
                Aucune notification récente.
              </p>
            ) : (
              <div className="space-y-3">
                {formattedNotifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className={`rounded-lg p-3 ${!notif.read ? "bg-primary/5" : "bg-muted/30"}`}>
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
