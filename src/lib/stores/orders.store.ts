import { formatISO } from "date-fns";

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
  createdAt: string;
  updatedAt: string;
  excludedDriverIds?: string[];
}

const STORAGE_KEY = "oc_admin_order_details";

const defaultOrders: OrderDetailRecord[] = [
  {
    id: "010",
    orderNumber: "CMD-010",
    status: "EN_ATTENTE_AFFECTATION",
    amountTtc: 198.5,
    currency: "EUR",
    pickupAt: "2025-02-02T08:30:00+01:00",
    transportType: "Express",
    customer: {
      companyName: "One Logistics",
      siret: "81234567800024",
      contact: {
        name: "Sophie Martin",
        email: "sophie.martin@onelogistics.test",
        phone: "+33102030405",
      },
    },
    pickupAddress: "17 Rue des Entrepreneurs, 75015 Paris",
    deliveryAddress: "2 Avenue de la République, 75011 Paris",
    weight: 320,
    volume: 6.5,
    driverInstructions: "Contactez le client 15 minutes avant l'arrivée.",
    documents: {
      purchaseOrderUrl: "https://files.one-connexion.test/purchase-orders/CMD-010.pdf",
    },
    statusHistory: [
      {
        id: "ST-010-1",
        status: "EN_ATTENTE_AFFECTATION",
        occurredAt: "2025-01-31T09:12:00+01:00",
        author: "admin.julie",
        note: "Commande créée depuis l'espace client",
      },
    ],
    assignmentEvents: [],
    createdAt: "2025-01-31T09:12:00+01:00",
    updatedAt: "2025-01-31T09:12:00+01:00",
    excludedDriverIds: [],
  },
  {
    id: "011",
    orderNumber: "CMD-011",
    status: "EN_COURS",
    amountTtc: 142.0,
    currency: "EUR",
    pickupAt: "2025-02-01T14:00:00+01:00",
    transportType: "Standard",
    customer: {
      companyName: "Café de la Gare",
      siret: "90234567800011",
      contact: {
        name: "Paul Hernandez",
        email: "paul.hernandez@cafedelagare.test",
        phone: "+33106070809",
      },
    },
    pickupAddress: "5 Place du 8 Mai 1945, 75010 Paris",
    deliveryAddress: "12 Rue Oberkampf, 75011 Paris",
    weight: 120,
    volume: 2.4,
    driverInstructions: "Livraison avant ouverture",
    documents: {
      purchaseOrderUrl: "https://files.one-connexion.test/purchase-orders/CMD-011.pdf",
      proofOfDeliveryUrl: "https://files.one-connexion.test/pods/CMD-011.pdf",
    },
    assignedDriver: {
      id: "DRV-101",
      name: "Marc Dubois",
      phone: "+33612345678",
      vehicle: "Fourgon · 12 m³",
      availability: "En course",
    },
    statusHistory: [
      {
        id: "ST-011-1",
        status: "EN_ATTENTE_AFFECTATION",
        occurredAt: "2025-01-30T11:20:00+01:00",
        author: "admin.julie",
      },
      {
        id: "ST-011-2",
        status: "EN_ATTENTE_ENLEVEMENT",
        occurredAt: "2025-01-31T09:45:00+01:00",
        author: "admin.julie",
      },
      {
        id: "ST-011-3",
        status: "ENLEVE",
        occurredAt: "2025-02-01T14:25:00+01:00",
        author: "DRV-101",
      },
      {
        id: "ST-011-4",
        status: "EN_COURS",
        occurredAt: "2025-02-01T14:40:00+01:00",
        author: "DRV-101",
      },
    ],
    assignmentEvents: [
      {
        id: "AS-011-1",
        type: "ASSIGNED",
        driverId: "DRV-101",
        driverName: "Marc Dubois",
        occurredAt: "2025-01-31T09:45:00+01:00",
        author: "admin.julie",
        note: "Affectation confirmée",
      },
    ],
    createdAt: "2025-01-30T11:20:00+01:00",
    updatedAt: "2025-02-01T14:40:00+01:00",
    excludedDriverIds: [],
  },
  {
    id: "012",
    orderNumber: "CMD-012",
    status: "LIVRE",
    amountTtc: 298.9,
    currency: "EUR",
    pickupAt: "2025-01-20T07:45:00+01:00",
    transportType: "Température dirigée",
    customer: {
      companyName: "Pharmacie Centrale",
      siret: "80345678900017",
      contact: {
        name: "Claire Nguyen",
        email: "claire.nguyen@pharmaciecentrale.test",
        phone: "+33107080910",
      },
    },
    pickupAddress: "3 Rue de la Paix, 75002 Paris",
    deliveryAddress: "88 Avenue Victor Hugo, 75116 Paris",
    weight: 80,
    volume: 1.6,
    driverInstructions: "Confidentiel - signature obligatoire",
    documents: {
      purchaseOrderUrl: "https://files.one-connexion.test/purchase-orders/CMD-012.pdf",
      proofOfDeliveryUrl: "https://files.one-connexion.test/pods/CMD-012.pdf",
    },
    assignedDriver: {
      id: "DRV-104",
      name: "Nadia Benali",
      phone: "+33699887766",
      vehicle: "Utilitaire · 8 m³",
      availability: "Disponible",
    },
    statusHistory: [
      {
        id: "ST-012-1",
        status: "EN_ATTENTE_AFFECTATION",
        occurredAt: "2025-01-18T10:05:00+01:00",
        author: "admin.adrien",
      },
      {
        id: "ST-012-2",
        status: "EN_ATTENTE_ENLEVEMENT",
        occurredAt: "2025-01-18T11:15:00+01:00",
        author: "admin.adrien",
      },
      {
        id: "ST-012-3",
        status: "ENLEVE",
        occurredAt: "2025-01-20T08:10:00+01:00",
        author: "DRV-104",
      },
      {
        id: "ST-012-4",
        status: "EN_COURS",
        occurredAt: "2025-01-20T08:35:00+01:00",
        author: "DRV-104",
      },
      {
        id: "ST-012-5",
        status: "LIVRE",
        occurredAt: "2025-01-20T09:05:00+01:00",
        author: "DRV-104",
      },
    ],
    assignmentEvents: [
      {
        id: "AS-012-1",
        type: "ASSIGNED",
        driverId: "DRV-104",
        driverName: "Nadia Benali",
        occurredAt: "2025-01-18T11:15:00+01:00",
        author: "admin.adrien",
      },
    ],
    createdAt: "2025-01-18T10:05:00+01:00",
    updatedAt: "2025-01-20T09:05:00+01:00",
    excludedDriverIds: [],
  },
];

