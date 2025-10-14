import { differenceInMinutes, parseISO } from "date-fns";

export type DriverStatus = "AVAILABLE" | "ON_TRIP" | "PAUSED";

export type ZoneCode = "INTRA_PARIS" | "PETITE_COURONNE" | "GRANDE_COURONNE";

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: {
    type: string;
    capacity: string;
    registration?: string;
  };
  status: DriverStatus;
  nextFreeSlot: string;
  active: boolean;
  /**
   * @deprecated Tous les chauffeurs couvrent toutes les zones.
   * Ce champ est conservé pour compatibilité mais n'est plus utilisé.
   */
  zone?: ZoneCode | string;
  /**
   * Indicateur interne pour rappeler la règle métier : tous les chauffeurs couvrent toutes les zones.
   */
  coversAllZones?: true;
}

export interface OrderSchedule {
  start: string;
  end: string;
}

export interface Order {
  id: string;
  client: string;
  type: string;
  status: string;
  amount: number;
  schedule: OrderSchedule;
  pickupAddress: string;
  dropoffAddress: string;
  zoneRequirement: ZoneCode;
  volumeRequirement: string;
  weight: string;
  instructions?: string;
  driverId?: string | null;
  driverAssignedAt?: string | null;
}

export type ScheduledAssignmentStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED" | "FAILED";

export interface ScheduledAssignment {
  id: string;
  orderId: string;
  driverId: string;
  start: string;
  end: string;
  executeAt: string;
  createdAt: string;
  status: ScheduledAssignmentStatus;
  failureReason?: string;
}

export interface Assignment {
  id: string;
  orderId: string;
  driverId: string;
  start: string;
  end: string;
  endedAt?: string | null;
}

export type ActivityType = "CREATE" | "ASSIGN" | "UNASSIGN" | "NOTE" | "STATUS_UPDATE";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  orderId: string;
  driverId?: string;
  by: string;
  at: string;
  meta?: Record<string, unknown>;
  message?: string;
}

export type NotificationChannel = "CLIENT" | "ADMIN" | "DRIVER";

export interface NotificationEntry {
  id: string;
  channel: NotificationChannel;
  orderId: string;
  driverId?: string;
  read: boolean;
  message: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  orders: "oc_orders",
  drivers: "oc_drivers",
  assignments: "oc_assignments",
  scheduledAssignments: "oc_scheduled_assignments",
  activity: "oc_activity_log",
  notifications: "oc_notifications",
} as const;

