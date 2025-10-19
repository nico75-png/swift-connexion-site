import { formatISO } from "date-fns";
import { ADMIN_ORDER_SEEDS, CLIENT_DIRECTORY, type AdminOrderSeed } from "./data/adminOrderSeeds";
import { defaultDrivers, type DriverStatus } from "./driversOrders.store";
import { ensureOrderNumberFormat } from "@/lib/orderSequence";

export type OrderStatus =
  | "EN_ATTENTE_AFFECTATION"
  | "EN_ATTENTE_ENLEVEMENT"
  | "ENLEVE"
  | "EN_COURS"
  | "LIVRE"
  | "ANNULEE"
  | "INCIDENT";

export interface OrderStatusHistoryEntry {
  id: string;
  status: OrderStatus;
  occurredAt: string;
  author: string;
  note?: string;
}

export type OrderAssignmentEventType = "ASSIGNED" | "UNASSIGNED" | "REASSIGNED" | "INCIDENT";

export interface OrderAssignmentEvent {
  id: string;
  type: OrderAssignmentEventType;
  driverId: string;
  driverName: string;
  occurredAt: string;
  author: string;
  note?: string;
}

export interface OrderDocuments {
  purchaseOrderUrl?: string;
  proofOfDeliveryUrl?: string;
}

export interface OrderAssignedDriver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  availability: "Disponible" | "En course" | "Occupé" | "Indisponible";
}

export interface OrderAdministrativeEvent {
  id: string;
  label: string;
  occurredAt: string;
  author: string;
  meta?: Record<string, unknown>;
}

export interface OrderDetailRecord {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  amountTtc: number;
  currency: string;
  pickupAt: string;
  transportType: string;
  customer: {
    companyName: string;
    siret: string;
    contact: {
      name: string;
      email: string;
      phone: string;
    };
  };
  pickupAddress: string;
  deliveryAddress: string;
  weight: number;
  volume: number;
  driverInstructions?: string;
  assignedDriver?: OrderAssignedDriver;
  documents?: OrderDocuments;
  statusHistory: OrderStatusHistoryEntry[];
  assignmentEvents: OrderAssignmentEvent[];
  administrativeEvents?: OrderAdministrativeEvent[];
  createdAt: string;
  updatedAt: string;
  excludedDriverIds?: string[];
}

const STORAGE_KEY = "oc_admin_order_details";

const DRIVER_AVAILABILITY_LABEL: Record<DriverStatus, OrderAssignedDriver["availability"]> = {
  AVAILABLE: "Disponible",
  ON_TRIP: "En course",
  PAUSED: "Indisponible",
};

const STATUS_SEQUENCE: Record<AdminOrderSeed["status"], OrderStatus[]> = {
  "En attente": ["EN_ATTENTE_AFFECTATION"],
  "Enlevé": ["EN_ATTENTE_AFFECTATION", "EN_ATTENTE_ENLEVEMENT", "ENLEVE"],
  "En cours": ["EN_ATTENTE_AFFECTATION", "EN_ATTENTE_ENLEVEMENT", "ENLEVE", "EN_COURS"],
  "Livré": [
    "EN_ATTENTE_AFFECTATION",
    "EN_ATTENTE_ENLEVEMENT",
    "ENLEVE",
    "EN_COURS",
    "LIVRE",
  ],
  "Annulé": ["EN_ATTENTE_AFFECTATION", "ANNULEE"],
};

const STATUS_TIMINGS: Record<OrderStatus, number> = {
  EN_ATTENTE_AFFECTATION: -180,
  EN_ATTENTE_ENLEVEMENT: -60,
  ENLEVE: -5,
  EN_COURS: 30,
  LIVRE: 90,
  ANNULEE: -45,
  INCIDENT: 0,
};

const toIsoDateTime = (date: string, time: string) => new Date(`${date}T${time}:00+02:00`).toISOString();

const addMinutes = (isoDate: string, minutes: number) =>
  new Date(new Date(isoDate).getTime() + minutes * 60 * 1000).toISOString();

const resolveStatusAuthor = (status: OrderStatus, seed: AdminOrderSeed): string => {
  if (status === "ENLEVE" || status === "EN_COURS" || status === "LIVRE") {
    return seed.driverId ?? "system";
  }
  return "admin.centrale";
};

