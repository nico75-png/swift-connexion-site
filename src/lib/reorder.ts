import { differenceInMinutes } from "date-fns";
import {
  getDrivers as getAdminDrivers,
  isDriverAssignable,
  type DriverUnavailability,
} from "@/lib/stores/driversOrders.store";
import {
  assertUniqueOrderIdOrThrow,
  generateNextOrderNumber,
  reconcileGlobalOrderSeq,
} from "@/lib/orderSequence";
import type { CancelOrderReason } from "@/lib/orders/cancellation";

export type Nullable<T> = T | null;

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ContactPoint {
  name?: string;
  phone?: string;
  email?: string;
}

export interface LocationDetails {
  address: string;
  complement?: string;
  instructions?: string;
  coords?: Coordinates | null;
  contact?: ContactPoint;
}

export interface OrderOptions {
  express?: boolean;
  fragile?: boolean;
  insurance?: boolean;
  returnDocuments?: boolean;
  temperatureControlled?: boolean;
}

export interface PriceBreakdown {
  base: number;
  km: number;
  express: string;
  fragile: string;
  temperature: string;
}

export interface OrderPrice {
  breakdown: PriceBreakdown;
  total: number;
}

export interface ClientOrder {
  id: string;
  previousOrderId?: string;
  reference?: string;
  status: string;
  customerId?: string;
  createdAt?: string;
  pickupAt: string;
  dropoffEta?: string;
  type: string;
  transportTypeCode?: string;
  description?: string;
  from: LocationDetails;
  to: LocationDetails;
  km: number;
  weightKg: number;
  volumeM3: number;
  parcelsCount?: number;
  options?: OrderOptions;
  price: OrderPrice;
  driverId: string | null;
  driver?: Nullable<{ id: string; name: string; phone?: string }>;
  notes?: string;
  quoteId?: string | null;
  currency?: string;
  history?: Array<{ label: string; at: string }>;
  cancellation?: {
    reason: CancelOrderReason;
    comment?: string;
    at: string;
  };
}

export interface StoredDriver {
  id: string;
  name: string;
  phone?: string;
  status: "ACTIF" | "INACTIF" | string;
  onPause?: boolean;
  capacityKg?: number;
  lastLocation?: Coordinates | null;
  vehicleType?: string;
  unavailabilities?: DriverUnavailability[];
  [key: string]: unknown;
}

export interface AssignmentEntry {
  id: string;
  orderId: string;
  driverId: string;
  start: string;
  end: string;
  status?: string;
  createdAt?: string;
}

export interface ActivityEntry {
  id: string;
  type: string;
  orderId: string;
  driverId?: string;
  at: string;
  [key: string]: unknown;
}

export interface NotificationEntry {
  id: string;
  scope: string;
  kind: string;
  orderId: string;
  driverId?: string;
  message: string;
  at: string;
  read?: boolean;
  [key: string]: unknown;
}

export const getFromStorage = <T,>(key: string, fallback: T = [] as T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    return JSON.parse(stored) as T;
  } catch (error) {
    console.error(`Failed to read storage key "${key}":`, error);
    return fallback;
  }
};

