import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  Loader2,
  ShieldAlert,
  Truck,
  UsersRound,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AnimatedCounter from "@/components/dashboard-client/AnimatedCounter";
import { supabase } from "@/integrations/supabase/client";
import {
  ADMIN_DASHBOARD_REFRESH_MS,
  useAdminDashboardData,
  type AlertEntry,
  type SummaryMetric,
} from "@/hooks/useAdminDashboardData";
import { Alert as Callout, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/providers/AuthProvider";

export interface MessageComposerPreset {
  recipientType?: "client" | "chauffeur" | "admin";
  subject?: string;
  email?: string;
  content?: string;
}

interface TableauDeBordProps {
  onOpenOrderForm?: () => void;
  onOpenMessageComposer?: (preset?: MessageComposerPreset) => void;
  onOpenIncidentReport?: (alertId?: string) => void;
}

const SUMMARY_CARD_STYLES: Array<{
  id: SummaryMetric["id"];
  title: string;
  accent: string;
  ring: string;
}> = [
  {
    id: "orders",
    title: "Commandes du mois",
    accent: "bg-[#2563EB]/15 text-[#2563EB]",
    ring: "ring-[#2563EB]/30",
  },
  {
    id: "clients",
    title: "Nouveaux clients",
    accent: "bg-[#10B981]/15 text-[#047857]",
    ring: "ring-[#10B981]/30",
  },
  {
    id: "drivers",
    title: "Chauffeurs actifs",
    accent: "bg-[#F59E0B]/15 text-[#B45309]",
    ring: "ring-[#F59E0B]/30",
  },
  {
    id: "revenue",
    title: "Revenus",
    accent: "bg-[#6366F1]/15 text-[#4338CA]",
    ring: "ring-[#6366F1]/30",
  },
];

const ALERT_LEVEL_CLASSES: Record<string, string> = {
  alert: "bg-rose-100 text-rose-600",
  warning: "bg-amber-100 text-amber-600",
  info: "bg-sky-100 text-sky-600",
  success: "bg-emerald-100 text-emerald-600",
};

const FLUX_TONE_CLASSES: Record<"positive" | "warning" | "critical", string> = {
  positive: "bg-[#10B981]/10 text-[#047857]",
  warning: "bg-amber-100 text-amber-700",
  critical: "bg-rose-100 text-rose-700",
};

const SESSION_BADGE_CLASSES: Record<"info" | "warning", string> = {
  info: "bg-[#2563EB]/10 text-[#2563EB]",
  warning: "bg-[#F97316]/10 text-[#B45309]",
};

type TeamLoadState = "stable" | "charge" | "sature";

const TEAM_STATUS_STYLES: Record<
  TeamLoadState,
  { label: string; badge: string; ring: string; icon: string }
> = {
  stable: {
    label: "Stable",
    badge: "bg-emerald-100 text-emerald-600",
    ring: "ring-emerald-200/60",
    icon: "bg-emerald-500/15 text-emerald-600",
  },
  charge: {
    label: "Chargé",
    badge: "bg-amber-100 text-amber-600",
    ring: "ring-amber-200/60",
    icon: "bg-amber-500/15 text-amber-600",
  },
  sature: {
    label: "Saturé",
    badge: "bg-rose-100 text-rose-600",
    ring: "ring-rose-200/60",
    icon: "bg-rose-500/15 text-rose-600",
  },
};

type HighlightImpact = "mineur" | "modere" | "majeur";

const IMPACT_BADGE_CLASSES: Record<HighlightImpact, string> = {
  mineur: "bg-sky-100 text-sky-600",
  modere: "bg-amber-100 text-amber-600",
  majeur: "bg-rose-100 text-rose-600",
};

const ALERT_ACTION_LABEL: Record<AlertEntry["action"], string> = {
  dispatch: "Contacter le dispatch",
  note: "Consulter la note",
  incident: "Ouvrir le rapport",
  none: "Afficher les détails",
};

const formatDeltaLabel = (delta: number | undefined) => {
  if (delta === undefined || Number.isNaN(delta)) {
    return "Évolution indéterminée";
  }

  const fixed = Number(delta).toFixed(1);
  const sign = delta > 0 ? "+" : "";
  return `${sign}${fixed}% vs mois dernier`;
};

const formatCurrency = (value: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits,
  }).format(value);

