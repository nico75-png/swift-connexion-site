import { addHours, formatISO, isAfter, isBefore, isEqual, parseISO } from "date-fns";

type DriverStatus = "Disponible" | "En course" | "En pause";

type ActivityType =
  | "ASSIGN_NOW"
  | "ASSIGN_SCHEDULED"
  | "EXECUTION"
  | "FAILED"
  | "CANCELLED"
  | "ASSIGN_REMOVED"
  | "NOTES_UPDATED";

type NotificationAudience = "admin" | "client" | "driver";

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  zone: string;
  status: DriverStatus;
  isActive: boolean;
  nextSlot?: {
    start: string;
    end: string;
  };
}

export interface Order {
  id: string;
  date: string;
  client: string;
  type: string;
  status: string;
  amount: number;
  pickup: string;
  delivery: string;
  weight: string;
  volume: string;
  instructions?: string;
  adminNotes?: string;
  driverId?: string;
  driverAssignedAt?: string;
  driverAssignmentWindow?: {
    start: string;
    end: string;
  };
  scheduledAssignmentId?: string;
  scheduledAt?: string;
  windowStart?: string;
  windowEnd?: string;
}

export interface Assignment {
  id: string;
  orderId: string;
  driverId: string;
  start: string;
  end: string;
  createdAt: string;
}

export interface ScheduledAssignment {
  id: string;
  orderId: string;
  driverId: string;
  scheduledAt: string;
  start: string;
  end: string;
  status: "SCHEDULED" | "EXECUTED" | "FAILED" | "CANCELLED";
  createdAt: string;
  executedAt?: string;
  reason?: string;
}

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  orderId: string;
  driverId?: string;
  at?: string;
  scheduledAt?: string;
  by: string;
  payload?: Record<string, unknown>;
}

export interface NotificationItem {
  id: string;
  audience: NotificationAudience;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  meta?: Record<string, unknown>;
  actionLabel?: string;
}

export const STORAGE_KEYS = {
  orders: "oc_orders",
  drivers: "oc_drivers",
  assignments: "oc_assignments",
  scheduledAssignments: "oc_scheduled_assignments",
  activity: "oc_activity_log",
  notifications: "oc_notifications",
} as const;

export const STORAGE_EVENT = "oc-storage-updated";

const DEFAULT_ASSIGNMENT_DURATION_HOURS = 1;

const load = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") {
    return fallback;
  }
  const stored = window.localStorage.getItem(key);
  if (!stored) {
    return fallback;
  }
  try {
    return JSON.parse(stored) as T;
  } catch (error) {
    console.error(`[mockData] unable to parse ${key}`, error);
    return fallback;
  }
};

const notifyChange = (keys: string[]) => {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent(STORAGE_EVENT, {
      detail: { keys },
    }),
  );
};

const save = <T>(key: string, value: T) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
  notifyChange([key]);
};

const createId = () => (typeof crypto !== "undefined" ? crypto.randomUUID() : Math.random().toString(36).slice(2));

