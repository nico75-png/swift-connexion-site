import {
  appendActivity,
  appendNotifications,
  Assignment,
  Driver,
  NotificationEntry,
  Order,
  ScheduledAssignment,
  ScheduledAssignmentStatus,
  generateId,
  getAssignments,
  getDrivers,
  getOrders,
  getScheduledAssignments,
  hasTimeOverlap,
  isBlockingScheduledStatus,
  isDriverAssignable,
  saveAssignments,
  saveOrders,
  saveScheduledAssignments,
} from "@/lib/stores/driversOrders.store";
import { ensureOrderNumberFormat } from "@/lib/orderSequence";

interface ServiceResult {
  success: boolean;
  error?: string;
  conflictOrderId?: string;
  driver?: Driver;
  order?: Order;
}

interface ScheduleResult extends ServiceResult {
  scheduledAssignment?: ScheduledAssignment;
}

const nowIso = () => new Date().toISOString();

const resolveDriver = (driverId: string, drivers: Driver[]) => drivers.find((driver) => driver.id === driverId);

const normalizeOrderId = (value: string) => ensureOrderNumberFormat(value) || value;

const resolveOrder = (orderId: string, orders: Order[]) => {
  const normalized = normalizeOrderId(orderId);
  return orders.find((order) => normalizeOrderId(order.id) === normalized);
};

export const cancelScheduledAssignmentsForInterval = (
  driverId: string,
  interval: { start: string; end: string },
): ScheduledAssignment[] => {
  const scheduledAssignments = getScheduledAssignments();
  const nowTime = Date.now();
  let hasChanges = false;
  const cancelled: ScheduledAssignment[] = [];

  const updated = scheduledAssignments.map((assignment) => {
    if (
      assignment.driverId !== driverId ||
      !isBlockingScheduledStatus(assignment.status) ||
      !hasTimeOverlap(interval.start, interval.end, assignment.start, assignment.end)
    ) {
      return assignment;
    }

    const assignmentStart = new Date(assignment.start).getTime();
    if (Number.isNaN(assignmentStart) || assignmentStart < nowTime) {
      return assignment;
    }

    const updatedAssignment: ScheduledAssignment = {
      ...assignment,
      status: "CANCELLED",
      failureReason: "Annulé (indisponibilité chauffeur)",
    };
    cancelled.push(updatedAssignment);
    hasChanges = true;
    return updatedAssignment;
  });

  if (hasChanges) {
    saveScheduledAssignments(updated);
  }

  return cancelled;
};

export const isDriverAvailable = (
  driverId: string,
  dateStart: string,
  dateEnd: string,
  options: { ignoreScheduledId?: string; currentOrderId?: string | null } = {},
) => {
  const drivers = getDrivers();
  const driver = resolveDriver(driverId, drivers);
  const result = isDriverAssignable(driver, dateStart, dateEnd, options);
  return result.assignable;
};

const updateAssignmentsAfterAssign = (assignment: Assignment) => {
  const assignments = getAssignments();
  const exists = assignments.find((item) => item.orderId === assignment.orderId);
  const updated = exists
    ? assignments.map((item) => (item.orderId === assignment.orderId ? assignment : item))
    : [assignment, ...assignments];
  saveAssignments(updated);
};

const generateActivity = (orderId: string, driverId: string, type: "ASSIGN" | "UNASSIGN") => {
  appendActivity({
    id: generateId(),
    type,
    orderId,
    driverId,
    by: "admin",
    at: nowIso(),
    message: type === "ASSIGN" ? "Chauffeur affecté" : "Chauffeur retiré",
  });
};

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

const pushAssignmentNotifications = (order: Order, driver: Driver, type: "ASSIGN" | "UNASSIGN") => {
  const baseMessage =
    type === "ASSIGN"
      ? `Un chauffeur a été affecté à votre commande #${order.id}`
      : `Le chauffeur a été retiré de votre commande #${order.id}`;

  const adminMessage =
    type === "ASSIGN"
      ? `Chauffeur ${driver.name} affecté à #${order.id}`
      : `Chauffeur ${driver.name} retiré de #${order.id}`;

  const driverMessage =
    type === "ASSIGN"
      ? `Nouvelle mission : #${order.id} — ${order.pickupAddress} → ${order.dropoffAddress}`
      : `Mission #${order.id} annulée / retirée`;

  const notifications: NotificationEntry[] = [
    buildNotification("CLIENT", baseMessage, order.id, driver.id),
    buildNotification("ADMIN", adminMessage, order.id, driver.id),
  ];

  if (type === "ASSIGN") {
    notifications.push(buildNotification("DRIVER", driverMessage, order.id, driver.id));
  }

  appendNotifications(notifications);
};

