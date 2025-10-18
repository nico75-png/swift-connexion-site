import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addMonths, format, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type OrderRow = Tables<"orders">;

type VariationInfo = {
  text: string;
  tone: "up" | "down" | "neutral";
};

type OverviewStats = {
  currentOrdersCount: number;
  previousOrdersCount: number;
  currentRevenue: number;
  previousRevenue: number;
  inProgressCount: number;
  currentActiveClients: number;
  previousActiveClients: number;
};

const numberFormatter = new Intl.NumberFormat("fr-FR");
const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
});

const capitalizeFirst = (value: string) =>
  value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const formatCount = (value: number) => numberFormatter.format(value);

const countActiveClients = (orders: OrderRow[]) => {
  const identifiers = new Set<string>();
  orders.forEach((order) => {
    const identifier = order.customer_id?.trim();
    if (identifier) {
      identifiers.add(identifier);
    }
  });
  return identifiers.size;
};

const buildPercentageVariation = (
  current: number,
  previous: number,
  previousLabel: string,
): VariationInfo | null => {
  if (previous === 0) {
    return null;
  }

  const delta = ((current - previous) / previous) * 100;
  const absolute = Math.abs(delta);
  const formatted = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: absolute < 10 ? 1 : 0,
  }).format(absolute);
  const prefix = delta > 0 ? "+" : delta < 0 ? "-" : "";
  const arrow = delta > 0 ? "🔺" : delta < 0 ? "🔻" : "—";

  return {
    text: `${arrow} ${prefix}${formatted}% vs ${previousLabel}`,
    tone: delta > 0 ? "up" : delta < 0 ? "down" : "neutral",
  };
};

const buildClientsVariation = (
  current: number,
  previous: number,
  previousLabel: string,
): VariationInfo | null => {
  if (previous === 0) {
    return null;
  }

  const delta = current - previous;
  const absolute = Math.abs(delta);
  const pluralized = absolute > 1 ? "clients" : "client";
  const prefix = delta > 0 ? "+" : delta < 0 ? "-" : "";
  const arrow = delta > 0 ? "🔺" : delta < 0 ? "🔻" : "—";

  return {
    text: `${arrow} ${prefix}${absolute} ${pluralized} vs ${previousLabel}`,
    tone: delta > 0 ? "up" : delta < 0 ? "down" : "neutral",
  };
};

