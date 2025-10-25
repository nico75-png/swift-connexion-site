// @ts-nocheck
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import {
  assignDriverToOrder,
  appendAdministrativeEventToOrder,
  cancelOrderInStore,
  getOrderDetailRecord,
  listOrderDetails,
  upsertOrderDetailRecord,
  type OrderAssignmentEvent,
  type OrderAssignedDriver,
  type OrderDetailRecord,
  type OrderStatus,
} from "@/lib/stores/orders.store";
import {
  appendNotifications,
  generateId,
  getDrivers,
  getOrders as getLegacyOrders,
  saveOrders as saveLegacyOrders,
  type Driver,
  type NotificationEntry,
  type Order as LegacyOrder,
} from "@/lib/stores/driversOrders.store";
import {
  type AssignmentRequirements,
  evaluateDriverCompatibility,
} from "@/lib/utils/driver-compatibility";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { ensureOrderNumberFormat } from "@/lib/orderSequence";
import { ADMIN_DRIVER_LABELS, type PackageType } from "@/lib/packageTaxonomy";

export interface OrderActivityEntry {
  id: string;
  label: string;
  occurredAt: string;
  actor: string;
  kind: "status" | "assignment" | "incident" | "note";
  meta?: Record<string, unknown>;
}

export interface AdminOrderDetail extends OrderDetailRecord {
  statusLabel: string;
  formattedAmount: string;
  formattedPickupAt: string;
  activityLog: OrderActivityEntry[];
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  EN_ATTENTE_AFFECTATION: "En attente d'affectation",
  EN_ATTENTE_ENLEVEMENT: "En attente d'enlèvement",
  ENLEVE: "Enlevé",
  EN_COURS: "En cours",
  LIVRE: "Livré",
  ANNULEE: "Annulée",
  INCIDENT: "En incident",
};

const LEGACY_STATUS: Record<OrderStatus, LegacyOrder["status"]> = {
  EN_ATTENTE_AFFECTATION: "En attente",
  EN_ATTENTE_ENLEVEMENT: "En attente",
  ENLEVE: "Enlevé",
  EN_COURS: "En cours",
  LIVRE: "Livré",
  ANNULEE: "Annulé",
  INCIDENT: "En cours",
};

const ASSIGNABLE_STATUSES: OrderStatus[] = [
  "EN_ATTENTE_AFFECTATION",
  "EN_ATTENTE_ENLEVEMENT",
  "ENLEVE",
  "EN_COURS",
];

const availabilityLabel = (status: string): OrderAssignedDriver["availability"] => {
  switch (status) {
    case "AVAILABLE":
      return "Disponible";
    case "ON_TRIP":
      return "En course";
    case "PAUSED":
      return "Indisponible";
    default:
      return "Occupé";
  }
};

const formatDateTime = (iso: string) =>
  format(new Date(iso), "dd MMM yyyy · HH'h'mm", { locale: fr });

const buildActivityLog = (record: OrderDetailRecord): OrderActivityEntry[] => {
  const items: OrderActivityEntry[] = [];
  const seenAssignmentByDriver = new Map<string, string>();

  record.statusHistory.forEach((entry) => {
    items.push({
      id: entry.id,
      label: `Statut → ${STATUS_LABELS[entry.status]}`,
      occurredAt: entry.occurredAt,
      actor: entry.author,
      kind: entry.status === "ANNULEE" ? "incident" : "status",
      meta: entry.note ? { note: entry.note } : undefined,
    });
  });

  const sortedAssignments = record.assignmentEvents
    .slice()
    .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

  sortedAssignments.forEach((event) => {
    const existing = seenAssignmentByDriver.get(event.driverId);
    if (event.type === "ASSIGNED" || event.type === "REASSIGNED") {
      if (existing === event.driverName) {
        return;
      }
      seenAssignmentByDriver.set(event.driverId, event.driverName);
    }

    items.push({
      id: event.id,
      label:
        event.type === "ASSIGNED"
          ? `Chauffeur affecté · ${event.driverName}`
          : event.type === "REASSIGNED"
            ? `Chauffeur remplacé · ${event.driverName}`
            : event.type === "INCIDENT"
              ? `Incident chauffeur · ${event.driverName}`
              : `Chauffeur retiré · ${event.driverName}`,
      occurredAt: event.occurredAt,
      actor: event.author,
      kind: event.type === "INCIDENT" ? "incident" : "assignment",
      meta: event.note ? { note: event.note } : undefined,
    });
  });

  (record.administrativeEvents ?? []).forEach((event) => {
    items.push({
      id: event.id,
      label: event.label,
      occurredAt: event.occurredAt,
      actor: event.author,
      kind: "note",
      meta: event.meta,
    });
  });

  return items.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
};

