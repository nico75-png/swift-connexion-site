import { ensureOrderNumberFormat, reconcileGlobalOrderSeq } from "@/lib/orderSequence";
import {
  ClientOrder,
  ensureOrdersDataShape,
  haversineKm,
  mockGeocode,
  saveToStorage,
} from "@/lib/reorder";
import { getQuoteById } from "@/lib/services/quotes.service";

const STORAGE_KEY = "oc_orders";
const ORDERS_UPDATED_EVENT = "client-orders:updated";

export interface AddressSummary {
  line: string;
  postalCode: string;
  city: string;
}

export interface DriverSummary {
  name?: string;
  phone?: string;
}

export interface ClientOrderListItem {
  id: string;
  orderNumber: string;
  createdAt: string | null;
  transportType: string | null;
  transportLabel: string;
  pickupAddress: AddressSummary | null;
  deliveryAddress: AddressSummary | null;
  amountTTC: number | null;
  currency: string;
  status: string;
  driverSummary: DriverSummary | null;
  quoteId?: string | null;
}

export interface ClientOrderCreateInput {
  id: string;
  customerId: string;
  transportType: string;
  pickupAddress: string;
  deliveryAddress: string;
  scheduleStart: string;
  scheduleEnd: string;
  weightKg: number;
  volumeM3: number;
  quoteAmount: number;
  quoteId: string;
  currency?: string;
  instructions?: string;
  options?: {
    express?: boolean;
    fragile?: boolean;
    temperatureControlled?: boolean;
  };
}

const TRANSPORT_LABELS: Record<string, string> = {
  juridique: "Document juridique",
  colis: "Livraison colis",
  monture: "Monture optique",
  document: "Document express",
  medical: "Colis médical",
  express: "Transport express",
  standard: "Livraison standard",
};

const FRAGILE_TYPES = new Set(["colis", "monture", "medical", "optique"]);

const normalizeTransportCode = (value: string): string => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "optique") return "monture";
  return normalized;
};

const resolveTransportLabel = (code: string | undefined, fallback: string): string => {
  if (!code) return fallback;
  return TRANSPORT_LABELS[code] ?? fallback;
};

const parseAddress = (value: string | undefined): AddressSummary | null => {
  if (!value) return null;
  const line = value.trim();
  if (!line) return null;
  const postalMatch = line.match(/(\d{5})\s+([^,]+)$/u);
  const postalCode = postalMatch?.[1] ?? "";
  const city = postalMatch?.[2]?.trim() ?? "";
  return {
    line,
    postalCode,
    city,
  };
};

const formatCurrencyCode = (value: string | undefined): string => {
  if (!value) return "EUR";
  return value.trim().toUpperCase() || "EUR";
};

export const emitClientOrdersUpdated = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ORDERS_UPDATED_EVENT));
};

const computeSupplementFromCode = (code: string | undefined): number => {
  switch (code) {
    case "express":
      return 18;
    case "medical":
      return 12;
    case "juridique":
      return 10;
    case "colis":
      return 8;
    case "monture":
      return 6;
    case "document":
      return 5;
    default:
      return 6;
  }
};

export const getOrderAmount = (order: ClientOrder): number | null => {
  const weight = typeof order.weightKg === "number" ? order.weightKg : undefined;
  const volume = typeof order.volumeM3 === "number" ? order.volumeM3 : undefined;
  const distance = typeof order.km === "number" ? order.km : undefined;

  if (weight === undefined && volume === undefined && distance === undefined) {
    return null;
  }

  const base = 25;
  const dist = distance ?? 10;
  const weightFee = Math.max(4, (weight ?? 2) * 0.45);
  const volumeFee = Math.max(4, (volume ?? 1) * 0.65);
  const supplements = computeSupplementFromCode(order.transportTypeCode);
  const discount = volume && volume > 2 ? 5 : 0;
  const totalHT = base + dist + weightFee + volumeFee + supplements - discount;
  const taxes = totalHT * 0.2;
  const totalTTC = Math.round((totalHT + taxes) * 100) / 100;
  return totalTTC;
};

const resolveAmount = async (order: ClientOrder): Promise<{ amount: number | null; currency: string }> => {
  if (typeof order.price?.total === "number") {
    return { amount: order.price.total, currency: formatCurrencyCode(order.currency) };
  }

  if (order.quoteId) {
    const stored = await getQuoteById(order.quoteId);
    if (stored) {
      return { amount: stored.amount, currency: formatCurrencyCode(stored.currency) };
    }
  }

  const amount = getOrderAmount(order);
  return { amount, currency: formatCurrencyCode(order.currency) };
};

