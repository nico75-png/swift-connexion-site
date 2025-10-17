import { differenceInMinutes, parseISO } from "date-fns";
import { initGlobalOrderSeq, reconcileGlobalOrderSeq } from "@/lib/orderSequence";

export type DriverStatus = "AVAILABLE" | "ON_TRIP" | "PAUSED";

export type DriverWorkflowStatus = "ACTIF" | "EN_PAUSE" | "EN_COURSE";

export type DriverLifecycleStatus = "ACTIF" | "INACTIF";

export const DRIVER_UNAVAILABILITY_TYPES = [
  "VACANCES",
  "RENDEZ_VOUS",
  "MALADIE",
  "AUTRE",
] as const;

export type DriverUnavailabilityType = (typeof DRIVER_UNAVAILABILITY_TYPES)[number];

export interface DriverUnavailability {
  id: string;
  type: DriverUnavailabilityType;
  start: string;
  end: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export type ZoneCode = "INTRA_PARIS" | "PETITE_COURONNE" | "GRANDE_COURONNE";

export interface Driver {
  id: string;
  name: string;
  fullname?: string;
  phone: string;
  phoneNormalized?: string;
  email?: string;
  vehicle: {
    type: string;
    capacity: string;
    capacityKg?: number;
    registration?: string;
  };
  plate?: string;
  plateNormalized?: string;
  status: DriverStatus;
  nextFreeSlot: string;
  active: boolean;
  lifecycleStatus?: DriverLifecycleStatus;
  workflowStatus?: DriverWorkflowStatus;
  deactivated?: boolean;
  deactivatedAt?: string;
  unavailabilities?: DriverUnavailability[];
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
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
  excludedDriverIds?: string[];
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

const BLOCKING_SCHEDULED_STATUSES: ScheduledAssignmentStatus[] = ["PENDING", "PROCESSING"];

export const isBlockingScheduledStatus = (status: ScheduledAssignmentStatus) =>
  BLOCKING_SCHEDULED_STATUSES.includes(status);

export interface Assignment {
  id: string;
  orderId: string;
  driverId: string;
  start: string;
  end: string;
  endedAt?: string | null;
}

export type ActivityType =
  | "CREATE"
  | "ASSIGN"
  | "UNASSIGN"
  | "NOTE"
  | "STATUS_UPDATE"
  | "DRIVER_CREATE";

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
    fullname: "Marc Dubois",
    phone: "06 12 34 56 78",
    phoneNormalized: "0612345678",
    email: "marc.dubois@one-connexion.test",
    vehicle: { type: "Fourgon", capacity: "500 kg", capacityKg: 500, registration: "AB-123-CD" },
    plate: "AB123CD",
    plateNormalized: "AB123CD",
    status: "AVAILABLE",
    workflowStatus: "ACTIF",
    nextFreeSlot: "Aujourd'hui · 16:00",
    active: true,
    lifecycleStatus: "ACTIF",
    unavailabilities: [],
    comment: "Polyvalent et réactif",
    createdAt: "2025-01-14T08:15:00.000Z",
    coversAllZones: true,
  },
  {
    id: "DRV-102",
    name: "Julie Lambert",
    fullname: "Julie Lambert",
    phone: "06 98 76 54 32",
    phoneNormalized: "0698765432",
    email: "julie.lambert@one-connexion.test",
    vehicle: { type: "Scooter", capacity: "80 kg", capacityKg: 80 },
    plate: "SC123OC",
    plateNormalized: "SC123OC",
    status: "ON_TRIP",
    workflowStatus: "EN_COURSE",
    nextFreeSlot: "Aujourd'hui · 18:15",
    active: true,
    lifecycleStatus: "ACTIF",
    unavailabilities: [],
    createdAt: "2025-01-14T09:45:00.000Z",
    coversAllZones: true,
  },
  {
    id: "DRV-103",
    name: "Sophie Renard",
    fullname: "Sophie Renard",
    phone: "07 11 22 33 44",
    phoneNormalized: "0711223344",
    email: "sophie.renard@one-connexion.test",
    vehicle: { type: "Voiture", capacity: "250 kg", capacityKg: 250, registration: "CD-456-EF" },
    plate: "CD456EF",
    plateNormalized: "CD456EF",
    status: "PAUSED",
    workflowStatus: "EN_PAUSE",
    nextFreeSlot: "Demain · 08:00",
    active: true,
    lifecycleStatus: "ACTIF",
    unavailabilities: [],
    createdAt: "2025-01-13T15:30:00.000Z",
    coversAllZones: true,
  },
  {
    id: "DRV-104",
    name: "Pierre Martin",
    fullname: "Pierre Martin",
    phone: "06 55 44 33 22",
    phoneNormalized: "0655443322",
    email: "pierre.martin@one-connexion.test",
    vehicle: { type: "Utilitaire", capacity: "750 kg", capacityKg: 750, registration: "GH-789-IJ" },
    plate: "GH789IJ",
    plateNormalized: "GH789IJ",
    status: "AVAILABLE",
    workflowStatus: "ACTIF",
    nextFreeSlot: "Aujourd'hui · 15:30",
    active: true,
    lifecycleStatus: "ACTIF",
    unavailabilities: [],
    createdAt: "2025-01-12T11:10:00.000Z",
    coversAllZones: true,
  },
];

