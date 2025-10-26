import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  delivered: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  pending: "bg-amber-100 text-amber-800 border border-amber-200",
  cancelled: "bg-rose-100 text-rose-700 border border-rose-200",
  in_transit: "bg-sky-100 text-sky-700 border border-sky-200",
};

const SORTABLE_COLUMNS = {
  created_at: "Date",
  status: "Statut",
};

const formatDate = (isoDate) =>
  new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));

const formatCurrency = (value, currency = "EUR") =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(value);

const OrdersTable = ({ orders = [], isLoading = false, onViewOrder }) => {
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });

  const sortedOrders = useMemo(() => {
    if (!Array.isArray(orders)) {
      return [];
    }

    const sortableOrders = [...orders];
    const { key, direction } = sortConfig;

    sortableOrders.sort((a, b) => {
      if (key === "created_at") {
        return direction === "asc"
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }

      if (key === "status") {
        return direction === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }

      return 0;
    });

    return sortableOrders;
  }, [orders, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        const nextDirection = prev.direction === "asc" ? "desc" : "asc";
        return { key, direction: nextDirection };
      }

      return { key, direction: key === "status" ? "asc" : "desc" };
    });
  };

  const renderSortButton = (columnKey, label) => {
    const isActive = sortConfig.key === columnKey;
    const direction = isActive ? sortConfig.direction : undefined;

    return (
      <button
        type="button"
        onClick={() => handleSort(columnKey)}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide transition-colors",
          isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-800",
        )}
      >
        {label}
        <span className="text-[10px]">
          {direction === "asc" ? "▲" : direction === "desc" ? "▼" : ""}
        </span>
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Historique des commandes</h2>
          <p className="text-sm text-slate-500">
            Retrouvez toutes vos commandes et consultez les détails en un clic.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {Object.entries(SORTABLE_COLUMNS).map(([key, label]) => (
            <span key={key} className="hidden sm:inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {renderSortButton(key, label)}
            </span>
          ))}
          <span className="inline-flex sm:hidden">{renderSortButton(sortConfig.key, SORTABLE_COLUMNS[sortConfig.key])}</span>
        </div>
      </div>

      <div className="px-3 pb-4 pt-2">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[160px]">Numéro de commande</TableHead>
              <TableHead>
                {renderSortButton("created_at", "Date")}
              </TableHead>
              <TableHead>Chauffeur</TableHead>
              <TableHead>
                {renderSortButton("status", "Statut")}
              </TableHead>
              <TableHead className="text-right">Prix</TableHead>
              <TableHead className="text-right">&nbsp;</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-sm text-slate-500">
                  Chargement des commandes…
                </TableCell>
              </TableRow>
            ) : sortedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-sm text-slate-500">
                  Aucune commande pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              sortedOrders.map((order) => (
                <TableRow key={order.id} className="group">
                  <TableCell>
                    <div className="font-medium text-slate-900">{order.order_number}</div>
                    <p className="text-xs text-slate-500">Créée via {order.source || "Tableau de bord"}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-slate-900">{formatDate(order.created_at)}</p>
                    {order.delivery?.expected_date && (
                      <p className="text-xs text-slate-500">
                        Livraison prévue : {formatDate(order.delivery.expected_date)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-slate-900">{order.driver?.name ?? "Non attribué"}</p>
                    <p className="text-xs text-slate-500">{order.driver?.vehicle}</p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "capitalize px-2.5 py-1 text-xs font-semibold",
                        STATUS_STYLES[order.status] || "bg-slate-100 text-slate-700 border border-slate-200",
                      )}
                    >
                      {order.status_label || order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-slate-900">
                    {formatCurrency(order.total_amount, order.currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => onViewOrder?.(order)}
                    >
                      Voir la fiche
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableCaption className="pt-6 text-xs text-slate-500">
            Données affichées à titre indicatif. Intégration Supabase prête via `fetchOrders()`.
          </TableCaption>
        </Table>
      </div>
    </div>
  );
};

export default OrdersTable;
