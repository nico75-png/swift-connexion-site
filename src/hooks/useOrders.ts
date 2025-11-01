import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { useAuth } from "@/providers/AuthProvider";

type OrderStatus = NonNullable<Tables<"orders">["status"]>;

type StatusFilter = "all" | "active" | "delivered" | "cancelled";

interface DateRangeFilter {
  start: Date | null;
  end: Date | null;
}

interface AdvancedFilters {
  packageTypes: string[];
  driverId?: string;
}

interface InternalFilters {
  status: StatusFilter;
  search: string;
  dateRange: DateRangeFilter;
  packageTypes: string[];
  driverId?: string;
}

export interface DriverOption {
  id: string;
  name: string;
  availability: boolean | null;
  vehicleType: string | null;
}

export interface ClientOption {
  id: string;
  company: string;
  contactName: string | null;
  userId: string;
  defaultPickup: string | null;
  defaultDelivery: string | null;
}

export interface OrderListItem {
  id: string;
  clientName: string;
  driverName: string | null;
  driverId: string | null;
  status: OrderStatus;
  dateLabel: string;
  etaLabel: string;
  scheduleStart: string | null;
  scheduleEnd: string | null;
  packageType: string | null;
  amount: number | null;
  pickupAddress: string | null;
  deliveryAddress: string | null;
  updatedAt: string | null;
}

export interface OrdersSummary {
  missions: number;
  urgent: number;
  lastUpdateIso: string | null;
  lastUpdateLabel: string;
}

export interface CreateOrderInput {
  clientId: string;
  driverId?: string;
  packageType: string;
  amount: number;
  eta: string;
  notes?: string;
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  message?: string;
}

export interface AssignDriverResult {
  success: boolean;
  message?: string;
}

export interface ExportOrdersResult {
  success: boolean;
  message?: string;
}

export interface UseOrdersResult {
  orders: OrderListItem[];
  unassignedOrders: OrderListItem[];
  summary: OrdersSummary;
  isLoading: boolean;
  error: string | null;
  statusFilter: StatusFilter;
  searchTerm: string;
  dateRange: DateRangeFilter;
  advancedFilters: AdvancedFilters;
  availablePackageTypes: string[];
  drivers: DriverOption[];
  clients: ClientOption[];
  isCreating: boolean;
  isAssigning: boolean;
  isExporting: boolean;
  setStatusFilter: (status: StatusFilter) => void;
  setSearchTerm: (value: string) => void;
  setDateRange: (value: DateRangeFilter) => void;
  setAdvancedFilters: (value: AdvancedFilters) => void;
  refresh: () => Promise<void>;
  createOrder: (input: CreateOrderInput) => Promise<CreateOrderResult>;
  assignDriver: (orderId: string, driverId: string) => Promise<AssignDriverResult>;
  exportOrders: () => Promise<ExportOrdersResult>;
}