const defaultOrders: Order[] = [
  {
    id: "010",
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
    id: "009",
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
    id: "1000",
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
    id: "1001",
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
    id: "1002",
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
    id: "1003",
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
    orderId: "010",
    driverId: "DRV-101",
    start: "2025-01-15T13:45:00+01:00",
    end: "2025-01-15T14:45:00+01:00",
  },
  {
    id: "ASN-2",
    orderId: "009",
    driverId: "DRV-102",
    start: "2025-01-15T12:30:00+01:00",
    end: "2025-01-15T13:15:00+01:00",
  },
  {
    id: "ASN-3",
    orderId: "1001",
    driverId: "DRV-104",
    start: "2025-01-15T09:45:00+01:00",
    end: "2025-01-15T10:45:00+01:00",
  },
  {
    id: "ASN-4",
    orderId: "1002",
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
    orderId: "010",
    at: "2025-01-15T12:00:00+01:00",
    by: "system",
    message: "Commande créée",
  },
  {
    id: "ACT-2",
    type: "ASSIGN",
    orderId: "010",
    driverId: "DRV-101",
    at: "2025-01-15T12:30:00+01:00",
    by: "admin.sophie",
    message: "Chauffeur Marc Dubois affecté",
  },
  {
    id: "ACT-3",
    type: "STATUS_UPDATE",
    orderId: "010",
    at: "2025-01-15T13:00:00+01:00",
    by: "DRV-101",
    message: "Statut mis à jour : Enlevé",
  },
];

