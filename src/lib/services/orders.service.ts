import { generateNextOrderNumber } from "@/lib/orderSequence";
import {
  Assignment,
  Driver,
  NotificationEntry,
  Order,
  appendActivity,
  appendNotifications,
  generateId,
  getDrivers,
  getOrders,
  isDriverAssignable,
  saveOrders,
  updateOrder,
  upsertAssignment,
} from "@/lib/stores/driversOrders.store";
import { appendClientOrderFromCreate } from "@/lib/stores/clientOrders.store";
import { getQuoteById } from "@/lib/services/quotes.service";
import { resolveOrderStatus } from "@/lib/orders/status";

const nowIso = () => new Date().toISOString();

const buildNotification = (
  channel: NotificationEntry["channel"],
  message: string,
  orderId: string,
  driverId?: string,
): NotificationEntry => ({
  id: generateId(),
  channel,
  orderId,
  driverId,
  read: false,
  message,
  createdAt: nowIso(),
});

const simulateNetworkLatency = async (min = 320, max = 620) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise((resolve) => setTimeout(resolve, delay));
};

const ensureOrderIsAssignable = (order: Order) => {
  const normalized = resolveOrderStatus(order.status);

  if (normalized === "LIVREE" || normalized === "ANNULEE") {
    const label = normalized === "LIVREE" ? "livrée" : "annulée";
    throw new Error(`Impossible d'affecter un chauffeur : la commande est ${label}.`);
  }

  if (normalized !== "EN_ATTENTE_AFFECTATION") {
    throw new Error("Cette commande n'est pas en attente d'affectation.");
  }
};

const ensureDriverIsEligible = (driver: Driver | undefined, order: Order) => {
  if (!driver) {
    throw new Error("Chauffeur introuvable");
  }

  if (!driver.active || driver.lifecycleStatus === "INACTIF") {
    throw new Error("Ce chauffeur n'est pas actif");
  }

  const excludedIds = new Set(order.excludedDriverIds ?? []);
  if (excludedIds.has(driver.id)) {
    throw new Error("Ce chauffeur est indisponible pour cette commande");
  }
};

export interface AssignDriverResponse {
  order: Order;
  assignment: Assignment;
}

export const assignDriver = async (orderId: string, driverId: string): Promise<AssignDriverResponse> => {
  await simulateNetworkLatency();

  const orders = getOrders();
  const order = orders.find((item) => item.id === orderId);
  if (!order) {
    throw new Error("Commande introuvable");
  }

  ensureOrderIsAssignable(order);

  const drivers = getDrivers();
  const driver = drivers.find((item) => item.id === driverId);
  ensureDriverIsEligible(driver, order);

  const assignability = isDriverAssignable(driver, order.schedule.start, order.schedule.end, {
    currentOrderId: order.id,
  });

  if (!assignability.assignable) {
    throw new Error(assignability.reason ?? "Ce chauffeur n'est pas disponible");
  }

  const assignment: Assignment = {
    id: generateId(),
    orderId: order.id,
    driverId: driver!.id,
    start: order.schedule.start,
    end: order.schedule.end,
    endedAt: null,
  };

  const assignedAt = nowIso();
  const updatedOrder = updateOrder(order.id, {
    status: "EN_ATTENTE_ENLEVEMENT",
    driverId: driver!.id,
    driverAssignedAt: assignedAt,
  });

  if (!updatedOrder) {
    throw new Error("Impossible de mettre à jour la commande");
  }

  upsertAssignment(assignment);

  appendActivity({
    id: generateId(),
    type: "ASSIGN",
    orderId: order.id,
    driverId: driver!.id,
    by: "admin",
    at: assignedAt,
    message: `Chauffeur ${driver!.name} affecté`,
  });

  const notifications: NotificationEntry[] = [
    buildNotification("CLIENT", `Un chauffeur a été affecté à votre commande #${order.id}`, order.id, driver!.id),
    buildNotification("ADMIN", `Chauffeur ${driver!.name} affecté à #${order.id}`, order.id, driver!.id),
    buildNotification(
      "DRIVER",
      `Nouvelle mission : #${order.id} — ${order.pickupAddress} → ${order.dropoffAddress}`,
      order.id,
      driver!.id,
    ),
  ];

  appendNotifications(notifications);

  return { order: updatedOrder, assignment };
};

export interface CreateOrderPayload {
  customerId: string;
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
    const resolvedTransportType = storedQuote?.transportType ?? "standard";
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
