import { generateNextOrderNumber } from "@/lib/orderSequence";
import {
  Order,
  appendActivity,
  generateId,
  getOrders,
  saveOrders,
} from "@/lib/stores/driversOrders.store";
import { appendClientOrderFromCreate } from "@/lib/stores/clientOrders.store";
import { getQuoteById } from "@/lib/services/quotes.service";

export interface CreateOrderPayload {
  customerId: string;
  transportType?: string;
  pickupAddress: string;
  deliveryAddress: string;
  date: string;
  time: string;
  weight: number;
  volume: number;
  driverInstructions?: string;
  quoteId: string;
  quoteAmount: number;
}

type CompleteCreateOrderPayload = CreateOrderPayload & { transportType: string };

interface CreateOrderOptions {
  customerDisplayName: string;
  customerCompany: string;
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

const toIsoString = (date: string, time: string) => {
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  const candidate = new Date(`${date}T${normalizedTime}`);
  if (Number.isNaN(candidate.getTime())) {
    throw new Error("Date ou heure invalide");
  }
  return candidate.toISOString();
};

const buildNewOrder = (
  payload: CompleteCreateOrderPayload,
  options: CreateOrderOptions,
  orderId: string,
): Order => {
  const scheduleStartIso = toIsoString(payload.date, payload.time);
  const scheduleStart = new Date(scheduleStartIso);
  const scheduleEnd = new Date(scheduleStart.getTime() + 60 * 60 * 1000);

  return {
    id: orderId,
    client: options.customerCompany,
    type: payload.transportType,
    status: "En attente",
    amount: payload.quoteAmount,
    schedule: {
      start: scheduleStart.toISOString(),
      end: scheduleEnd.toISOString(),
    },
    pickupAddress: payload.pickupAddress,
    dropoffAddress: payload.deliveryAddress,
    zoneRequirement: "INTRA_PARIS",
    volumeRequirement: `${payload.volume}`,
    weight: `${payload.weight}`,
    instructions: payload.driverInstructions?.trim() || undefined,
    driverId: null,
    driverAssignedAt: null,
  };
};

export const createOrder = async (
  payload: CreateOrderPayload,
  options: CreateOrderOptions,
): Promise<CreateOrderResult> => {
  try {
    const storedQuote = await getQuoteById(payload.quoteId);
    const candidateType = payload.transportType?.trim().toLowerCase();
    const resolvedTransportType =
      (candidateType && candidateType.length > 0 ? candidateType : undefined) ??
      storedQuote?.transportType ??
      "standard";
    const resolvedTransportLabel = storedQuote?.transportLabel ?? resolvedTransportType;

    const orderId = generateNextOrderNumber();
    const completePayload: CompleteCreateOrderPayload = { ...payload, transportType: resolvedTransportType };
    const newOrder = buildNewOrder(completePayload, options, orderId);

    const orders = getOrders();
    saveOrders([newOrder, ...orders]);

    appendClientOrderFromCreate({
      id: orderId,
      customerId: payload.customerId,
      transportType: resolvedTransportType,
      pickupAddress: payload.pickupAddress,
      deliveryAddress: payload.deliveryAddress,
      scheduleStart: newOrder.schedule.start,
      scheduleEnd: newOrder.schedule.end,
      weightKg: payload.weight,
      volumeM3: payload.volume,
      quoteAmount: payload.quoteAmount,
      quoteId: payload.quoteId,
      currency: storedQuote?.currency ?? "EUR",
      instructions: payload.driverInstructions,
    });

    appendActivity({
      id: generateId(),
      type: "CREATE",
      orderId,
      by: options.customerDisplayName,
      at: new Date().toISOString(),
      message: `Commande créée via l'espace client (${resolvedTransportLabel})`,
      meta: {
        customerId: payload.customerId,
        weight: payload.weight,
        volume: payload.volume,
        quoteId: payload.quoteId,
        quoteAmount: payload.quoteAmount,
      },
    });

    await new Promise(resolve => setTimeout(resolve, 450));

    return { success: true, orderId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible de créer la commande";
    return { success: false, error: message };
  }
};