const AdminStats = () => {
  const [referenceDate] = useState(() => new Date());
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const currentMonthLabel = useMemo(
    () => format(referenceDate, "MMMM yyyy", { locale: fr }),
    [referenceDate],
  );
  const previousMonthLabel = useMemo(
    () => format(addMonths(referenceDate, -1), "MMMM yyyy", { locale: fr }),
    [referenceDate],
  );
  const currentPeriodEndLabel = useMemo(
    () => format(referenceDate, "d MMMM yyyy", { locale: fr }),
    [referenceDate],
  );

  const ordersVariation = useMemo(
    () =>
      stats
        ? buildPercentageVariation(
            stats.currentOrdersCount,
            stats.previousOrdersCount,
            previousMonthLabel,
          )
        : null,
    [stats, previousMonthLabel],
  );

  const clientsVariation = useMemo(
    () =>
      stats
        ? buildClientsVariation(
            stats.currentActiveClients,
            stats.previousActiveClients,
            previousMonthLabel,
          )
        : null,
    [stats, previousMonthLabel],
  );

  const revenueVariation = useMemo(
    () =>
      stats
        ? buildPercentageVariation(
            stats.currentRevenue,
            stats.previousRevenue,
            previousMonthLabel,
          )
        : null,
    [stats, previousMonthLabel],
  );

  const loadStats = useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const currentStart = startOfMonth(referenceDate).toISOString();
      const nextMonthStart = startOfMonth(addMonths(referenceDate, 1)).toISOString();
      const previousStart = startOfMonth(addMonths(referenceDate, -1)).toISOString();

      const [currentOrdersResult, previousOrdersResult, inProgressResult] = await Promise.all([
        supabase
          .from("orders")
          .select("id, customer_id, status, created_at, amount")
          .gte("created_at", currentStart)
          .lt("created_at", nextMonthStart),
        supabase
          .from("orders")
          .select("id, customer_id, status, created_at, amount")
          .gte("created_at", previousStart)
          .lt("created_at", currentStart),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("status", "EN_COURS"),
      ]);

      if (currentOrdersResult.error) {
        throw currentOrdersResult.error;
      }
      if (previousOrdersResult.error) {
        throw previousOrdersResult.error;
      }
      if (inProgressResult.error) {
        throw inProgressResult.error;
      }

      const currentOrders = (currentOrdersResult.data as OrderRow[] | null) ?? [];
      const previousOrders = (previousOrdersResult.data as OrderRow[] | null) ?? [];

      if (isMountedRef.current) {
        setStats({
          currentOrdersCount: currentOrders.length,
          previousOrdersCount: previousOrders.length,
          currentRevenue: currentOrders.reduce((total, order) => total + (order.amount ?? 0), 0),
          previousRevenue: previousOrders.reduce((total, order) => total + (order.amount ?? 0), 0),
          inProgressCount: inProgressResult.count ?? 0,
          currentActiveClients: countActiveClients(currentOrders),
          previousActiveClients: countActiveClients(previousOrders),
        });
      }
    } catch (fetchError) {
      console.error(fetchError);
      if (isMountedRef.current) {
        setError("Impossible de récupérer les statistiques du mois en cours.");
        setStats(null);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [referenceDate]);

  useEffect(() => {
    void loadStats();

    const channel = supabase
      .channel("orders-overview")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          if (isMountedRef.current) {
            void loadStats();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadStats]);

  const resolvedStats: OverviewStats | null = error ? null : stats;

  return (
    <DashboardLayout
      sidebar={<AdminSidebar />}
      topbar={<Topbar title="Vue d’ensemble" />}
    >
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">Vue d’ensemble</h1>
        <p className="text-sm text-muted-foreground">
          Données du 1er {currentMonthLabel} au {currentPeriodEndLabel}.
        </p>
        {error ? (
          <p className="text-sm font-medium text-destructive">
            {error}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Mise à jour le {capitalizeFirst(currentPeriodEndLabel)}.
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border border-border/50 bg-background/80 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Commandes du mois 📦
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Chargement des données…</p>
            ) : resolvedStats ? (
              <div className="space-y-3">
                <p className="text-3xl font-bold">
                  {formatCount(resolvedStats.currentOrdersCount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {resolvedStats.currentOrdersCount === 0
                    ? "Aucune commande enregistrée ce mois-ci."
                    : "Commandes créées entre le 1er et aujourd’hui."}
                </p>
                {ordersVariation && (
                  <p
                    className={`text-sm font-semibold ${
                      ordersVariation.tone === "up"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : ordersVariation.tone === "down"
                          ? "text-red-600 dark:text-red-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    {ordersVariation.text}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune donnée disponible pour le moment.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-background/80 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Chiffre d’affaires du mois 💰
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Chargement des données…</p>
            ) : resolvedStats ? (
              <div className="space-y-3">
                <p className="text-3xl font-bold">
                  {currencyFormatter.format(resolvedStats.currentRevenue)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {resolvedStats.currentRevenue === 0
                    ? "0 € généré depuis le 1er du mois."
                    : "Montant TTC des commandes depuis le 1er."}
                </p>
                {revenueVariation && (
                  <p
                    className={`text-sm font-semibold ${
                      revenueVariation.tone === "up"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : revenueVariation.tone === "down"
                          ? "text-red-600 dark:text-red-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    {revenueVariation.text}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune donnée disponible pour le moment.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-background/80 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Courses en cours 🔄
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Chargement des données…</p>
            ) : resolvedStats ? (
              <div className="space-y-3">
                <p className="text-3xl font-bold">
                  {formatCount(resolvedStats.inProgressCount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {resolvedStats.inProgressCount === 0
                    ? "Aucune course en cours."
                    : "Courses actuellement en livraison."}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune donnée disponible pour le moment.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-background/80 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Clients actifs 👥
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Chargement des données…</p>
            ) : resolvedStats ? (
              <div className="space-y-3">
                <p className="text-3xl font-bold">
                  {formatCount(resolvedStats.currentActiveClients)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {resolvedStats.currentActiveClients === 0
                    ? "0 client actif pour l’instant."
                    : `Clients ayant passé au moins une commande en ${capitalizeFirst(currentMonthLabel)}.`}
                </p>
                {clientsVariation && (
                  <p
                    className={`text-sm font-semibold ${
                      clientsVariation.tone === "up"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : clientsVariation.tone === "down"
                          ? "text-red-600 dark:text-red-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    {clientsVariation.text}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune donnée disponible pour le moment.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminStats;