const seedData = () => {
  const now = new Date();
  const today = formatISO(now, { representation: "date" });
  const tomorrow = formatISO(addHours(now, 24), { representation: "date" });

  const defaultOrders: Order[] = [
    {
      id: "CMD-247",
      date: `${today}T14:30:00.000Z`,
      client: "Cabinet Dupont",
      type: "Express",
      status: "En cours",
      amount: 45.5,
      pickup: "12 rue de la Paix, 75002 Paris",
      delivery: "45 avenue des Champs-Élysées, 75008 Paris",
      weight: "2.5 kg",
      volume: "0.05 m³",
      instructions: "Sonnez à l'interphone, code 1234",
      adminNotes: "Client préfère les livraisons en matinée",
      windowStart: `${today}T14:00:00.000Z`,
      windowEnd: `${today}T16:00:00.000Z`,
    },
    {
      id: "CMD-246",
      date: `${today}T13:15:00.000Z`,
      client: "Optique Vision",
      type: "Standard",
      status: "Livré",
      amount: 38,
      pickup: "25 rue de Rivoli, 75001 Paris",
      delivery: "8 boulevard Haussmann, 75009 Paris",
      weight: "1.2 kg",
      volume: "0.03 m³",
      windowStart: `${today}T12:30:00.000Z`,
      windowEnd: `${today}T13:45:00.000Z`,
      driverId: "DRV-1",
      driverAssignedAt: addHours(now, -3).toISOString(),
      driverAssignmentWindow: {
        start: addHours(now, -3).toISOString(),
        end: addHours(now, -2).toISOString(),
      },
      adminNotes: "Client régulier — vérifier facture mensuelle",
    },
    {
      id: "CMD-245",
      date: `${today}T12:00:00.000Z`,
      client: "Lab Médical",
      type: "Fragile",
      status: "En attente",
      amount: 52,
      pickup: "5 rue Claude Bernard, 75005 Paris",
      delivery: "22 rue de la Santé, 75013 Paris",
      weight: "3.1 kg",
      volume: "0.06 m³",
      windowStart: `${today}T11:30:00.000Z`,
      windowEnd: `${today}T12:30:00.000Z`,
      adminNotes: "Prévoir emballage isotherme",
    },
    {
      id: "CMD-244",
      date: `${today}T10:45:00.000Z`,
      client: "Avocat & Associés",
      type: "Express",
      status: "Enlevé",
      amount: 41,
      pickup: "18 rue du Louvre, 75001 Paris",
      delivery: "3 rue de la Paix, 75002 Paris",
      weight: "0.9 kg",
      volume: "0.02 m³",
      windowStart: `${today}T10:15:00.000Z`,
      windowEnd: `${today}T11:15:00.000Z`,
      driverId: "DRV-2",
      driverAssignedAt: addHours(now, -4).toISOString(),
      driverAssignmentWindow: {
        start: addHours(now, -4).toISOString(),
        end: addHours(now, -3).toISOString(),
      },
      adminNotes: "Client sensible au délai",
    },
    {
      id: "CMD-243",
      date: `${today}T09:20:00.000Z`,
      client: "Pharmacie Centrale",
      type: "Standard",
      status: "Livré",
      amount: 35,
      pickup: "55 rue du Faubourg Saint-Honoré, 75008 Paris",
      delivery: "75 avenue des Champs-Élysées, 75008 Paris",
      weight: "0.7 kg",
      volume: "0.015 m³",
      windowStart: `${today}T09:00:00.000Z`,
      windowEnd: `${today}T10:00:00.000Z`,
      driverId: "DRV-3",
      driverAssignedAt: addHours(now, -5).toISOString(),
      driverAssignmentWindow: {
        start: addHours(now, -5).toISOString(),
        end: addHours(now, -4).toISOString(),
      },
      adminNotes: "Remettre les documents au responsable de boutique",
    },
    {
      id: "CMD-242",
      date: `${tomorrow}T08:30:00.000Z`,
      client: "Cabinet Martin",
      type: "Express",
      status: "En attente",
      amount: 48,
      pickup: "12 avenue de l'Opéra, 75001 Paris",
      delivery: "60 boulevard Saint-Germain, 75005 Paris",
      weight: "1.8 kg",
      volume: "0.04 m³",
      windowStart: `${tomorrow}T08:00:00.000Z`,
      windowEnd: `${tomorrow}T09:00:00.000Z`,
      adminNotes: "Confirmer la présence du contact sur place",
    },
  ];

  const defaultDrivers: Driver[] = [
    {
      id: "DRV-1",
      name: "Marc Dubois",
      phone: "0612345678",
      vehicle: "Renault Kangoo - AB-123-CD",
      zone: "Paris Centre",
      status: "Disponible",
      isActive: true,
      nextSlot: {
        start: addHours(now, 1).toISOString(),
        end: addHours(now, 2).toISOString(),
      },
    },
    {
      id: "DRV-2",
      name: "Julie Lefèvre",
      phone: "0678563412",
      vehicle: "Peugeot Partner - EF-456-GH",
      zone: "Paris Ouest",
      status: "En course",
      isActive: true,
      nextSlot: {
        start: addHours(now, 2).toISOString(),
        end: addHours(now, 3).toISOString(),
      },
    },
    {
      id: "DRV-3",
      name: "Pierre Morel",
      phone: "0645789632",
      vehicle: "Citroën Berlingo - IJ-789-KL",
      zone: "Paris Sud",
      status: "Disponible",
      isActive: true,
      nextSlot: {
        start: addHours(now, 3).toISOString(),
        end: addHours(now, 4).toISOString(),
      },
    },
    {
      id: "DRV-4",
      name: "Sophie Renard",
      phone: "0687452390",
      vehicle: "Scooter Piaggio - MN-012-OP",
      zone: "Paris Est",
      status: "En pause",
      isActive: true,
    },
    {
      id: "DRV-5",
      name: "Lucas Bernard",
      phone: "0623459876",
      vehicle: "Camionnette Ford - QR-345-ST",
      zone: "Petite Couronne",
      status: "Disponible",
      isActive: false,
    },
  ];

  save(STORAGE_KEYS.orders, defaultOrders);
  save(STORAGE_KEYS.drivers, defaultDrivers);
  save(STORAGE_KEYS.assignments, [] as Assignment[]);
  save(STORAGE_KEYS.scheduledAssignments, [] as ScheduledAssignment[]);
  save(STORAGE_KEYS.activity, [] as ActivityEntry[]);
  save(STORAGE_KEYS.notifications, [] as NotificationItem[]);
};

