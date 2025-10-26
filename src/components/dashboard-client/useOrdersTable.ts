import { useMemo, useRef, useState } from "react";
import { type ColumnDef, type SortingState, type Table, useReactTable } from "@tanstack/react-table";
import { type VirtualItem, useVirtualizer } from "@tanstack/react-virtual";

import type { Order, OrderStatus } from "./orders.types";

type StatusFilter = OrderStatus | "all";

type UseOrdersTableParams = {
  orders: Order[];
  columns: ColumnDef<Order>[];
};

type UseOrdersTableResult = {
  table: Table<Order>;
  statusFilter: StatusFilter;
  setStatusFilter: (status: StatusFilter) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filteredCount: number;
  sorting: SortingState;
  setSorting: (updater: SortingState | ((prev: SortingState) => SortingState)) => void;
  tableContainerRef: React.RefObject<HTMLDivElement>;
  enableVirtualization: boolean;
  virtualItems: VirtualItem[];
  totalSize?: number;
};

const sanitize = (value: string) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "in_transit", label: "En transit" },
  { id: "delivered", label: "Livrés" },
  { id: "pending", label: "En attente" },
  { id: "cancelled", label: "Annulés" },
];

export const useOrdersTable = ({ orders, columns }: UseOrdersTableParams): UseOrdersTableResult => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);

  const filteredOrders = useMemo(() => {
    if (!orders.length) {
      return [] as Order[];
    }

    const normalizedQuery = sanitize(searchQuery);

    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        order.order_number,
        order.driver?.name,
        order.driver?.vehicle,
        order.delivery?.address,
        order.status_label,
      ]
        .filter(Boolean)
        .map((value) => sanitize(value as string))
        .join(" ");

      return haystack.includes(normalizedQuery);
    });
  }, [orders, statusFilter, searchQuery]);

  const table = useReactTable<Order>({
    data: filteredOrders,
    columns,
    state: { sorting },
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const enableVirtualization = filteredOrders.length > 30;

  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => tableContainerRef.current,
    count: enableVirtualization ? table.getRowModel().rows.length : 0,
    estimateSize: () => 56,
    overscan: 6,
  });

  const virtualItems = enableVirtualization ? rowVirtualizer.getVirtualItems() : [];
  const totalSize = enableVirtualization ? rowVirtualizer.getTotalSize() : undefined;

  return {
    table,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    filteredCount: filteredOrders.length,
    sorting,
    setSorting,
    tableContainerRef,
    enableVirtualization,
    virtualItems,
    totalSize,
  };
};
