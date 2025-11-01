import type { PostgrestError } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import {
  addMonths,
  eachMonthOfInterval,
  endOfDay,
  endOfMonth,
  format,
  formatDistanceToNow,
  getDaysInMonth,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
  differenceInMinutes,
} from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const ADMIN_DASHBOARD_REFRESH_MS = 5 * 60 * 1000;

type OrderRow = Tables<"orders">;
type ClientProfileRow = Tables<"client_profiles">;
type DriverRow = Tables<"drivers">;
type NotificationRow = Tables<"notifications">;

type SystemAlertRow = {
  id: string | null;
  title?: string | null;
  message?: string | null;
  description?: string | null;
  details?: string | null;
  severity?: string | null;
  level?: string | null;
  status?: string | null;
  created_at?: string | null;
  action?: string | null;
  action_required?: string | null;
  incident_id?: string | null;
  related_incident_id?: string | null;
  maintenance_id?: string | null;
  note_id?: string | null;
  requires_dispatch?: boolean | null;
  dispatch_required?: boolean | null;
  metadata?: Record<string, unknown> | null;
};

type IncidentRow = {
  id: string;
  title?: string | null;
  summary?: string | null;
  description?: string | null;
  severity?: string | null;
  impact_level?: string | null;
  status?: string | null;
  created_at?: string | null;
  reported_at?: string | null;
  reference?: string | null;
  requires_dispatch?: boolean | null;
  action_required?: string | null;
};

type MaintenanceRow = {
  id: string;
  title?: string | null;
  description?: string | null;
  summary?: string | null;
  status?: string | null;
  severity?: string | null;
  priority?: string | null;
  impact_level?: string | null;
  created_at?: string | null;
  scheduled_at?: string | null;
  scheduled_for?: string | null;
  requires_dispatch?: boolean | null;
  action_required?: string | null;
};

type DailyEventRow = {
  id: string;
  title?: string | null;
  description?: string | null;
  summary?: string | null;
  impact_level?: string | null;
  priority?: number | string | null;
  priority_label?: string | null;
  status?: string | null;
  tone?: string | null;
  type?: string | null;
  event_date?: string | null;
  highlight_date?: string | null;
  date?: string | null;
  created_at?: string | null;
  scheduled_at?: string | null;
  scheduled_for?: string | null;
  scheduled_end?: string | null;
  start_time?: string | null;
  starts_at?: string | null;
  metadata?: Record<string, unknown> | null;
};

type SummaryMetricId = "orders" | "clients" | "drivers" | "revenue";

type AlertLevel = NonNullable<NotificationRow["notification_type"]>;

export type AlertAction = "dispatch" | "note" | "incident" | "none";

export interface SummaryMetric {
  id: SummaryMetricId;
  value: number;
  previousValue: number;
  delta: number;
  suffix?: string;
  decimals?: number;
}

export interface ChartPoint {
  month: string;
  commandes: number;
  revenus: number;
}

export interface PerformanceKpis {
  projectedRevenue: number;
  averageOrderValue: number;
  satisfactionScore: number;
  ordersDelivered: number;
  ordersTotal: number;
}

export interface AlertEntry {
  id: string;
  title: string;
  description: string;
  level: AlertLevel;
  createdAt: string;
  action: AlertAction;
}

export interface ActivitySegment {
  id: string;
  name: string;
  orders: number;
  deliveredRatio: number;
}

export interface DriverAvailabilityEntry {
  id: string;
  label: string;
  total: number;
  available: number;
  availabilityRate: number;
}

export interface FluxStatus {
  label: string;
  tone: "positive" | "warning" | "critical";
  ratio: number;
  delivered: number;
  total: number;
}

export interface SessionHighlight {
  id: string;
  label: string;
  scheduleLabel: string;
  tone: "info" | "warning";
}

export interface HighlightHeadline {
  title: string;
  description: string;
  trendLabel: string;
  trendDirection: "up" | "down" | "neutral";
}

export interface PickupHighlight {
  averageMinutes: number | null;
  trendMinutes: number | null;
  trendDirection: "up" | "down" | "neutral";
}