const STATUS_GROUPS: Record<StatusFilter, OrderStatus[] | null> = {
  all: null,
  active: ["pending", "scheduled", "in_transit"],
  delivered: ["delivered"],
  cancelled: ["cancelled"],
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "En attente",
  scheduled: "Planifiée",
  in_transit: "En cours",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const ORDER_EVENTS_CHANNEL = "admin-orders-realtime";
const ORDER_EVENTS_TABLE = "order_events" as const;

const formatDateLabel = (iso: string | null): string => {
  if (!iso) {
    return "—";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatTimeLabel = (iso: string | null): string => {
  if (!iso) {
    return "—";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatRelative = (iso: string | null): string => {
  if (!iso) {
    return "—";
  }
  const value = new Date(iso).getTime();
  if (Number.isNaN(value)) {
    return "—";
  }
  const now = Date.now();
  const diff = value - now;
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
  ];
  for (const [unit, factor] of units) {
    const amount = diff / factor;
    if (Math.abs(amount) >= (unit === "minute" ? 1 : 0.8)) {
      const formatter = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
      return formatter.format(Math.round(amount), unit);
    }
  }
  const formatter = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
  return formatter.format(Math.round(diff / (1000 * 60)), "minute");
};

const generateOrderReference = () => {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  const year = new Date().getFullYear();
  return `CMD-${year}-${random}`;
};

const useDebouncedValue = <T,>(value: T, delay: number) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(handle);
  }, [value, delay]);

  return debounced;
};

export const useOrders = (): UseOrdersResult => {
  const { session, userRole } = useAuth();

  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [rawOrders, setRawOrders] = useState<Tables<"orders">[]>([]);
  const [summary, setSummary] = useState<OrdersSummary>({
    missions: 0,
    urgent: 0,
    lastUpdateIso: null,
    lastUpdateLabel: "—",
  });
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const clientsRef = useRef<ClientOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<InternalFilters>({
    status: "all",
    search: "",
    dateRange: { start: null, end: null },
    packageTypes: [],
    driverId: undefined,
  });

  const debouncedSearch = useDebouncedValue(filters.search, 350);

  useEffect(() => {
    clientsRef.current = clients;
  }, [clients]);

  const loadClients = useCallback(async () => {
    if (userRole !== "admin") {
      return;
    }
    const { data, error: fetchError } = await supabase
      .from("client_profiles")
      .select("id, user_id, company, contact_name, default_pickup_address, default_delivery_address")
      .order("company", { ascending: true });

    if (fetchError) {
      console.error("Failed to fetch clients", fetchError);
      return;
    }

    const mapped: ClientOption[] = (data ?? []).map((entry) => ({
      id: entry.id,
      company: entry.company ?? "Client Swift",
      contactName: entry.contact_name,
      userId: entry.user_id ?? entry.id,
      defaultPickup: entry.default_pickup_address ?? null,
      defaultDelivery: entry.default_delivery_address ?? null,
    }));

    setClients(mapped);
  }, [userRole]);

  const loadDrivers = useCallback(async () => {
    if (userRole !== "admin") {
      return;
    }

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "driver");

    if (roleError) {
      console.error("Failed to fetch driver roles", roleError);
      return;
    }

    const driverIds = Array.from(new Set((roleData ?? []).map((entry) => entry.user_id).filter(Boolean)));

    if (driverIds.length === 0) {
      setDrivers([]);
      return;
    }

    const [{ data: driverRows, error: driverError }, { data: profileRows, error: profileError }] = await Promise.all([
      supabase.from("drivers").select("id, availability, vehicle_type").in("id", driverIds),
      supabase
        .from("profiles")
        .select("id, display_name, first_name, last_name")
        .in("id", driverIds),
    ]);

    if (driverError) {
      console.error("Failed to fetch drivers", driverError);
    }

    if (profileError) {
      console.error("Failed to fetch driver profiles", profileError);
    }

    const driverMap = new Map<string, Tables<"drivers">>();
    (driverRows ?? []).forEach((row) => {
      if (row?.id) {
        driverMap.set(row.id, row);
      }
    });

    const mapped: DriverOption[] = (profileRows ?? [])
      .filter((profile): profile is NonNullable<typeof profile> => Boolean(profile?.id))
      .map((profile) => {
        const driverRow = driverMap.get(profile.id);
        const pieces = [profile.display_name, profile.first_name, profile.last_name].filter(Boolean);
        const name = pieces.length > 0 ? pieces[0] ?? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() : profile.id;
        return {
          id: profile.id,
          name: name || profile.id,
          availability: driverRow?.availability ?? null,
          vehicleType: driverRow?.vehicle_type ?? null,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));

    setDrivers(mapped);
  }, [userRole]);

  const fetchOrders = useCallback(async () => {
    if (userRole !== "admin") {
      setOrders([]);
      setSummary({ missions: 0, urgent: 0, lastUpdateIso: null, lastUpdateLabel: "—" });
      return;
    }

    setIsLoading(true);
    try {
      let query = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      const statuses = STATUS_GROUPS[filters.status];
      if (statuses && statuses.length > 0) {
        if (statuses.length === 1) {
          query = query.eq("status", statuses[0]);
        } else {
          query = query.in("status", statuses);
        }
      }

      if (filters.dateRange.start) {
        query = query.gte("schedule_start", filters.dateRange.start.toISOString());
      }

      if (filters.dateRange.end) {
        query = query.lte("schedule_start", filters.dateRange.end.toISOString());
      }

      if (filters.packageTypes.length > 0) {
        query = query.in("package_type", filters.packageTypes);
      }

      if (filters.driverId === "__unassigned__") {
        query = query.is("driver_id", null);
      } else if (filters.driverId) {
        query = query.eq("driver_id", filters.driverId);
      }

      if (debouncedSearch.trim().length > 0) {
        const likeTerm = `%${debouncedSearch.trim()}%`;
        query = query.or(
          [
            `id.ilike.${likeTerm}`,
            `customer_company.ilike.${likeTerm}`,
            `pickup_address.ilike.${likeTerm}`,
            `delivery_address.ilike.${likeTerm}`,
          ].join(","),
        );
      }

      const { data, error: ordersError } = await query;

      if (ordersError) {
        throw ordersError;
      }

      const safeData = data ?? [];
      setRawOrders(safeData);

      const clientIds = Array.from(new Set(safeData.map((order) => order.client_id).filter((value): value is string => Boolean(value))));
      const driverIds = Array.from(new Set(safeData.map((order) => order.driver_id).filter((value): value is string => Boolean(value))));

      const [{ data: clientRows, error: clientError }, { data: driverProfileRows, error: driverProfileError }] = await Promise.all([
        clientIds.length > 0
          ? supabase
              .from("client_profiles")
              .select("id, company, contact_name")
              .in("id", clientIds)
          : Promise.resolve({ data: null, error: null }),
        driverIds.length > 0
          ? supabase
              .from("profiles")
              .select("id, display_name, first_name, last_name")
              .in("id", driverIds)
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (clientError) {
        console.error("Failed to hydrate clients", clientError);
      }

      if (driverProfileError) {
        console.error("Failed to hydrate driver profiles", driverProfileError);
      }

      const clientMap = new Map<string, { company: string | null; contactName: string | null }>();
      (clientRows ?? []).forEach((row) => {
        if (row?.id) {
          clientMap.set(row.id, { company: row.company, contactName: row.contact_name });
        }
      });

      const driverProfileMap = new Map<string, { name: string }>();
      (driverProfileRows ?? []).forEach((row) => {
        if (!row?.id) return;
        const candidates = [row.display_name, row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : null]
          .filter((value): value is string => Boolean(value && value.trim()));
        const name = candidates[0] ?? row.id;
        driverProfileMap.set(row.id, { name });
      });

      const mapped: OrderListItem[] = safeData.map((order) => {
        const client = order.client_id ? clientMap.get(order.client_id) : null;
        const driver = order.driver_id ? driverProfileMap.get(order.driver_id) : null;
        const status = order.status ?? "pending";
        return {
          id: order.id,
          clientName: client?.company || order.customer_company || "Client Swift",
          driverName: driver?.name ?? null,
          driverId: order.driver_id ?? null,
          status,
          dateLabel: formatDateLabel(order.created_at ?? order.schedule_start ?? order.updated_at),
          etaLabel: formatTimeLabel(order.schedule_end ?? order.schedule_start),
          scheduleStart: order.schedule_start,
          scheduleEnd: order.schedule_end,
          packageType: order.package_type,
          amount: order.amount,
          pickupAddress: order.pickup_address,
          deliveryAddress: order.delivery_address,
          updatedAt: order.updated_at ?? order.created_at,
        };
      });

      const missions = safeData.filter((order) =>
        order.status && STATUS_GROUPS.active?.includes(order.status as OrderStatus),
      ).length;

      const urgentThreshold = Date.now() + 1000 * 60 * 120;
      const urgent = safeData.filter((order) => {
        if (!order.status || order.status === "delivered" || order.status === "cancelled") {
          return false;
        }
        if (!order.schedule_start) {
          return true;
        }
        const start = new Date(order.schedule_start).getTime();
        if (Number.isNaN(start)) {
          return true;
        }
        return start <= urgentThreshold;
      }).length;

      const lastUpdateIso = safeData.reduce<string | null>((latest, order) => {
        const candidate = order.updated_at ?? order.created_at ?? null;
        if (!candidate) {
          return latest;
        }
        if (!latest) {
          return candidate;
        }
        return candidate > latest ? candidate : latest;
      }, null);

      setSummary({
        missions,
        urgent,
        lastUpdateIso,
        lastUpdateLabel: formatRelative(lastUpdateIso),
      });

      setOrders(mapped);
      setError(null);
    } catch (fetchError) {
      console.error("Failed to fetch orders", fetchError);
      const message =
        fetchError instanceof Error ? fetchError.message : "Impossible de charger les commandes";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, filters.dateRange.end, filters.dateRange.start, filters.driverId, filters.packageTypes, filters.status, userRole]);

  useEffect(() => {
    if (userRole !== "admin") {
      return;
    }
    void loadClients();
    void loadDrivers();
  }, [loadClients, loadDrivers, userRole]);

  useEffect(() => {
    if (userRole !== "admin") {
      return;
    }
    void fetchOrders();
  }, [fetchOrders, userRole]);

  useEffect(() => {
    if (userRole !== "admin") {
      return;
    }

    const channel = supabase
      .channel(ORDER_EVENTS_CHANNEL)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        void fetchOrders();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: ORDER_EVENTS_TABLE }, () => {
        void fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, userRole]);

  const availablePackageTypes = useMemo(() => {
    const types = new Set<string>();
    for (const order of rawOrders) {
      if (order.package_type) {
        types.add(order.package_type);
      }
    }
    return Array.from(types).sort((a, b) => a.localeCompare(b, "fr"));
  }, [rawOrders]);

  const unassignedOrders = useMemo(
    () => orders.filter((order) => !order.driverId || order.status === "pending"),
    [orders],
  );

  const setStatusFilter = useCallback((status: StatusFilter) => {
    setFilters((previous) => ({ ...previous, status }));
  }, []);

  const setSearchTerm = useCallback((value: string) => {
    setFilters((previous) => ({ ...previous, search: value }));
  }, []);

  const setDateRange = useCallback((value: DateRangeFilter) => {
    setFilters((previous) => ({ ...previous, dateRange: value }));
  }, []);

  const setAdvancedFilters = useCallback((value: AdvancedFilters) => {
    setFilters((previous) => ({
      ...previous,
      packageTypes: value.packageTypes,
      driverId: value.driverId,
    }));
  }, []);

  const createOrder = useCallback(
    async (input: CreateOrderInput): Promise<CreateOrderResult> => {
      if (userRole !== "admin") {
        return { success: false, message: "Accès refusé" };
      }

      const client = clientsRef.current.find((entry) => entry.id === input.clientId);
      if (!client) {
        return { success: false, message: "Client introuvable" };
      }

      const etaDate = new Date(input.eta);
      if (Number.isNaN(etaDate.getTime())) {
        return { success: false, message: "ETA invalide" };
      }

      const scheduleEnd = etaDate.toISOString();
      const scheduleStart = new Date(etaDate.getTime() - 45 * 60 * 1000).toISOString();
      const nowIso = new Date().toISOString();
      const orderId = generateOrderReference();

      const record: TablesInsert<"orders"> = {
        id: orderId,
        customer_id: client.userId,
        client_id: client.id,
        customer_company: client.company,
        sector: null,
        package_type: input.packageType,
        package_note: input.notes?.trim() ? input.notes.trim() : null,
        pickup_address: client.defaultPickup ?? "Adresse à confirmer",
        delivery_address: client.defaultDelivery ?? "Adresse de livraison à confirmer",
        schedule_start: scheduleStart,
        schedule_end: scheduleEnd,
        amount: input.amount,
        currency: "EUR",
        status: input.driverId ? "scheduled" : "pending",
        driver_id: input.driverId ?? null,
        driver_assigned_at: input.driverId ? nowIso : null,
        driver_instructions: input.notes?.trim() ? input.notes.trim() : null,
        weight_kg: null,
        volume_m3: null,
        total_amount: null,
        parcel_info: null,
        scheduled_at: scheduleStart,
        created_at: nowIso,
        updated_at: nowIso,
        delivery_address_id: null,
        pickup_address_id: null,
      };

      setIsCreating(true);
      try {
        const { error: insertError } = await supabase.from("orders").insert(record);
        if (insertError) {
          throw insertError;
        }

        const eventPayload: TablesInsert<"order_events"> = {
          order_id: orderId,
          event: "order_created",
          metadata: {
            client_id: client.id,
            package_type: input.packageType,
          },
          created_at: nowIso,
          created_by: session?.user?.id ?? null,
        };

        const { error: eventError } = await supabase
          .from(ORDER_EVENTS_TABLE)
          .insert(eventPayload);
        if (eventError) {
          console.warn("Failed to insert order event", eventError);
        }

        if (input.driverId) {
          const assignEvent: TablesInsert<"order_events"> = {
            order_id: orderId,
            event: "driver_assigned",
            metadata: { driver_id: input.driverId },
            created_at: nowIso,
            created_by: session?.user?.id ?? null,
          };
          const { error: assignEventError } = await supabase
            .from(ORDER_EVENTS_TABLE)
            .insert(assignEvent);
          if (assignEventError) {
            console.warn("Failed to insert driver assignment event", assignEventError);
          }
        }

        await fetchOrders();
        return { success: true, orderId };
      } catch (createError) {
        console.error("Failed to create order", createError);
        const message =
          createError instanceof Error ? createError.message : "Création impossible";
        return { success: false, message };
      } finally {
        setIsCreating(false);
      }
    },
    [fetchOrders, session?.user?.id, userRole],
  );

  const assignDriver = useCallback(
    async (orderId: string, driverId: string): Promise<AssignDriverResult> => {
      if (!driverId) {
        return { success: false, message: "Chauffeur requis" };
      }

      setIsAssigning(true);
      try {
        const nowIso = new Date().toISOString();
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            driver_id: driverId,
            status: "in_transit",
            driver_assigned_at: nowIso,
            updated_at: nowIso,
          })
          .eq("id", orderId);

        if (updateError) {
          throw updateError;
        }

        const eventPayload: TablesInsert<"order_events"> = {
          order_id: orderId,
          event: "driver_assigned",
          metadata: { driver_id: driverId },
          created_at: nowIso,
          created_by: session?.user?.id ?? null,
        };

        const { error: eventError } = await supabase
          .from(ORDER_EVENTS_TABLE)
          .insert(eventPayload);

        if (eventError) {
          console.warn("Failed to register order event", eventError);
        }

        await fetchOrders();

        return { success: true };
      } catch (assignError) {
        console.error("Failed to assign driver", assignError);
        const message =
          assignError instanceof Error ? assignError.message : "Affectation impossible";
        return { success: false, message };
      } finally {
        setIsAssigning(false);
      }
    },
    [fetchOrders, session?.user?.id],
  );

  const exportOrders = useCallback(async (): Promise<ExportOrdersResult> => {
    if (orders.length === 0) {
      return { success: false, message: "Aucune commande à exporter" };
    }

    if (typeof window === "undefined") {
      return { success: false, message: "Export non supporté" };
    }

    setIsExporting(true);
    try {
      const header = ["Référence", "Client", "Chauffeur", "Statut", "Date", "ETA", "Type", "Montant"];
      const rows = orders.map((order) => [
        order.id,
        order.clientName,
        order.driverName ?? "—",
        STATUS_LABELS[order.status],
        order.dateLabel,
        order.etaLabel,
        order.packageType ?? "—",
        order.amount != null ? String(order.amount) : "—",
      ]);

      const csvLines = [header, ...rows].map((line) =>
        line
          .map((cell) => {
            const needsQuotes = /[";,\n]/.test(cell);
            const escaped = cell.replace(/"/g, '""');
            return needsQuotes ? `"${escaped}"` : escaped;
          })
          .join(";"),
      );

      const csvContent = `\ufeff${csvLines.join("\n")}`;
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `commandes_${new Date().toISOString().slice(0, 10)}.csv`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (exportError) {
      console.error("Failed to export orders", exportError);
      const message =
        exportError instanceof Error ? exportError.message : "Export impossible";
      return { success: false, message };
    } finally {
      setIsExporting(false);
    }
  }, [orders]);

  return {
    orders,
    unassignedOrders,
    summary,
    isLoading,
    error,
    statusFilter: filters.status,
    searchTerm: filters.search,
    dateRange: filters.dateRange,
    advancedFilters: { packageTypes: filters.packageTypes, driverId: filters.driverId },
    availablePackageTypes,
    drivers,
    clients,
    isCreating,
    isAssigning,
    isExporting,
    setStatusFilter,
    setSearchTerm,
    setDateRange,
    setAdvancedFilters,
    refresh: fetchOrders,
    createOrder,
    assignDriver,
    exportOrders,
  };
};

