import { generateNextOrderNumber } from "@/lib/orderSequence";
import {
  Order,
  appendActivity,
  generateId,
  getOrders,
  saveOrders,
} from "@/lib/stores/driversOrders.store";

export interface CreateOrderPayload {
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
  payload: CreateOrderPayload,
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
    amount: 0,
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
    const orderId = generateNextOrderNumber();
    const newOrder = buildNewOrder(payload, options, orderId);

    const orders = getOrders();
    saveOrders([newOrder, ...orders]);

    appendActivity({
      id: generateId(),
      type: "CREATE",
      orderId,
      by: options.customerDisplayName,
      at: new Date().toISOString(),
      message: `Commande créée via l'espace client (${payload.transportType})`,
      meta: {
        customerId: payload.customerId,
        weight: payload.weight,
        volume: payload.volume,
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