const updateScheduledAssignment = (id: string, patch: Partial<ScheduledAssignment>) => {
  const scheduledAssignments = getScheduledAssignments();
  const updated = scheduledAssignments.map((item) => (item.id === id ? { ...item, ...patch } : item));
  saveScheduledAssignments(updated);
  return updated.find((item) => item.id === id);
};

export const assignDriver = (
  orderId: string,
  driverId: string,
  options: { ignoreScheduledId?: string } = {},
): ServiceResult => {
  const orders = getOrders();
  const drivers = getDrivers();

  const normalizedOrderId = normalizeOrderId(orderId);
  const orderIndex = orders.findIndex((item) => normalizeOrderId(item.id) === normalizedOrderId);
  if (orderIndex === -1) {
    return { success: false, error: "Commande introuvable" };
  }

  const order = orders[orderIndex];
  const driver = resolveDriver(driverId, drivers);
  if (!driver) {
    return { success: false, error: "Chauffeur introuvable" };
  }

  const assignability = isDriverAssignable(driver, order.schedule.start, order.schedule.end, {
    ignoreScheduledId: options.ignoreScheduledId,
    currentOrderId: normalizeOrderId(order.id),
  });
  if (!assignability.assignable) {
    return {
      success: false,
      error: assignability.reason,
      conflictOrderId: assignability.conflictOrderId,
    };
  }

  const updatedOrder: Order = {
    ...order,
    driverId: driver.id,
    driverAssignedAt: nowIso(),
    status: order.status === "En attente" ? "En attente" : order.status,
    formattedId: normalizeOrderId(order.formattedId ?? order.id),
    legacyId: order.legacyId ?? order.id,
  };

  const updatedOrders = orders.map((item) =>
    normalizeOrderId(item.id) === normalizedOrderId ? updatedOrder : item,
  );
  saveOrders(updatedOrders);

  updateAssignmentsAfterAssign({
    id: generateId(),
    orderId: normalizedOrderId,
    driverId: driver.id,
    start: order.schedule.start,
    end: order.schedule.end,
  });

  generateActivity(normalizeOrderId(order.id), driver.id, "ASSIGN");
  pushAssignmentNotifications(updatedOrder, driver, "ASSIGN");

  return { success: true, driver, order: updatedOrder };
};

export const unassignDriver = (orderId: string): ServiceResult => {
  const orders = getOrders();
  const normalizedOrderId = normalizeOrderId(orderId);
  const orderIndex = orders.findIndex((item) => normalizeOrderId(item.id) === normalizedOrderId);
  if (orderIndex === -1) {
    return { success: false, error: "Commande introuvable" };
  }

  const order = orders[orderIndex];
  const driverId = order.driverId;
  if (!driverId) {
    return { success: false, error: "Aucun chauffeur à retirer" };
  }

  const drivers = getDrivers();
  const driver = resolveDriver(driverId, drivers);
  const updatedOrder: Order = {
    ...order,
    driverId: null,
    driverAssignedAt: null,
  };

  const updatedOrders = orders.map((item) =>
    normalizeOrderId(item.id) === normalizedOrderId ? updatedOrder : item,
  );
  saveOrders(updatedOrders);

  const assignments = getAssignments().filter(
    (assignment) => assignment.orderId !== normalizedOrderId,
  );
  saveAssignments(assignments);

  generateActivity(normalizedOrderId, driverId, "UNASSIGN");
  if (driver) {
    pushAssignmentNotifications(order, driver, "UNASSIGN");
  }

  return { success: true, driver, order: updatedOrder };
};