let memoryOrders = [...defaultOrders];

const isBrowser = typeof window !== "undefined";

const readFromStorage = (): OrderDetailRecord[] => {
  if (!isBrowser) {
    return memoryOrders;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultOrders));
      return [...defaultOrders];
    }
    const parsed = JSON.parse(stored) as OrderDetailRecord[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...defaultOrders];
  } catch (error) {
    console.error("Unable to parse order details store", error);
    return [...defaultOrders];
  }
};

const writeToStorage = (orders: OrderDetailRecord[]) => {
  memoryOrders = [...orders];
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error("Unable to persist order details store", error);
  }
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export const listOrderDetails = (): OrderDetailRecord[] => clone(readFromStorage());

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

  if (existing.status !== "EN_ATTENTE_AFFECTATION" && existing.status !== "EN_ATTENTE_ENLEVEMENT") {
    throw new Error("Cette commande ne peut pas être affectée");
  }

  const now = formatISO(new Date());
  const alreadyAssigned = existing.assignedDriver?.id === payload.driver.id;
  const status: OrderStatus = "EN_ATTENTE_ENLEVEMENT";

  const updatedHistory = [...existing.statusHistory];
  if (!updatedHistory.some((entry) => entry.status === status)) {
    updatedHistory.push({
      id: `ST-${orderId}-${Date.now()}`,
      status,
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
    status,
    assignedDriver: clone(payload.driver),
    statusHistory: updatedHistory
      .slice()
      .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()),
    assignmentEvents: updatedAssignments
      .slice()
      .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()),
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

  const updated: OrderDetailRecord = {
    ...existing,
    status: "ANNULEE",
    assignedDriver: undefined,
    statusHistory: updatedHistory,
    assignmentEvents: existing.assignmentEvents,
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