export interface DailyHighlights {
  headline: HighlightHeadline | null;
  sessions: SessionHighlight[];
  pickup: PickupHighlight | null;
}

export interface AdminDashboardData {
  summary: SummaryMetric[];
  performance: {
    chart: ChartPoint[];
    kpis: PerformanceKpis;
  };
  alerts: AlertEntry[];
  activity: {
    segments: ActivitySegment[];
    driverAvailability: DriverAvailabilityEntry[];
    flux: FluxStatus;
  };
  highlights: DailyHighlights;
}

interface EnrichedOrder extends OrderRow {
  createdAt: Date;
  totalAmount: number;
}

const safeParseDate = (value: string | null): Date | null => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const computePercentChange = (previous: number, current: number): number => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
};

const normaliseMonthLabel = (date: Date): string => {
  const raw = format(date, "MMM", { locale: fr });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

const resolveAlertAction = (level: AlertLevel): AlertAction => {
  switch (level) {
    case "alert":
      return "dispatch";
    case "warning":
      return "incident";
    case "info":
      return "note";
    default:
      return "none";
  }
};

const isMissingRelationError = (code: string | null | undefined) => code === "42P01" || code === "PGRST302";

const isMissingColumnError = (code: string | null | undefined) => code === "42703" || code === "PGRST204";

const booleanFromUnknown = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value > 0;
  }

  if (typeof value === "string") {
    const normalised = value.trim().toLowerCase();
    return ["1", "true", "vrai", "oui", "yes", "y"].includes(normalised);
  }

  return false;
};

const firstNonEmpty = (...values: Array<unknown>): string | null => {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }
  return null;
};

const normaliseAlertLevelFromSeverity = (severity: string | null | undefined): AlertLevel => {
  const value = severity?.toString().trim().toLowerCase() ?? "";

  if (["critical", "critique", "severe", "urgent", "incident", "major", "haut"].some((term) => value.includes(term))) {
    return "alert";
  }

  if (["warning", "avertissement", "medium", "moyen", "maintenance", "degraded", "retard"].some((term) => value.includes(term))) {
    return "warning";
  }

  if (["resolved", "resolu", "normal", "ok", "completed", "termine"].some((term) => value.includes(term))) {
    return "success";
  }

  return "info";
};

const normaliseAlertAction = (
  rawAction: string | null | undefined,
  fallback: AlertAction = "note",
): AlertAction => {
  const value = rawAction?.toString().trim().toLowerCase() ?? "";

  if (!value) {
    return fallback;
  }

  if (["dispatch", "contacter", "appeler", "call"].some((term) => value.includes(term))) {
    return "dispatch";
  }

  if (["incident", "rapport", "ticket"].some((term) => value.includes(term))) {
    return "incident";
  }

  if (["note", "consulter", "read"].some((term) => value.includes(term))) {
    return "note";
  }

  if (["ignore", "noop", "none"].some((term) => value.includes(term))) {
    return "none";
  }

  return fallback;
};

const ensureAlertId = (rawId: string | null | undefined, prefix: string) => {
  if (rawId && rawId.trim().length > 0) {
    return rawId;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

const extractMetadataString = (metadata: Record<string, unknown> | null | undefined, key: string) => {
  const value = metadata?.[key];
  return typeof value === "string" ? value : null;
};

const normaliseEventDate = (event: DailyEventRow): Date | null => {
  const candidates = [
    event.event_date,
    event.highlight_date,
    event.date,
    event.scheduled_at,
    event.scheduled_for,
    event.scheduled_end,
    event.start_time,
    event.starts_at,
    event.created_at,
    extractMetadataString(event.metadata, "event_date"),
    extractMetadataString(event.metadata, "scheduled_at"),
    extractMetadataString(event.metadata, "scheduled_for"),
    extractMetadataString(event.metadata, "start_time"),
  ];

  for (const candidate of candidates) {
    const parsed = safeParseDate(candidate ?? null);
    if (parsed) {
      return parsed;
    }
  }

  return null;
};

const normalisePriorityValue = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    const numeric = Number(trimmed);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }

    const lower = trimmed.toLowerCase();
    if (lower.includes("crit")) return 0;
    if (lower.includes("haut") || lower.includes("high") || lower.includes("urgent")) return 1;
    if (lower.includes("moy") || lower.includes("medium")) return 2;
    if (lower.includes("faible") || lower.includes("low")) return 3;
  }

  return null;
};

