import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityEntry,
  Assignment,
  Driver,
  NotificationEntry,
  Order,
  getActivityLog,
  getAssignments,
  getDrivers,
  getNotifications,
  getOrders,
  saveNotifications,
} from "@/lib/stores/driversOrders.store";
import { assignDriver as assignDriverService, reassignDriver as reassignDriverService, unassignDriver as unassignDriverService } from "@/lib/services/assign.service";

interface AdminDataContextValue {
  ready: boolean;
  orders: Order[];
  drivers: Driver[];
  assignments: Assignment[];
  activityLog: ActivityEntry[];
  notifications: NotificationEntry[];
  refreshAll: () => void;
  assignDriver: typeof assignDriverService;
  reassignDriver: typeof reassignDriverService;
  unassignDriver: typeof unassignDriverService;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const AdminDataContext = createContext<AdminDataContextValue | undefined>(undefined);

const storageKeys = new Set([
  "oc_orders",
  "oc_drivers",
  "oc_assignments",
  "oc_activity_log",
  "oc_notifications",
]);

export const AdminDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);

  const hydrate = useCallback(() => {
    setOrders(getOrders());
    setDrivers(getDrivers());
    setAssignments(getAssignments());
    setActivityLog(getActivityLog());
    setNotifications(getNotifications());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    hydrate();
    setReady(true);

    const handleStorage = (event: StorageEvent) => {
      if (event.key && storageKeys.has(event.key)) {
        hydrate();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [hydrate]);

  const refreshAll = useCallback(() => {
    hydrate();
  }, [hydrate]);

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
    activityLog,
    notifications,
    refreshAll,
    assignDriver,
    reassignDriver,
    unassignDriver,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  }), [ready, orders, drivers, assignments, activityLog, notifications, refreshAll, assignDriver, reassignDriver, unassignDriver, markNotificationAsRead, markAllNotificationsAsRead]);

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
  const { ready, orders, assignments, assignDriver, reassignDriver, unassignDriver, refreshAll } = useAdminDataContext();
  return { ready, orders, assignments, assignDriver, reassignDriver, unassignDriver, refreshAll };
};

export const useDriversStore = () => {
  const { ready, drivers, refreshAll } = useAdminDataContext();
  return { ready, drivers, refreshAll };
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
