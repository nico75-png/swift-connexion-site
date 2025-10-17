import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityEntry,
  Assignment,
  Driver,
  NotificationEntry,
  Order,
  ScheduledAssignment,
  getActivityLog,
  getAssignments,
  createDriver as createDriverInStore,
  type CreateDriverPayload,
  type CreateDriverResult,
  getDrivers,
  getNotifications,
  getOrders,
  getScheduledAssignments,
  saveNotifications,
} from "@/lib/stores/driversOrders.store";
import {
  assignDriver as assignDriverService,
  cancelScheduledAssignment as cancelScheduledAssignmentService,
  processScheduledAssignments,
  reassignDriver as reassignDriverService,
  scheduleDriverAssignment as scheduleDriverAssignmentService,
  unassignDriver as unassignDriverService,
} from "@/lib/services/assign.service";

interface AdminDataContextValue {
  ready: boolean;
  orders: Order[];
  drivers: Driver[];
  assignments: Assignment[];
  scheduledAssignments: ScheduledAssignment[];
  activityLog: ActivityEntry[];
  notifications: NotificationEntry[];
  refreshAll: () => void;
  refetchOrder: (orderId: string) => Order | null;
  assignDriver: typeof assignDriverService;
  reassignDriver: typeof reassignDriverService;
  unassignDriver: typeof unassignDriverService;
  scheduleDriverAssignment: typeof scheduleDriverAssignmentService;
  cancelScheduledAssignment: typeof cancelScheduledAssignmentService;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  createDriver: (payload: CreateDriverPayload) => CreateDriverResult;
}

const AdminDataContext = createContext<AdminDataContextValue | undefined>(undefined);

const storageKeys = new Set([
  "oc_orders",
  "oc_drivers",
  "oc_assignments",
  "oc_scheduled_assignments",
  "oc_activity_log",
  "oc_notifications",
]);

export const AdminDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [scheduledAssignments, setScheduledAssignments] = useState<ScheduledAssignment[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);

  const hydrate = useCallback(() => {
    setOrders(getOrders());
    setDrivers(getDrivers());
    setAssignments(getAssignments());
    setScheduledAssignments(getScheduledAssignments());
    setActivityLog(getActivityLog());
    setNotifications(getNotifications());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    hydrate();
    setReady(true);

    const interval = window.setInterval(() => {
      processScheduledAssignments();
      hydrate();
    }, 45000);

    const handleStorage = (event: StorageEvent) => {
      if (event.key && storageKeys.has(event.key)) {
        hydrate();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.clearInterval(interval);
    };
  }, [hydrate]);

  const refreshAll = useCallback(() => {
    hydrate();
  }, [hydrate]);

  const refetchOrder = useCallback<AdminDataContextValue["refetchOrder"]>((orderId) => {
    const nextOrders = getOrders();
    const nextAssignments = getAssignments();
    const nextScheduledAssignments = getScheduledAssignments();
    const nextActivity = getActivityLog();
    const nextNotifications = getNotifications();

    setOrders(nextOrders);
    setDrivers(getDrivers());
    setAssignments(nextAssignments);
    setScheduledAssignments(nextScheduledAssignments);
    setActivityLog(nextActivity);
    setNotifications(nextNotifications);

    return nextOrders.find((item) => item.id === orderId) ?? null;
  }, []);

  const assignDriver = useCallback<AdminDataContextValue["assignDriver"]>((orderId, driverId) => {
    const result = assignDriverService(orderId, driverId);
    refreshAll();
    return result;
  }, [refreshAll]);

  const reassignDriver = useCallback<AdminDataContextValue["reassignDriver"]>((orderId, driverId) => {
    const result = reassignDriverService(orderId, driverId);
    refreshAll();
    return result;
  }, [refreshAll]);

  const unassignDriver = useCallback<AdminDataContextValue["unassignDriver"]>((orderId) => {
    const result = unassignDriverService(orderId);
    refreshAll();
    return result;
  }, [refreshAll]);

  const scheduleDriverAssignment = useCallback<AdminDataContextValue["scheduleDriverAssignment"]>((orderId, driverId, executeAt) => {
    const result = scheduleDriverAssignmentService(orderId, driverId, executeAt);
    refreshAll();
    return result;
  }, [refreshAll]);

  const cancelScheduledAssignment = useCallback<AdminDataContextValue["cancelScheduledAssignment"]>((scheduledId) => {
    const result = cancelScheduledAssignmentService(scheduledId);
    refreshAll();
    return result;
  }, [refreshAll]);

  const createDriver = useCallback<AdminDataContextValue["createDriver"]>((payload) => {
    const result = createDriverInStore(payload);
    if (result.success) {
      refreshAll();
    }
    return result;
  }, [refreshAll]);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((current) => {
      const updated = current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      );
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((current) => {
      const updated = current.map((notification) => ({ ...notification, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const value = useMemo<AdminDataContextValue>(() => ({
    ready,
    orders,
    drivers,
    assignments,
    scheduledAssignments,
    activityLog,
    notifications,
    refreshAll,
    refetchOrder,
    assignDriver,
    reassignDriver,
    unassignDriver,
    scheduleDriverAssignment,
    cancelScheduledAssignment,
    createDriver,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  }), [
    ready,
    orders,
    drivers,
    assignments,
    scheduledAssignments,
    activityLog,
    notifications,
    refreshAll,
    refetchOrder,
    assignDriver,
    reassignDriver,
    unassignDriver,
    scheduleDriverAssignment,
    cancelScheduledAssignment,
    createDriver,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  ]);

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};

const useAdminDataContext = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminDataContext must be used within an AdminDataProvider");
  }
  return context;
};

export const useOrdersStore = () => {
  const {
    ready,
    orders,
    assignments,
    scheduledAssignments,
    refetchOrder,
    assignDriver,
    reassignDriver,
    unassignDriver,
    scheduleDriverAssignment,
    cancelScheduledAssignment,
    refreshAll,
  } = useAdminDataContext();
  return {
    ready,
    orders,
    assignments,
    scheduledAssignments,
    refetchOrder,
    assignDriver,
    reassignDriver,
    unassignDriver,
    scheduleDriverAssignment,
    cancelScheduledAssignment,
    refreshAll,
  };
};

export const useDriversStore = () => {
  const { ready, drivers, refreshAll, createDriver } = useAdminDataContext();
  return { ready, drivers, refreshAll, createDriver };
};

export const useActivityLogStore = () => {
  const { ready, activityLog, refreshAll } = useAdminDataContext();
  return { ready, activityLog, refreshAll };
};

export const useNotificationsStore = () => {
  const { ready, notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAdminDataContext();
  return { ready, notifications, markNotificationAsRead, markAllNotificationsAsRead };
};

export const useAdminData = () => useAdminDataContext();