const syncLegacyOrder = (record: OrderDetailRecord) => {
  const legacyOrders = getLegacyOrders();
  const index = legacyOrders.findIndex((order) => order.id === record.id);
  if (index === -1) {
    return;
  }

  const current = legacyOrders[index];
  const updated: LegacyOrder = {
    ...current,
    status: LEGACY_STATUS[record.status] ?? current.status,
    amount: record.amountTtc,
    schedule: {
      start: record.pickupAt,
      end: current.schedule?.end ?? record.pickupAt,
    },
    type: record.transportType,
    pickupAddress: record.pickupAddress,
    dropoffAddress: record.deliveryAddress,
    weight: `${record.weight} kg`,
    volumeRequirement: `${record.volume} m³`,
    instructions: record.driverInstructions,
    driverId: record.assignedDriver?.id ?? null,
  };

  const nextOrders = [...legacyOrders];
  nextOrders[index] = updated;
  saveLegacyOrders(nextOrders);
};

const buildAssignmentRequirements = (record: OrderDetailRecord): AssignmentRequirements => ({
  weight: record.weight,
  volume: record.volume,
  excludedDriverIds: record.excludedDriverIds ?? [],
});

const notifyDriverAssignment = (order: OrderDetailRecord, driver: Driver) => {
  const message = `Nouvelle mission : ${order.orderNumber} — ${order.pickupAddress} → ${order.deliveryAddress}`;
  const notification: NotificationEntry = {
    id: generateId(),
    channel: "DRIVER",
    orderId: order.id,
    driverId: driver.id,
    read: false,
    message,
    createdAt: new Date().toISOString(),
  };
  appendNotifications(notification);
};

const toAdminOrderDetail = (record: OrderDetailRecord): AdminOrderDetail => ({
  ...record,
  statusLabel: STATUS_LABELS[record.status],
  formattedAmount: new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: record.currency,
    minimumFractionDigits: 2,
  }).format(record.amountTtc),
  formattedPickupAt: formatDateTime(record.pickupAt),
  activityLog: buildActivityLog(record),
});

type SupabaseOrderRow = Tables<"orders">;

const resolveTransportLabel = (packageType: SupabaseOrderRow["package_type"] | null): string => {
  if (!packageType) {
    return "Course dédiée";
  }
  return ADMIN_DRIVER_LABELS[packageType as PackageType] ?? "Course dédiée";
};

const buildStatusHistoryFromSupabase = (
  row: SupabaseOrderRow,
  orderId: string,
  status: OrderStatus,
): OrderDetailRecord["statusHistory"] => {
  const history: OrderDetailRecord["statusHistory"] = [
    {
      id: `ST-${orderId}-CREATED`,
      status: "EN_ATTENTE_AFFECTATION",
      occurredAt: row.created_at,
      author: row.customer_company,
    },
  ];

  if (status !== "EN_ATTENTE_AFFECTATION") {
    history.push({
      id: `ST-${orderId}-${status}`,
      status,
      occurredAt: row.updated_at ?? row.created_at,
      author: row.driver_id ? row.driver_id : "system",
    });
  }

  return history.sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
};

