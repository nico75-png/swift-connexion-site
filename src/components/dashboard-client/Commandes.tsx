import { useEffect, useMemo, useState } from "react";

import OrderDetailsModal from "@/components/orders/OrderDetailsModal";
import OrdersTable from "@/components/orders/OrdersTable";

interface OrderItem {
  sku: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
}

interface OrderPayment {
  subtotal?: number;
  fees?: number;
  method?: string;
}

interface OrderDelivery {
  address?: string;
  expected_date?: string;
  status?: string;
}

interface OrderDriver {
  id?: string;
  name?: string;
  phone?: string;
  vehicle?: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  created_at: string;
  updated_at?: string;
  status: "delivered" | "pending" | "cancelled" | "in_transit";
  status_label?: string;
  source?: string;
  driver?: OrderDriver;
  delivery?: OrderDelivery;
  items: OrderItem[];
  payment?: OrderPayment;
  total_amount: number;
  currency: string;
}

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
        unit_price: 54.0,
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

const Commandes = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      setIsLoading(true);

      try {
        // TODO: Remplacer par l'appel Supabase (ex: supabase.from("orders").select(...))
        await new Promise((resolve) => setTimeout(resolve, 320));

        if (isMounted) {
          setOrders(MOCK_ORDERS);
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

  const metrics = useMemo(() => {
    if (!orders.length) {
      return {
        totalAmount: 0,
        deliveredCount: 0,
        upcomingDelivery: undefined as Order | undefined,
      };
    }

    const totalAmount = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const deliveredCount = orders.filter((order) => order.status === "delivered").length;
    const upcomingDelivery = [...orders]
      .filter((order) => Boolean(order.delivery?.expected_date))
      .sort((a, b) => {
        const aDate = new Date(a.delivery?.expected_date ?? 0).getTime();
        const bDate = new Date(b.delivery?.expected_date ?? 0).getTime();
        return aDate - bDate;
      })[0];

    return {
      totalAmount,
      deliveredCount,
      upcomingDelivery,
    };
  }, [orders]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedOrder(null);
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#0B2D55]">Commandes</h1>
        <p className="text-sm text-slate-600">
          Visualisez vos commandes, suivez l'acheminement en temps réel et accédez aux fiches détaillées pour préparer vos
          opérations.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Commandes livrées</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{metrics.deliveredCount}</p>
          <p className="mt-1 text-xs text-slate-500">Mises à jour automatiquement avec Supabase.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Volume traité</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{formatCurrency(metrics.totalAmount)}</p>
          <p className="mt-1 text-xs text-slate-500">Total cumulé de vos commandes confirmées.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Prochaine livraison</p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {metrics.upcomingDelivery?.delivery?.address ?? "Aucune livraison planifiée"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {metrics.upcomingDelivery?.delivery?.expected_date
              ? new Intl.DateTimeFormat("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(metrics.upcomingDelivery.delivery.expected_date))
              : "Suivez ici vos prochaines expéditions."}
          </p>
        </div>
      </div>

      <OrdersTable orders={orders} isLoading={isLoading} onViewOrder={handleViewOrder} />

      <OrderDetailsModal order={selectedOrder ?? undefined} open={isDetailsOpen} onClose={handleCloseDetails} />
    </section>
  );
};

export default Commandes;
