import { useEffect, useMemo, useState } from "react";
import { differenceInDays, isAfter, subDays } from "date-fns";
import { Activity, CheckCircle2, Download, FileText, Package, TrendingUp, Wallet2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Header from "@/components/dashboard/Header";
import CreateOrderButton from "@/components/dashboard/CreateOrderButton";
import StatCard from "@/components/dashboard/StatCard";
import DataTable, { type DataTableColumn } from "@/components/dashboard/DataTable";
import EmptyState from "@/components/dashboard/EmptyState";
import { Link } from "react-router-dom";
import {
  ClientOrderListItem,
  listOrdersByClient,
} from "@/lib/stores/clientOrders.store";
import { ensureStoragePrimitives } from "@/lib/reorder";
import { useAuth } from "@/lib/stores/auth.store";
import { getNotifications } from "@/lib/stores/driversOrders.store";
import type { NotificationEntry } from "@/lib/stores/driversOrders.store";
import { formatCurrencyEUR, formatDateFR } from "@/lib/formatters";

const statusStyles: Record<string, string> = {
  delivered: "bg-[color:rgba(15,157,88,0.14)] text-[color:var(--brand-success)]",
  pending: "bg-[color:rgba(245,158,11,0.18)] text-[color:var(--brand-warning)]",
  cancelled: "bg-[color:rgba(220,38,38,0.14)] text-[color:#dc2626]",
  default: "bg-[color:var(--bg-subtle)] text-[color:var(--text-secondary)]",
};

const resolveStatusClass = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("livr")) {
    return statusStyles.delivered;
  }
  if (normalized.includes("attente") || normalized.includes("cours")) {
    return statusStyles.pending;
  }
  if (normalized.includes("annul")) {
    return statusStyles.cancelled;
  }
  return statusStyles.default;
};

