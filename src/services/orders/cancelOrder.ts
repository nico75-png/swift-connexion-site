import {
  type ActivityEntry,
  type ClientOrder,
  type NotificationEntry,
  ensureOrdersDataShape,
  getFromStorage,
  saveToStorage,
} from "@/lib/reorder";
import {
  type CancelOrderReason,
  ORDER_CANCELLATION_REASON_LABELS,
  doesCancelReasonRequireDetails,
} from "@/lib/orders/cancellation";
import {
  isOrderCancelableStatus,
  resolveOrderStatus,
} from "@/lib/orders/status";

export interface CancelOrderPayload {
  reason: CancelOrderReason;
  details?: string;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const dispatchOrdersStorageEvent = (orders: ClientOrder[]) => {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "oc_orders",
        newValue: JSON.stringify(orders),
      }),
    );
  } catch (error) {
    console.error("Failed to dispatch storage event", error);
  }
};

export const cancelOrder = async (
  orderId: string,
  payload: CancelOrderPayload,
): Promise<ClientOrder> => {
  const trimmedDetails = payload.details?.trim() ?? "";
  if (!payload.reason) {
    throw new Error("Le motif d’annulation est requis.");
  }
  if (doesCancelReasonRequireDetails(payload.reason) && trimmedDetails.length === 0) {
    throw new Error("Veuillez préciser le motif d’annulation.");
  }

  const orders = ensureOrdersDataShape();
  const index = orders.findIndex((order) => order.id === orderId);
  if (index === -1) {
    throw new Error("Commande introuvable");
  }

  const existingOrder = orders[index];
  if (!isOrderCancelableStatus(existingOrder.status)) {
    const normalized = resolveOrderStatus(existingOrder.status);
    if (normalized === "ANNULEE") {
      throw new Error("Cette commande est déjà annulée.");
    }
    throw new Error("Cette commande ne peut pas être annulée.");
  }

  const cancellationAt = new Date().toISOString();
  const updatedOrder: ClientOrder = {
    ...existingOrder,
    status: "Annulée",
    cancellation: {
      reason: payload.reason,
      comment: doesCancelReasonRequireDetails(payload.reason) ? trimmedDetails : undefined,
      at: cancellationAt,
    },
    history: [
      ...(existingOrder.history ?? []),
      { label: "Commande annulée par le client", at: cancellationAt },
    ],
  };

  const previousOrdersSnapshot = [...orders];
  const updatedOrders = [...orders];
  updatedOrders[index] = updatedOrder;
  saveToStorage("oc_orders", updatedOrders);

  try {
    await wait(600);

    const activityLog = getFromStorage<ActivityEntry[]>("oc_activity_log", []);
    activityLog.unshift({
      id: `LOG-${Date.now()}`,
      type: "CLIENT_ORDER_CANCELLED",
      orderId: updatedOrder.id,
      at: cancellationAt,
    });
    saveToStorage("oc_activity_log", activityLog);

    const notifications = getFromStorage<NotificationEntry[]>("oc_notifications", []);
    const reasonLabel = ORDER_CANCELLATION_REASON_LABELS[payload.reason];
    notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      scope: "CLIENT",
      kind: "ORDER_CANCELLED",
      orderId: updatedOrder.id,
      message: `Commande ${updatedOrder.id} annulée (${reasonLabel.toLowerCase()}).`,
      at: cancellationAt,
      read: false,
    });
    saveToStorage("oc_notifications", notifications);

    console.info("[mock] cancelOrder", {
      orderId: updatedOrder.id,
      reason: payload.reason,
      details: trimmedDetails,
    });

    dispatchOrdersStorageEvent(updatedOrders);

    return updatedOrder;
  } catch (error) {
    saveToStorage("oc_orders", previousOrdersSnapshot);
    dispatchOrdersStorageEvent(previousOrdersSnapshot);
    throw error;
  }
};
