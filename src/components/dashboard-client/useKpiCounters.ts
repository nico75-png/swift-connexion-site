import { useMemo } from "react";

import type { Order } from "./orders.types";

type UseKpiCountersParams = {
  orders: Order[];
  isLoading: boolean;
};

type KpiCounters = {
  deliveredCount: number;
  totalVolume: number;
  trendPercentage: number | null;
  upcomingDelivery?: Order;
  isLoading: boolean;
};

const DAYS_WINDOW = 7;

export const useKpiCounters = ({ orders, isLoading }: UseKpiCountersParams): KpiCounters => {
  return useMemo(() => {
    if (isLoading) {
      return {
        deliveredCount: 0,
        totalVolume: 0,
        trendPercentage: null,
        upcomingDelivery: undefined,
        isLoading: true,
      };
    }

    if (!orders.length) {
      return {
        deliveredCount: 0,
        totalVolume: 0,
        trendPercentage: null,
        upcomingDelivery: undefined,
        isLoading: false,
      };
    }

    const now = Date.now();
    const currentWindowStart = now - DAYS_WINDOW * 24 * 60 * 60 * 1000;
    const previousWindowStart = now - 2 * DAYS_WINDOW * 24 * 60 * 60 * 1000;

    const deliveredCount = orders.filter((order) => order.status === "delivered").length;
    const totalVolume = orders.reduce((sum, order) => sum + order.total_amount, 0);

    let currentWindowTotal = 0;
    let previousWindowTotal = 0;

    for (const order of orders) {
      const created = new Date(order.created_at).getTime();
      if (created >= currentWindowStart) {
        currentWindowTotal += order.total_amount;
      } else if (created >= previousWindowStart && created < currentWindowStart) {
        previousWindowTotal += order.total_amount;
      }
    }

    const trendPercentage =
      previousWindowTotal > 0
        ? Number((((currentWindowTotal - previousWindowTotal) / previousWindowTotal) * 100).toFixed(1))
        : currentWindowTotal > 0
          ? 100
          : null;

    const upcomingDelivery = [...orders]
      .filter((order) => order.delivery?.expected_date)
      .sort((a, b) => {
        const aTime = new Date(a.delivery?.expected_date ?? 0).getTime();
        const bTime = new Date(b.delivery?.expected_date ?? 0).getTime();
        return aTime - bTime;
      })
      .find((order) => new Date(order.delivery?.expected_date ?? 0).getTime() >= now);

    return {
      deliveredCount,
      totalVolume,
      trendPercentage,
      upcomingDelivery,
      isLoading: false,
    };
  }, [orders, isLoading]);
};