export const reassignDriver = (orderId: string, newDriverId: string): ServiceResult => {
  const normalizedOrderId = normalizeOrderId(orderId);
  const currentOrder = getOrders().find(
    (order) => normalizeOrderId(order.id) === normalizedOrderId,
  );
  const currentDriverId = currentOrder?.driverId || undefined;
  if (currentDriverId) {
    unassignDriver(normalizedOrderId);
  }
  return assignDriver(normalizedOrderId, newDriverId);
};

export const scheduleDriverAssignment = (
  orderId: string,
  driverId: string,
  executeAt: string,
): ScheduleResult => {
  const orders = getOrders();
  const drivers = getDrivers();

  const order = resolveOrder(orderId, orders);
  if (!order) {
    return { success: false, error: "Commande introuvable" };
  }

  const driver = resolveDriver(driverId, drivers);
  if (!driver) {
    return { success: false, error: "Chauffeur introuvable" };
  }

  const executionDate = new Date(executeAt);
  if (Number.isNaN(executionDate.getTime()) || executionDate.getTime() <= Date.now()) {
    return { success: false, error: "La planification doit être programmée dans le futur" };
  }

  const normalizedOrderId = normalizeOrderId(order.id);

  const assignability = isDriverAssignable(driver, order.schedule.start, order.schedule.end, {
    currentOrderId: normalizedOrderId,
  });
  if (!assignability.assignable) {
    return {
      success: false,
      error: assignability.reason,
      conflictOrderId: assignability.conflictOrderId,
    };
  }

  const scheduledAssignment: ScheduledAssignment = {
    id: generateId(),
    orderId: normalizedOrderId,
    driverId: driver.id,
    start: order.schedule.start,
    end: order.schedule.end,
    executeAt: executionDate.toISOString(),
    createdAt: nowIso(),
    status: "PENDING",
  };

  const scheduledAssignments = getScheduledAssignments();
  saveScheduledAssignments([scheduledAssignment, ...scheduledAssignments]);

  return { success: true, driver, order, scheduledAssignment };
};

export const cancelScheduledAssignment = (scheduledId: string): ScheduleResult => {
  const scheduledAssignments = getScheduledAssignments();
  const target = scheduledAssignments.find((item) => item.id === scheduledId);
  if (!target) {
    return { success: false, error: "Planification introuvable" };
  }

  if (!isBlockingScheduledStatus(target.status)) {
    return { success: false, error: "Cette planification ne peut plus être annulée" };
  }

  const updated: ScheduledAssignment[] = scheduledAssignments.map((item) =>
    item.id === scheduledId
      ? { ...item, status: "CANCELLED" as ScheduledAssignmentStatus, failureReason: undefined }
      : item,
  );
  saveScheduledAssignments(updated);

  return {
    success: true,
    scheduledAssignment: updated.find((item) => item.id === scheduledId),
  };
};

export const processScheduledAssignments = () => {
  const scheduledAssignments = getScheduledAssignments();
  const dueAssignments = scheduledAssignments.filter(
    (assignment) => assignment.status === "PENDING" && new Date(assignment.executeAt).getTime() <= Date.now(),
  );

  if (dueAssignments.length === 0) {
    return;
  }

  for (const assignment of dueAssignments) {
    updateScheduledAssignment(assignment.id, { status: "PROCESSING", failureReason: undefined });

    const drivers = getDrivers();
    const driver = resolveDriver(assignment.driverId, drivers);
    const orders = getOrders();
    const order = resolveOrder(assignment.orderId, orders);

    if (!driver || !order) {
      updateScheduledAssignment(assignment.id, {
        status: "FAILED",
        failureReason: "Commande ou chauffeur introuvable",
      });
      continue;
    }

    const assignability = isDriverAssignable(driver, order.schedule.start, order.schedule.end, {
      ignoreScheduledId: assignment.id,
      currentOrderId: order.id,
    });
    if (!assignability.assignable) {
      updateScheduledAssignment(assignment.id, {
        status: "FAILED",
        failureReason: assignability.reason,
      });
      continue;
    }

    const result = assignDriver(order.id, driver.id, { ignoreScheduledId: assignment.id });
    if (result.success) {
      updateScheduledAssignment(assignment.id, { status: "COMPLETED", failureReason: undefined });
    } else {
      updateScheduledAssignment(assignment.id, {
        status: "FAILED",
        failureReason: result.error,
      });
    }
  }
};
