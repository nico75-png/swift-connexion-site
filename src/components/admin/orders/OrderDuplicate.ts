import { parseISO } from "date-fns";

import type { Order, ZoneCode } from "@/lib/stores/driversOrders.store";

export interface OrderDuplicateDraft {
  client: string;
  type: string;
  pickupAddress: string;
  dropoffAddress: string;
  date: string;
  time: string;
  weight: string;
  volume: string;
  instructions: string;
  zoneRequirement: ZoneCode;
  amount: number;
}

const extractNumber = (value: string | null | undefined): string => {
  if (!value) {
    return "";
  }
  const match = value.match(/\d+[\d,.]*/);
  if (!match) {
    return "";
  }
  return match[0].replace(/,/g, ".").trim();
};

const toDateInput = (iso: string | null | undefined): string => {
  if (!iso) {
    return "";
  }
  try {
    const date = parseISO(iso);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toISOString().slice(0, 10);
  } catch (error) {
    return "";
  }
};

const toTimeInput = (iso: string | null | undefined): string => {
  if (!iso) {
    return "";
  }
  try {
    const date = parseISO(iso);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toISOString().slice(11, 16);
  } catch (error) {
    return "";
  }
};

export const createDuplicateDraftFromOrder = (order: Order): OrderDuplicateDraft => ({
  client: order.client,
  type: order.type ?? "",
  pickupAddress: order.pickupAddress ?? "",
  dropoffAddress: order.dropoffAddress ?? "",
  date: toDateInput(order.schedule?.start),
  time: toTimeInput(order.schedule?.start),
  weight: extractNumber(order.weight),
  volume: extractNumber(order.volumeRequirement),
  instructions: order.instructions ?? "",
  zoneRequirement: order.zoneRequirement,
  amount: order.amount,
});