const findDriver = (driverId: string | null | undefined) =>
  driverId ? defaultDrivers.find((driver) => driver.id === driverId) ?? null : null;

const buildAssignedDriver = (seed: AdminOrderSeed): OrderAssignedDriver | undefined => {
  const driver = findDriver(seed.driverId);
  if (!driver) {
    return undefined;
  }
  const vehicleLabel = driver.vehicle?.type
    ? `${driver.vehicle.type} · ${driver.vehicle.capacity ?? ""}`.trim()
    : "Véhicule";
  return {
    id: driver.id,
    name: driver.name,
    phone: driver.phone,
    vehicle: vehicleLabel,
    availability: DRIVER_AVAILABILITY_LABEL[driver.status],
  };
};

const buildStatusHistory = (seed: AdminOrderSeed, pickupAt: string): OrderStatusHistoryEntry[] => {
  const sequence = STATUS_SEQUENCE[seed.status] ?? ["EN_ATTENTE_AFFECTATION"];
  return sequence
    .map((status, index) => {
      const offset = STATUS_TIMINGS[status] ?? index * 15;
      const occurredAt = addMinutes(pickupAt, offset);
      const note =
        status === "ANNULEE"
          ? "Annulation confirmée suite à la demande du client"
          : undefined;
      return {
        id: `ST-${seed.number}-${status}`,
        status,
        occurredAt,
        author: resolveStatusAuthor(status, seed),
        note,
      } satisfies OrderStatusHistoryEntry;
    })
    .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
};

const buildAssignmentEvents = (seed: AdminOrderSeed, pickupAt: string): OrderAssignmentEvent[] => {
  if (!seed.driverId) {
    return [];
  }
  const driver = findDriver(seed.driverId);
  return [
    {
      id: `AS-${seed.number}-ASSIGN`,
      type: "ASSIGNED",
      driverId: seed.driverId,
      driverName: driver?.name ?? seed.driverId,
      occurredAt: addMinutes(pickupAt, -45),
      author: "admin.centrale",
      note: seed.status === "Annulé" ? "Assignation initiale (commande annulée)" : "Assignation confirmée",
    },
  ];
};

const buildDocuments = (seed: AdminOrderSeed): OrderDocuments => {
  const baseUrl = "https://files.one-connexion.test";
  const documents: OrderDocuments = {
    purchaseOrderUrl: `${baseUrl}/purchase-orders/${seed.number}.pdf`,
  };
  if (seed.status === "Livré") {
    documents.proofOfDeliveryUrl = `${baseUrl}/pods/${seed.number}.pdf`;
  }
  return documents;
};

const buildDetailRecord = (seed: AdminOrderSeed): OrderDetailRecord => {
  const pickupAt = toIsoDateTime(seed.date, seed.time);
  const customerInfo = CLIENT_DIRECTORY[seed.client];
  const statusHistory = buildStatusHistory(seed, pickupAt);
  const assignmentEvents = buildAssignmentEvents(seed, pickupAt);
  const assignedDriver = buildAssignedDriver(seed);
  const createdAt = addMinutes(pickupAt, -200);
  const updatedAt = statusHistory[statusHistory.length - 1]?.occurredAt ?? pickupAt;

  const administrativeEvents: OrderAdministrativeEvent[] =
    seed.status === "Annulé"
      ? [
          {
            id: `ADM-${seed.number}-CANCEL`,
            label: "Commande annulée",
            occurredAt: updatedAt,
            author: "admin.centrale",
            meta: { origin: "client" },
          },
        ]
      : [];

  const status = statusHistory[statusHistory.length - 1]?.status ?? "EN_ATTENTE_AFFECTATION";

  const formattedNumber = ensureOrderNumberFormat(seed.number) || seed.number;
  return {
    id: formattedNumber,
    orderNumber: formattedNumber,
    status,
    amountTtc: seed.amount,
    currency: "EUR",
    pickupAt,
    transportType: seed.transportType,
    customer: {
      companyName: seed.client,
      siret: customerInfo?.siret ?? "00000000000000",
      contact: {
        name: customerInfo?.contact.name ?? "Contact principal",
        email: customerInfo?.contact.email ?? "contact@client.test",
        phone: customerInfo?.contact.phone ?? "+33100000000",
      },
    },
    pickupAddress: seed.pickupAddress,
    deliveryAddress: seed.deliveryAddress,
    weight: Number(seed.weight.toFixed(1)),
    volume: Number(seed.volume.toFixed(1)),
    driverInstructions: seed.instructions,
    assignedDriver,
    documents: buildDocuments(seed),
    statusHistory,
    assignmentEvents,
    administrativeEvents,
    createdAt,
    updatedAt,
    excludedDriverIds: [],
  };
};

