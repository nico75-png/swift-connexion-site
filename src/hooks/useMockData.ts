import { useCallback, useEffect, useMemo, useState } from "react";

import {
  STORAGE_EVENT,
  STORAGE_KEYS,
  type Assignment,
  type ActivityEntry,
  type Driver,
  type NotificationItem,
  type Order,
  type ScheduledAssignment,
  getAssignments,
  getActivityLog,
  getDrivers,
  getNotifications,
  getOrderById,
  getOrders,
  getScheduledAssignmentForOrder,
  getScheduledAssignments,
  initializeMockData,
} from "@/lib/mockData";

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

const useStorageCollection = <T>(selector: () => T, watchKeys: readonly StorageKey[]) => {
  const [data, setData] = useState<T>(() => selector());

  useEffect(() => {
    initializeMockData();
    setData(selector());

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ keys?: string[] }>;
      const updatedKeys = customEvent.detail?.keys ?? [];
      if (updatedKeys.length === 0 || updatedKeys.some((key) => watchKeys.includes(key as StorageKey))) {
        setData(selector());
      }
    };

    window.addEventListener(STORAGE_EVENT, handler as EventListener);
    return () => {
      window.removeEventListener(STORAGE_EVENT, handler as EventListener);
    };
  }, [selector, watchKeys]);

  return data;
};

const WATCH_ORDERS = [STORAGE_KEYS.orders] as const;
const WATCH_DRIVERS = [STORAGE_KEYS.drivers] as const;
const WATCH_SCHEDULED = [STORAGE_KEYS.scheduledAssignments] as const;
const WATCH_SCHEDULED_AND_ORDERS = [STORAGE_KEYS.scheduledAssignments, STORAGE_KEYS.orders] as const;
const WATCH_ACTIVITY = [STORAGE_KEYS.activity] as const;
const WATCH_NOTIFICATIONS = [STORAGE_KEYS.notifications] as const;
const WATCH_ASSIGNMENTS = [STORAGE_KEYS.assignments] as const;

export const useOrders = () => useStorageCollection<Order[]>(getOrders, WATCH_ORDERS);

export const useOrder = (orderId?: string) => {
  const selector = useCallback(() => (orderId ? getOrderById(orderId) ?? null : null), [orderId]);
  return useStorageCollection(selector, WATCH_ORDERS);
};

export const useDrivers = () => useStorageCollection<Driver[]>(getDrivers, WATCH_DRIVERS);

export const useScheduledAssignments = () =>
  useStorageCollection<ScheduledAssignment[]>(getScheduledAssignments, WATCH_SCHEDULED);

export const useAssignments = () => useStorageCollection<Assignment[]>(getAssignments, WATCH_ASSIGNMENTS);

export const useScheduledAssignmentForOrder = (orderId?: string) => {
  const selector = useCallback(
    () => (orderId ? getScheduledAssignmentForOrder(orderId) ?? null : null),
    [orderId],
  );
  return useStorageCollection(selector, WATCH_SCHEDULED_AND_ORDERS);
};

export const useActivity = () => useStorageCollection<ActivityEntry[]>(getActivityLog, WATCH_ACTIVITY);

export const useNotifications = (audience?: string) => {
  const selector = useCallback(() => {
    const notifications = getNotifications();
    if (!audience) {
      return notifications;
    }
    return notifications.filter((item) => item.audience === audience);
  }, [audience]);

  const notifications = useStorageCollection<NotificationItem[]>(selector, WATCH_NOTIFICATIONS);

  const sorted = useMemo(
    () =>
      [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications],
  );

  return sorted;
};