const ClientDashboard = () => {
  const { currentClient, currentUser } = useAuth();
  const [orders, setOrders] = useState<ClientOrderListItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (typeof window !== "undefined") {
          ensureStoragePrimitives();
        }

        const [ordersResult, notificationsResult] = await Promise.all([
          currentClient?.id ? listOrdersByClient(currentClient.id) : Promise.resolve([]),
          Promise.resolve(getNotifications()),
        ]);

        if (!mounted) return;

        setOrders(ordersResult);
        setNotifications(notificationsResult);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [currentClient?.id]);

  const lastThirtyDaysOrders = useMemo(() => {
    const cutoff = subDays(new Date(), 30);
    return orders.filter((order) => {
      if (!order.createdAt) return false;
      const created = new Date(order.createdAt);
      return isAfter(created, cutoff);
    });
  }, [orders]);

  const totalAmountLast30Days = useMemo(() => {
    return lastThirtyDaysOrders.reduce((sum, order) => sum + (order.amountTTC ?? 0), 0);
  }, [lastThirtyDaysOrders]);

  const deliveredOrdersLast30Days = useMemo(
    () => lastThirtyDaysOrders.filter((order) => order.status.toLowerCase().includes("livr")),
    [lastThirtyDaysOrders],
  );

  const averageDeliveryDelay = useMemo(() => {
    if (lastThirtyDaysOrders.length === 0) return 0;
    const today = new Date();
    const total = lastThirtyDaysOrders.reduce((sum, order) => {
      if (!order.createdAt) return sum;
      return sum + differenceInDays(today, new Date(order.createdAt));
    }, 0);
    return Math.round((total / lastThirtyDaysOrders.length) * 10) / 10;
  }, [lastThirtyDaysOrders]);

  const stats = useMemo(() => {
    const deliveredRatio = lastThirtyDaysOrders.length
      ? Math.round((deliveredOrdersLast30Days.length / lastThirtyDaysOrders.length) * 100)
      : 0;

    return [
      {
        title: "Commandes (30 jours)",
        value: lastThirtyDaysOrders.length,
        description: "Commandes validées sur les trente derniers jours",
        icon: Package,
        trend: {
          value: deliveredRatio,
          label: "livrées",
          isPositive: deliveredRatio >= 60,
        },
      },
      {
        title: "Montant facturé",
        value: formatCurrencyEUR(totalAmountLast30Days),
        description: "Montant TTC cumulé sur la période",
        icon: Wallet2,
      },
      {
        title: "Taux de livraison",
        value: `${deliveredRatio} %`,
        description: "Livraisons réussies vs commandes créées",
        icon: CheckCircle2,
        trend: {
          value: deliveredRatio >= 80 ? "Objectif atteint" : "À surveiller",
        },
      },
      {
        title: "Délai moyen",
        value: `${averageDeliveryDelay} j`,
        description: "Délai observé entre création et livraison",
        icon: TrendingUp,
      },
    ];
  }, [averageDeliveryDelay, deliveredOrdersLast30Days.length, lastThirtyDaysOrders.length, totalAmountLast30Days]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  const formattedNotifications = useMemo(
    () =>
      notifications
        .filter((notif) => notif.createdAt)
        .map((notif) => {
          const date = new Date(notif.createdAt);
          const isValidDate = !Number.isNaN(date.getTime());

          return {
            id: notif.id,
            message: notif.message,
            time: isValidDate ? formatDateFR(date, { withTime: true }) : "Date inconnue",
            read: notif.read,
          };
        }),
    [notifications],
  );

  const invoiceColumns: Array<DataTableColumn<ClientOrderListItem & { amount: string; createdLabel: string }>> = [
    {
      key: "orderNumber",
      header: "N° facture",
      sortable: true,
    },
    {
      key: "createdLabel",
      header: "Date",
      sortable: true,
      sortAccessor: (item) => new Date(item.createdAt ?? 0),
    },
    {
      key: "status",
      header: "Statut",
      render: (item) => (
        <span
          className={`inline-flex items-center justify-center rounded-[var(--radius-pill)] px-[var(--space-2)] py-[2px] text-xs font-semibold ${resolveStatusClass(item.status)}`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Montant",
      align: "right",
      sortable: true,
      sortAccessor: (item) => item.amountTTC ?? 0,
      render: (item) => <span className="font-medium text-[color:var(--text-primary)]">{item.amount}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <Link
          to={`/factures/${item.id}`}
          className="inline-flex min-h-[36px] items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--border-subtle)] px-[var(--space-2)] py-[var(--space-1)] text-xs font-medium text-[color:var(--brand-primary)] transition-colors duration-150 hover:bg-[color:rgba(11,45,99,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-accent)]"
        >
          Voir
        </Link>
      ),
    },
  ];

  const invoiceRows = useMemo(
    () =>
      orders.map((order) => ({
        ...order,
        amount: formatCurrencyEUR(order.amountTTC ?? 0),
        createdLabel: order.createdAt ? formatDateFR(order.createdAt) : "—",
      })),
    [orders],
  );

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={
        <Header
          title="Tableau de bord"
          subtitle="Suivez vos commandes et factures en un coup d’œil"
          userName={currentUser?.name ?? undefined}
          userEmail={currentUser?.email ?? undefined}
          notifications={formattedNotifications}
          cta={<CreateOrderButton className="inline-flex" />}
        />
      }
      showProfileReminder
    >
      <div className="flex flex-col gap-[var(--space-6)]">
        <section className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              trend={stat.trend}
              isLoading={isLoading}
            />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-[var(--space-6)] xl:grid-cols-12">
          <div className="xl:col-span-8">
            <DataTable
              data={invoiceRows}
              columns={invoiceColumns}
              caption="Mes factures"
              isLoading={isLoading}
              pageSize={6}
              initialSortKey="createdLabel"
              initialSortDirection="desc"
              getRowId={(row) => row.id}
              emptyState={{
                icon: <FileText className="h-8 w-8" aria-hidden />,
                title: "Aucune facture disponible",
                description: "Créez votre première commande pour générer automatiquement vos factures.",
                actionLabel: "Créer une commande",
                onAction: () => window.scrollTo({ top: 0, behavior: "smooth" }),
              }}
            />
          </div>

          <div className="flex flex-col gap-[var(--space-4)] xl:col-span-4">
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-[var(--space-5)] shadow-[var(--elevation-1)]">
              <div className="mb-[var(--space-3)] flex items-center justify-between">
                <h2 className="text-base font-semibold text-[color:var(--text-primary)]">Activité récente</h2>
                <Activity className="h-5 w-5 text-[color:var(--brand-primary)]" aria-hidden />
              </div>
              {isLoading ? (
                <div className="space-y-[var(--space-2)]">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      // eslint-disable-next-line react/no-array-index-key
                      key={`recent-skeleton-${index}`}
                      className="h-4 w-full animate-pulse rounded-[var(--radius-sm)] bg-[color:var(--bg-subtle)]"
                    />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <EmptyState
                  icon={<Download className="h-6 w-6" aria-hidden />}
                  title="Aucune commande récente"
                  description="Vos futures commandes apparaîtront ici dès leur création."
                  className="border-none bg-transparent p-0"
                />
              ) : (
                <ul className="space-y-[var(--space-3)]">
                  {recentOrders.map((order) => (
                    <li key={order.id} className="flex flex-col gap-[var(--space-1)]">
                      <div className="flex items-center justify-between gap-[var(--space-2)]">
                        <Link
                          to={`/commandes/${order.id}`}
                          className="text-sm font-semibold text-[color:var(--brand-primary)] hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                        <span className="text-xs text-[color:var(--text-muted)]">
                          {order.createdAt ? formatDateFR(order.createdAt, { withTime: true }) : "Date inconnue"}
                        </span>
                      </div>
                      <p className="text-sm text-[color:var(--text-secondary)]">{order.transportLabel}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-[var(--space-5)] shadow-[var(--elevation-1)]">
              <div className="mb-[var(--space-3)] flex items-center justify-between">
                <h2 className="text-base font-semibold text-[color:var(--text-primary)]">Notifications</h2>
                <Download className="h-5 w-5 text-[color:var(--brand-primary)]" aria-hidden />
              </div>
              {isLoading ? (
                <div className="space-y-[var(--space-2)]">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      // eslint-disable-next-line react/no-array-index-key
                      key={`notif-skeleton-${index}`}
                      className="h-3 w-full animate-pulse rounded-[var(--radius-sm)] bg-[color:var(--bg-subtle)]"
                    />
                  ))}
                </div>
              ) : formattedNotifications.length === 0 ? (
                <EmptyState
                  icon={<Download className="h-6 w-6" aria-hidden />}
                  title="Rien à signaler"
                  description="Vous serez averti ici des mises à jour importantes."
                  className="border-none bg-transparent p-0"
                />
              ) : (
                <ul className="space-y-[var(--space-3)]" aria-live="polite">
                  {formattedNotifications.slice(0, 5).map((notif) => (
                    <li
                      key={notif.id}
                      className="rounded-[var(--radius-md)] border border-[color:var(--border-subtle)] bg-[color:var(--bg-subtle)] px-[var(--space-3)] py-[var(--space-2)]"
                    >
                      <p className="text-sm text-[color:var(--text-secondary)]">{notif.message}</p>
                      <p className="text-xs text-[color:var(--text-muted)]">{notif.time}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