const defaultNotifications: NotificationEntry[] = [
  {
    id: "NOTIF-1",
    channel: "ADMIN",
    orderId: "010",
    driverId: "DRV-101",
    read: true,
    message: "Chauffeur Marc Dubois affecté à #010",
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
  initGlobalOrderSeq();
  reconcileGlobalOrderSeq();
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

export const updateOrder = (orderId: string, patch: Partial<Order>): Order | null => {
  const current = getOrders();
  const index = current.findIndex((item) => item.id === orderId);
  if (index === -1) {
    return null;
  }

  const updated: Order = {
    ...current[index],
    ...patch,
  };

  const next = [...current];
  next.splice(index, 1, updated);
  saveOrders(next);

  return updated;
};

export const getDrivers = (): Driver[] => {
  const raw = readStore<unknown[]>(STORAGE_KEYS.drivers, defaultDrivers as unknown as unknown[]);
  return normalizeDriversArray(raw, { fallbackToDefault: true });
};

export const saveDrivers = (list: Driver[]) => {
  const sanitized = normalizeDriversArray(list as unknown[], { fallbackToDefault: false });
  writeStore(STORAGE_KEYS.drivers, sanitized);
};

export const getAssignments = (): Assignment[] => readStore(STORAGE_KEYS.assignments, defaultAssignments);

export const saveAssignments = (list: Assignment[]) => {
  writeStore(STORAGE_KEYS.assignments, list);
};

export const upsertAssignment = (assignment: Assignment): Assignment => {
  const current = getAssignments();
  const existingIndex = current.findIndex((item) => item.orderId === assignment.orderId);
  const next = [...current];

  if (existingIndex === -1) {
    next.unshift(assignment);
  } else {
    next.splice(existingIndex, 1, assignment);
  }

  saveAssignments(next);
  return assignment;
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

export const normalizeDriverPhone = (value: string) => value.replace(/\D/g, "");

export const normalizeDriverPlate = (value: string) => value.trim().toUpperCase().replace(/\s+/g, "");

const VEHICLE_LABELS: Record<string, string> = {
  vélo: "Vélo",
  velo: "Vélo",
  scooter: "Scooter",
  moto: "Moto",
  voiture: "Voiture",
  utilitaire: "Utilitaire",
  fourgon: "Fourgon",
};

const DRIVER_STATUS_VALUES: DriverStatus[] = ["AVAILABLE", "ON_TRIP", "PAUSED"];

const DRIVER_LIFECYCLE_VALUES: DriverLifecycleStatus[] = ["ACTIF", "INACTIF"];

const formatPhoneDisplay = (normalized: string) =>
  normalized.length === 10 ? normalized.replace(/(\d{2})(?=(\d{2})+(?!\d))/g, "$1 ").trim() : normalized;

const toTimestamp = (value: string | undefined | null) => {
  if (!value) return null;
  const time = parseISO(value).getTime();
  return Number.isNaN(time) ? null : time;
};

export const mergeUnavailabilitiesByType = (list: DriverUnavailability[] = []) => {
  if (!Array.isArray(list) || list.length === 0) {
    return [];
  }

  const nowIso = new Date().toISOString();
  const byType = new Map<DriverUnavailabilityType, DriverUnavailability[]>();

  list.forEach((item) => {
    if (!item) return;
    const copy = { ...item };
    const bucket = byType.get(copy.type);
    if (bucket) {
      bucket.push(copy);
    } else {
      byType.set(copy.type, [copy]);
    }
  });

  const mergedByType = new Map<DriverUnavailabilityType, DriverUnavailability[]>();

  byType.forEach((items, type) => {
    const sorted = items
      .map((entry) => ({ ...entry }))
      .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());

    const acc: DriverUnavailability[] = [];

    sorted.forEach((current) => {
      const last = acc[acc.length - 1];
      if (!last) {
        acc.push({ ...current });
        return;
      }

      const lastEnd = parseISO(last.end).getTime();
      const currentStart = parseISO(current.start).getTime();

      if (lastEnd >= currentStart) {
        const lastStart = parseISO(last.start).getTime();
        const currentEnd = parseISO(current.end).getTime();
        const mergedStart = Math.min(lastStart, currentStart);
        const mergedEnd = Math.max(lastEnd, currentEnd);
        const createdAtCandidates = [toTimestamp(last.createdAt), toTimestamp(current.createdAt)].filter(
          (value): value is number => value !== null,
        );
        const mergedCreatedAt = createdAtCandidates.length
          ? new Date(Math.min(...createdAtCandidates)).toISOString()
          : new Date(mergedStart).toISOString();
        const mergedReason = last.reason?.trim()
          ? last.reason
          : current.reason?.trim()
            ? current.reason
            : undefined;

        acc[acc.length - 1] = {
          ...last,
          start: new Date(mergedStart).toISOString(),
          end: new Date(mergedEnd).toISOString(),
          reason: mergedReason,
          createdAt: mergedCreatedAt,
          updatedAt: nowIso,
        } satisfies DriverUnavailability;
      } else {
        acc.push({ ...current });
      }
    });

    mergedByType.set(type, acc);
  });

  return Array.from(mergedByType.values())
    .flat()
    .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());
};

const sanitizeUnavailabilities = (value: unknown): DriverUnavailability[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const now = new Date().toISOString();

  const sanitized = value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const entry = item as Record<string, unknown>;
      const startRaw = typeof entry.start === "string" ? entry.start : null;
      const endRaw = typeof entry.end === "string" ? entry.end : null;
      if (!startRaw || !endRaw) {
        return null;
      }

      const startDate = new Date(startRaw);
      const endDate = new Date(endRaw);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return null;
      }
      if (startDate.getTime() >= endDate.getTime()) {
        return null;
      }

      const typeValue =
        typeof entry.type === "string" && DRIVER_UNAVAILABILITY_TYPES.includes(entry.type as DriverUnavailabilityType)
          ? (entry.type as DriverUnavailabilityType)
          : "AUTRE";

      return {
        id:
          typeof entry.id === "string" && entry.id.trim()
            ? entry.id
            : `UNAV-${startDate.getTime()}`,
        type: typeValue,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        reason:
          typeof entry.reason === "string" && entry.reason.trim()
            ? entry.reason.trim().slice(0, 200)
            : undefined,
        createdAt:
          typeof entry.createdAt === "string" && entry.createdAt.trim()
            ? entry.createdAt
            : now,
        updatedAt:
          typeof entry.updatedAt === "string" && entry.updatedAt.trim()
            ? entry.updatedAt
            : now,
      } satisfies DriverUnavailability;
    })
    .filter((item): boolean => {
      if (!item) return false;
      return Boolean(item.id && item.type && item.start && item.end);
    })
    .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime()) as DriverUnavailability[];

  return mergeUnavailabilitiesByType(sanitized);
};