export const initializeMockData = () => {
  if (typeof window === "undefined") {
    return;
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.orders)) {
    seedData();
  }
};

export const getOrders = (): Order[] => load<Order[]>(STORAGE_KEYS.orders, []);
export const saveOrders = (orders: Order[]) => save(STORAGE_KEYS.orders, orders);

export const getDrivers = (): Driver[] => load<Driver[]>(STORAGE_KEYS.drivers, []);
export const saveDrivers = (drivers: Driver[]) => save(STORAGE_KEYS.drivers, drivers);

export const getAssignments = (): Assignment[] => load<Assignment[]>(STORAGE_KEYS.assignments, []);
export const saveAssignments = (assignments: Assignment[]) => save(STORAGE_KEYS.assignments, assignments);

export const getScheduledAssignments = (): ScheduledAssignment[] =>
  load<ScheduledAssignment[]>(STORAGE_KEYS.scheduledAssignments, []);
export const saveScheduledAssignments = (scheduledAssignments: ScheduledAssignment[]) =>
  save(STORAGE_KEYS.scheduledAssignments, scheduledAssignments);

export const getActivityLog = (): ActivityEntry[] => load<ActivityEntry[]>(STORAGE_KEYS.activity, []);
export const saveActivityLog = (activity: ActivityEntry[]) => save(STORAGE_KEYS.activity, activity);

export const getNotifications = (): NotificationItem[] => load<NotificationItem[]>(STORAGE_KEYS.notifications, []);
export const saveNotifications = (notifications: NotificationItem[]) => save(STORAGE_KEYS.notifications, notifications);

export const appendActivity = (entry: Omit<ActivityEntry, "id"> & { id?: string }) => {
  const activity = getActivityLog();
  const next = [...activity, { ...entry, id: entry.id ?? createId() }];
  saveActivityLog(next);
};

export const pushNotification = (
  notification: Omit<NotificationItem, "id" | "read" | "createdAt"> & { read?: boolean; createdAt?: string },
) => {
  const notifications = getNotifications();
  const createdAt = notification.createdAt ?? new Date().toISOString();
  const item: NotificationItem = {
    id: createId(),
    read: notification.read ?? false,
    createdAt,
    ...notification,
  };
  saveNotifications([item, ...notifications]);
};

