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
import { SECTOR_DISPLAY_MAP } from "@/lib/stores/data/adminOrderSeeds";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

export interface CreateOrderPayload {
  customerId: string;
  sector: string;
  packageType: string;
  packageNote?: string;
  pickupAddress: string;
  deliveryAddress: string;
  date: string;
  time: string;
  weight: number;
  volume: number;
  driverInstructions?: string;
  expressDelivery?: boolean;
  fragilePackage?: boolean;
  temperatureControlled?: boolean;
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

  const sectorLabel =
    SECTOR_DISPLAY_MAP[payload.sector?.toUpperCase?.() ?? ""] ?? payload.sector ?? "B2B Express";

  return {
    id: orderId,
    client: options.customerCompany,
    sector: sectorLabel,
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
    options: (() => {
      const extras = {
        express: Boolean(payload.expressDelivery),
        fragile: Boolean(payload.fragilePackage),
        temperatureControlled: Boolean(payload.temperatureControlled),
      };
      return extras.express || extras.fragile || extras.temperatureControlled ? extras : undefined;
    })(),
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

    const previousOrders = getOrders();
    const nextOrders = [newOrder, ...previousOrders];

    const nowIso = new Date().toISOString();
    const orderRecord: TablesInsert<"orders"> = {
      id: orderId,
      customer_id: payload.customerId,
      customer_company: options.customerCompany,
      sector: payload.sector as TablesInsert<"orders">["sector"],
      package_type: payload.packageType as TablesInsert<"orders">["package_type"],
      package_note: payload.packageNote?.trim() ? payload.packageNote.trim() : null,
      pickup_address: payload.pickupAddress,
      delivery_address: payload.deliveryAddress,
      schedule_start: newOrder.schedule.start,
      schedule_end: newOrder.schedule.end,
      amount: payload.quoteAmount,
      currency: storedQuote?.currency ?? "EUR",
      status: "pending" as const,
      driver_instructions: payload.driverInstructions?.trim() ? payload.driverInstructions.trim() : null,
      volume_m3: payload.volume,
      weight_kg: payload.weight,
      quote_id: payload.quoteId,
      driver_id: null,
      driver_assigned_at: null,
      created_at: nowIso,
      updated_at: nowIso,
    };

    const { error: supabaseError } = await supabase.from("orders").insert(orderRecord);

    if (supabaseError) {
      console.error("Failed to persist order to Supabase", supabaseError);
      throw new Error("Impossible d'enregistrer la commande dans la base de données.");
    }

    saveOrders(nextOrders);

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
      options: {
        express: Boolean(payload.expressDelivery),
        fragile: Boolean(payload.fragilePackage),
        temperatureControlled: Boolean(payload.temperatureControlled),
      },
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