const buildAssignmentEventsFromSupabase = (
  row: SupabaseOrderRow,
  orderId: string,
  driverName: string | null,
): OrderDetailRecord["assignmentEvents"] => {
  if (!row.driver_id) {
    return [];
  }
  return [
    {
      id: `AS-${orderId}-ASSIGNED`,
      type: "ASSIGNED",
      driverId: row.driver_id,
      driverName: driverName ?? row.driver_id,
      occurredAt: row.driver_assigned_at ?? row.updated_at ?? row.created_at,
      author: "system",
      note: row.driver_instructions ?? undefined,
    },
  ];
};

const buildAssignedDriverFromSupabase = (
  row: SupabaseOrderRow,
  driver: Driver | undefined,
): OrderAssignedDriver | undefined => {
  if (!row.driver_id || !driver) {
    return undefined;
  }
  const vehicleLabel = driver.vehicle?.type
    ? `${driver.vehicle.type}${driver.vehicle.capacity ? ` · ${driver.vehicle.capacity}` : ""}`
    : "Véhicule";
  return {
    id: driver.id,
    name: driver.name,
    phone: driver.phone,
    vehicle: vehicleLabel,
    availability: availabilityLabel(driver.status),
  };
};

const toOrderDetailRecordFromSupabase = (row: SupabaseOrderRow): OrderDetailRecord => {
  const formattedId = ensureOrderNumberFormat(row.id) || row.id;
  const status = (row.status as OrderStatus) ?? "EN_ATTENTE_AFFECTATION";
  const drivers = getDrivers();
  const driver = row.driver_id ? drivers.find((candidate) => candidate.id === row.driver_id) : undefined;
  const assignedDriver = buildAssignedDriverFromSupabase(row, driver);
  return {
    id: formattedId,
    orderNumber: formattedId,
    status,
    amountTtc: row.amount ?? 0,
    currency: row.currency ?? "EUR",
    pickupAt: row.schedule_start,
    transportType: resolveTransportLabel(row.package_type),
    customer: {
      companyName: row.customer_company,
      siret: "00000000000000",
      contact: {
        name: row.customer_company,
        email: "contact@client.test",
        phone: "+33102030405",
      },
    },
    pickupAddress: row.pickup_address,
    deliveryAddress: row.delivery_address,
    weight: row.weight_kg,
    volume: row.volume_m3,
    driverInstructions: row.driver_instructions ?? undefined,
    assignedDriver,
    documents: {},
    statusHistory: buildStatusHistoryFromSupabase(row, formattedId, status),
    assignmentEvents: buildAssignmentEventsFromSupabase(row, formattedId, assignedDriver?.name ?? null),
    administrativeEvents: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    excludedDriverIds: [],
  };
};

