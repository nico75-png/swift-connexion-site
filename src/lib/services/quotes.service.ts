import { generateId } from "@/lib/stores/driversOrders.store";
import { getFromStorage, saveToStorage } from "@/lib/reorder";

export interface QuoteOrderPayload {
  customerId: string;
  transportType: string;
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

export const quoteOrder = async (payload: QuoteOrderPayload): Promise<QuoteOrderResult> => {
  const {
    transportType,
    pickupAddress,
    deliveryAddress,
    weight,
    volume,
  } = payload;

  await new Promise(resolve => setTimeout(resolve, 350));

  if (!transportType || !pickupAddress || !deliveryAddress) {
    return {
      success: false,
      error: "Informations insuffisantes pour calculer le tarif.",
    };
  }

  const base = 25;
  const distance = pickupAddress === deliveryAddress ? 8 : 18;
  const weightFee = Math.max(4, weight * 0.45);
  const volumeFee = Math.max(4, volume * 0.65);
  const supplements = computeSupplement(transportType);
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
  };

  rememberQuote(payload, quote);

  return {
    success: true,
    quote,
  };
};