const TableauDeBord = ({
  onOpenOrderForm,
  onOpenMessageComposer,
  onOpenIncidentReport,
}: TableauDeBordProps) => {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error, dataUpdatedAt } = useAdminDashboardData(userId);

  const [refreshCountdown, setRefreshCountdown] = useState("05:00");
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  const [noteAlert, setNoteAlert] = useState<AlertEntry | null>(null);
  const [dispatchAlert, setDispatchAlert] = useState<AlertEntry | null>(null);

  useEffect(() => {
    if (!dataUpdatedAt) {
      setRefreshCountdown("--:--");
      return;
    }

    const updateCountdown = () => {
      const nextRefreshAt = dataUpdatedAt + ADMIN_DASHBOARD_REFRESH_MS;
      const remaining = Math.max(0, nextRefreshAt - Date.now());
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setRefreshCountdown(`${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`);
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, [dataUpdatedAt]);

  useEffect(() => {
    if (!realtimeEnabled) {
      return;
    }

    const channel = supabase
      .channel(`dashboard-alerts-${userId ?? "anonymous"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_alerts" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-dashboard-data", userId ?? "anonymous"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-dashboard-data", userId ?? "anonymous"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "maintenance_events" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-dashboard-data", userId ?? "anonymous"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-dashboard-data", userId ?? "anonymous"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, realtimeEnabled, userId]);

  const lastUpdatedLabel = useMemo(() => {
    if (!dataUpdatedAt) {
      return null;
    }

    return format(new Date(dataUpdatedAt), "HH:mm", { locale: fr });
  }, [dataUpdatedAt]);

  const summaryCards = useMemo(() => {
    const summaryMap = new Map(data?.summary.map((metric) => [metric.id, metric]));

    return SUMMARY_CARD_STYLES.map((style) => ({
      ...style,
      metric: summaryMap.get(style.id),
    }));
  }, [data?.summary]);

  const resolveTeamLoadState = useCallback((rate: number): TeamLoadState => {
    if (rate >= 0.75) {
      return "stable";
    }
    if (rate >= 0.5) {
      return "charge";
    }
    return "sature";
  }, []);

  const teamStatusEntries = useMemo(
    () =>
      (data?.activity.driverAvailability ?? []).map((entry) => {
        const state = resolveTeamLoadState(entry.availabilityRate ?? 0);
        const status = TEAM_STATUS_STYLES[state];

        return {
          id: entry.id,
          label: entry.label,
          available: entry.available,
          total: entry.total,
          status,
        };
      }),
    [data?.activity.driverAvailability, resolveTeamLoadState],
  );

  const highlightItems = useMemo(() => {
    if (!data) {
      return [] as Array<{
        id: string;
        title: string;
        description: string;
        impact: HighlightImpact;
        meta?: string;
      }>;
    }

    const items: Array<{
      id: string;
      title: string;
      description: string;
      impact: HighlightImpact;
      meta?: string;
    }> = [];

    const headline = data.highlights.headline;
    if (headline) {
      const impact: HighlightImpact =
        headline.trendDirection === "down"
          ? "majeur"
          : headline.trendDirection === "neutral"
          ? "modere"
          : "mineur";

      items.push({
        id: `headline-${headline.title}`,
        title: headline.title,
        description: headline.description,
        impact,
        meta: headline.trendLabel,
      });
    }

    data.highlights.sessions.forEach((session) => {
      const impact: HighlightImpact = session.tone === "warning" ? "modere" : "mineur";
      items.push({
        id: session.id,
        title: session.label,
        description: session.scheduleLabel,
        impact,
        meta: session.tone === "warning" ? "Surveillance" : "Information",
      });
    });

    const pickup = data.highlights.pickup;
    if (pickup && pickup.averageMinutes !== null && pickup.averageMinutes !== undefined) {
      const impact: HighlightImpact =
        pickup.trendDirection === "down"
          ? "majeur"
          : pickup.trendDirection === "neutral"
          ? "modere"
          : "mineur";

      let meta: string | undefined;
      if (pickup.trendMinutes !== null && pickup.trendMinutes !== undefined) {
        if (pickup.trendMinutes === 0) {
          meta = "Évolution stable";
        } else {
          const formatted = Math.abs(pickup.trendMinutes).toFixed(1);
          meta = pickup.trendDirection === "down"
            ? `${formatted} min de plus qu'hier`
            : `${formatted} min de mieux qu'hier`;
        }
      }

      items.push({
        id: "pickup",
        title: "Temps de prise en charge",
        description: `Moyenne actuelle : ${pickup.averageMinutes.toFixed(1)} min`,
        impact,
        meta,
      });
    }

    return items;
  }, [data]);

  const handleAlertAction = useCallback(
    (alert: AlertEntry) => {
      switch (alert.action) {
        case "dispatch":
          setDispatchAlert(alert);
          break;
        case "note":
          setNoteAlert(alert);
          break;
        case "incident":
          onOpenIncidentReport?.(alert.id);
          break;
        default:
          setNoteAlert(alert);
      }
    },
    [onOpenIncidentReport],
  );

  const handleOpenDispatchComposer = useCallback(() => {
    if (!dispatchAlert) {
      return;
    }

    onOpenMessageComposer?.({
      recipientType: "admin",
      subject: `Dispatch · ${dispatchAlert.title}`,
      content: `${dispatchAlert.description}\n\nMerci de prioriser cette action.`,
    });
    setDispatchAlert(null);
  }, [dispatchAlert, onOpenMessageComposer]);

  return (
    <div className="space-y-8">
      {error ? (
        <Callout variant="destructive" className="border-rose-200 bg-rose-50">
          <AlertTitle>Synchronisation impossible</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Callout>
      ) : null}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card, index) => {
          const metric = card.metric;
          const value = metric?.value ?? 0;
          const decimals = metric?.decimals ?? (card.id === "revenue" ? 1 : 0);
          const suffix = metric?.suffix ?? "";
          const delta = metric?.delta;
          const DeltaIcon = !delta || delta >= 0 ? ArrowUpRight : ArrowDownRight;
          const deltaColor = !delta || delta >= 0 ? "text-[#10B981]" : "text-rose-500";

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, type: "spring", stiffness: 140, damping: 20 }}
            >
              <Card
                className={cn(
                  "group rounded-3xl border-none bg-white/85 p-6 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.45)] ring-1 transition hover:-translate-y-1 hover:shadow-[0_32px_65px_-30px_rgba(37,99,235,0.35)]",
                  card.ring,
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.title}</p>
                    <div className="mt-3 flex items-baseline gap-1">
                      {metric ? (
                        <AnimatedCounter
                          value={value}
                          decimals={decimals}
                          className="text-3xl font-bold text-slate-900"
                          suffix={suffix}
                        />
                      ) : (
                        <Skeleton className="h-9 w-24 rounded-xl" />
                      )}
                    </div>
                    <p className={cn("mt-2 flex items-center gap-1 text-xs font-semibold", deltaColor)}>
                      <DeltaIcon className="h-4 w-4" />
                      {formatDeltaLabel(delta)}
                    </p>
                  </div>
                  <div className={cn("rounded-2xl px-3 py-2 text-xs font-semibold", card.accent)}>Focus</div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-3xl border-none bg-white/90 shadow-md xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Performances mensuelles</CardTitle>
              <CardDescription>Suivi des commandes et revenus consolidés</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Badge className="rounded-2xl bg-[#2563EB]/10 px-3 py-1 text-[#2563EB]">
                {`Prochaine mise à jour dans ${refreshCountdown}`}
              </Badge>
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" /> : null}
              <Button
                variant="outline"
                className="rounded-2xl border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:border-[#2563EB]/40 hover:text-[#2563EB]"
                onClick={onOpenOrderForm}
              >
                Planifier une course
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[280px] w-full">
              {isLoading && !data ? (
                <Skeleton className="h-full w-full rounded-2xl" />
              ) : (
                <ResponsiveContainer>
                  <AreaChart data={data?.performance.chart ?? []} margin={{ left: 0, right: 0 }}>
                    <defs>
                      <linearGradient id="colorCommandes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickMargin={12} />
                    <Tooltip
                      cursor={{ stroke: "#CBD5E1" }}
                      contentStyle={{
                        borderRadius: 16,
                        borderColor: "#E2E8F0",
                        boxShadow: "0 18px 32px -24px rgba(15,23,42,0.25)",
                      }}
                      formatter={(value: number, name) =>
                        name === "revenus"
                          ? [`${value.toLocaleString("fr-FR")} €`, "Revenus"]
                          : [value, "Commandes"]
                      }
                    />
                    <Area
                      dataKey="commandes"
                      stroke="#2563EB"
                      fill="url(#colorCommandes)"
                      strokeWidth={3}
                      type="monotone"
                      name="Commandes"
                    />
                    <Area
                      dataKey="revenus"
                      stroke="#10B981"
                      fill="url(#colorRevenus)"
                      strokeWidth={3}
                      type="monotone"
                      name="Revenus"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Revenus projetés</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {data ? formatCurrency(data.performance.kpis.projectedRevenue) : "—"}
                </p>
                <p className="text-xs text-slate-500">
                  {lastUpdatedLabel ? `Projection à ${lastUpdatedLabel}` : "Projection en cours"}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Panier moyen</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {data ? formatCurrency(data.performance.kpis.averageOrderValue, 0) : "—"}
                </p>
                <p className="text-xs text-slate-500">Calculé sur les commandes du mois</p>
              </div>
              <div className="rounded-2xl bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Satisfaction client</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {data ? `${data.performance.kpis.satisfactionScore.toFixed(1)} / 5` : "—"}
                </p>
                <p className="text-xs text-slate-500">
                  {data
                    ? `${data.performance.kpis.ordersDelivered} livraisons réussies`
                    : "Suivi des livraisons en cours"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm transition-shadow duration-300 hover:shadow-lg">
          <CardHeader className="p-4 md:p-6 pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800">Alertes système</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Retards, incidents et anomalies à surveiller
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 md:p-6 pt-0">
            {(data?.alerts ?? []).length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/40 bg-white/50 px-4 py-5 text-sm text-gray-500">
                Aucune alerte critique détectée sur les 30 derniers jours.
              </p>
            ) : (
              data?.alerts.map((alert) => {
                const levelClass = ALERT_LEVEL_CLASSES[alert.level] ?? ALERT_LEVEL_CLASSES.info;
                const createdAtLabel = alert.createdAt
                  ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: fr })
                  : "À l'instant";

                return (
                  <div key={alert.id} className="rounded-2xl border border-white/30 bg-white/70 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", levelClass)}>
                          <ShieldAlert className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{alert.title}</p>
                          <p className="text-xs text-gray-500">{alert.description}</p>
                          <p className="mt-1 text-xs text-gray-400">{createdAtLabel}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="rounded-xl border border-white/60 bg-white px-3 py-1 text-xs font-semibold text-[#2563EB] shadow-sm transition hover:border-[#2563EB]/40 hover:bg-[#2563EB]/10"
                        onClick={() => handleAlertAction(alert)}
                      >
                        {ALERT_ACTION_LABEL[alert.action]}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
            <div className="flex items-center justify-between rounded-2xl bg-[#2563EB]/10 px-4 py-3 text-sm text-[#1D4ED8]">
              <span>{realtimeEnabled ? "Alertes temps réel activées" : "Activer les alertes temps réel"}</span>
              <Button
                className={cn(
                  "rounded-xl px-3 py-1 text-xs font-semibold",
                  realtimeEnabled ? "bg-[#1D4ED8] text-white" : "bg-white text-[#2563EB]",
                )}
                variant={realtimeEnabled ? "default" : "secondary"}
                onClick={() => setRealtimeEnabled((prev) => !prev)}
              >
                {realtimeEnabled ? "Désactiver" : "Activer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="h-full rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm transition-shadow duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-col gap-3 p-4 md:p-6 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-800">Activité des équipes</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Livraisons et niveau de charge des équipes terrain
                </CardDescription>
              </div>
              <Badge
                className={cn(
                  "rounded-xl px-3 py-1 text-xs font-semibold",
                  data ? FLUX_TONE_CLASSES[data.activity.flux.tone] : FLUX_TONE_CLASSES.positive,
                )}
              >
                {data ? data.activity.flux.label : "Flux stable"}
              </Badge>
            </div>
            {data ? (
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-2 font-medium text-gray-600">
                  <Truck className="h-4 w-4 text-[#2563EB]" />
                  {`${data.activity.flux.delivered}/${data.activity.flux.total} courses livrées`}
                </span>
                <span className="rounded-full border border-[#2563EB]/20 bg-[#2563EB]/10 px-2 py-0.5 text-[#2563EB]">
                  {`${Math.round(data.activity.flux.ratio * 100)}% de réussite`}
                </span>
              </div>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-6 p-4 md:p-6 pt-0">
            {teamStatusEntries.length === 0 && (data?.activity.segments ?? []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/50 bg-white/50 px-6 py-8 text-center text-sm text-gray-500">
                Aucune activité enregistrée aujourd'hui.
              </div>
            ) : (
              <>
                {teamStatusEntries.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {teamStatusEntries.map((team, index) => (
                      <motion.div
                        key={team.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, type: "spring", stiffness: 160, damping: 22 }}
                      >
                        <div
                          className={cn(
                            "flex items-start justify-between gap-3 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm ring-1",
                            team.status.ring,
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", team.status.icon)}>
                              <UsersRound className="h-5 w-5" />
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{team.label}</p>
                              <p className="text-xs text-gray-500">
                                {team.available} disponibles sur {team.total}
                              </p>
                            </div>
                          </div>
                          <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", team.status.badge)}>
                            {team.status.label}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : null}

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">Segments opérationnels</p>
                      <span className="text-xs text-gray-400">Top 3</span>
                    </div>
                    <ul className="space-y-3">
                      {(data?.activity.segments ?? []).length === 0 ? (
                        <li className="rounded-xl border border-dashed border-white/50 bg-white/40 px-3 py-2 text-xs text-gray-500">
                          Aucune donnée segmentée disponible pour ce mois.
                        </li>
                      ) : (
                        data?.activity.segments.map((item) => (
                          <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-2 text-sm shadow-sm">
                            <div>
                              <p className="font-semibold text-gray-800">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.orders} commandes</p>
                            </div>
                            <span className="text-xs font-semibold text-[#2563EB]">
                              {Math.round(item.deliveredRatio * 100)}%
                            </span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm">
                      <p className="text-sm font-semibold text-gray-800">Progression des livraisons</p>
                      <p className="mt-1 text-xs text-gray-500">Ratio de réussite des équipes aujourd'hui</p>
                      <div className="mt-4 h-2 w-full rounded-full bg-gray-200/70">
                        <div
                          className="h-full rounded-full bg-[#2563EB]"
                          style={{ width: `${Math.min(100, Math.round((data?.activity.flux.ratio ?? 0) * 100))}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs font-semibold text-gray-600">
                        {data ? `${Math.round(data.activity.flux.ratio * 100)}% des courses finalisées` : "Synchronisation"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm">
                      <p className="text-sm font-semibold text-gray-800">Sessions à confirmer</p>
                      <ul className="mt-3 space-y-2 text-xs text-gray-500">
                        {(data?.highlights.sessions ?? []).length === 0 ? (
                          <li className="rounded-xl border border-dashed border-white/50 bg-white/50 px-3 py-2 text-gray-400">
                            Aucune session en attente.
                          </li>
                        ) : (
                          data?.highlights.sessions.map((session) => (
                            <li key={session.id} className="flex items-center justify-between gap-3">
                              <span className="font-medium text-gray-600">{session.label}</span>
                              <span className={cn("rounded-full px-2 py-0.5", SESSION_BADGE_CLASSES[session.tone])}>
                                {session.scheduleLabel}
                              </span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="h-full rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm transition-shadow duration-300 hover:shadow-lg">
          <CardHeader className="p-4 md:p-6 pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800">Temps forts du jour</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Suivi des points opérationnels essentiels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 md:p-6 pt-0">
            {highlightItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/50 bg-white/50 px-6 py-10 text-center text-sm text-gray-500">
                Aucun événement signalé aujourd'hui.
              </div>
            ) : (
              highlightItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, type: "spring", stiffness: 160, damping: 24 }}
                >
                  <div className="group rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm transition hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                        {item.meta ? <p className="mt-2 text-xs text-gray-400">{item.meta}</p> : null}
                      </div>
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", IMPACT_BADGE_CLASSES[item.impact])}>
                        {item.impact === "modere" ? "Modéré" : item.impact.charAt(0).toUpperCase() + item.impact.slice(1)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <Dialog open={Boolean(noteAlert)} onOpenChange={(open) => !open && setNoteAlert(null)}>
        <DialogContent className="max-w-lg rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle>{noteAlert?.title ?? "Note opérationnelle"}</DialogTitle>
            <DialogDescription>
              {noteAlert?.createdAt
                ? `Publié ${formatDistanceToNow(new Date(noteAlert.createdAt), { addSuffix: true, locale: fr })}`
                : "Détail de l'alerte"}
            </DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-line text-sm text-slate-600">{noteAlert?.description}</p>
          <DialogFooter>
            <Button variant="outline" className="rounded-2xl" onClick={() => setNoteAlert(null)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(dispatchAlert)} onOpenChange={(open) => !open && setDispatchAlert(null)}>
        <DialogContent className="max-w-lg rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle>Contacter le dispatch</DialogTitle>
            <DialogDescription>
              {dispatchAlert?.createdAt
                ? `Déclenché ${formatDistanceToNow(new Date(dispatchAlert.createdAt), { addSuffix: true, locale: fr })}`
                : "Action prioritaire"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-600">
            <p>{dispatchAlert?.description}</p>
            <p className="rounded-2xl bg-slate-100 px-4 py-3 text-xs text-slate-500">
              Utilisez le centre de messages pour informer le dispatch et ajouter des consignes spécifiques.
            </p>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="w-full rounded-2xl"
              onClick={() => setDispatchAlert(null)}
            >
              Annuler
            </Button>
            <Button className="w-full rounded-2xl bg-[#2563EB] text-white" onClick={handleOpenDispatchComposer}>
              Ouvrir le centre de messages
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableauDeBord;
