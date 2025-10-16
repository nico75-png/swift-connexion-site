import { generateId } from "@/lib/stores/driversOrders.store";
import { getFromStorage, saveToStorage } from "@/lib/reorder";

export interface QuoteOrderPayload {
  customerId: string;
  transportType?: string;
  pickupAddress: string;
  deliveryAddress: string;
  date: string;
  time: string;
  weight: number;
  volume: number;
  driverInstructions?: string;
}

export interface QuoteBreakdown {
  base: number;
  distance: number;
  weight: number;
  volume: number;
  supplements: number;
  taxes: number;
  discount: number;
  totalHT: number;
  totalTTC: number;
}

export interface QuoteOrderSuccess {
  id: string;
  amount: number;
  currency: "EUR";
  breakdown: QuoteBreakdown;
  expiresAt: string;
  transportType: string;
  transportLabel: string;
}

export interface QuoteOrderResult {
  success: boolean;
  quote?: QuoteOrderSuccess;
  error?: string;
}

export interface StoredQuote extends QuoteOrderSuccess {
  customerId?: string;
  createdAt: string;
  payload: QuoteOrderPayload;
}

const QUOTES_STORAGE_KEY = "oc_quotes";

const TRANSPORT_LABELS: Record<string, string> = {
  juridique: "Document juridique",
  medical: "Colis médical",
  optique: "Monture optique",
  express: "Transport express",
  standard: "Livraison standard",
};

const normalizeTransportType = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (normalized === "monture") return "optique";
  return normalized;
};

const resolveTransportLabel = (type: string): string => {
  return TRANSPORT_LABELS[type] ?? TRANSPORT_LABELS.standard;
};

const readStoredQuotes = (): StoredQuote[] =>
  getFromStorage<StoredQuote[]>(QUOTES_STORAGE_KEY, []);

const writeStoredQuotes = (list: StoredQuote[]) => {
  saveToStorage(QUOTES_STORAGE_KEY, list);
};

const rememberQuote = (payload: QuoteOrderPayload, quote: QuoteOrderSuccess) => {
  const entry: StoredQuote = {
    ...quote,
    customerId: payload.customerId,
    createdAt: new Date().toISOString(),
    payload,
  };
  const existing = readStoredQuotes();
  const withoutDuplicate = existing.filter(item => item.id !== entry.id);
  writeStoredQuotes([entry, ...withoutDuplicate]);
};

export const getQuoteById = async (id: string): Promise<StoredQuote | null> => {
  const quotes = readStoredQuotes();
  const found = quotes.find(entry => entry.id === id);
  if (found) {
    return found;
  }
  return null;
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const computeSupplement = (transportType: string) => {
  switch (transportType) {
    case "express":
      return 18;
    case "medical":
      return 12;
    case "juridique":
      return 10;
    default:
      return 6;
  }
};

const determineTransportType = (payload: QuoteOrderPayload): string => {
  const provided = normalizeTransportType(payload.transportType);
  if (provided) {
    return provided;
  }

  const weight = Number.isFinite(payload.weight) ? payload.weight : 0;
  const volume = Number.isFinite(payload.volume) ? payload.volume : 0;
  const context = `${payload.pickupAddress} ${payload.deliveryAddress}`.toLowerCase();

  if (/(h[oô]pital|clinique|pharmacie|laboratoire)/u.test(context)) {
    return "medical";
  }

  if (/(tribunal|cour|palais\s+de\s+justice|notaire|huissier)/u.test(context)) {
    return "juridique";
  }

  if (/(optique|ophtalmologie|lunetterie|monture)/u.test(context)) {
    return "optique";
  }

  if (weight > 40 || volume > 1.5) {
    return "express";
  }

  return "standard";
};

export const quoteOrder = async (payload: QuoteOrderPayload): Promise<QuoteOrderResult> => {
  const { pickupAddress, deliveryAddress, weight, volume } = payload;

  await new Promise(resolve => setTimeout(resolve, 350));

  if (!pickupAddress || !deliveryAddress) {
    return {
      success: false,
      error: "Informations insuffisantes pour calculer le tarif.",
    };
  }

  const resolvedType = determineTransportType(payload);

  const base = 25;
  const distance = pickupAddress === deliveryAddress ? 8 : 18;
  const weightFee = Math.max(4, weight * 0.45);
  const volumeFee = Math.max(4, volume * 0.65);
  const supplements = computeSupplement(resolvedType);
  const discount = volume > 2 ? 5 : 0;
  const totalHT = roundCurrency(base + distance + weightFee + volumeFee + supplements - discount);
  const taxes = roundCurrency(totalHT * 0.2);
  const totalTTC = roundCurrency(totalHT + taxes);

  const quote: QuoteOrderSuccess = {
    id: `Q-${generateId()}`,
    amount: totalTTC,
    currency: "EUR",
    breakdown: {
      base: roundCurrency(base),
      distance: roundCurrency(distance),
      weight: roundCurrency(weightFee),
      volume: roundCurrency(volumeFee),
      supplements: roundCurrency(supplements),
      discount: roundCurrency(discount),
      taxes,
      totalHT,
      totalTTC,
    },
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    transportType: resolvedType,
    transportLabel: resolveTransportLabel(resolvedType),
  };

  rememberQuote(payload, quote);

  return {
    success: true,
    quote,
  };
};