export const generateId = () => {
  const globalScope = globalThis as { crypto?: Crypto };
  if (globalScope.crypto?.randomUUID) {
    return globalScope.crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 11)}`;
};

const defaultDrivers: Driver[] = [
  {
    id: "DRV-101",
    name: "Marc Dubois",
    phone: "06 12 34 56 78",
    vehicle: { type: "Fourgon", capacity: "5 m³", registration: "AB-123-CD" },
    status: "AVAILABLE",
    nextFreeSlot: "Aujourd'hui · 16:00",
    active: true,
    coversAllZones: true,
  },
  {
    id: "DRV-102",
    name: "Julie Lambert",
    phone: "06 98 76 54 32",
    vehicle: { type: "Scooter", capacity: "0.5 m³" },
    status: "ON_TRIP",
    nextFreeSlot: "Aujourd'hui · 18:15",
    active: true,
    coversAllZones: true,
  },
  {
    id: "DRV-103",
    name: "Sophie Renard",
    phone: "07 11 22 33 44",
    vehicle: { type: "Voiture", capacity: "1.2 m³", registration: "CD-456-EF" },
    status: "PAUSED",
    nextFreeSlot: "Demain · 08:00",
    active: true,
    coversAllZones: true,
  },
  {
    id: "DRV-104",
    name: "Pierre Martin",
    phone: "06 55 44 33 22",
    vehicle: { type: "Camionnette", capacity: "8 m³", registration: "GH-789-IJ" },
    status: "AVAILABLE",
    nextFreeSlot: "Aujourd'hui · 15:30",
    active: true,
    coversAllZones: true,
  },
];

const defaultOrders: Order[] = [
  {
    id: "CMD-247",
    client: "Cabinet Dupont",
    type: "Express",
    status: "En cours",
    amount: 45.5,
    schedule: {
      start: "2025-01-15T13:45:00+01:00",
      end: "2025-01-15T14:45:00+01:00",
    },
    pickupAddress: "12 rue de la Paix, 75002 Paris",
    dropoffAddress: "45 avenue des Champs-Élysées, 75008 Paris",
    zoneRequirement: "INTRA_PARIS",
    volumeRequirement: "3 m³",
    weight: "2.5 kg",
    instructions: "Sonnez à l'interphone, code 1234",
    driverId: "DRV-101",
    driverAssignedAt: "2025-01-15T12:30:00+01:00",
  },
  {
    id: "CMD-246",
    client: "Optique Vision",
    type: "Standard",
    status: "Livré",
    amount: 38,
    schedule: {
      start: "2025-01-15T12:30:00+01:00",
      end: "2025-01-15T13:15:00+01:00",
    },
    pickupAddress: "115 rue Saint-Lazare, 75009 Paris",
    dropoffAddress: "8 boulevard Saint-Germain, 75005 Paris",
    zoneRequirement: "INTRA_PARIS",
    volumeRequirement: "1 m³",
    weight: "1.2 kg",
    driverId: "DRV-102",
    driverAssignedAt: "2025-01-15T11:15:00+01:00",
  },
  {
    id: "CMD-245",
    client: "Lab Médical",
    type: "Fragile",
    status: "En attente",
    amount: 52,
    schedule: {
      start: "2025-01-15T16:00:00+01:00",
      end: "2025-01-15T17:30:00+01:00",
    },
    pickupAddress: "9 rue des Écoles, 75005 Paris",
    dropoffAddress: "16 avenue Foch, 75116 Paris",
    zoneRequirement: "PETITE_COURONNE",
    volumeRequirement: "2 m³",
    weight: "3.8 kg",
    driverId: null,
    driverAssignedAt: null,
  },
  {
    id: "CMD-244",
    client: "Avocat & Associés",
    type: "Express",
    status: "Enlevé",
    amount: 41,
    schedule: {
      start: "2025-01-15T09:45:00+01:00",
      end: "2025-01-15T10:45:00+01:00",
    },
    pickupAddress: "34 rue Vivienne, 75002 Paris",
    dropoffAddress: "1 place Vendôme, 75001 Paris",
    zoneRequirement: "INTRA_PARIS",
    volumeRequirement: "1 m³",
    weight: "1.8 kg",
    driverId: "DRV-104",
    driverAssignedAt: "2025-01-15T09:00:00+01:00",
  },
  {
    id: "CMD-243",
    client: "Pharmacie Centrale",
    type: "Standard",
    status: "Livré",
    amount: 35,
    schedule: {
      start: "2025-01-15T08:30:00+01:00",
      end: "2025-01-15T09:15:00+01:00",
    },
    pickupAddress: "72 rue de Rennes, 75006 Paris",
    dropoffAddress: "10 rue Oberkampf, 75011 Paris",
    zoneRequirement: "INTRA_PARIS",
    volumeRequirement: "0.8 m³",
    weight: "1.1 kg",
    driverId: "DRV-103",
    driverAssignedAt: "2025-01-15T07:30:00+01:00",
  },
  {
    id: "CMD-242",
    client: "Cabinet Martin",
    type: "Express",
    status: "Annulé",
    amount: 48,
    schedule: {
      start: "2025-01-14T17:00:00+01:00",
      end: "2025-01-14T17:30:00+01:00",
    },
    pickupAddress: "18 rue du Bac, 75007 Paris",
    dropoffAddress: "98 rue de Rivoli, 75001 Paris",
    zoneRequirement: "INTRA_PARIS",
    volumeRequirement: "1.5 m³",
    weight: "2.1 kg",
    driverId: null,
    driverAssignedAt: null,
  },
];

const defaultAssignments: Assignment[] = [
  {
    id: "ASN-1",
    orderId: "CMD-247",
    driverId: "DRV-101",
    start: "2025-01-15T13:45:00+01:00",
    end: "2025-01-15T14:45:00+01:00",
  },
  {
    id: "ASN-2",
    orderId: "CMD-246",
    driverId: "DRV-102",
    start: "2025-01-15T12:30:00+01:00",
    end: "2025-01-15T13:15:00+01:00",
  },
  {
    id: "ASN-3",
    orderId: "CMD-244",
    driverId: "DRV-104",
    start: "2025-01-15T09:45:00+01:00",
    end: "2025-01-15T10:45:00+01:00",
  },
  {
    id: "ASN-4",
    orderId: "CMD-243",
    driverId: "DRV-103",
    start: "2025-01-15T08:30:00+01:00",
    end: "2025-01-15T09:15:00+01:00",
  },
];

const defaultScheduledAssignments: ScheduledAssignment[] = [];

const defaultActivity: ActivityEntry[] = [
  {
    id: "ACT-1",
    type: "CREATE",
    orderId: "CMD-247",
    at: "2025-01-15T12:00:00+01:00",
    by: "system",
    message: "Commande créée",
  },
  {
    id: "ACT-2",
    type: "ASSIGN",
    orderId: "CMD-247",
    driverId: "DRV-101",
    at: "2025-01-15T12:30:00+01:00",
    by: "admin.sophie",
    message: "Chauffeur Marc Dubois affecté",
  },
  {
    id: "ACT-3",
    type: "STATUS_UPDATE",
    orderId: "CMD-247",
    at: "2025-01-15T13:00:00+01:00",
    by: "DRV-101",
    message: "Statut mis à jour : Enlevé",
  },
];

const defaultNotifications: NotificationEntry[] = [
  {
    id: "NOTIF-1",
    channel: "ADMIN",
    orderId: "CMD-247",
    driverId: "DRV-101",
    read: true,
    message: "Chauffeur Marc Dubois affecté à #CMD-247",
    createdAt: "2025-01-15T12:30:00+01:00",
  },
];

const safeParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value) as T;
    return parsed;
  } catch (error) {
    console.warn("Unable to parse store value", error);
    return fallback;
  }
};

const isBrowser = typeof window !== "undefined";

const initStore = <T,>(key: string, defaultValue: T) => {
  if (!isBrowser) {
    return defaultValue;
  }
  const existing = window.localStorage.getItem(key);
  if (existing) {
    return safeParse<T>(existing, defaultValue);
  }
  window.localStorage.setItem(key, JSON.stringify(defaultValue));
  return defaultValue;
};

const ensureInitialized = () => {
  initStore(STORAGE_KEYS.orders, defaultOrders);
  initStore(STORAGE_KEYS.drivers, defaultDrivers);
  initStore(STORAGE_KEYS.assignments, defaultAssignments);
  initStore(STORAGE_KEYS.scheduledAssignments, defaultScheduledAssignments);
  initStore(STORAGE_KEYS.activity, defaultActivity);
  initStore(STORAGE_KEYS.notifications, defaultNotifications);
};

const readStore = <T,>(key: string, fallback: T): T => {
  if (!isBrowser) {
    return fallback;
  }
  ensureInitialized();
  return safeParse<T>(window.localStorage.getItem(key), fallback);
};

const writeStore = <T,>(key: string, value: T) => {
  if (!isBrowser) {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const getOrders = (): Order[] => readStore(STORAGE_KEYS.orders, defaultOrders);

export const saveOrders = (list: Order[]) => {
  writeStore(STORAGE_KEYS.orders, list);
};

export const getDrivers = (): Driver[] => readStore(STORAGE_KEYS.drivers, defaultDrivers);

export const saveDrivers = (list: Driver[]) => {
  writeStore(STORAGE_KEYS.drivers, list);
};

export const getAssignments = (): Assignment[] => readStore(STORAGE_KEYS.assignments, defaultAssignments);

export const saveAssignments = (list: Assignment[]) => {
  writeStore(STORAGE_KEYS.assignments, list);
};

export const getScheduledAssignments = (): ScheduledAssignment[] =>
  readStore(STORAGE_KEYS.scheduledAssignments, defaultScheduledAssignments);

export const saveScheduledAssignments = (list: ScheduledAssignment[]) => {
  writeStore(STORAGE_KEYS.scheduledAssignments, list);
};

export const getActivityLog = (): ActivityEntry[] => readStore(STORAGE_KEYS.activity, defaultActivity);

export const appendActivity = (entry: ActivityEntry) => {
  const current = getActivityLog();
  const next = [entry, ...current].sort((a, b) => parseISO(b.at).getTime() - parseISO(a.at).getTime());
  writeStore(STORAGE_KEYS.activity, next);
};

export const getNotifications = (): NotificationEntry[] => readStore(STORAGE_KEYS.notifications, defaultNotifications);

export const saveNotifications = (list: NotificationEntry[]) => {
  writeStore(STORAGE_KEYS.notifications, list);
};

export const appendNotifications = (entries: NotificationEntry | NotificationEntry[]) => {
  const payload = Array.isArray(entries) ? entries : [entries];
  const current = getNotifications();
  const merged = [...payload, ...current].sort(
    (a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime(),
  );
  saveNotifications(merged);
};

export const hasTimeOverlap = (startA: string, endA: string, startB: string, endB: string) => {
  const diffStart = differenceInMinutes(parseISO(endA), parseISO(startB));
  const diffEnd = differenceInMinutes(parseISO(endB), parseISO(startA));
  return diffStart > 0 && diffEnd > 0;
};

export const resetMockStores = () => {
  if (!isBrowser) return;
  writeStore(STORAGE_KEYS.orders, defaultOrders);
  writeStore(STORAGE_KEYS.drivers, defaultDrivers);
  writeStore(STORAGE_KEYS.assignments, defaultAssignments);
  writeStore(STORAGE_KEYS.scheduledAssignments, defaultScheduledAssignments);
  writeStore(STORAGE_KEYS.activity, defaultActivity);
  writeStore(STORAGE_KEYS.notifications, defaultNotifications);
};