const overlaps = (startA: string, endA: string, startB: string, endB: string) => {
  const sA = parseISO(startA);
  const eA = parseISO(endA);
  const sB = parseISO(startB);
  const eB = parseISO(endB);
  return sA < eB && sB < eA;
};

interface AvailabilityOptions {
  excludeAssignmentOrderId?: string;
  excludeScheduledId?: string;
}

export const isDriverAvailable = (
  driverId: string,
  start: string,
  end: string,
  options: AvailabilityOptions = {},
) => {
  const assignments = getAssignments();
  const scheduled = getScheduledAssignments();

  const hasAssignmentConflict = assignments.some(
    (assignment) =>
      assignment.driverId === driverId &&
      assignment.orderId !== options.excludeAssignmentOrderId &&
      overlaps(assignment.start, assignment.end, start, end),
  );

  if (hasAssignmentConflict) {
    return false;
  }

  const hasScheduledConflict = scheduled.some(
    (schedule) =>
      schedule.driverId === driverId &&
      schedule.status === "SCHEDULED" &&
      schedule.id !== options.excludeScheduledId &&
      overlaps(schedule.start, schedule.end, start, end),
  );

  return !hasScheduledConflict;
};

const updateOrder = (orderId: string, updater: (order: Order) => Order) => {
  const orders = getOrders();
  const nextOrders = orders.map((order) => (order.id === orderId ? updater(order) : order));
  saveOrders(nextOrders);
};

export const assignDriverNow = (
  orderId: string,
  driverId: string,
  options?: { start?: string; end?: string; source?: "manual" | "scheduled"; scheduledAssignmentId?: string },
) => {
  const driver = getDrivers().find((d) => d.id === driverId);
  if (!driver) {
    throw new Error("Driver not found");
  }

  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  const start = options?.start ?? new Date().toISOString();
  const end = options?.end ?? addHours(new Date(), DEFAULT_ASSIGNMENT_DURATION_HOURS).toISOString();

  updateOrder(orderId, (current) => ({
    ...current,
    driverId,
    driverAssignedAt: new Date().toISOString(),
    driverAssignmentWindow: { start, end },
    scheduledAssignmentId: options?.source === "scheduled" ? undefined : current.scheduledAssignmentId,
    scheduledAt: options?.source === "scheduled" ? undefined : current.scheduledAt,
    status: current.status === "En attente" ? "A VALIDER" : current.status,
  }));

  const assignments = getAssignments();
  const withoutOrder = assignments.filter((assignment) => assignment.orderId !== orderId);
  withoutOrder.push({
    id: createId(),
    orderId,
    driverId,
    start,
    end,
    createdAt: new Date().toISOString(),
  });
  saveAssignments(withoutOrder);

  if (options?.scheduledAssignmentId) {
    const scheduledAssignments = getScheduledAssignments();
    const updatedScheduled = scheduledAssignments.map((schedule) =>
      schedule.id === options.scheduledAssignmentId
        ? {
            ...schedule,
            status: "EXECUTED",
            executedAt: new Date().toISOString(),
          }
        : schedule,
    );
    saveScheduledAssignments(updatedScheduled);
  }

  appendActivity({
    type: options?.source === "scheduled" ? "EXECUTION" : "ASSIGN_NOW",
    orderId,
    driverId,
    at: new Date().toISOString(),
    by: options?.source === "scheduled" ? "scheduler" : "admin",
  });

  pushNotification({
    audience: "admin",
    title: options?.source === "scheduled" ? "Affectation exécutée" : "Chauffeur affecté",
    message:
      options?.source === "scheduled"
        ? `Affectation planifiée exécutée pour la commande ${orderId}`
        : `Un chauffeur a été affecté à la commande ${orderId}`,
  });

  pushNotification({
    audience: "client",
    title: "Chauffeur affecté",
    message:
      options?.source === "scheduled"
        ? `Votre commande ${orderId} vient de recevoir un chauffeur planifié.`
        : `Un chauffeur vient d'être assigné à la commande ${orderId}.`,
  });

  pushNotification({
    audience: "driver",
    title: "Nouvelle mission",
    message: `Vous avez été assigné à la commande ${orderId}.`,
    meta: { driverId },
  });
};