const toListItem = async (order: ClientOrder): Promise<ClientOrderListItem> => {
  const { amount, currency } = await resolveAmount(order);
  const normalizedCode = normalizeTransportCode(order.transportTypeCode ?? "");
  const formattedNumber = ensureOrderNumberFormat(order.reference ?? order.id);
  return {
    id: order.id,
    orderNumber: formattedNumber || order.reference || order.id,
    createdAt: order.createdAt ?? order.pickupAt ?? null,
    transportType: normalizedCode || null,
    transportLabel: resolveTransportLabel(normalizedCode, order.type),
    pickupAddress: parseAddress(order.from?.address),
    deliveryAddress: parseAddress(order.to?.address),
    amountTTC: amount,
    currency,
    status: order.status,
    driverSummary: order.driver ? { name: order.driver.name, phone: order.driver.phone } : null,
    quoteId: order.quoteId ?? null,
  };
};

export const listOrdersByClient = async (clientId: string): Promise<ClientOrderListItem[]> => {
  if (!clientId) return [];
  const orders = ensureOrdersDataShape();
  const filtered = orders.filter(order => !order.customerId || order.customerId === clientId);
  const items = await Promise.all(filtered.map(toListItem));
  return items.sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
};

const buildPrice = (
  quoteAmount: number,
  normalizedCode: string,
  distanceKm: number | null,
  options?: { express?: boolean; fragile?: boolean; temperatureControlled?: boolean },
): ClientOrder["price"] => {
  const total = Number(Number.isFinite(quoteAmount) ? quoteAmount.toFixed(2) : "0");
  const baseShare = Number((total * 0.6).toFixed(2));
  const kmShareBase = distanceKm ?? 0;
  const kmShare = Number(Math.max(0, kmShareBase * 0.9).toFixed(2));
  const adjustment = Number((total - baseShare - kmShare).toFixed(2));
  const finalBase = Number((baseShare + Math.min(0, adjustment)).toFixed(2));
  const finalKm = Number((kmShare + Math.max(0, adjustment)).toFixed(2));
  const expressOption = Boolean(options?.express ?? (normalizedCode === "express" || normalizedCode === "document"));
  const fragileOption = Boolean(options?.fragile ?? FRAGILE_TYPES.has(normalizedCode));
  const temperatureOption = Boolean(options?.temperatureControlled);
  return {
    breakdown: {
      base: finalBase,
      km: finalKm,
      express: expressOption ? "+30%" : "0%",
      fragile: fragileOption ? "+15%" : "0%",
      temperature: temperatureOption ? "+20%" : "0%",
    },
    total,
  };
};

export const appendClientOrderFromCreate = (input: ClientOrderCreateInput): ClientOrder => {
  const {
    id,
    customerId,
    transportType,
    pickupAddress,
    deliveryAddress,
    scheduleStart,
    scheduleEnd,
    weightKg,
    volumeM3,
    quoteAmount,
    quoteId,
    currency = "EUR",
    instructions,
  } = input;

  const normalizedCode = normalizeTransportCode(transportType || "standard");
  const pickupCoords = mockGeocode(pickupAddress);
  const deliveryCoords = mockGeocode(deliveryAddress);
  const km = pickupCoords && deliveryCoords ? Number(haversineKm(pickupCoords, deliveryCoords).toFixed(1)) : null;
  const now = new Date().toISOString();

  const newOrder: ClientOrder = {
    id,
    reference: id,
    status: "En attente",
    customerId,
    createdAt: now,
    pickupAt: scheduleStart,
    dropoffEta: scheduleEnd,
    type: resolveTransportLabel(normalizedCode, transportType),
    transportTypeCode: normalizedCode,
    from: {
      address: pickupAddress,
      coords: pickupCoords ?? undefined,
    },
    to: {
      address: deliveryAddress,
      coords: deliveryCoords ?? undefined,
    },
    km: km ?? 0,
    weightKg,
    volumeM3,
    options: {
      express: Boolean(input.options?.express ?? (normalizedCode === "express" || normalizedCode === "document")),
      fragile: Boolean(input.options?.fragile ?? FRAGILE_TYPES.has(normalizedCode)),
      temperatureControlled: Boolean(input.options?.temperatureControlled),
    },
    price: buildPrice(quoteAmount, normalizedCode, km, input.options),
    driverId: null,
    driver: null,
    notes: instructions,
    quoteId,
    currency: formatCurrencyCode(currency),
    history: [
      {
        label: "Commande créée",
        at: now,
      },
    ],
  };

  const orders = ensureOrdersDataShape();
  const withoutDuplicate = orders.filter(order => order.id !== id);
  const next = [newOrder, ...withoutDuplicate];
  saveToStorage(STORAGE_KEY, next);
  reconcileGlobalOrderSeq();
  emitClientOrdersUpdated();
  return newOrder;
};

export const ORDERS_EVENTS = {
  UPDATED: ORDERS_UPDATED_EVENT,
};