const defaultOrders: OrderDetailRecord[] = ADMIN_ORDER_SEEDS.map(buildDetailRecord);

let memoryOrders = [...defaultOrders];

const isBrowser = typeof window !== "undefined";

const normalizeRecord = (record: OrderDetailRecord): OrderDetailRecord => {
  const formatted = ensureOrderNumberFormat(record.orderNumber ?? record.id);
  return {
    ...record,
    id: formatted || record.id,
    orderNumber: formatted || record.orderNumber,
    administrativeEvents: Array.isArray(record.administrativeEvents)
      ? record.administrativeEvents.map((event) => ({ ...event }))
      : [],
  };
};

const readFromStorage = (): OrderDetailRecord[] => {
  if (!isBrowser) {
    return memoryOrders.map(normalizeRecord);
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultOrders));
      return defaultOrders.map(normalizeRecord);
    }
    const parsed = JSON.parse(stored) as OrderDetailRecord[];
    const records = Array.isArray(parsed) && parsed.length > 0 ? parsed : [...defaultOrders];
    return records.map(normalizeRecord);
  } catch (error) {
    console.error("Unable to parse order details store", error);
    return defaultOrders.map(normalizeRecord);
  }
};

const writeToStorage = (orders: OrderDetailRecord[]) => {
  memoryOrders = orders.map(normalizeRecord);
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders.map(normalizeRecord)));
  } catch (error) {
    console.error("Unable to persist order details store", error);
  }
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export const listOrderDetails = (): OrderDetailRecord[] => clone(readFromStorage());

export const upsertOrderDetailRecord = (record: OrderDetailRecord): OrderDetailRecord => {
  persistOrderRecord(record);
  return clone(record);
};

export const getOrderDetailRecord = (orderId: string): OrderDetailRecord | null => {
  const orders = readFromStorage();
  const match = orders.find((order) => order.id === orderId);
  return match ? clone(match) : null;
};

const persistOrderRecord = (next: OrderDetailRecord) => {
  const orders = readFromStorage();
  const index = orders.findIndex((order) => order.id === next.id);
  const updated = [...orders];
  if (index === -1) {
    updated.unshift(next);
  } else {
    updated[index] = next;
  }
  writeToStorage(updated);
};

export interface AssignDriverPayload {
  driver: OrderAssignedDriver;
  author: string;
}

export const assignDriverToOrder = (orderId: string, payload: AssignDriverPayload): OrderDetailRecord => {
  const existing = getOrderDetailRecord(orderId);
  if (!existing) {
    throw new Error("Commande introuvable");
  }

  const now = formatISO(new Date());
  const alreadyAssigned = existing.assignedDriver?.id === payload.driver.id;
  const nextStatus: OrderStatus =
    existing.status === "EN_ATTENTE_AFFECTATION"
      ? "EN_ATTENTE_ENLEVEMENT"
      : existing.status;

  if (
    existing.status !== "EN_ATTENTE_AFFECTATION" &&
    existing.status !== "EN_ATTENTE_ENLEVEMENT" &&
    existing.status !== "ENLEVE" &&
    existing.status !== "EN_COURS"
  ) {
    throw new Error("Cette commande ne peut pas être affectée");
  }

  const updatedHistory = [...existing.statusHistory];
  if (existing.status !== nextStatus && !updatedHistory.some((entry) => entry.status === nextStatus)) {
    updatedHistory.push({
      id: `ST-${orderId}-${Date.now()}`,
      status: nextStatus,
      occurredAt: now,
      author: payload.author,
      note: "Chauffeur affecté",
    });
  }

  const updatedAssignments = [...existing.assignmentEvents];
  if (!alreadyAssigned) {
    updatedAssignments.push({
      id: `AS-${orderId}-${Date.now()}`,
      type: existing.assignedDriver ? "REASSIGNED" : "ASSIGNED",
      driverId: payload.driver.id,
      driverName: payload.driver.name,
      occurredAt: now,
      author: payload.author,
    });
  }

  const updated: OrderDetailRecord = {
    ...existing,
    status: nextStatus,
    assignedDriver: clone(payload.driver),
    statusHistory: updatedHistory
      .slice()
      .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()),
    assignmentEvents: updatedAssignments
      .slice()
      .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()),
    administrativeEvents: existing.administrativeEvents ?? [],
    updatedAt: now,
  };

  persistOrderRecord(updated);
  return updated;
};