export const scheduleDriverAssignment = (
  orderId: string,
  driverId: string,
  scheduledAt: string,
  window?: { start?: string; end?: string },
) => {
  const start = window?.start ?? scheduledAt;
  const end = window?.end ?? addHours(parseISO(start), DEFAULT_ASSIGNMENT_DURATION_HOURS).toISOString();

  const scheduledAssignment: ScheduledAssignment = {
    id: createId(),
    orderId,
    driverId,
    scheduledAt,
    start,
    end,
    status: "SCHEDULED",
    createdAt: new Date().toISOString(),
  };

  const scheduledAssignments = getScheduledAssignments();
  saveScheduledAssignments([...scheduledAssignments, scheduledAssignment]);

  updateOrder(orderId, (current) => ({
    ...current,
    scheduledAssignmentId: scheduledAssignment.id,
    scheduledAt,
  }));

  appendActivity({
    type: "ASSIGN_SCHEDULED",
    orderId,
    driverId,
    scheduledAt,
    by: "admin",
  });

  pushNotification({
    audience: "admin",
    title: "Affectation planifiée",
    message: `Un chauffeur sera affecté à la commande ${orderId} le ${new Date(scheduledAt).toLocaleString("fr-FR")}.`,
  });

  pushNotification({
    audience: "client",
    title: "Planification confirmée",
    message: `Un chauffeur sera assigné à votre commande ${orderId} à l'heure prévue.`,
  });
};

export const cancelScheduledAssignment = (scheduleId: string) => {
  const scheduledAssignments = getScheduledAssignments();
  const updated = scheduledAssignments.map((schedule) =>
    schedule.id === scheduleId
      ? {
          ...schedule,
          status: "CANCELLED",
          reason: "Cancelled by admin",
        }
      : schedule,
  );
  saveScheduledAssignments(updated);

  const schedule = scheduledAssignments.find((item) => item.id === scheduleId);
  if (schedule) {
    updateOrder(schedule.orderId, (current) => ({
      ...current,
      scheduledAssignmentId: undefined,
      scheduledAt: undefined,
    }));

    appendActivity({
      type: "CANCELLED",
      orderId: schedule.orderId,
      driverId: schedule.driverId,
      at: new Date().toISOString(),
      by: "admin",
    });

    pushNotification({
      audience: "admin",
      title: "Planification annulée",
      message: `La planification de la commande ${schedule.orderId} a été annulée.`,
    });
  }
};

export const rescheduleDriverAssignment = (
  scheduleId: string,
  scheduledAt: string,
  window?: { start?: string; end?: string },
) => {
  const start = window?.start ?? scheduledAt;
  const end = window?.end ?? addHours(parseISO(start), DEFAULT_ASSIGNMENT_DURATION_HOURS).toISOString();

  const scheduledAssignments = getScheduledAssignments();
  const updated = scheduledAssignments.map((schedule) =>
    schedule.id === scheduleId
      ? {
          ...schedule,
          scheduledAt,
          start,
          end,
        }
      : schedule,
  );
  saveScheduledAssignments(updated);

  const schedule = updated.find((item) => item.id === scheduleId);
  if (schedule) {
    updateOrder(schedule.orderId, (current) => ({
      ...current,
      scheduledAt,
    }));

    appendActivity({
      type: "ASSIGN_SCHEDULED",
      orderId: schedule.orderId,
      driverId: schedule.driverId,
      scheduledAt,
      by: "admin",
    });

    pushNotification({
      audience: "admin",
      title: "Planification mise à jour",
      message: `La planification de la commande ${schedule.orderId} a été mise à jour.`,
    });
  }
};