const sanitizeDriverEntry = (value: Partial<Driver>): Driver | null => {
  const id = typeof value.id === "string" && value.id.trim() ? value.id.trim() : `DRV-${Date.now()}`;
  const nameValue = typeof value.name === "string" && value.name.trim() ? value.name.trim() : undefined;
  const fullnameValue =
    typeof value.fullname === "string" && value.fullname.trim() ? value.fullname.trim() : nameValue;

  const phoneInput =
    typeof value.phone === "string" && value.phone.trim()
      ? value.phone.trim()
      : typeof value.phoneNormalized === "string" && value.phoneNormalized.trim()
        ? value.phoneNormalized.trim()
        : "";

  const phoneNormalized = normalizeDriverPhone(
    typeof value.phoneNormalized === "string" && value.phoneNormalized.trim()
      ? value.phoneNormalized.trim()
      : phoneInput,
  );

  const phoneDisplay = phoneInput || (phoneNormalized ? formatPhoneDisplay(phoneNormalized) : "");

  const vehicleRaw = (value.vehicle ?? {}) as Partial<{ type?: string; capacityKg?: number; capacity?: string; registration?: string }>;
  const vehicleTypeRaw =
    typeof vehicleRaw.type === "string" && vehicleRaw.type.trim()
      ? vehicleRaw.type.trim()
      : undefined;
  const vehicleTypeKey = vehicleTypeRaw?.toLowerCase();
  const vehicleType =
    (vehicleTypeKey && VEHICLE_LABELS[vehicleTypeKey]) || vehicleTypeRaw || "Véhicule";

  const capacityKg =
    typeof vehicleRaw.capacityKg === "number" && Number.isFinite(vehicleRaw.capacityKg)
      ? Math.max(0, Math.round(vehicleRaw.capacityKg))
      : Number.parseInt(String(vehicleRaw.capacity ?? "").replace(/\D/g, ""), 10) || 0;

  const plateRaw =
    typeof vehicleRaw.registration === "string" && vehicleRaw.registration.trim()
      ? vehicleRaw.registration.trim().toUpperCase()
      : typeof value.plate === "string" && value.plate.trim()
        ? value.plate.trim().toUpperCase()
        : undefined;

  const plateNormalized = plateRaw ? normalizeDriverPlate(plateRaw) : value.plateNormalized;

  const lifecycleStatus: DriverLifecycleStatus = DRIVER_LIFECYCLE_VALUES.includes(
    value.lifecycleStatus as DriverLifecycleStatus,
  )
    ? (value.lifecycleStatus as DriverLifecycleStatus)
    : value.deactivated
      ? "INACTIF"
      : "ACTIF";

  const status: DriverStatus = DRIVER_STATUS_VALUES.includes(value.status as DriverStatus)
    ? (value.status as DriverStatus)
    : "AVAILABLE";

  const active = lifecycleStatus !== "INACTIF" && status !== "PAUSED";

  const createdAt =
    typeof value.createdAt === "string" && value.createdAt.trim()
      ? value.createdAt
      : new Date().toISOString();

  const updatedAt =
    typeof value.updatedAt === "string" && value.updatedAt.trim() ? value.updatedAt : createdAt;

  return {
    id,
    name: nameValue || fullnameValue || (phoneDisplay || "Chauffeur"),
    fullname: fullnameValue || nameValue || (phoneDisplay || "Chauffeur"),
    phone: phoneDisplay || phoneNormalized,
    phoneNormalized,
    email: typeof value.email === "string" ? value.email.trim() : value.email,
    vehicle: {
      type: vehicleType,
      capacity: `${new Intl.NumberFormat("fr-FR").format(capacityKg)} kg`,
      capacityKg,
      registration: plateRaw,
    },
    plate: plateNormalized,
    plateNormalized,
    status,
    nextFreeSlot: value.nextFreeSlot ?? "À planifier",
    active,
    lifecycleStatus,
    workflowStatus:
      value.workflowStatus ?? (status === "ON_TRIP" ? "EN_COURSE" : status === "PAUSED" ? "EN_PAUSE" : "ACTIF"),
    deactivated: value.deactivated ?? lifecycleStatus === "INACTIF",
    deactivatedAt: value.deactivatedAt,
    unavailabilities: sanitizeUnavailabilities(value.unavailabilities),
    comment: value.comment,
    createdAt,
    updatedAt,
    zone: value.zone,
    coversAllZones: true,
  } satisfies Driver;
};

