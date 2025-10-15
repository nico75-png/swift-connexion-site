import { differenceInMinutes, parseISO } from "date-fns";

export type DriverStatus = "AVAILABLE" | "ON_TRIP" | "PAUSED";

export type DriverWorkflowStatus = "ACTIF" | "EN_PAUSE" | "EN_COURSE";

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
  workflowStatus?: DriverWorkflowStatus;
  comment?: string;
  createdAt?: string;
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
    createdAt: "2025-01-12T11:10:00.000Z",
    coversAllZones: true,
  },
];

const defaultOrders: Order[] = [
  {
    id: "HORDE26047",
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
    id: "HORDE26046",
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
    id: "HORDE26045",
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
    id: "HORDE26044",
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
    id: "HORDE26043",
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
    id: "HORDE26042",
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
    orderId: "HORDE26047",
    driverId: "DRV-101",
    start: "2025-01-15T13:45:00+01:00",
    end: "2025-01-15T14:45:00+01:00",
  },
  {
    id: "ASN-2",
    orderId: "HORDE26046",
    driverId: "DRV-102",
    start: "2025-01-15T12:30:00+01:00",
    end: "2025-01-15T13:15:00+01:00",
  },
  {
    id: "ASN-3",
    orderId: "HORDE26044",
    driverId: "DRV-104",
    start: "2025-01-15T09:45:00+01:00",
    end: "2025-01-15T10:45:00+01:00",
  },
  {
    id: "ASN-4",
    orderId: "HORDE26043",
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
    orderId: "HORDE26047",
    at: "2025-01-15T12:00:00+01:00",
    by: "system",
    message: "Commande créée",
  },
  {
    id: "ACT-2",
    type: "ASSIGN",
    orderId: "HORDE26047",
    driverId: "DRV-101",
    at: "2025-01-15T12:30:00+01:00",
    by: "admin.sophie",
    message: "Chauffeur Marc Dubois affecté",
  },
  {
    id: "ACT-3",
    type: "STATUS_UPDATE",
    orderId: "HORDE26047",
    at: "2025-01-15T13:00:00+01:00",
    by: "DRV-101",
    message: "Statut mis à jour : Enlevé",
  },
];

const defaultNotifications: NotificationEntry[] = [
  {
    id: "NOTIF-1",
    channel: "ADMIN",
    orderId: "HORDE26047",
    driverId: "DRV-101",
    read: true,
    message: "Chauffeur Marc Dubois affecté à #HORDE26047",
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

export const normalizeDriverPhone = (value: string) => value.replace(/\D/g, "");

export const normalizeDriverPlate = (value: string) => value.trim().toUpperCase().replace(/\s+/g, "");

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
    comment: payload.comment?.trim() ? payload.comment.trim() : undefined,
    createdAt,
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
