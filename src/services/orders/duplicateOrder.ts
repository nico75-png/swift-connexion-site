import { generateNextOrderNumber } from "@/lib/orderSequence";
import {
  appendActivity,
  generateId,
  getOrders,
  saveOrders,
  type Order,
  type ZoneCode,
} from "@/lib/stores/driversOrders.store";

export interface CreateOrderFromDraftPayload {
  client: string;
  type: string;
  pickupAddress: string;
  dropoffAddress: string;
  date: string;
  time: string;
  weight: string;
  volume: string;
  instructions?: string;
  zoneRequirement: ZoneCode;
  amount: number;
  sourceOrderId: string;
  options: {
    express: boolean;
    fragile: boolean;
    temperatureControlled: boolean;
  };
}

const toIsoString = (date: string, time: string) => {
  const paddedTime = time.length === 5 ? `${time}:00` : time;
  const isoCandidate = new Date(`${date}T${paddedTime}`);
  if (Number.isNaN(isoCandidate.getTime())) {
    throw new Error("Date ou heure invalide pour la nouvelle commande");
  }
  return isoCandidate.toISOString();
};

const formatUnitValue = (value: number, unit: string) => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`La valeur ${unit} doit être un nombre positif`);
  }
  const rounded = Number(value.toFixed(2));
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded} ${unit}`;
};

const parseNumber = (input: string, unit: string) => {
  const normalized = input.replace(/,/g, ".").trim();
  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`La valeur ${unit} doit être supérieure à 0`);
  }
  return value;
};

export const createOrderFromDuplicateDraft = async (
  payload: CreateOrderFromDraftPayload,
): Promise<Order> => {
  const scheduleStartIso = toIsoString(payload.date, payload.time);
  const scheduleStart = new Date(scheduleStartIso);
  const scheduleEnd = new Date(scheduleStart.getTime() + 60 * 60 * 1000);

  const weightValue = parseNumber(payload.weight, "poids");
  const volumeValue = parseNumber(payload.volume, "volume");

  const newOrderId = generateNextOrderNumber();
  const newOrder: Order = {
    id: newOrderId,
    client: payload.client.trim(),
    type: payload.type.trim() || "Standard",
    status: "En attente",
    amount: payload.amount,
    schedule: {
      start: scheduleStart.toISOString(),
      end: scheduleEnd.toISOString(),
    },
    pickupAddress: payload.pickupAddress.trim(),
    dropoffAddress: payload.dropoffAddress.trim(),
    zoneRequirement: payload.zoneRequirement,
    volumeRequirement: formatUnitValue(volumeValue, "m³"),
    weight: formatUnitValue(weightValue, "kg"),
    instructions: payload.instructions?.trim() || undefined,
    options: {
      express: payload.options.express,
      fragile: payload.options.fragile,
      temperatureControlled: payload.options.temperatureControlled,
    },
    driverId: null,
    driverAssignedAt: null,
  };

  const currentOrders = getOrders();
  saveOrders([newOrder, ...currentOrders]);

  appendActivity({
    id: generateId(),
    type: "CREATE",
    orderId: newOrder.id,
    by: "admin",
    at: new Date().toISOString(),
    message: `Commande créée par duplication de ${payload.sourceOrderId}`,
    meta: {
      sourceOrderId: payload.sourceOrderId,
    },
  });

  return newOrder;
};
