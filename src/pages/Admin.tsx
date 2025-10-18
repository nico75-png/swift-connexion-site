import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Package,
  Truck,
  Euro,
  UserPlus,
} from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDriversStore, useNotificationsStore, useOrdersStore } from "@/providers/AdminDataProvider";
import { getClients, type ClientRecord } from "@/lib/clientStorage";
import type { Order } from "@/lib/stores/driversOrders.store";

type VariationTone = "up" | "down" | "neutral";

type VariationInfo = {
  label: string;
  tone: VariationTone;
};

type MetricsSnapshot = {
  currentOrders: number;
  previousOrders: number;
  currentRevenue: number;
  previousRevenue: number;
  currentInProgress: number;
  previousInProgress: number;
  currentNewClients: number;
  previousNewClients: number;
};

const numberFormatter = new Intl.NumberFormat("fr-FR");
const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
});

const IN_PROGRESS_STATUSES = new Set(["En cours", "Enlevé"]);

const statusBadgeStyles: Record<string, string> = {
  "Livré": "border-success/30 bg-success/10 text-success",
  "En cours": "border-info/30 bg-info/10 text-info",
  "Enlevé": "border-secondary/30 bg-secondary/10 text-secondary",
  "En attente": "border-warning/30 bg-warning/10 text-warning",
  "Annulé": "border-destructive/30 bg-destructive/10 text-destructive",
};

const formatCurrency = (value: number) => currencyFormatter.format(value);
const formatCount = (value: number) => numberFormatter.format(value);

const parseDate = (value: string | null | undefined): Date | null => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const computeVariation = (current: number, previous: number): VariationInfo | null => {
  if (previous === 0) {
    return null;
  }

  const delta = ((current - previous) / previous) * 100;
  const absDelta = Math.abs(delta);
  const formatter = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: absDelta < 10 ? 1 : 0,
  });
  const sign = delta > 0 ? "+" : delta < 0 ? "-" : "";
  const tone: VariationTone = delta > 0 ? "up" : delta < 0 ? "down" : "neutral";

  return {
    label: `${sign}${formatter.format(absDelta)}% vs mois dernier`,
    tone,
  };
};

const computeMetrics = (
  orders: Order[],
  clients: ClientRecord[],
  referenceDate: Date,
): MetricsSnapshot => {
  const currentMonthStart = startOfMonth(referenceDate);
  const nextMonthStart = startOfMonth(addMonths(referenceDate, 1));
  const previousMonthStart = startOfMonth(subMonths(referenceDate, 1));

  const currentOrders: Order[] = [];
  const previousOrders: Order[] = [];

  orders.forEach((order) => {
    const start = parseDate(order.schedule?.start);
    if (!start) {
      return;
    }

    if (start >= currentMonthStart && start < nextMonthStart) {
      currentOrders.push(order);
    } else if (start >= previousMonthStart && start < currentMonthStart) {
      previousOrders.push(order);
    }
  });

  const currentOrdersTotal = currentOrders.length;
  const previousOrdersTotal = previousOrders.length;

  const currentRevenue = currentOrders.reduce((total, order) => total + (order.amount ?? 0), 0);
  const previousRevenue = previousOrders.reduce((total, order) => total + (order.amount ?? 0), 0);

  const currentInProgress = currentOrders.filter((order) => IN_PROGRESS_STATUSES.has(order.status)).length;
  const previousInProgress = previousOrders.filter((order) => IN_PROGRESS_STATUSES.has(order.status)).length;

  const currentNewClients = clients.filter((client) => {
    const createdAt = parseDate(client.createdAt);
    return !!createdAt && createdAt >= currentMonthStart && createdAt < nextMonthStart;
  }).length;

  const previousNewClients = clients.filter((client) => {
    const createdAt = parseDate(client.createdAt);
    return !!createdAt && createdAt >= previousMonthStart && createdAt < currentMonthStart;
  }).length;

  return {
    currentOrders: currentOrdersTotal,
    previousOrders: previousOrdersTotal,
    currentRevenue,
    previousRevenue,
    currentInProgress,
    previousInProgress,
    currentNewClients,
    previousNewClients,
  };
};