const convertLegacyDriverRecord = (value: Record<string, unknown>): Driver | null => {
  const lifecycleStatus: DriverLifecycleStatus =
    value.lifecycleStatus === "INACTIF" || value.status === "INACTIF" ? "INACTIF" : "ACTIF";

  const phoneRaw =
    typeof value.phoneRaw === "string" && value.phoneRaw.trim()
      ? value.phoneRaw.trim()
      : typeof value.phone === "string" && value.phone.trim()
        ? value.phone.trim()
        : "";

  const phoneNormalized = normalizeDriverPhone(
    typeof value.phone === "string" && value.phone.trim() ? value.phone.trim() : phoneRaw,
  );

  const capacityKg = Number(value.capacityKg) || 0;
  const plateRaw =
    typeof value.plateRaw === "string" && value.plateRaw.trim()
      ? value.plateRaw.trim().toUpperCase()
      : typeof value.plate === "string" && value.plate.trim()
        ? value.plate.trim().toUpperCase()
        : undefined;

  return sanitizeDriverEntry({
    id: typeof value.id === "string" ? value.id : undefined,
    name: typeof value.name === "string" ? value.name : undefined,
    fullname: typeof value.fullname === "string" ? value.fullname : undefined,
    phone: phoneRaw,
    phoneNormalized,
    email: typeof value.email === "string" ? value.email : undefined,
    vehicle: {
      type:
        typeof value.vehicleType === "string" ? VEHICLE_LABELS[value.vehicleType] ?? value.vehicleType : "Véhicule",
      capacityKg,
      capacity: `${new Intl.NumberFormat("fr-FR").format(Math.max(0, capacityKg))} kg`,
      registration: plateRaw,
    },
    plate: plateRaw ? normalizeDriverPlate(plateRaw) : undefined,
    plateNormalized: plateRaw ? normalizeDriverPlate(plateRaw) : undefined,
    status: "AVAILABLE",
    nextFreeSlot: typeof value.nextFreeSlot === "string" ? value.nextFreeSlot : "À planifier",
    lifecycleStatus,
    deactivated: value.deactivated === true || lifecycleStatus === "INACTIF",
    deactivatedAt: typeof value.deactivatedAt === "string" ? value.deactivatedAt : undefined,
    unavailabilities: sanitizeUnavailabilities(value.unavailabilities),
    comment: typeof value.comment === "string" ? value.comment : undefined,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : undefined,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : undefined,
  });
};