export const removeDriverFromOrder = (orderId: string) => {
  updateOrder(orderId, (current) => ({
    ...current,
    driverId: undefined,
    driverAssignedAt: undefined,
    driverAssignmentWindow: undefined,
  }));

  const assignments = getAssignments();
  const nextAssignments = assignments.filter((assignment) => assignment.orderId !== orderId);
  saveAssignments(nextAssignments);

  appendActivity({
    type: "ASSIGN_REMOVED",
    orderId,
    at: new Date().toISOString(),
    by: "admin",
  });
};

export const updateOrderAdminNotes = (orderId: string, adminNotes: string) => {
  const orders = getOrders();
  if (!orders.some((order) => order.id === orderId)) {
    return { success: false as const };
  }

  updateOrder(orderId, (current) => ({
    ...current,
    adminNotes,
  }));

  appendActivity({
    type: "NOTES_UPDATED",
    orderId,
    at: new Date().toISOString(),
    by: "admin",
    payload: { notes: adminNotes },
  });

  return { success: true as const };
};

const addMilliseconds = (date: Date, amount: number) => new Date(date.getTime() + amount);

export const processScheduledAssignments = () => {
  const now = new Date();
  const scheduledAssignments = getScheduledAssignments();
  let dirty = false;

  scheduledAssignments
    .filter((item) => item.status === "SCHEDULED")
    .forEach((item) => {
      const triggerTime = parseISO(item.scheduledAt);
      if (isBefore(triggerTime, addMilliseconds(now, 1)) || isEqual(triggerTime, now)) {
        const available = isDriverAvailable(item.driverId, item.start, item.end, {
          excludeAssignmentOrderId: item.orderId,
          excludeScheduledId: item.id,
        });
        if (available) {
          assignDriverNow(item.orderId, item.driverId, {
            start: item.start,
            end: item.end,
            source: "scheduled",
            scheduledAssignmentId: item.id,
          });
        } else {
          const updated = scheduledAssignments.map((schedule) =>
            schedule.id === item.id
              ? {
                  ...schedule,
                  status: "FAILED",
                  reason: "Driver unavailable",
                }
              : schedule,
          );
          saveScheduledAssignments(updated);

          appendActivity({
            type: "FAILED",
            orderId: item.orderId,
            driverId: item.driverId,
            at: new Date().toISOString(),
            by: "scheduler",
            payload: { reason: "Driver unavailable" },
          });

          pushNotification({
            audience: "admin",
            title: "Échec planification",
            message: `Échec de l'affectation planifiée pour ${item.orderId} — chauffeur indisponible`,
            actionLabel: "Replanifier",
          });
        }
        dirty = true;
      }
    });

  if (dirty) {
    notifyChange([
      STORAGE_KEYS.orders,
      STORAGE_KEYS.assignments,
      STORAGE_KEYS.scheduledAssignments,
      STORAGE_KEYS.activity,
      STORAGE_KEYS.notifications,
    ]);
  }
};

export const isFuture = (isoDate: string) => {
  const date = parseISO(isoDate);
  return isAfter(date, new Date());
};

export const formatDateTime = (isoDate: string) => {
  const date = parseISO(isoDate);
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getDriverById = (driverId?: string) => {
  if (!driverId) {
    return undefined;
  }
  return getDrivers().find((driver) => driver.id === driverId);
};

export const getOrderById = (orderId: string) => getOrders().find((order) => order.id === orderId);

export const getScheduledAssignmentForOrder = (orderId: string) =>
  getScheduledAssignments().find(
    (assignment) => assignment.orderId === orderId && assignment.status === "SCHEDULED",
  );

export const getDriverAvailabilityWindow = (order: Order) => {
  const baseStart = order.scheduledAt ?? order.driverAssignedAt ?? order.windowStart ?? new Date().toISOString();
  const start = baseStart;
  const end = addHours(parseISO(start), DEFAULT_ASSIGNMENT_DURATION_HOURS).toISOString();
  return {
    start,
    end,
  };
};