const fetchOrderDetailFromSupabase = async (orderId: string): Promise<OrderDetailRecord | null> => {
  if (!orderId) {
    return null;
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toOrderDetailRecordFromSupabase(data);
};

export const getOrderDetail = async (orderId: string): Promise<AdminOrderDetail | null> => {
  const record = getOrderDetailRecord(orderId);
  if (record) {
    return toAdminOrderDetail(record);
  }

  const supabaseRecord = await fetchOrderDetailFromSupabase(orderId);
  if (!supabaseRecord) {
    return null;
  }

  const persisted = upsertOrderDetailRecord(supabaseRecord);
  return toAdminOrderDetail(persisted);
};

export const listOrders = async (): Promise<AdminOrderDetail[]> => {
  return listOrderDetails().map(toAdminOrderDetail);
};

export const assignDriver = async (
  orderId: string,
  driverId: string,
  options: { actor?: string } = {},
): Promise<AdminOrderDetail> => {
  const currentRecord = getOrderDetailRecord(orderId);
  if (!currentRecord) {
    throw new Error("Commande introuvable");
  }
  if (!ASSIGNABLE_STATUSES.includes(currentRecord.status)) {
    throw new Error("Cette commande ne peut plus être modifiée à ce stade");
  }

  const drivers = getDrivers();
  const driver = drivers.find((item) => item.id === driverId);
  if (!driver) {
    throw new Error("Chauffeur introuvable");
  }

  const compatibility = evaluateDriverCompatibility(driver, buildAssignmentRequirements(currentRecord));
  if (!compatibility.assignable) {
    throw new Error(compatibility.reasons[0] ?? "Ce chauffeur ne peut pas être affecté");
  }

  const payload: OrderAssignedDriver = {
    id: driver.id,
    name: driver.name,
    phone: driver.phone,
    vehicle: `${driver.vehicle.type} · ${driver.vehicle.capacity}`,
    availability: availabilityLabel(driver.status),
  };

  const record = assignDriverToOrder(orderId, {
    driver: payload,
    author: options.actor ?? "admin",
  });

  if (currentRecord.assignedDriver?.id !== driver.id) {
    notifyDriverAssignment(record, driver);
  }
  syncLegacyOrder(record);
  return toAdminOrderDetail(record);
};

export const cancelOrder = async (
  orderId: string,
  payload: { reason: string; author?: string; note?: string },
): Promise<AdminOrderDetail> => {
  const record = cancelOrderInStore(orderId, {
    reason: payload.reason,
    author: payload.author ?? "admin",
    note: payload.note,
  });
  syncLegacyOrder(record);
  return toAdminOrderDetail(record);
};

export const logAdministrativeAction = async (
  orderId: string,
  payload: { label: string; author?: string; meta?: Record<string, unknown> },
): Promise<AdminOrderDetail> => {
  const record = appendAdministrativeEventToOrder(orderId, {
    label: payload.label,
    author: payload.author ?? "admin",
    meta: payload.meta,
  });
  return toAdminOrderDetail(record);
};

export const downloadDocument = async (url: string) => {
  if (typeof window === "undefined") return;
  window.open(url, "_blank", "noopener");
};

export const resolveStatusLabel = (status: OrderStatus): string => STATUS_LABELS[status];

export const isAssignmentAllowed = (status: OrderStatus) => ASSIGNABLE_STATUSES.includes(status);

export const canCancelOrder = (status: OrderStatus) =>
  status === "EN_ATTENTE_AFFECTATION" || status === "EN_ATTENTE_ENLEVEMENT";

const TIMELINE_STATUS_ORDER: OrderStatus[] = [
  "EN_ATTENTE_AFFECTATION",
  "ENLEVE",
  "EN_COURS",
  "LIVRE",
];

export const buildTimeline = (record: OrderDetailRecord) => {
  const steps = TIMELINE_STATUS_ORDER.map((status) => {
    const history = record.statusHistory.find((entry) => entry.status === status);
    const time = history ? formatDateTime(history.occurredAt) : "-";

    let stepStatus: "done" | "current" | "pending" | "cancelled" = "pending";
    const currentIndex = TIMELINE_STATUS_ORDER.indexOf(record.status);
    const stepIndex = TIMELINE_STATUS_ORDER.indexOf(status);

    if (record.status === "ANNULEE") {
      stepStatus = stepIndex === 0 ? "cancelled" : "pending";
    } else if (currentIndex > stepIndex) {
      stepStatus = "done";
    } else if (currentIndex === stepIndex) {
      stepStatus = "current";
    }

    return {
      label: STATUS_LABELS[status],
      time,
      status: stepStatus,
    };
  });

  if (record.status === "ANNULEE") {
    const cancelEntry = record.statusHistory
      .slice()
      .reverse()
      .find((entry) => entry.status === "ANNULEE");
    steps.push({
      label: STATUS_LABELS.ANNULEE,
      time: cancelEntry ? formatDateTime(cancelEntry.occurredAt) : "-",
      status: "cancelled" as const,
    });
  }

  return steps;
};

export const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);

export const formatPhoneDisplay = (phone: string) => {
  const digits = phone.replace(/[^0-9+]/g, "");
  if (digits.startsWith("+")) {
    return digits;
  }
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
};

export const formatTimelineLabel = (event: OrderAssignmentEvent) => {
  switch (event.type) {
    case "ASSIGNED":
      return `Chauffeur ${event.driverName} affecté`;
    case "REASSIGNED":
      return `Chauffeur remplacé par ${event.driverName}`;
    case "INCIDENT":
      return `Incident chauffeur (${event.driverName})`;
    default:
      return `Chauffeur retiré (${event.driverName})`;
  }
};
