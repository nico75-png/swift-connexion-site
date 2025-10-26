import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  TrendingUp,
  Truck,
  Loader2,
  Search,
  ChevronRight,
  Info,
  Clock4,
  XOctagon,
} from "lucide-react";
import { createColumnHelper, flexRender } from "@tanstack/react-table";

import OrderDetailsModal from "@/components/orders/OrderDetailsModal";
import AnimatedCounter from "@/components/dashboard-client/AnimatedCounter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

import type { Order } from "./orders.types";
import { useKpiCounters } from "./useKpiCounters";
import { STATUS_FILTERS, useOrdersTable } from "./useOrdersTable";

const KPI_CARD_VARIANTS = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const STATUS_CONFIG = {
  in_transit: {
    label: "En transit",
    textClass: "text-[#1D4ED8]",
    bgClass: "bg-[#DBEAFE]",
    icon: Truck,
  },
  delivered: {
    label: "Livré",
    textClass: "text-[#047857]",
    bgClass: "bg-[#D1FAE5]",
    icon: CheckCircle2,
  },
  pending: {
    label: "En attente",
    textClass: "text-[#B45309]",
    bgClass: "bg-[#FEF3C7]",
    icon: Clock4,
  },
  cancelled: {
    label: "Annulée",
    textClass: "text-[#DC2626]",
    bgClass: "bg-[#FEE2E2]",
    icon: XOctagon,
  },
} as const satisfies Record<Order["status"], { label: string; textClass: string; bgClass: string; icon: typeof Truck }>;

const tableColumnHelper = createColumnHelper<Order>();

const KPI_CARD_TRANSITION = { duration: 0.2, ease: [0.16, 1, 0.3, 1] };

const MOCK_ORDERS: Order[] = [
  {
    id: "ord_001",
    order_number: "SC-2024-001",
    customer_id: "cust_001",
    created_at: "2024-10-12T08:30:00.000Z",
    updated_at: "2024-10-12T18:45:00.000Z",
    status: "delivered",
    status_label: "Livré",
    source: "Espace client",
    driver: {
      id: "driver_001",
      name: "Jean Martin",
      phone: "+33 6 12 34 56 78",
      vehicle: "Renault Master · AB-123-CD",
    },
    delivery: {
      address: "12 rue des Entrepreneurs, 75015 Paris",
      expected_date: "2024-10-13T14:30:00.000Z",
      status: "Livraison effectuée",
    },
    items: [
      {
        sku: "PAL-01",
        name: "Palette alimentaire",
        description: "Produits frais - 24 caisses",
        quantity: 1,
        unit_price: 89.9,
      },
      {
        sku: "COL-02",
        name: "Colis express",
        description: "Livraison J+1",
        quantity: 3,
        unit_price: 29.9,
      },
    ],
    payment: {
      subtotal: 179.6,
      fees: 4.5,
      method: "Carte bancaire",
    },
    total_amount: 184.1,
    currency: "EUR",
  },
  {
    id: "ord_002",
    order_number: "SC-2024-002",
    customer_id: "cust_001",
    created_at: "2024-10-14T09:10:00.000Z",
    updated_at: "2024-10-15T08:20:00.000Z",
    status: "in_transit",
    status_label: "En transit",
    source: "API partenaire",
    driver: {
      id: "driver_002",
      name: "Sophie Bernard",
      phone: "+33 7 98 76 54 32",
      vehicle: "Mercedes Sprinter · XY-456-ZA",
    },
    delivery: {
      address: "Zone logistique de Lyon, Bâtiment C",
      expected_date: "2024-10-16T10:00:00.000Z",
      status: "En cours d'acheminement",
    },
    items: [
      {
        sku: "BULK-45",
        name: "Lot industriel",
        description: "Composants électroniques",
        quantity: 12,
        unit_price: 54,
      },
    ],
    payment: {
      subtotal: 648,
      fees: 12.5,
      method: "Virement bancaire",
    },
    total_amount: 660.5,
    currency: "EUR",
  },
  {
    id: "ord_003",
    order_number: "SC-2024-003",
    customer_id: "cust_001",
    created_at: "2024-10-05T15:45:00.000Z",
    updated_at: "2024-10-06T09:00:00.000Z",
    status: "pending",
    status_label: "En attente",
    source: "Espace client",
    driver: {
      id: "driver_003",
      name: "Karim Lefèvre",
      phone: "+33 6 22 11 33 55",
      vehicle: "Peugeot Boxer · FG-789-HI",
    },
    delivery: {
      address: "Site logistique Swift, Bordeaux",
      expected_date: "2024-10-18T08:00:00.000Z",
      status: "Planifiée",
    },
    items: [
      {
        sku: "COL-09",
        name: "Colis standard",
        description: "Enlèvement 24h",
        quantity: 5,
        unit_price: 19.9,
      },
      {
        sku: "COL-12",
        name: "Colis fragile",
        description: "Manipulation spéciale",
        quantity: 2,
        unit_price: 39.9,
      },
    ],
    payment: {
      subtotal: 199.3,
      fees: 5.6,
      method: "Carte bancaire",
    },
    total_amount: 204.9,
    currency: "EUR",
  },
  {
    id: "ord_004",
    order_number: "SC-2024-004",
    customer_id: "cust_001",
    created_at: "2024-09-28T11:00:00.000Z",
    updated_at: "2024-09-28T14:30:00.000Z",
    status: "cancelled",
    status_label: "Annulée",
    source: "Support client",
    driver: {
      id: "driver_004",
      name: "Equipe Swift",
      phone: "+33 1 70 00 11 22",
      vehicle: "—",
    },
    delivery: {
      address: "Annulée avant départ",
      expected_date: undefined,
      status: "Annulée",
    },
    items: [
      {
        sku: "PAL-05",
        name: "Palette surgelée",
        description: "Chaîne du froid",
        quantity: 1,
        unit_price: 129.9,
      },
    ],
    payment: {
      subtotal: 129.9,
      fees: 0,
      method: "Non facturé",
    },
    total_amount: 0,
    currency: "EUR",
  },
];

