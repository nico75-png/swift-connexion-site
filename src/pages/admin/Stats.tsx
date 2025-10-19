import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { fr } from "date-fns/locale";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import type { DateRange as DayPickerRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type OrderRow = Tables<"orders">;

type DateRange = {
  start: Date;
  end: Date;
};

type DateShortcut =
  | "today"
  | "this_week"
  | "this_month"
  | "this_year"
  | "custom";

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

const normalizeRange = (start: Date, end: Date): DateRange => {
  const normalizedStart = startOfDay(start);
  const normalizedEnd = endOfDay(end);
  return normalizedStart <= normalizedEnd
    ? { start: normalizedStart, end: normalizedEnd }
    : { start: normalizedEnd, end: normalizedStart };
};

const computeShortcutRange = (shortcut: DateShortcut, reference = new Date()): DateRange => {
  switch (shortcut) {
    case "today":
      return normalizeRange(reference, reference);
    case "this_week": {
      const start = startOfWeek(reference, { weekStartsOn: 1 });
      const end = endOfWeek(reference, { weekStartsOn: 1 });
      return normalizeRange(start, end);
    }
    case "this_year":
      return normalizeRange(startOfYear(reference), endOfYear(reference));
    case "this_month":
    default:
      return normalizeRange(startOfMonth(reference), endOfMonth(reference));
  }
};

const computePreviousRange = (range: DateRange): DateRange => {
  const length = differenceInCalendarDays(range.end, range.start) + 1;
  const previousPeriodEnd = addDays(range.start, -1);
  const previousPeriodStart = addDays(previousPeriodEnd, -(length - 1));
  return normalizeRange(previousPeriodStart, previousPeriodEnd);
};

const formatRangeLabel = (range: DateRange) => {
  const sameDay = differenceInCalendarDays(range.end, range.start) === 0;
  if (sameDay) {
    return capitalizeFirst(format(range.start, "d MMMM yyyy", { locale: fr }));
  }

  const startLabel = format(range.start, "d MMM", { locale: fr });
  const endLabel = format(range.end, "d MMM yyyy", { locale: fr });
  return `${startLabel} – ${endLabel}`;
};

const formatRangeDescription = (range: DateRange) => {
  const sameDay = differenceInCalendarDays(range.end, range.start) === 0;
  if (sameDay) {
    return `Données du ${capitalizeFirst(
      format(range.start, "EEEE d MMMM yyyy", { locale: fr }),
    )}.`;
  }

  const startLabel = capitalizeFirst(
    format(range.start, "EEEE d MMMM yyyy", { locale: fr }),
  );
  const endLabel = capitalizeFirst(
    format(range.end, "EEEE d MMMM yyyy", { locale: fr }),
  );
  return `Données du ${startLabel} au ${endLabel}.`;
};

const shortcutLabels: Record<Exclude<DateShortcut, "custom">, string> = {
  today: "Aujourd’hui",
  this_week: "Cette semaine",
  this_month: "Ce mois",
  this_year: "Cette année",
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
  const [selectedShortcut, setSelectedShortcut] = useState<DateShortcut>("this_month");
  const [selectedRange, setSelectedRange] = useState<DateRange>(() =>
    computeShortcutRange("this_month"),
  );
  const [calendarRange, setCalendarRange] = useState<DayPickerRange | undefined>(() => ({
    from: selectedRange.start,
    to: selectedRange.end,
  }));
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const cacheRef = useRef(new Map<string, OverviewStats>());
  const activeRequestKeyRef = useRef<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const previousRange = useMemo(
    () => computePreviousRange(selectedRange),
    [selectedRange],
  );

  const currentRangeLabel = useMemo(
    () => formatRangeLabel(selectedRange),
    [selectedRange],
  );

  const previousRangeLabel = useMemo(
    () => formatRangeLabel(previousRange),
    [previousRange],
  );

  const currentRangeDescription = useMemo(
    () => formatRangeDescription(selectedRange),
    [selectedRange],
  );

  const updatedAtLabel = useMemo(
    () =>
      capitalizeFirst(
        format(selectedRange.end, "EEEE d MMMM yyyy à HH'h'mm", { locale: fr }),
      ),
    [selectedRange],
  );

  const ordersVariation = useMemo(
    () =>
      stats
        ? buildPercentageVariation(
            stats.currentOrdersCount,
            stats.previousOrdersCount,
            previousRangeLabel,
          )
        : null,
    [stats, previousRangeLabel],
  );

  const clientsVariation = useMemo(
    () =>
      stats
        ? buildClientsVariation(
            stats.currentActiveClients,
            stats.previousActiveClients,
            previousRangeLabel,
          )
        : null,
    [stats, previousRangeLabel],
  );

  const revenueVariation = useMemo(
    () =>
      stats
        ? buildPercentageVariation(
            stats.currentRevenue,
            stats.previousRevenue,
            previousRangeLabel,
          )
        : null,
    [stats, previousRangeLabel],
  );

  const loadStats = useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }

    setLoading(true);
    setError(null);

    const currentStart = selectedRange.start.toISOString();
    const currentEndExclusive = addDays(selectedRange.end, 1).toISOString();
    const previousStart = previousRange.start.toISOString();
    const previousEndExclusive = addDays(previousRange.end, 1).toISOString();
    const cacheKey = `${currentStart}:${currentEndExclusive}`;
    activeRequestKeyRef.current = cacheKey;

    try {
      
      if (cacheRef.current.has(cacheKey)) {
        const cached = cacheRef.current.get(cacheKey);
        if (cached && activeRequestKeyRef.current === cacheKey) {
          setStats(cached);
          setLoading(false);
        }
        return;
      }

      const [currentOrdersResult, previousOrdersResult, inProgressResult] =
        await Promise.all([
          supabase
            .from("orders")
            .select("id, customer_id, status, created_at, amount")
            .gte("created_at", currentStart)
            .lt("created_at", currentEndExclusive),
          supabase
            .from("orders")
            .select("id, customer_id, status, created_at, amount")
            .gte("created_at", previousStart)
            .lt("created_at", previousEndExclusive),
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

      const computedStats: OverviewStats = {
        currentOrdersCount: currentOrders.length,
        previousOrdersCount: previousOrders.length,
        currentRevenue: currentOrders.reduce(
          (total, order) => total + (order.amount ?? 0),
          0,
        ),
        previousRevenue: previousOrders.reduce(
          (total, order) => total + (order.amount ?? 0),
          0,
        ),
        inProgressCount: inProgressResult.count ?? 0,
        currentActiveClients: countActiveClients(currentOrders),
        previousActiveClients: countActiveClients(previousOrders),
      };

      if (isMountedRef.current && activeRequestKeyRef.current === cacheKey) {
        setStats(computedStats);
        cacheRef.current.set(cacheKey, computedStats);
      }
    } catch (fetchError) {
      console.error(fetchError);
      if (isMountedRef.current && activeRequestKeyRef.current === cacheKey) {
        setError("Impossible de récupérer les statistiques pour la période sélectionnée.");
        setStats(null);
      }
    } finally {
      if (isMountedRef.current && activeRequestKeyRef.current === cacheKey) {
        setLoading(false);
      }
    }
  }, [selectedRange, previousRange]);

  useEffect(() => {
    void loadStats();

    const channel = supabase
      .channel("orders-overview")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          if (isMountedRef.current) {
            cacheRef.current.clear();
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

  const handleShortcutSelect = (shortcut: Exclude<DateShortcut, "custom">) => {
    const range = computeShortcutRange(shortcut);
    setSelectedShortcut(shortcut);
    setSelectedRange(range);
    setCalendarRange({ from: range.start, to: range.end });
  };

  const handleCalendarSelect = (range?: DayPickerRange) => {
    setCalendarRange(range);
    if (range?.from && range?.to) {
      const normalized = normalizeRange(range.from, range.to);
      setSelectedShortcut("custom");
      setSelectedRange(normalized);
    }
  };

  return (
    <DashboardLayout
      sidebar={<AdminSidebar />}
      topbar={<Topbar title="Vue d’ensemble" />}
    >
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">Vue d’ensemble</h1>
        <p className="text-sm text-muted-foreground">{currentRangeDescription}</p>
        {error ? (
          <p className="text-sm font-medium text-destructive">
            {error}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Mise à jour le {updatedAtLabel}.
          </p>
        )}
        <div className="pt-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{currentRangeLabel}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-4" align="start">
              <div className="flex flex-wrap gap-2 pb-4">
                {Object.entries(shortcutLabels).map(([shortcut, label]) => (
                  <Button
                    key={shortcut}
                    variant={
                      selectedShortcut === shortcut ? "default" : "secondary"
                    }
                    size="sm"
                    onClick={() =>
                      handleShortcutSelect(shortcut as Exclude<DateShortcut, "custom">)
                    }
                  >
                    {label}
                  </Button>
                ))}
              </div>
              <Calendar
                mode="range"
                numberOfMonths={1}
                selected={calendarRange}
                onSelect={handleCalendarSelect}
                initialFocus
              />
              <p className="pt-3 text-xs text-muted-foreground">
                Choisissez une plage personnalisée ou utilisez un raccourci.
              </p>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border border-border/50 bg-background/80 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Commandes 📦
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
                    ? "0 commande sur la période sélectionnée."
                    : "Commandes créées sur la période sélectionnée."}
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
              Chiffre d’affaires 💰
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
                    ? "0 € de chiffre d’affaires sur la période sélectionnée."
                    : "Montant TTC des commandes validées sur la période."}
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
                    ? "0 client actif sur la période sélectionnée."
                    : "Clients ayant passé au moins une commande sur la période."}
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