export const saveToStorage = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write storage key "${key}":`, error);
  }
};

export function haversineKm(a: Coordinates, b: Coordinates): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function mockGeocode(address: string | undefined): Coordinates | null {
  if (!address) return null;
  const cache = getFromStorage<Record<string, Coordinates>>("oc_geocache", {});
  if (cache[address]) {
    return cache[address];
  }
  let hash = 0;
  for (let index = 0; index < address.length; index += 1) {
    hash = (hash * 31 + address.charCodeAt(index)) >>> 0;
  }
  const lat = 42 + (hash % 900) / 100;
  const lng = -4.8 + ((hash >> 3) % 1330) / 100;
  const point: Coordinates = {
    lat: Math.min(51.2, Math.max(42.0, lat)),
    lng: Math.min(8.5, Math.max(-4.8, lng)),
  };
  saveToStorage("oc_geocache", { ...cache, [address]: point });
  return point;
}

export function isDriverAvailable(driver: StoredDriver | undefined, startISO: string, endISO: string): boolean {
  if (!driver) return false;
  const record = getAdminDrivers().find((item) => item.id === driver.id);
  const result = isDriverAssignable(record, startISO, endISO);
  return result.assignable;
}

export function selectNearestAvailableDriver(params: {
  pickup: Coordinates;
  start: string;
  end: string;
  minCapacityKg?: number;
}): StoredDriver | null {
  const { pickup, start, end, minCapacityKg = 0 } = params;
  const drivers = getFromStorage<StoredDriver[]>("oc_drivers", []);
  const driverRecords = getAdminDrivers();
  const driverRecordMap = new Map(driverRecords.map((entry) => [entry.id, entry]));
  const candidates: Array<{ driver: StoredDriver; distKm: number }> = [];
  for (const driver of drivers) {
    if (driver.status !== "ACTIF" || driver.onPause === true) continue;
    if ((driver.capacityKg ?? 0) < minCapacityKg) continue;
    const position = driver.lastLocation;
    if (!position || typeof position.lat !== "number" || typeof position.lng !== "number") continue;
    const record = driverRecordMap.get(driver.id);
    if (!record) continue;
    const assignability = isDriverAssignable(record, start, end);
    if (!assignability.assignable) continue;
    const distKm = haversineKm(pickup, position);
    candidates.push({ driver, distKm });
  }
  candidates.sort((a, b) => a.distKm - b.distKm);
  return candidates[0]?.driver ?? null;
}

export function estimatePrice(params: {
  base: number;
  km: number;
  express?: boolean;
  fragile?: boolean;
  temperatureControlled?: boolean;
}): OrderPrice {
  const { base, km, express, fragile, temperatureControlled } = params;
  const kmCost = km * 0.9;
  const multiplier =
    (express ? 1.3 : 1) * (fragile ? 1.15 : 1) * (temperatureControlled ? 1.2 : 1);
  const total = Number(((base + kmCost) * multiplier).toFixed(2));
  return {
    breakdown: {
      base,
      km: Number(kmCost.toFixed(2)),
      express: express ? "+30%" : "0%",
      fragile: fragile ? "+15%" : "0%",
      temperature: temperatureControlled ? "+20%" : "0%",
    },
    total,
  };
}

export function createReorderDraft(orderId: string): ClientOrder {
  const orders = getFromStorage<ClientOrder[]>("oc_orders", []);
  const source = orders.find((order) => order.id === orderId);
  if (!source) {
    throw new Error("Commande source introuvable");
  }
  const pickupCoords = source.from?.coords ?? mockGeocode(source.from?.address);
  const km = source.km ?? 10;
  const base = source.price?.breakdown?.base ?? 10;
  return {
    ...source,
    id: generateNextOrderNumber(),
    previousOrderId: source.id,
    status: "À valider",
    driverId: null,
    driver: null,
    from: {
      ...source.from,
      coords: pickupCoords,
    },
    price: estimatePrice({
      base,
      km,
      express: source.options?.express,
      fragile: source.options?.fragile,
      temperatureControlled: source.options?.temperatureControlled,
    }),
    createdAt: new Date().toISOString(),
  };
}

export function confirmReorder(draft: ClientOrder) {
  const orders = getFromStorage<ClientOrder[]>("oc_orders", []);
  const newOrder: ClientOrder = {
    ...draft,
    id: draft.id,
    createdAt: new Date().toISOString(),
  };

  assertUniqueOrderIdOrThrow(newOrder.id);

  const pickup =
    newOrder.from?.coords ??
    mockGeocode(newOrder.from?.address) ?? {
      lat: 48.8566,
      lng: 2.3522,
    };
  const start = newOrder.pickupAt;
  const fallbackEnd = new Date(new Date(start).getTime() + 2 * 60 * 60 * 1000).toISOString();
  const end = newOrder.dropoffEta ?? fallbackEnd;
  const minCapacity = newOrder.weightKg ?? 0;

  const driver = selectNearestAvailableDriver({
    pickup,
    start,
    end,
    minCapacityKg: minCapacity,
  });

  const driverInfo = driver
    ? {
        id: driver.id,
        name: driver.name,
        phone: typeof driver.phone === "string" ? driver.phone : undefined,
      }
    : null;

  const storedOrder: ClientOrder = {
    ...newOrder,
    driverId: driverInfo?.id ?? null,
    driver: driverInfo,
  };

  orders.unshift(storedOrder);
  saveToStorage("oc_orders", orders);
  reconcileGlobalOrderSeq();

  const assignments = getFromStorage<AssignmentEntry[]>("oc_assignments", []);
  const nowISO = new Date().toISOString();
  if (driverInfo) {
    assignments.unshift({
      id: `ASG-${Date.now()}`,
      orderId: storedOrder.id,
      driverId: driverInfo.id,
      start,
      end,
      status: "ASSIGNED",
      createdAt: nowISO,
    });
    saveToStorage("oc_assignments", assignments);
  } else {
    saveToStorage("oc_assignments", assignments);
  }

  const activityLog = getFromStorage<ActivityEntry[]>("oc_activity_log", []);
  activityLog.unshift(
    driverInfo
      ? {
          id: `LOG-${Date.now()}`,
          type: "AUTO_ASSIGN_NEAREST_OK",
          orderId: storedOrder.id,
          driverId: driverInfo.id,
          at: nowISO,
        }
      : {
          id: `LOG-${Date.now()}`,
          type: "AUTO_ASSIGN_NEAREST_NONE",
          orderId: storedOrder.id,
          at: nowISO,
        },
  );
  saveToStorage("oc_activity_log", activityLog);

  const notifications = getFromStorage<NotificationEntry[]>("oc_notifications", []);
  notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    scope: "CLIENT",
    kind: "ORDER_REORDERED",
    orderId: storedOrder.id,
    driverId: driverInfo?.id,
    message: `Commande ${storedOrder.id} créée à partir de ${storedOrder.previousOrderId ?? "une commande précédente"}`,
    at: nowISO,
    read: false,
  });
  saveToStorage("oc_notifications", notifications);

  return { order: storedOrder, driver: driverInfo };
}

export function ensureDriverDataShape(): StoredDriver[] {
  const drivers = getFromStorage<StoredDriver[]>("oc_drivers", []);
  if (!Array.isArray(drivers)) {
    saveToStorage("oc_drivers", []);
    return [];
  }

  if (drivers.length === 0) {
    saveToStorage("oc_drivers", []);
    return [];
  }

  const enhanced = drivers.map((driver, index) => {
    const status = driver.status === "INACTIF" ? "INACTIF" : "ACTIF";
    const capacityKg = typeof driver.capacityKg === "number" && !Number.isNaN(driver.capacityKg)
      ? driver.capacityKg
      : typeof (driver as { capacity?: number }).capacity === "number"
        ? ((driver as unknown as { capacity: number }).capacity ?? 0)
        : 0;
    const lastLocation = driver.lastLocation &&
      typeof driver.lastLocation === "object" &&
      typeof (driver.lastLocation as Coordinates).lat === "number" &&
      typeof (driver.lastLocation as Coordinates).lng === "number"
        ? (driver.lastLocation as Coordinates)
        : mockGeocode(`${driver.id}-driver-${index}`) ?? { lat: 48.8566, lng: 2.3522 };
    return {
      ...driver,
      status,
      onPause: driver.onPause === true ? true : false,
      capacityKg,
      lastLocation,
      unavailabilities: Array.isArray(driver.unavailabilities)
        ? (driver.unavailabilities as DriverUnavailability[])
        : [],
    } satisfies StoredDriver;
  });
  saveToStorage("oc_drivers", enhanced);
  return enhanced;
}

export function ensureOrdersDataShape(): ClientOrder[] {
  const stored = getFromStorage<ClientOrder[]>("oc_orders", []);
  const isClientOrder = (order: ClientOrder | Record<string, unknown>): order is ClientOrder => {
    return Boolean(order && typeof order === "object" && (order as ClientOrder).from && (order as ClientOrder).from?.address);
  };

  if (Array.isArray(stored) && stored.some((item) => isClientOrder(item))) {
    const normalized = stored.map((item) => {
      const coords = item.from?.coords ?? mockGeocode(item.from?.address);
      return {
        ...item,
        from: { ...item.from, coords },
      };
    });
    saveToStorage("oc_orders", normalized);
    reconcileGlobalOrderSeq();
    return normalized;
  }

  saveToStorage("oc_orders", []);
  reconcileGlobalOrderSeq();
  return [];
}

export function ensureAssignmentShape() {
  const assignments = getFromStorage<AssignmentEntry[]>("oc_assignments", []);
  if (!Array.isArray(assignments)) {
    saveToStorage("oc_assignments", []);
    return [] as AssignmentEntry[];
  }
  return assignments;
}

export function ensureStoragePrimitives() {
  ensureDriverDataShape();
  ensureOrdersDataShape();
  ensureAssignmentShape();
  getFromStorage<ActivityEntry[]>("oc_activity_log", []);
  getFromStorage<NotificationEntry[]>("oc_notifications", []);
  getFromStorage<Record<string, Coordinates>>("oc_geocache", {});
}

export const formatDateTime = (value: string | undefined, locale = "fr-FR") => {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Failed to format date", error);
    return "";
  }
};

export const formatCurrencyEUR = (value: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
};

export const computeDurationMinutes = (startISO: string, endISO: string) => {
  try {
    const minutes = differenceInMinutes(new Date(endISO), new Date(startISO));
    return Number.isFinite(minutes) ? minutes : 0;
  } catch (error) {
    console.error("Failed to compute duration", error);
    return 0;
  }
};