const formatCurrency = (value: number, currency = "EUR") =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(value);

const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));

const getInitials = (value?: string) => {
  if (!value) {
    return "?";
  }

  const [first = "", second = ""] = value.split(" ");
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
};

const FilterPill = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "inline-flex min-h-[44px] items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD] focus-visible:ring-offset-2",
      active
        ? "bg-[#DBEAFE] text-[#1D4ED8] shadow-sm"
        : "bg-[#F3F4F6] text-slate-600 hover:bg-slate-200",
    )}
    role="button"
    aria-pressed={active}
  >
    {label}
  </button>
);

const Commandes = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [loadingRowId, setLoadingRowId] = useState<string | null>(null);
  const { toast } = useToast();
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await new Promise((resolve) => setTimeout(resolve, 320));

        if (isMounted) {
          setOrders(MOCK_ORDERS);
        }
      } catch (err) {
        if (isMounted) {
          setError("Impossible de charger les commandes pour le moment.");
          setOrders([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const kpis = useKpiCounters({ orders, isLoading });

  useEffect(() => {
    if (!hasLoggedRef.current && !isLoading && !error) {
      console.info("[Audit] Section Commandes restaurée");
      hasLoggedRef.current = true;
    }
  }, [isLoading, error]);

  const columns = useMemo(
    () => [
      tableColumnHelper.accessor("order_number", {
        id: "order_number",
        header: () => (
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Numéro de commande
              <Info className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            </TooltipTrigger>
            <TooltipContent side="top" align="start" className="max-w-xs text-xs">
              Voir le détail de la commande
            </TooltipContent>
          </Tooltip>
        ),
        sortingFn: "alphanumeric",
        cell: ({ row }) => {
          const order = row.original;
          const isRecent = Date.now() - new Date(order.created_at).getTime() < 24 * 60 * 60 * 1000;

          return (
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#111827]">{order.order_number}</p>
                <p className="text-xs text-[#6B7280]">Créée via {order.source ?? "Tableau de bord"}</p>
              </div>
              {isRecent ? (
                <span className="ml-auto inline-flex items-center rounded-full bg-[#E0E7FF] px-2.5 py-1 text-[11px] font-medium text-[#4338CA]">
                  Nouveau
                </span>
              ) : null}
            </div>
          );
        },
      }),
      tableColumnHelper.accessor("created_at", {
        id: "created_at",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Date</span>
        ),
        sortingFn: "datetime",
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div>
              <p className="text-sm font-medium text-slate-800">{formatDate(order.created_at)}</p>
              {order.delivery?.expected_date ? (
                <p className="text-xs text-[#6B7280]">
                  Livraison prévue {formatDate(order.delivery.expected_date)}
                </p>
              ) : null}
            </div>
          );
        },
      }),
      tableColumnHelper.accessor((row) => row.driver?.name ?? "Non attribué", {
        id: "driver",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Chauffeur</span>
        ),
        cell: ({ row }) => {
          const order = row.original;
          const initials = getInitials(order.driver?.name);
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5E7EB] text-sm font-semibold text-slate-700">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#111827]">{order.driver?.name ?? "Non attribué"}</p>
                {order.driver?.vehicle ? (
                  <p className="truncate text-xs text-[#6B7280]">{order.driver.vehicle}</p>
                ) : null}
              </div>
            </div>
          );
        },
      }),
      tableColumnHelper.accessor("status", {
        id: "status",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Statut</span>
        ),
        cell: ({ row }) => {
          const order = row.original;
          const config = STATUS_CONFIG[order.status];
          const Icon = config.icon;

          return (
            <motion.span
              key={order.status}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                config.bgClass,
                config.textClass,
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {config.label}
            </motion.span>
          );
        },
      }),
      tableColumnHelper.accessor("total_amount", {
        id: "total_amount",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Prix</span>
        ),
        sortingFn: "basic",
        cell: ({ row }) => (
          <div className="text-right text-base font-semibold text-slate-900">
            {formatCurrency(row.original.total_amount, row.original.currency)}
          </div>
        ),
      }),
    ],
    [],
  );

  const {
    table,
    filteredCount,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    tableContainerRef,
    enableVirtualization,
    virtualItems,
    totalSize,
  } = useOrdersTable({ orders: error ? [] : orders, columns });

  const tableRows = table.getRowModel().rows;

  const handleViewOrder = (order: Order) => {
    setLoadingRowId(order.id);
    setSelectedOrder(order);
    setIsDetailsOpen(true);
    setTimeout(() => {
      setLoadingRowId(null);
    }, 260);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedOrder(null);
  };

  const handleFilterChange = (nextFilter: (typeof STATUS_FILTERS)[number]["id"]) => {
    if (statusFilter === nextFilter) {
      return;
    }
    setStatusFilter(nextFilter);
    toast({
      title: "Filtre appliqué",
      description: `Affichage des commandes « ${STATUS_FILTERS.find((option) => option.id === nextFilter)?.label} ».`,
      duration: 2500,
      className: "border border-blue-100 bg-white/95 text-slate-800 shadow-lg backdrop-blur",
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const renderRow = (row: (typeof tableRows)[number] | undefined, index: number) => {
    if (!row) {
      return null;
    }

    const order = row.original;
    const isActive = loadingRowId === order.id;

    return (
      <motion.div
        key={row.id}
        layout
        role="button"
        tabIndex={0}
        onClick={() => handleViewOrder(order)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleViewOrder(order);
          }
        }}
        className={cn(
          "group relative flex min-h-[56px] items-center gap-6 rounded-xl border border-transparent px-4 py-3 transition duration-200",
          index % 2 === 1 ? "bg-[#FCFCFD]" : "bg-white",
          "hover:-translate-y-0.5 hover:bg-[#F9FAFB] hover:shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD] focus-visible:ring-offset-2",
          isActive ? "opacity-60" : "opacity-100",
        )}
      >
        <div className="grid flex-1 grid-cols-[minmax(180px,1.2fr)_minmax(150px,1fr)_minmax(200px,1.4fr)_minmax(140px,0.9fr)_minmax(120px,0.6fr)] items-center gap-6">
          {row.getVisibleCells().map((cell) => {
            const column = cell?.column;
            const cellRenderer = column?.columnDef?.cell;
            const fallbackValue = typeof cell.getValue === "function" ? cell.getValue() ?? "—" : "—";

            return (
              <div key={cell.id} className={cn(column?.id === "total_amount" && "text-right")}>
                {cellRenderer ? flexRender(cellRenderer, cell.getContext()) : fallbackValue}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            className="min-h-[44px] rounded-full border-[#BFDBFE] px-3 text-sm font-medium text-[#1D4ED8] transition duration-150 hover:border-[#93C5FD] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
          >
            {isActive ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            <span className="flex items-center gap-1">
              Voir
              <ChevronRight className="h-4 w-4" aria-hidden />
            </span>
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <TooltipProvider delayDuration={120} skipDelayDuration={0}>
      <section className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#EFF6FF] to-[#DBEAFE] p-6 shadow-sm">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="flex flex-col gap-3 text-[#1F2937]"
        >
          <div>
            <h1 className="text-2xl font-semibold leading-8">Commandes</h1>
            <p className="text-sm text-[#6B7280]">Suivez vos expéditions en temps réel.</p>
          </div>
          <p className="max-w-2xl text-sm text-[#475569]">
            Visualisez l'état de vos commandes, vérifiez vos chauffeurs et accédez en un clic aux fiches détaillées pour garder une longueur d'avance sur vos opérations.
          </p>
        </motion.div>
      </div>

      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {[ 
          {
            id: "delivered",
            title: "Commandes livrées",
            icon: CheckCircle2,
            description: "Mises à jour en temps réel",
            highlight: false,
            counterValue: kpis.deliveredCount,
            counterProps: { decimals: 0 },
          },
          {
            id: "volume",
            title: "Volume traité",
            icon: TrendingUp,
            description: "Total cumulé confirmé",
            highlight: false,
            counterValue: kpis.totalVolume,
            counterProps: { decimals: 2, suffix: " €" },
            trend: kpis.trendPercentage,
          },
          {
            id: "upcoming",
            title: "Prochaine livraison",
            icon: Truck,
            description: kpis.upcomingDelivery?.delivery?.address ?? "Aucune livraison planifiée",
            highlight: true,
            upcomingDate: kpis.upcomingDelivery?.delivery?.expected_date,
          },
        ].map((card, index) => {
          const Icon = card.icon;
          const isAccent = card.highlight;

          const trendLabel =
            card.id === "volume" && typeof card.trend === "number"
              ? `${card.trend > 0 ? "+" : ""}${card.trend}% vs période précédente`
              : null;
          const trendClass =
            card.id === "volume" && typeof card.trend === "number"
              ? card.trend >= 0
                ? "bg-[#DBEAFE] text-[#1D4ED8]"
                : "bg-[#FEE2E2] text-[#DC2626]"
              : undefined;

          return (
            <motion.div
              key={card.id}
              variants={KPI_CARD_VARIANTS}
              initial="hidden"
              animate="visible"
              transition={{ ...KPI_CARD_TRANSITION, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, boxShadow: "0px 6px 16px rgba(17,24,39,0.08)" }}
              className={cn(
                "flex min-w-[240px] flex-1 flex-col gap-3 rounded-[14px] border border-transparent p-4",
                isAccent
                  ? "bg-[#EFF6FF] border-[#BFDBFE]"
                  : "bg-white border-[#E5E7EB]",
              )}
            >
              <div className="flex items-center gap-3 text-[#1F2937]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#1D4ED8] shadow-sm">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">{card.title}</p>
              </div>
              <div className="flex flex-col gap-1">
                {kpis.isLoading ? (
                  <Skeleton className="h-8 w-24 rounded-md" />
                ) : card.id === "upcoming" ? (
                  <p className="text-base font-semibold text-[#1F2937]">
                    {card.upcomingDate
                      ? formatDate(card.upcomingDate)
                      : "—"}
                  </p>
                ) : (
                  <AnimatedCounter
                    value={card.counterValue}
                    decimals={card.counterProps?.decimals}
                    prefix={card.counterProps?.prefix}
                    suffix={card.counterProps?.suffix}
                    className="text-2xl leading-7"
                  />
                )}
                {trendLabel ? (
                  <Badge className={cn("w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold", trendClass)}>
                    {trendLabel}
                  </Badge>
                ) : null}
                <p className="text-xs text-[#6B7280]">{card.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-white/90 p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <FilterPill
                key={filter.id}
                label={filter.label}
                active={statusFilter === filter.id}
                onClick={() => handleFilterChange(filter.id)}
              />
            ))}
          </div>
          <div className="relative w-full min-w-[240px] max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Rechercher une commande, un chauffeur…"
              className="h-11 rounded-full border-[#CBD5F5] pl-10 pr-4 text-sm focus-visible:ring-[#93C5FD]"
            />
          </div>
        </div>

        <div className="hidden text-xs text-[#6B7280] lg:flex lg:items-center lg:justify-between">
          <span>{filteredCount} commande{filteredCount > 1 ? "s" : ""} affichée{filteredCount > 1 ? "s" : ""}</span>
        </div>

        <div className="md:hidden">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-amber-200 bg-[#FEF3C7] p-4 text-sm text-[#92400E]">
              <p className="font-semibold">{error}</p>
              <Button
                variant="outline"
                className="mt-3 h-10 rounded-full border-[#FBBF24] text-[#B45309] hover:bg-[#FDE68A]"
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setOrders(MOCK_ORDERS);
                    setIsLoading(false);
                    setError(null);
                  }, 300);
                }}
              >
                Réessayer
              </Button>
            </div>
          ) : tableRows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#CBD5F5] bg-[#F8FAFC] p-6 text-center">
              <div className="h-16 w-16 rounded-full bg-[#DBEAFE] text-[#1D4ED8]">
                <Truck className="m-auto h-8 w-8 pt-4" aria-hidden />
              </div>
              <p className="text-sm font-semibold text-[#1F2937]">Aucune commande correspondante</p>
              <p className="text-sm text-[#6B7280]">Ajustez vos filtres ou relancez une recherche.</p>
              <Button
                variant="outline"
                className="rounded-full border-[#BFDBFE] text-[#1D4ED8] hover:bg-[#EFF6FF]"
                onClick={() => {
                  handleFilterChange("all");
                  handleSearchChange("");
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tableRows.map((row) => {
                const order = row.original;
                const config = STATUS_CONFIG[order.status];
                const Icon = config.icon;
                return (
                  <motion.div
                    key={row.id}
                    layout
                    className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-[#111827]">{order.order_number}</p>
                        <p className="text-xs text-[#6B7280]">{formatDate(order.created_at)}</p>
                      </div>
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold", config.bgClass, config.textClass)}>
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                        {config.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#475569]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E5E7EB] text-xs font-semibold">
                          {getInitials(order.driver?.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#111827]">{order.driver?.name ?? "Non attribué"}</p>
                          <p className="text-xs text-[#6B7280]">{order.driver?.vehicle}</p>
                        </div>
                      </div>
                      <p className="text-base font-semibold text-[#111827]">{formatCurrency(order.total_amount)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-[#6B7280]">
                        {order.delivery?.address ?? "Destination à confirmer"}
                      </p>
                      <Button
                        variant="outline"
                        className="min-h-[44px] rounded-full border-[#BFDBFE] text-[#1D4ED8] hover:bg-[#EFF6FF]"
                        onClick={() => handleViewOrder(order)}
                      >
                        Voir
                        <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div className="hidden md:flex md:flex-col">
          <div className="grid grid-cols-[minmax(180px,1.2fr)_minmax(150px,1fr)_minmax(200px,1.4fr)_minmax(140px,0.9fr)_minmax(120px,0.6fr)_96px] items-center gap-6 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            <span>Numéro</span>
            <span>Date</span>
            <span>Chauffeur</span>
            <span>Statut</span>
            <span className="text-right">Prix</span>
            <span className="sr-only">Actions</span>
          </div>
          <div
            ref={tableContainerRef}
            className="mt-2 max-h-[520px] overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white"
          >
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col gap-3 p-6">
                <div className="rounded-xl border border-amber-200 bg-[#FEF3C7] p-4 text-sm text-[#92400E]">
                  <p className="font-semibold">{error}</p>
                  <p>Vérifiez votre connexion ou réessayez.</p>
                </div>
                <Button
                  variant="outline"
                  className="self-start rounded-full border-[#FBBF24] text-[#B45309] hover:bg-[#FDE68A]"
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => {
                      setOrders(MOCK_ORDERS);
                      setIsLoading(false);
                      setError(null);
                    }, 300);
                  }}
                >
                  Réessayer
                </Button>
              </div>
            ) : tableRows.length === 0 ? (
              <div className="flex flex-col items-center gap-3 p-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DBEAFE] text-[#1D4ED8]">
                  <Truck className="h-8 w-8" aria-hidden />
                </div>
                <p className="text-base font-semibold text-[#1F2937]">Aucune commande correspondante</p>
                <p className="max-w-sm text-sm text-[#6B7280]">
                  Ajustez vos filtres ou relancez une recherche pour afficher de nouvelles expéditions.
                </p>
                <Button
                  variant="outline"
                  className="rounded-full border-[#BFDBFE] text-[#1D4ED8] hover:bg-[#EFF6FF]"
                  onClick={() => {
                    handleFilterChange("all");
                    handleSearchChange("");
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <div className="relative">
                {enableVirtualization ? (
                  <div style={{ height: totalSize ?? 0 }} className="relative">
                    {virtualItems.map((virtualRow) => {
                      const row = tableRows[virtualRow.index];
                      if (!row) return null;
                      return (
                        <div
                          key={row.id}
                          className="absolute left-0 right-0"
                          style={{
                            transform: `translateY(${virtualRow.start}px)`,
                            height: virtualRow.size,
                          }}
                        >
                          <div className="p-2">{renderRow(row, virtualRow.index)}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {tableRows.map((row) => renderRow(row, row.index ?? 0))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

        <OrderDetailsModal order={selectedOrder ?? undefined} open={isDetailsOpen} onClose={handleCloseDetails} />
      </section>
    </TooltipProvider>
  );
};

export default Commandes;
