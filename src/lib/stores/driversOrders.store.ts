import { differenceInMinutes, parseISO } from "date-fns";
import { initGlobalOrderSeq, reconcileGlobalOrderSeq } from "@/lib/orderSequence";
import { ADMIN_ORDER_SEEDS, type AdminOrderSeed } from "./data/adminOrderSeeds";

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
  sector: string;
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
  options?: {
    express?: boolean;
    fragile?: boolean;
    temperatureControlled?: boolean;
  };
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

const BLOCKING_SCHEDULED_STATUSES: ScheduledAssignmentStatus[] = ["PENDING", "PROCESSING"];

export const isBlockingScheduledStatus = (status: ScheduledAssignmentStatus) =>
  BLOCKING_SCHEDULED_STATUSES.includes(status);

const toIsoDateTime = (date: string, time: string) => new Date(`${date}T${time}:00+02:00`).toISOString();

const addMinutes = (isoDate: string, minutes: number) =>
  new Date(new Date(isoDate).getTime() + minutes * 60 * 1000).toISOString();

const buildOrderFromSeed = (seed: AdminOrderSeed): Order => {
  const scheduleStart = toIsoDateTime(seed.date, seed.time);
  const scheduleEnd = addMinutes(scheduleStart, 75);
  const assignedAt = seed.driverId ? addMinutes(scheduleStart, -30) : null;

  const options =
    seed.express || seed.fragile || seed.temperatureControlled
      ? {
          express: seed.express,
          fragile: seed.fragile,
          temperatureControlled: seed.temperatureControlled,
        }
      : undefined;

  return {
    id: seed.number,
    client: seed.client,
    sector: seed.sector,
    type: seed.transportType,
    status: seed.status,
    amount: seed.amount,
    schedule: {
      start: scheduleStart,
      end: scheduleEnd,
    },
    pickupAddress: seed.pickupAddress,
    dropoffAddress: seed.deliveryAddress,
    zoneRequirement: seed.zone,
    volumeRequirement: `${seed.volume.toFixed(1)} m³`,
    weight: `${seed.weight.toFixed(1)} kg`,
    instructions: seed.instructions,
    options,
    driverId: seed.driverId ?? null,
    driverAssignedAt: seed.driverId ? assignedAt : null,
  };
};

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

const isBrowser = typeof window !== "undefined";

const purgeStoredDrivers = () => {
  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEYS.drivers);
  } catch (error) {
    console.warn("Unable to purge drivers store", error);
  }
};

purgeStoredDrivers();

export const generateId = () => {
  const globalScope = globalThis as { crypto?: Crypto };
  if (globalScope.crypto?.randomUUID) {
    return globalScope.crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 11)}`;
};

export const defaultDrivers: Driver[] = [];

const defaultOrders: Order[] = ADMIN_ORDER_SEEDS.map(buildOrderFromSeed);

const getOrderSchedule = (orderId: string) => {
  const match = defaultOrders.find((order) => order.id === orderId);
  if (!match) {
    const fallback = new Date().toISOString();
    return { start: fallback, end: fallback };
  }
  return match.schedule;
};

const buildAssignment = (id: string, orderId: string, driverId: string): Assignment => {
  const schedule = getOrderSchedule(orderId);
  return {
    id,
    orderId,
    driverId,
    start: schedule.start,
    end: schedule.end,
  };
};

const defaultAssignments: Assignment[] = [];

const defaultScheduledAssignments: ScheduledAssignment[] = [];

const defaultActivity: ActivityEntry[] = [];

const defaultNotifications: NotificationEntry[] = [];

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
