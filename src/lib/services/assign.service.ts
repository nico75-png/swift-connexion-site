import {
  appendActivity,
  appendNotifications,
  Assignment,
  Driver,
  generateId,
  getAssignments,
  getDrivers,
  getOrders,
  NotificationEntry,
  Order,
  saveAssignments,
  saveOrders,
  hasTimeOverlap,
} from "@/lib/stores/driversOrders.store";

interface ServiceResult {
  success: boolean;
  error?: string;
  conflictOrderId?: string;
  driver?: Driver;
  order?: Order;
}

const nowIso = () => new Date().toISOString();

const resolveDriver = (driverId: string, drivers: Driver[]) => drivers.find((driver) => driver.id === driverId);

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

export const isDriverAvailable = (driverId: string, dateStart: string, dateEnd: string) => {
  const assignments = getAssignments();
  const overlapping = assignments.some(
    (assignment) =>
      assignment.driverId === driverId &&
      !assignment.endedAt &&
      hasTimeOverlap(dateStart, dateEnd, assignment.start, assignment.end),
  );
  return !overlapping;
};

const findConflictingAssignment = (driverId: string, dateStart: string, dateEnd: string) => {
  const assignments = getAssignments();
  return assignments.find(
    (assignment) =>
      assignment.driverId === driverId &&
      !assignment.endedAt &&
      hasTimeOverlap(dateStart, dateEnd, assignment.start, assignment.end),
  );
};

const guardDriverStatus = (driver: Driver): { valid: boolean; error?: string } => {
  if (!driver.active) {
    return { valid: false, error: "Ce chauffeur est indisponible sur ce créneau" };
  }

  if (driver.status === "PAUSED") {
    return { valid: false, error: "Chauffeur en pause — sélection impossible" };
  }

  return { valid: true };
};

const guardAvailability = (
  driverId: string,
  schedule: Order["schedule"],
): { valid: boolean; conflictOrderId?: string; error?: string } => {
  const isAvailable = isDriverAvailable(driverId, schedule.start, schedule.end);
  if (!isAvailable) {
    const conflict = findConflictingAssignment(driverId, schedule.start, schedule.end);
    return {
      valid: false,
      conflictOrderId: conflict?.orderId,
      error: conflict ? `Conflit horaire détecté avec la commande #${conflict.orderId}` : "Ce chauffeur est indisponible sur ce créneau",
    };
  }
  return { valid: true };
};

const guardZoneAndCapacity = (driver: Driver, order: Order): { valid: boolean; error?: string } => {
  if (driver.zone !== order.zoneRequirement) {
    return { valid: false, error: "Ce chauffeur n'intervient pas sur la zone demandée" };
  }
  return { valid: true };
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

const pushAssignmentNotifications = (order: Order, driver: Driver, type: "ASSIGN" | "UNASSIGN") => {
  const baseMessage = type === "ASSIGN"
    ? `Un chauffeur a été affecté à votre commande #${order.id}`
    : `Le chauffeur a été retiré de votre commande #${order.id}`;

  const adminMessage = type === "ASSIGN"
    ? `Chauffeur ${driver.name} affecté à #${order.id}`
    : `Chauffeur ${driver.name} retiré de #${order.id}`;

  const driverMessage = type === "ASSIGN"
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

export const assignDriver = (orderId: string, driverId: string): ServiceResult => {
  const orders = getOrders();
  const drivers = getDrivers();

  const orderIndex = orders.findIndex((item) => item.id === orderId);
  if (orderIndex === -1) {
    return { success: false, error: "Commande introuvable" };
  }

  const order = orders[orderIndex];
  const driver = resolveDriver(driverId, drivers);
  if (!driver) {
    return { success: false, error: "Chauffeur introuvable" };
  }

  const statusCheck = guardDriverStatus(driver);
  if (!statusCheck.valid) {
    return { success: false, error: statusCheck.error };
  }

  const zoneCheck = guardZoneAndCapacity(driver, order);
  if (!zoneCheck.valid) {
    return { success: false, error: zoneCheck.error };
  }

  const availabilityCheck = guardAvailability(driver.id, order.schedule);
  if (!availabilityCheck.valid) {
    return {
      success: false,
      error: availabilityCheck.error,
      conflictOrderId: availabilityCheck.conflictOrderId,
    };
  }

  const updatedOrder: Order = {
    ...order,
    driverId: driver.id,
    driverAssignedAt: nowIso(),
    status: order.status === "En attente" ? "En attente" : order.status,
  };

  const updatedOrders = orders.map((item) => (item.id === order.id ? updatedOrder : item));
  saveOrders(updatedOrders);

  updateAssignmentsAfterAssign({
    id: generateId(),
    orderId: order.id,
    driverId: driver.id,
    start: order.schedule.start,
    end: order.schedule.end,
  });

  generateActivity(order.id, driver.id, "ASSIGN");
  pushAssignmentNotifications(updatedOrder, driver, "ASSIGN");

  return { success: true, driver, order: updatedOrder };
};

export const unassignDriver = (orderId: string): ServiceResult => {
  const orders = getOrders();
  const orderIndex = orders.findIndex((item) => item.id === orderId);
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

  const updatedOrders = orders.map((item) => (item.id === orderId ? updatedOrder : item));
  saveOrders(updatedOrders);

  const assignments = getAssignments().filter((assignment) => assignment.orderId !== orderId);
  saveAssignments(assignments);

  generateActivity(orderId, driverId, "UNASSIGN");
  if (driver) {
    pushAssignmentNotifications(order, driver, "UNASSIGN");
  }

  return { success: true, driver, order: updatedOrder };
};

export const reassignDriver = (orderId: string, newDriverId: string): ServiceResult => {
  const currentOrder = getOrders().find((order) => order.id === orderId);
  const currentDriverId = currentOrder?.driverId || undefined;
  if (currentDriverId) {
    unassignDriver(orderId);
  }
  return assignDriver(orderId, newDriverId);
};