const ensureDriverEntry = (value: unknown): Driver | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  if ("vehicleType" in record || "phoneRaw" in record || "capacityKg" in record) {
    return convertLegacyDriverRecord(record);
  }

  return sanitizeDriverEntry(record as Partial<Driver>);
};

const normalizeDriversArray = (input: unknown[], options: { fallbackToDefault: boolean }): Driver[] => {
  const byId = new Map<string, Driver>();

  input.forEach((item) => {
    const driver = ensureDriverEntry(item);
    if (driver) {
      byId.set(driver.id, driver);
    }
  });

  if (byId.size === 0) {
    if (!options.fallbackToDefault) {
      return [];
    }
    defaultDrivers.forEach((driver) => {
      byId.set(driver.id, sanitizeDriverEntry(driver)!);
    });
  }

  return Array.from(byId.values()).sort((a, b) => {
    const timeA = a.createdAt ? parseISO(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? parseISO(b.createdAt).getTime() : 0;
    if (timeA !== timeB) {
      return timeB - timeA;
    }
    return a.name.localeCompare(b.name);
  });
};

export interface CreateDriverPayload {
  fullname: string;
  phone: string;
  email: string;
  vehicleType: string;
  capacityKg: number;
  plate: string;
  status: DriverWorkflowStatus;
  comment?: string;
}

export type CreateDriverResult =
  | { success: true; driver: Driver }
  | { success: false; reason: "PHONE_EXISTS" | "PLATE_EXISTS"; message: string };

const statusToLegacy: Record<DriverWorkflowStatus, DriverStatus> = {
  ACTIF: "AVAILABLE",
  EN_PAUSE: "PAUSED",
  EN_COURSE: "ON_TRIP",
};

export const createDriver = (payload: CreateDriverPayload): CreateDriverResult => {
  const fullname = payload.fullname.trim();
  const phoneInput = payload.phone.trim();
  const emailInput = payload.email.trim();
  const plateInput = payload.plate.trim().toUpperCase();
  const phoneNorm = normalizeDriverPhone(phoneInput);
  const plateNorm = normalizeDriverPlate(plateInput);

  const current = getDrivers();

  const phoneExists = current.some((driver) => {
    const existing = driver.phoneNormalized ?? normalizeDriverPhone(driver.phone);
    return existing === phoneNorm;
  });
  if (phoneExists) {
    return { success: false, reason: "PHONE_EXISTS", message: "Un chauffeur avec ce téléphone existe déjà." };
  }

  const plateExists = current.some((driver) => {
    const existing = driver.plateNormalized ?? (driver.plate ? normalizeDriverPlate(driver.plate) : undefined);
    return existing === plateNorm;
  });
  if (plateExists) {
    return { success: false, reason: "PLATE_EXISTS", message: "Cette immatriculation est déjà utilisée." };
  }

  const id = `DRV-${Date.now()}`;
  const createdAt = new Date().toISOString();

  const driver: Driver = {
    id,
    name: fullname,
    fullname,
    phone: phoneInput,
    phoneNormalized: phoneNorm,
    email: emailInput,
    vehicle: {
      type: payload.vehicleType,
      capacity: `${payload.capacityKg} kg`,
      capacityKg: payload.capacityKg,
      registration: plateInput,
    },
    plate: plateNorm,
    plateNormalized: plateNorm,
    status: statusToLegacy[payload.status],
    workflowStatus: payload.status,
    nextFreeSlot: "À planifier",
    active: payload.status !== "EN_PAUSE",
    lifecycleStatus: "ACTIF",
    deactivated: false,
    unavailabilities: [],
    comment: payload.comment?.trim() ? payload.comment.trim() : undefined,
    createdAt,
    updatedAt: createdAt,
    coversAllZones: true,
  };

  const next = [driver, ...current];
  saveDrivers(next);

  appendActivity({
    id: generateId(),
    type: "DRIVER_CREATE",
    orderId: "ADMIN_DRIVER",
    driverId: id,
    at: createdAt,
    by: "admin",
    message: `Chauffeur ${fullname} ajouté`,
  });

  return { success: true, driver };
};

export function hasTimeOverlap(startA: string, endA: string, startB: string, endB: string) {
  const diffStart = differenceInMinutes(parseISO(endA), parseISO(startB));
  const diffEnd = differenceInMinutes(parseISO(endB), parseISO(startA));
  return diffStart > 0 && diffEnd > 0;
}

export interface DriverAssignabilityResult {
  assignable: boolean;
  reason?: string;
  conflictOrderId?: string;
}

export const isDriverAssignable = (
  driver: Driver | undefined | null,
  start: string,
  end: string,
  options: { ignoreScheduledId?: string; currentOrderId?: string | null } = {},
): DriverAssignabilityResult => {
  if (!driver) {
    return { assignable: false, reason: "Chauffeur introuvable" };
  }

  if (driver.lifecycleStatus === "INACTIF") {
    return { assignable: false, reason: "Ce chauffeur est inactif" };
  }

  if (!driver.active) {
    return { assignable: false, reason: "Ce chauffeur est indisponible sur ce créneau" };
  }

  if (driver.status === "PAUSED") {
    return { assignable: false, reason: "Chauffeur en pause — sélection impossible" };
  }

  const blockingUnavailability = (driver.unavailabilities ?? []).find((item) =>
    hasTimeOverlap(start, end, item.start, item.end),
  );
  if (blockingUnavailability) {
    return { assignable: false, reason: "Ce chauffeur est indisponible sur ce créneau" };
  }

  const assignments = getAssignments();
  const conflictingAssignment = assignments.find(
    (assignment) =>
      assignment.driverId === driver.id &&
      assignment.orderId !== (options.currentOrderId ?? null) &&
      !assignment.endedAt &&
      hasTimeOverlap(start, end, assignment.start, assignment.end),
  );

  if (conflictingAssignment) {
    return {
      assignable: false,
      reason: `Conflit horaire détecté avec la commande #${conflictingAssignment.orderId}`,
      conflictOrderId: conflictingAssignment.orderId,
    };
  }

  const scheduledAssignments = getScheduledAssignments();
  const conflictingScheduled = scheduledAssignments.find(
    (assignment) =>
      assignment.driverId === driver.id &&
      assignment.id !== options.ignoreScheduledId &&
      assignment.orderId !== (options.currentOrderId ?? null) &&
      isBlockingScheduledStatus(assignment.status) &&
      hasTimeOverlap(start, end, assignment.start, assignment.end),
  );

  if (conflictingScheduled) {
    return {
      assignable: false,
      reason: `Conflit horaire détecté avec une planification pour la commande #${conflictingScheduled.orderId}`,
      conflictOrderId: conflictingScheduled.orderId,
    };
  }

  return { assignable: true };
};

export const resetMockStores = () => {
  if (!isBrowser) return;
  writeStore(STORAGE_KEYS.orders, defaultOrders);
  writeStore(STORAGE_KEYS.drivers, defaultDrivers);
  writeStore(STORAGE_KEYS.assignments, defaultAssignments);
  writeStore(STORAGE_KEYS.scheduledAssignments, defaultScheduledAssignments);
  writeStore(STORAGE_KEYS.activity, defaultActivity);
  writeStore(STORAGE_KEYS.notifications, defaultNotifications);
  initGlobalOrderSeq();
  reconcileGlobalOrderSeq();
};