export interface CancelOrderPayload {
  reason: string;
  author: string;
  note?: string;
}

export const cancelOrderInStore = (orderId: string, payload: CancelOrderPayload): OrderDetailRecord => {
  const existing = getOrderDetailRecord(orderId);
  if (!existing) {
    throw new Error("Commande introuvable");
  }
  if (existing.status !== "EN_ATTENTE_AFFECTATION" && existing.status !== "EN_ATTENTE_ENLEVEMENT") {
    throw new Error("Cette commande ne peut pas être annulée à ce stade");
  }

  const now = formatISO(new Date());
  const updatedHistory = [
    ...existing.statusHistory,
    {
      id: `ST-${orderId}-${Date.now()}`,
      status: "ANNULEE" as OrderStatus,
      occurredAt: now,
      author: payload.author,
      note: payload.reason,
    },
  ].sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

  const administrativeEvents = [
    ...(existing.administrativeEvents ?? []),
    {
      id: `ADM-${orderId}-${Date.now()}`,
      label: "Commande annulée",
      occurredAt: now,
      author: payload.author,
      meta: { reason: payload.reason, note: payload.note },
    },
  ].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  const updated: OrderDetailRecord = {
    ...existing,
    status: "ANNULEE",
    assignedDriver: undefined,
    statusHistory: updatedHistory,
    assignmentEvents: existing.assignmentEvents,
    administrativeEvents,
    updatedAt: now,
  };

  persistOrderRecord(updated);
  return updated;
};

export const appendAdministrativeEventToOrder = (
  orderId: string,
  payload: { label: string; author: string; meta?: Record<string, unknown> },
): OrderDetailRecord => {
  const existing = getOrderDetailRecord(orderId);
  if (!existing) {
    throw new Error("Commande introuvable");
  }

  const now = formatISO(new Date());
  const events = [
    ...(existing.administrativeEvents ?? []),
    {
      id: `ADM-${orderId}-${Date.now()}`,
      label: payload.label,
      occurredAt: now,
      author: payload.author,
      meta: payload.meta,
    },
  ].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  const updated: OrderDetailRecord = {
    ...existing,
    administrativeEvents: events,
    updatedAt: now,
  };

  persistOrderRecord(updated);
  return updated;
};

export const updateOrderStatusInStore = (
  orderId: string,
  status: OrderStatus,
  author: string,
  note?: string,
): OrderDetailRecord => {
  const existing = getOrderDetailRecord(orderId);
  if (!existing) {
    throw new Error("Commande introuvable");
  }

  const now = formatISO(new Date());
  const historyEntry: OrderStatusHistoryEntry = {
    id: `ST-${orderId}-${Date.now()}`,
    status,
    occurredAt: now,
    author,
    note,
  };

  const updatedHistory = [...existing.statusHistory, historyEntry]
    .slice()
    .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

  const updated: OrderDetailRecord = {
    ...existing,
    status,
    statusHistory: updatedHistory,
    updatedAt: now,
  };

  persistOrderRecord(updated);
  return updated;
};

export const replaceOrderDetailRecord = (record: OrderDetailRecord) => {
  persistOrderRecord(record);
};

export const resetOrderStore = () => {
  writeToStorage([...defaultOrders]);
};