const VariationBadge = ({ variation }: { variation: VariationInfo | null }) => {
  if (!variation) {
    return <span className="text-xs text-muted-foreground">Pas assez de données</span>;
  }

  const Icon = variation.tone === "up" ? ArrowUpRight : variation.tone === "down" ? ArrowDownRight : Minus;
  const toneClass =
    variation.tone === "up"
      ? "text-success"
      : variation.tone === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${toneClass}`}>
      <Icon className="h-3.5 w-3.5" />
      {variation.label}
    </span>
  );
};

const MetricCard = ({
  title,
  value,
  icon: Icon,
  variation,
  description,
  iconClassName,
}: {
  title: string;
  value: string;
  description?: string;
  icon: typeof Package;
  variation: VariationInfo | null;
  iconClassName: string;
}) => (
  <Card className="border border-border/60 shadow-soft">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${iconClassName}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="text-3xl font-semibold text-foreground">{value}</div>
    </CardHeader>
    <CardContent className="pt-0">
      {description && <CardDescription className="text-xs text-muted-foreground">{description}</CardDescription>}
      <div className="mt-3">
        <VariationBadge variation={variation} />
      </div>
    </CardContent>
  </Card>
);

const Admin = () => {
  const { ready, orders } = useOrdersStore();
  const { drivers } = useDriversStore();
  const { notifications } = useNotificationsStore();

  const [clients, setClients] = useState<ClientRecord[]>([]);

  useEffect(() => {
    setClients(getClients());

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "oc_clients") {
        setClients(getClients());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const metrics = useMemo(() => computeMetrics(orders, clients, new Date()), [orders, clients]);

  const metricCards = useMemo(
    () => [
      {
        title: "Commandes du mois",
        value: formatCount(metrics.currentOrders),
        description: "Commandes confirmées sur la période courante",
        icon: Package,
        iconClassName: "bg-primary/10 text-primary",
        variation: computeVariation(metrics.currentOrders, metrics.previousOrders),
      },
      {
        title: "Chiffre d'affaires du mois",
        value: formatCurrency(metrics.currentRevenue),
        description: "Montant facturé sur les commandes du mois",
        icon: Euro,
        iconClassName: "bg-amber-100 text-amber-600",
        variation: computeVariation(metrics.currentRevenue, metrics.previousRevenue),
      },
      {
        title: "Courses en cours",
        value: formatCount(metrics.currentInProgress),
        description: "Commandes en livraison ou enlevées",
        icon: Truck,
        iconClassName: "bg-blue-100 text-blue-600",
        variation: computeVariation(metrics.currentInProgress, metrics.previousInProgress),
      },
      {
        title: "Nouveaux clients",
        value: formatCount(metrics.currentNewClients),
        description: "Inscriptions réalisées ce mois-ci",
        icon: UserPlus,
        iconClassName: "bg-emerald-100 text-emerald-600",
        variation: computeVariation(metrics.currentNewClients, metrics.previousNewClients),
      },
    ],
    [metrics],
  );

  const driversById = useMemo(() => {
    return new Map(drivers.map((driver) => [driver.id, driver]));
  }, [drivers]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const dateA = parseDate(a.schedule?.start)?.getTime() ?? 0;
      const dateB = parseDate(b.schedule?.start)?.getTime() ?? 0;
      return dateB - dateA;
    });
  }, [orders]);

  const latestOrders = useMemo(() => sortedOrders.slice(0, 10), [sortedOrders]);

  const topbarNotifications = useMemo(
    () =>
      notifications.map((notification) => ({
        id: notification.id,
        message: notification.message,
        time: new Date(notification.createdAt).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: notification.read,
      })),
    [notifications],
  );

  return (
    <DashboardLayout sidebar={<AdminSidebar />} topbar={<Topbar title="Vue d'ensemble" notifications={topbarNotifications} />}>
      {!ready && (
        <div className="mb-6 rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          Chargement des données...
        </div>
      )}

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => (
            <MetricCard key={card.title} {...card} />
          ))}
        </div>

        <Card className="border border-border/60 shadow-soft">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Commandes récentes</CardTitle>
              <CardDescription>Suivi en temps réel des commandes clients du mois en cours.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/commandes">Voir toutes les commandes</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {latestOrders.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Aucune commande disponible pour le moment.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="font-semibold">N° commande</TableHead>
                      <TableHead className="font-semibold">Date & heure</TableHead>
                      <TableHead className="font-semibold">Client</TableHead>
                      <TableHead className="font-semibold">Type de course</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold">Chauffeur affecté</TableHead>
                      <TableHead className="text-right font-semibold">Montant</TableHead>
                      <TableHead className="text-right font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestOrders.map((order) => {
                      const scheduleDate = parseDate(order.schedule?.start);
                      const driver = order.driverId ? driversById.get(order.driverId) ?? null : null;
                      const statusClass = statusBadgeStyles[order.status] ?? "border-border bg-muted/40";

                      return (
                        <TableRow key={order.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-sm font-semibold">{order.id}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {scheduleDate ? format(scheduleDate, "dd MMM yyyy · HH'h'mm", { locale: fr }) : "-"}
                          </TableCell>
                          <TableCell className="text-sm font-medium">{order.client}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {order.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs font-medium ${statusClass}`}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {driver ? (
                              <div className="space-y-0.5">
                                <p className="font-medium text-foreground">{driver.name}</p>
                                <p className="text-xs">{driver.vehicle.type}</p>
                              </div>
                            ) : (
                              <span className="text-xs italic text-muted-foreground">Non affecté</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-sm font-semibold">
                            {formatCurrency(order.amount ?? 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild size="sm" variant="ghost">
                              <Link to={`/admin/commandes/${order.id}`}>Voir</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