const deriveEventPriority = (event: DailyEventRow): number => {
  const candidates: unknown[] = [
    event.priority,
    event.priority_label,
    event.impact_level,
    extractMetadataString(event.metadata, "priority"),
  ];

  for (const candidate of candidates) {
    const value = normalisePriorityValue(candidate);
    if (value !== null) {
      return value;
    }
  }

  return 50;
};

const deriveEventTone = (event: DailyEventRow): SessionHighlight["tone"] => {
  const sources = [
    event.tone,
    event.status,
    event.impact_level,
    event.priority_label,
    extractMetadataString(event.metadata, "tone"),
  ];

  const value = firstNonEmpty(...sources);
  if (!value) {
    return "info";
  }

  const lower = value.toLowerCase();
  if (["critical", "incident", "urgent", "alert", "retard", "risk"].some((term) => lower.includes(term))) {
    return "warning";
  }

  return "info";
};

const buildHighlightsFromEvents = (
  events: DailyEventRow[],
  now: Date,
): { headline: HighlightHeadline | null; sessions: SessionHighlight[] } => {
  if (events.length === 0) {
    return { headline: null, sessions: [] };
  }

  const sorted = [...events].sort((a, b) => deriveEventPriority(a) - deriveEventPriority(b));

  const [primary, ...others] = sorted;
  const primaryTitle =
    firstNonEmpty(primary.title, primary.summary, extractMetadataString(primary.metadata, "title")) ?? "Événement prioritaire";
  const primaryDescription =
    firstNonEmpty(primary.description, primary.summary, extractMetadataString(primary.metadata, "description")) ??
    "Suivi opérationnel du jour";

  const severitySource =
    firstNonEmpty(
      primary.impact_level,
      primary.status,
      primary.priority_label,
      extractMetadataString(primary.metadata, "impact_level"),
      extractMetadataString(primary.metadata, "status"),
    ) ?? "";
  const severityLower = severitySource.toLowerCase();

  let trendDirection: HighlightHeadline["trendDirection"] = "neutral";
  if (["resolved", "normal", "stable", "ok", "completed", "réglé", "resolu"].some((term) => severityLower.includes(term))) {
    trendDirection = "up";
  } else if (["incident", "critical", "retard", "delayed", "degraded"].some((term) => severityLower.includes(term))) {
    trendDirection = "down";
  }

  const trendLabel = severitySource
    ? severitySource.replace(/_/g, " ").replace(/\b\p{L}/gu, (match) => match.toUpperCase())
    : "Suivi en cours";

  const sessions = others.slice(0, 3).map((event) => {
    const label =
      firstNonEmpty(event.title, event.summary, extractMetadataString(event.metadata, "title")) ?? "Session opérationnelle";
    const eventDate = normaliseEventDate(event) ?? now;

    return {
      id: ensureAlertId(event.id, "event"),
      label,
      scheduleLabel: formatDistanceToNow(eventDate, { addSuffix: true, locale: fr }),
      tone: deriveEventTone(event),
    } satisfies SessionHighlight;
  });

  return {
    headline: {
      title: primaryTitle,
      description: primaryDescription,
      trendLabel,
      trendDirection,
    },
    sessions,
  };
};

const unwrapOptionalResponse = <T>(
  response: { data: T[] | null; error: PostgrestError | null },
  context: string,
) => {
  if (response.error) {
    if (isMissingRelationError(response.error.code) || isMissingColumnError(response.error.code)) {
      console.warn(`[admin-dashboard] ${context} indisponibles : ${response.error.message}`);
      return [] as T[];
    }

    throw new Error(`Impossible de récupérer ${context} : ${response.error.message}`);
  }

  return response.data ?? [];
};

