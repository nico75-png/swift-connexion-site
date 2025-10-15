export type NormalizedOrderStatus =
  | "EN_ATTENTE_AFFECTATION"
  | "EN_ATTENTE_ENLEVEMENT"
  | "PICKED_UP"
  | "EN_COURS"
  | "LIVREE"
  | "ANNULEE";

export type OrderStatusBadgeTone = "warning" | "info" | "success" | "destructive" | "secondary" | "neutral";

interface OrderStatusMeta {
  label: string;
  badgeTone: OrderStatusBadgeTone;
  timelineIndex: number | null;
  final?: boolean;
}

const STATUS_METADATA: Record<NormalizedOrderStatus, OrderStatusMeta> = {
  EN_ATTENTE_AFFECTATION: {
    label: "En attente d'affectation",
    badgeTone: "warning",
    timelineIndex: 0,
  },
  EN_ATTENTE_ENLEVEMENT: {
    label: "En attente d'enlèvement",
    badgeTone: "warning",
    timelineIndex: 1,
  },
  PICKED_UP: {
    label: "Enlevée",
    badgeTone: "secondary",
    timelineIndex: 2,
  },
  EN_COURS: {
    label: "En cours de livraison",
    badgeTone: "info",
    timelineIndex: 2,
  },
  LIVREE: {
    label: "Livrée",
    badgeTone: "success",
    timelineIndex: 3,
    final: true,
  },
  ANNULEE: {
    label: "Annulée",
    badgeTone: "destructive",
    timelineIndex: null,
    final: true,
  },
};

const STATUS_ALIASES: Record<string, NormalizedOrderStatus> = {
  EN_ATTENTE_AFFECTATION: "EN_ATTENTE_AFFECTATION",
  "EN ATTENTE AFFECTATION": "EN_ATTENTE_AFFECTATION",
  "EN_ATTENTE": "EN_ATTENTE_AFFECTATION",
  "EN ATTENTE": "EN_ATTENTE_AFFECTATION",
  "En attente": "EN_ATTENTE_AFFECTATION",
  EN_ATTENTE_ENLEVEMENT: "EN_ATTENTE_ENLEVEMENT",
  "EN ATTENTE ENLEVEMENT": "EN_ATTENTE_ENLEVEMENT",
  "En attente d'enlèvement": "EN_ATTENTE_ENLEVEMENT",
  ENLEVE: "PICKED_UP",
  "ENLEVE": "PICKED_UP",
  "Enlevé": "PICKED_UP",
  PICKED_UP: "PICKED_UP",
  EN_COURS: "EN_COURS",
  "EN COURS": "EN_COURS",
  "En cours": "EN_COURS",
  LIVREE: "LIVREE",
  LIVRE: "LIVREE",
  "LIVRE": "LIVREE",
  "Livré": "LIVREE",
  "Livrée": "LIVREE",
  ANNULEE: "ANNULEE",
  ANNULE: "ANNULEE",
  "ANNULE": "ANNULEE",
  "Annulé": "ANNULEE",
  "Annulée": "ANNULEE",
};

const BADGE_TONE_CLASSES: Record<OrderStatusBadgeTone, string> = {
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-info/10 text-info border-info/20",
  success: "bg-success/10 text-success border-success/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  secondary: "bg-secondary/10 text-secondary border-secondary/20",
  neutral: "bg-muted text-foreground border-border",
};

export const ORDER_TIMELINE_STEPS = [
  { label: "En attente d'affectation" },
  { label: "En attente d'enlèvement" },
  { label: "En cours de livraison" },
  { label: "Livrée" },
] as const;

const sanitizeKey = (status: string) =>
  status
    .trim()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ");

const toAliasKey = (status: string) =>
  sanitizeKey(status)
    .replace(/\s+/g, "_")
    .replace(/\W/g, "_")
    .toUpperCase();

export const normalizeOrderStatus = (status: string | null | undefined): NormalizedOrderStatus | null => {
  if (!status) {
    return null;
  }
  const direct = STATUS_ALIASES[status];
  if (direct) {
    return direct;
  }
  const upper = STATUS_ALIASES[status.toUpperCase()];
  if (upper) {
    return upper;
  }
  const alias = STATUS_ALIASES[toAliasKey(status)];
  if (alias) {
    return alias;
  }
  return null;
};

export const getOrderStatusLabel = (status: string | null | undefined): string => {
  if (!status) {
    return "";
  }
  const normalized = normalizeOrderStatus(status);
  if (!normalized) {
    return status;
  }
  return STATUS_METADATA[normalized].label;
};

export const getOrderStatusBadgeClass = (status: string | null | undefined): string => {
  if (!status) {
    return BADGE_TONE_CLASSES.neutral;
  }
  const normalized = normalizeOrderStatus(status);
  if (!normalized) {
    return BADGE_TONE_CLASSES.neutral;
  }
  const tone = STATUS_METADATA[normalized].badgeTone;
  return BADGE_TONE_CLASSES[tone] ?? BADGE_TONE_CLASSES.neutral;
};

export const getOrderTimelineIndex = (status: string | null | undefined): number => {
  const normalized = normalizeOrderStatus(status ?? undefined);
  if (!normalized) {
    return -1;
  }
  const index = STATUS_METADATA[normalized].timelineIndex;
  return index ?? -1;
};

export const isOrderFinalStatus = (status: string | null | undefined): boolean => {
  const normalized = normalizeOrderStatus(status ?? undefined);
  return normalized ? Boolean(STATUS_METADATA[normalized].final) : false;
};

export const canReportDriverIncident = (status: string | null | undefined): boolean => {
  const normalized = normalizeOrderStatus(status ?? undefined);
  return normalized === "EN_ATTENTE_ENLEVEMENT";
};

export const isOrderCancelled = (status: string | null | undefined): boolean => {
  const normalized = normalizeOrderStatus(status ?? undefined);
  return normalized === "ANNULEE";
};

export const getStatusFilterValue = (status: string): string => {
  const normalized = normalizeOrderStatus(status);
  return normalized ?? status;
};

export const getOrderStatusTone = (status: string | null | undefined): OrderStatusBadgeTone => {
  const normalized = normalizeOrderStatus(status ?? undefined);
  if (!normalized) {
    return "neutral";
  }
  return STATUS_METADATA[normalized].badgeTone;
};
