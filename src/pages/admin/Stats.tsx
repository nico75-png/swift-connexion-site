import { useEffect, useMemo, useState } from "react";
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
  urgentOrdersCount: number;
  inProgressCount: number;
  currentActiveClients: number;
  previousActiveClients: number;
};

const numberFormatter = new Intl.NumberFormat("fr-FR");

const capitalizeFirst = (value: string) =>
  value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const formatCount = (value: number) => numberFormatter.format(value);

const detectExpressOption = (order: OrderRow) => {
  const candidates = [order.driver_instructions, order.package_note, order.quote_id];
  return candidates.some((field) => {
    if (typeof field !== "string") {
      return false;
    }
    const normalized = field.toLowerCase();
    return normalized.includes("express") || normalized.includes("exprès");
  });
};

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

const buildVariation = (
  current: number,
  previous: number,
  previousLabel: string,
): VariationInfo | null => {
  if (previous === 0) {
    if (current === 0) {
      return { text: `— vs ${previousLabel}`, tone: "neutral" };
    }
    return {
      text: `— vs ${previousLabel} (aucune donnée comparable)`,
      tone: "neutral",
    };
  }

  const delta = ((current - previous) / previous) * 100;
  const absolute = Math.abs(delta);
  const formatted = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: absolute < 10 ? 1 : 0,
  }).format(absolute);
  const prefix = delta >= 0 ? "+" : "-";
  const arrow = delta >= 0 ? "🔺" : "🔻";

  return {
    text: `${arrow} ${prefix}${formatted}% vs ${previousLabel}`,
    tone: delta >= 0 ? "up" : "down",
  };
};

const AdminStats = () => {
  const [referenceDate] = useState(() => new Date());
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        ? buildVariation(
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
        ? buildVariation(
            stats.currentActiveClients,
            stats.previousActiveClients,
            previousMonthLabel,
          )
        : null,
    [stats, previousMonthLabel],
  );

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const currentStart = startOfMonth(referenceDate).toISOString();
        const nextMonthStart = startOfMonth(addMonths(referenceDate, 1)).toISOString();
        const previousStart = startOfMonth(addMonths(referenceDate, -1)).toISOString();

        const [currentOrdersResult, previousOrdersResult, inProgressResult] = await Promise.all([
          supabase
            .from("orders")
            .select("id, customer_id, status, created_at, driver_instructions, package_note, quote_id")
            .gte("created_at", currentStart)
            .lt("created_at", nextMonthStart),
          supabase
            .from("orders")
            .select("id, customer_id, status, created_at, driver_instructions, package_note, quote_id")
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

        if (!isMounted) {
          return;
        }

        const currentOrders = currentOrdersResult.data ?? [];
        const previousOrders = previousOrdersResult.data ?? [];

        setStats({
          currentOrdersCount: currentOrders.length,
          previousOrdersCount: previousOrders.length,
          urgentOrdersCount: currentOrders.filter(detectExpressOption).length,
          inProgressCount: inProgressResult.count ?? 0,
          currentActiveClients: countActiveClients(currentOrders),
          previousActiveClients: countActiveClients(previousOrders),
        });
      } catch (fetchError) {
        console.error(fetchError);
        if (isMounted) {
          setError("Impossible de récupérer les statistiques du mois en cours.");
          setStats(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, [referenceDate]);

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
              Courses urgentes 🚨
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Chargement des données…</p>
            ) : resolvedStats ? (
              <div className="space-y-3">
                <p className="text-3xl font-bold">
                  {formatCount(resolvedStats.urgentOrdersCount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {resolvedStats.urgentOrdersCount === 0
                    ? "0 course urgente pour l’instant."
                    : "Courses avec option express depuis le 1er."}
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