const computeAveragePickupMinutes = (orders: EnrichedOrder[]): number | null => {
  const durations = orders
    .map((order) => {
      const reference = order.createdAt;
      const driverAssigned =
        safeParseDate(order.driver_assigned_at) ??
        safeParseDate(order.schedule_start) ??
        null;

      if (!reference || !driverAssigned) {
        return null;
      }

      const diff = differenceInMinutes(driverAssigned, reference);
      return Number.isFinite(diff) && diff >= 0 ? diff : null;
    })
    .filter((duration): duration is number => duration !== null);

  if (durations.length === 0) {
    return null;
  }

  const total = durations.reduce((acc, value) => acc + value, 0);
  return total / durations.length;
};

const fetchAdminDashboardData = async (userId?: string | null): Promise<AdminDashboardData> => {
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const startOfPreviousMonth = startOfMonth(subMonths(now, 1));
  const startOfNextMonth = startOfMonth(addMonths(now, 1));
  const startOfPeriod = startOfMonth(subMonths(now, 11));
  const startToday = startOfDay(now);
  const endToday = endOfDay(now);
  const startYesterday = startOfDay(subDays(now, 1));
  const endYesterday = endOfDay(subDays(now, 1));

  const [
    ordersResponse,
    clientsResponse,
    driversResponse,
    systemAlertsResponse,
    incidentsResponse,
    maintenanceResponse,
    dailyHighlightsResponse,
    eventsResponse,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "id, created_at, total_amount, amount, status, package_type, sector, driver_id, driver_assigned_at, schedule_start, schedule_end, customer_company",
      )
      .gte("created_at", startOfPeriod.toISOString())
      .order("created_at", { ascending: false }),
    supabase
      .from("client_profiles")
      .select("id, created_at, sector")
      .gte("created_at", startOfPreviousMonth.toISOString()),
    supabase
      .from("drivers")
      .select("id, availability, vehicle_type, created_at"),
    supabase
      .from("system_alerts" as never)
      .select("*")
      .gte("created_at", subDays(now, 30).toISOString())
      .order("created_at", { ascending: false }),
    supabase
      .from("incidents" as never)
      .select("*")
      .gte("created_at", subDays(now, 30).toISOString())
      .order("created_at", { ascending: false }),
    supabase
      .from("maintenance_events" as never)
      .select("*")
      .gte("created_at", subDays(now, 30).toISOString())
      .order("created_at", { ascending: false }),
    supabase
      .from("daily_highlights" as never)
      .select("*")
      .gte("created_at", startToday.toISOString())
      .lte("created_at", endToday.toISOString())
      .order("created_at", { ascending: false }),
    supabase
      .from("events" as never)
      .select("*")
      .gte("created_at", startToday.toISOString())
      .lte("created_at", endToday.toISOString())
      .order("created_at", { ascending: false }),
  ]);

  const notificationsQuery = supabase
    .from("notifications")
    .select("id, title, content, notification_type, created_at, user_id")
    .gte("created_at", subDays(now, 30).toISOString())
    .order("created_at", { ascending: false });

  const notificationsResponse = userId
    ? await notificationsQuery.or(`user_id.eq.${userId},user_id.is.null`)
    : await notificationsQuery.eq("user_id", null);

  if (ordersResponse.error) {
    throw new Error(`Impossible de récupérer les commandes : ${ordersResponse.error.message}`);
  }

  if (clientsResponse.error) {
    throw new Error(`Impossible de récupérer les clients : ${clientsResponse.error.message}`);
  }

  if (driversResponse.error) {
    throw new Error(`Impossible de récupérer les chauffeurs : ${driversResponse.error.message}`);
  }

  if (notificationsResponse.error) {
    throw new Error(`Impossible de récupérer les alertes : ${notificationsResponse.error.message}`);
  }

  const systemAlerts = unwrapOptionalResponse(systemAlertsResponse, "les alertes système");
  const incidentRows = unwrapOptionalResponse(incidentsResponse, "les incidents opérationnels");
  const maintenanceRows = unwrapOptionalResponse(maintenanceResponse, "les opérations de maintenance");
  const dailyHighlightsRows = unwrapOptionalResponse(dailyHighlightsResponse, "les temps forts quotidiens");
  const eventRows = unwrapOptionalResponse(eventsResponse, "les événements du jour");

  const orders: EnrichedOrder[] = (ordersResponse.data ?? [])
    .map((order) => {
      const createdAt = safeParseDate(order.created_at);
      if (!createdAt) {
        return null;
      }

      const totalAmount = Number(order.total_amount ?? order.amount ?? 0);
      return {
        ...order,
        createdAt,
        totalAmount: Number.isFinite(totalAmount) ? totalAmount : 0,
      };
    })
    .filter((order): order is EnrichedOrder => order !== null);

  const clients = clientsResponse.data ?? [];
  const drivers = driversResponse.data ?? [];
  const notifications = notificationsResponse.data ?? [];

  const ordersThisMonth = orders.filter(
    (order) => order.createdAt >= startOfCurrentMonth && order.createdAt < startOfNextMonth,
  );
  const ordersPreviousMonth = orders.filter(
    (order) => order.createdAt >= startOfPreviousMonth && order.createdAt < startOfCurrentMonth,
  );
  const ordersToday = orders.filter(
    (order) => order.createdAt >= startToday && order.createdAt <= endToday,
  );
  const ordersYesterday = orders.filter(
    (order) => order.createdAt >= startYesterday && order.createdAt <= endYesterday,
  );

  const ordersThisMonthCount = ordersThisMonth.length;
  const ordersPreviousMonthCount = ordersPreviousMonth.length;
  const deliveredThisMonth = ordersThisMonth.filter((order) => order.status === "delivered").length;
  const deliveredPreviousMonth = ordersPreviousMonth.filter((order) => order.status === "delivered").length;

  const revenueThisMonth = ordersThisMonth.reduce((acc, order) => acc + order.totalAmount, 0);
  const revenuePreviousMonth = ordersPreviousMonth.reduce((acc, order) => acc + order.totalAmount, 0);

  const clientsThisMonth = clients.filter((client) => {
    const createdAt = safeParseDate(client.created_at);
    return createdAt ? createdAt >= startOfCurrentMonth : false;
  }).length;

  const clientsPreviousMonth = clients.filter((client) => {
    const createdAt = safeParseDate(client.created_at);
    return createdAt ? createdAt >= startOfPreviousMonth && createdAt < startOfCurrentMonth : false;
  }).length;

  const activeDriversCurrent = drivers.filter((driver) => driver.availability === true).length;
  const activeDriversPrevious = drivers.filter((driver) => {
    if (driver.availability !== true) {
      return false;
    }

    const createdAt = safeParseDate(driver.created_at);
    if (!createdAt) {
      return false;
    }

    return createdAt < startOfCurrentMonth;
  }).length;

  const revenueCurrent = revenueThisMonth / 1000;
  const revenuePrevious = revenuePreviousMonth / 1000;

  const summary: SummaryMetric[] = [
    {
      id: "orders",
      value: ordersThisMonthCount,
      previousValue: ordersPreviousMonthCount,
      delta: computePercentChange(ordersPreviousMonthCount, ordersThisMonthCount),
    },
    {
      id: "clients",
      value: clientsThisMonth,
      previousValue: clientsPreviousMonth,
      delta: computePercentChange(clientsPreviousMonth, clientsThisMonth),
    },
    {
      id: "drivers",
      value: activeDriversCurrent,
      previousValue: activeDriversPrevious,
      delta: computePercentChange(activeDriversPrevious, activeDriversCurrent),
    },
    {
      id: "revenue",
      value: revenueCurrent,
      previousValue: revenuePrevious,
      delta: computePercentChange(revenuePreviousMonth, revenueThisMonth),
      suffix: " k€",
      decimals: 1,
    },
  ];

  const months = eachMonthOfInterval({
    start: startOfPeriod,
    end: now,
  });

  const chart: ChartPoint[] = months.map((monthDate) => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const monthOrders = orders.filter((order) => order.createdAt >= start && order.createdAt <= end);

    const monthRevenue = monthOrders.reduce((acc, order) => acc + order.totalAmount, 0);

    return {
      month: normaliseMonthLabel(monthDate),
      commandes: monthOrders.length,
      revenus: monthRevenue,
    };
  });

  const daysInMonth = getDaysInMonth(now);
  const currentDay = now.getDate();
  const averageDailyRevenue = currentDay > 0 ? revenueThisMonth / currentDay : 0;

  const projectedRevenue = averageDailyRevenue * daysInMonth;
  const averageOrderValue = ordersThisMonthCount > 0 ? revenueThisMonth / ordersThisMonthCount : 0;
  const satisfactionRatio = ordersThisMonthCount > 0 ? deliveredThisMonth / ordersThisMonthCount : 0;
  const satisfactionScore = Math.min(5, Math.max(0, 3 + satisfactionRatio * 2));

  const performance = {
    chart,
    kpis: {
      projectedRevenue,
      averageOrderValue,
      satisfactionScore,
      ordersDelivered: deliveredThisMonth,
      ordersTotal: ordersThisMonthCount,
    },
  };

  const systemAlertEntries: AlertEntry[] = (systemAlerts as any[]).map((alert) => {
    const metadataAction = alert.metadata?.["action"];
    const metadataTitle = alert.metadata?.["title"];
    const metadataMessage = alert.metadata?.["message"] ?? alert.metadata?.["description"];
    const metadataCreatedAt = alert.metadata?.["created_at"];
    const metadataSeverity = alert.metadata?.["severity"] ?? alert.metadata?.["level"];
    const metadataRequiresDispatch = alert.metadata?.["requires_dispatch"] ?? alert.metadata?.["dispatch_required"];

    const severitySource = firstNonEmpty(
      alert.severity,
      alert.level,
      alert.status,
      typeof metadataSeverity === "string" ? metadataSeverity : null,
    );
    const level = normaliseAlertLevelFromSeverity(severitySource);

    const requiresDispatch = booleanFromUnknown(alert.requires_dispatch ?? alert.dispatch_required ?? metadataRequiresDispatch);
    const baseAction = normaliseAlertAction(
      firstNonEmpty(alert.action_required, alert.action, typeof metadataAction === "string" ? metadataAction : null),
      requiresDispatch ? "dispatch" : alert.note_id ? "note" : "none",
    );

    const createdAtSource = firstNonEmpty(
      alert.created_at,
      typeof metadataCreatedAt === "string" ? metadataCreatedAt : null,
    );

    return {
      id: ensureAlertId(alert.id, "system"),
      title: firstNonEmpty(alert.title, typeof metadataTitle === "string" ? metadataTitle : null) ?? "Alerte système",
      description:
        firstNonEmpty(
          alert.message,
          alert.description,
          alert.details,
          typeof metadataMessage === "string" ? metadataMessage : null,
        ) ?? "",
      level,
      createdAt: safeParseDate(createdAtSource ?? null)?.toISOString() ?? new Date().toISOString(),
      action: alert.incident_id || alert.related_incident_id ? "incident" : baseAction,
    } satisfies AlertEntry;
  });

  const incidentAlertEntries: AlertEntry[] = (incidentRows as any[]).map((incident) => {
    const severitySource = firstNonEmpty(incident.severity, incident.impact_level, incident.status);
    const level = normaliseAlertLevelFromSeverity(severitySource);
    const createdAtSource = firstNonEmpty(incident.created_at, incident.reported_at);
    const requiresDispatch = booleanFromUnknown(incident.requires_dispatch ?? incident.action_required);

    return {
      id: ensureAlertId(`incident-${incident.id}`, "incident"),
      title: firstNonEmpty(incident.title, incident.reference) ?? "Incident opérationnel",
      description: firstNonEmpty(incident.summary, incident.description) ?? "",
      level,
      createdAt: safeParseDate(createdAtSource ?? null)?.toISOString() ?? new Date().toISOString(),
      action: requiresDispatch ? "dispatch" : "incident",
    } satisfies AlertEntry;
  });

  const maintenanceAlertEntries: AlertEntry[] = (maintenanceRows as any[]).map((task) => {
    const severitySource = firstNonEmpty(task.severity, task.priority, task.status, task.impact_level);
    const level = normaliseAlertLevelFromSeverity(severitySource);
    const createdAtSource = firstNonEmpty(task.scheduled_at, task.scheduled_for, task.created_at);
    const requiresDispatch = booleanFromUnknown(task.requires_dispatch ?? task.action_required);
    const action = requiresDispatch ? "dispatch" : normaliseAlertAction(task.action_required ?? task.status, "note");

    return {
      id: ensureAlertId(`maintenance-${task.id}`, "maintenance"),
      title: firstNonEmpty(task.title) ?? "Maintenance planifiée",
      description: firstNonEmpty(task.description, task.summary) ?? "",
      level,
      createdAt: safeParseDate(createdAtSource ?? null)?.toISOString() ?? new Date().toISOString(),
      action,
    } satisfies AlertEntry;
  });

  const notificationAlertEntries: AlertEntry[] = notifications.map((alert) => ({
    id: alert.id,
    title: alert.title ?? "Alerte système",
    description: alert.content ?? "",
    level: alert.notification_type ?? "info",
    createdAt: alert.created_at ?? new Date().toISOString(),
    action: resolveAlertAction(alert.notification_type ?? "info"),
  }));

  let alerts: AlertEntry[] = [...systemAlertEntries, ...incidentAlertEntries, ...maintenanceAlertEntries];

  if (alerts.length === 0) {
    alerts = notificationAlertEntries;
  } else if (notificationAlertEntries.length > 0) {
    const existingIds = new Set(alerts.map((alert) => alert.id));
    notificationAlertEntries.forEach((alert) => {
      if (!existingIds.has(alert.id)) {
        alerts.push(alert);
      }
    });
  }

  alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const packageSegments = new Map<string, { total: number; delivered: number }>();
  ordersThisMonth.forEach((order) => {
    const key = order.package_type ?? "Autres";
    const current = packageSegments.get(key) ?? { total: 0, delivered: 0 };
    current.total += 1;
    if (order.status === "delivered") {
      current.delivered += 1;
    }
    packageSegments.set(key, current);
  });

  const segments: ActivitySegment[] = Array.from(packageSegments.entries())
    .map(([id, stats]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      orders: stats.total,
      deliveredRatio: stats.total > 0 ? stats.delivered / stats.total : 0,
    }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 3);

  const driverAvailabilityMap = new Map<string, { total: number; available: number }>();
  drivers.forEach((driver) => {
    const key = driver.vehicle_type ?? "non renseigné";
    const current = driverAvailabilityMap.get(key) ?? { total: 0, available: 0 };
    current.total += 1;
    if (driver.availability) {
      current.available += 1;
    }
    driverAvailabilityMap.set(key, current);
  });

  const driverAvailability: DriverAvailabilityEntry[] = Array.from(driverAvailabilityMap.entries())
    .map(([id, stats]) => ({
      id,
      label: id
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      total: stats.total,
      available: stats.available,
      availabilityRate: stats.total > 0 ? stats.available / stats.total : 0,
    }))
    .sort((a, b) => b.available - a.available)
    .slice(0, 3);

  const fluxRatio = ordersThisMonthCount > 0 ? deliveredThisMonth / ordersThisMonthCount : 1;
  let fluxTone: FluxStatus["tone"] = "positive";
  let fluxLabel = "Flux stable";

  if (fluxRatio < 0.75) {
    fluxTone = "critical";
    fluxLabel = "Flux sous tension";
  } else if (fluxRatio < 0.9) {
    fluxTone = "warning";
    fluxLabel = "Surveillance";
  }

  const activity = {
    segments,
    driverAvailability,
    flux: {
      label: fluxLabel,
      tone: fluxTone,
      ratio: fluxRatio,
      delivered: deliveredThisMonth,
      total: ordersThisMonthCount,
    },
  };

  const deliveredToday = ordersToday.filter((order) => order.status === "delivered").length;
  const deliveredYesterday = ordersYesterday.filter((order) => order.status === "delivered").length;
  const deliveryDiff = deliveredToday - deliveredYesterday;

  const fallbackHeadline: HighlightHeadline = {
    title: "Livraisons finalisées",
    description: `${deliveredToday} livraison${deliveredToday > 1 ? "s" : ""} terminée${deliveredToday > 1 ? "s" : ""} aujourd'hui`,
    trendLabel:
      deliveryDiff === 0
        ? "Stable vs hier"
        : `${deliveryDiff > 0 ? "+" : ""}${deliveryDiff} vs hier`,
    trendDirection: deliveryDiff === 0 ? "neutral" : deliveryDiff > 0 ? "up" : "down",
  };

  const fallbackSessions = ordersThisMonth
    .filter((order) => {
      const scheduleStart = safeParseDate(order.schedule_start);
      if (!scheduleStart) {
        return false;
      }
      return scheduleStart >= now;
    })
    .sort((a, b) => {
      const aDate = safeParseDate(a.schedule_start) ?? now;
      const bDate = safeParseDate(b.schedule_start) ?? now;
      return aDate.getTime() - bDate.getTime();
    })
    .slice(0, 3)
    .map((order) => {
      const scheduleStart = safeParseDate(order.schedule_start) ?? now;
      const label = order.customer_company ?? order.package_type ?? "Course planifiée";
      const tone: SessionHighlight["tone"] = scheduleStart.getDate() === now.getDate() ? "info" : "warning";
      const scheduleLabel = formatDistanceToNow(scheduleStart, { addSuffix: true, locale: fr });

      return {
        id: order.id,
        label,
        scheduleLabel,
        tone,
      };
    });

  const pickupToday = computeAveragePickupMinutes(ordersToday);
  const pickupYesterday = computeAveragePickupMinutes(ordersYesterday);
  let pickupTrendDirection: PickupHighlight["trendDirection"] = "neutral";
  let pickupTrendMinutes: number | null = null;

  if (pickupToday !== null && pickupYesterday !== null) {
    const diff = pickupYesterday - pickupToday;
    pickupTrendMinutes = diff;
    pickupTrendDirection = diff === 0 ? "neutral" : diff > 0 ? "up" : "down";
  }

  const pickupHighlight: PickupHighlight | null = {
    averageMinutes: pickupToday,
    trendMinutes: pickupTrendMinutes,
    trendDirection: pickupTrendDirection,
  };

  const highlightSourceRows = dailyHighlightsRows.length > 0 ? dailyHighlightsRows : eventRows;
  const todaysEventHighlights = highlightSourceRows.filter((row) => {
    const eventDate = normaliseEventDate(row);
    return eventDate ? eventDate >= startToday && eventDate <= endToday : false;
  });

  const resolvedHighlights = buildHighlightsFromEvents(todaysEventHighlights, now);

  const highlights: DailyHighlights = {
    headline: resolvedHighlights.headline ?? fallbackHeadline,
    sessions: resolvedHighlights.sessions.length > 0 ? resolvedHighlights.sessions : fallbackSessions,
    pickup: pickupHighlight,
  };

  return {
    summary,
    performance,
    alerts,
    activity,
    highlights,
  };
};

export const useAdminDashboardData = (userId?: string | null) =>
  useQuery<AdminDashboardData, Error>({
    queryKey: ["admin-dashboard-data", userId ?? "anonymous"],
    queryFn: () => fetchAdminDashboardData(userId),
    refetchInterval: ADMIN_DASHBOARD_REFRESH_MS,
    staleTime: ADMIN_DASHBOARD_REFRESH_MS / 2,
  });
