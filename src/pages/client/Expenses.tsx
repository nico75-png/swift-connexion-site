import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import CreateOrderButton from "@/components/dashboard/CreateOrderButton";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileSpreadsheet, LineChart, PiggyBank, Timer } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/lib/stores/auth.store";
import {
  ClientOrderListItem,
  listOrdersByClient,
} from "@/lib/stores/clientOrders.store";
import { ensureStoragePrimitives, formatDateTime } from "@/lib/reorder";
import { getNotifications } from "@/lib/stores/driversOrders.store";
import type { NotificationEntry } from "@/lib/stores/driversOrders.store";
import { useToast } from "@/hooks/use-toast";

/**
 * Page des dépenses avec graphiques et exports
 */
const ClientExpenses = () => {
  const { currentClient, currentUser } = useAuth();
  const { toast } = useToast();
  const [periodFilter, setPeriodFilter] = useState("month");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState<ClientOrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const notifications = useMemo<NotificationEntry[]>(() => getNotifications(), []);
  const formattedNotifications = useMemo(
    () =>
      notifications.map((notif) => ({
        id: notif.id,
        message: notif.message,
        time: new Intl.DateTimeFormat("fr-FR", {
          day: "2-digit",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(notif.createdAt)),
        read: notif.read,
      })),
    [notifications],
  );

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      try {
        if (typeof window !== "undefined") {
          ensureStoragePrimitives();
        }
        const result = currentClient?.id ? await listOrdersByClient(currentClient.id) : [];
        if (!mounted) return;
        setOrders(result);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      mounted = false;
    };
  }, [currentClient?.id]);

  const fallbackExpenses = useMemo(
    () => [
      {
        id: "CMD-2025-021",
        status: "Livré",
        amount: 132.5,
        isoDate: "2025-03-18T08:30:00Z",
      },
      {
        id: "CMD-2025-019",
        status: "En cours",
        amount: 98.2,
        isoDate: "2025-03-14T13:45:00Z",
      },
      {
        id: "CMD-2025-017",
        status: "En attente",
        amount: 210.0,
        isoDate: "2025-03-03T09:10:00Z",
      },
    ],
    [],
  );

  const expenses = useMemo(() => {
    if (orders.length === 0) {
      return fallbackExpenses;
    }
    return orders.map((order) => ({
      id: order.orderNumber,
      status: order.status,
      amount: order.amountTTC ?? 0,
      isoDate: order.createdAt ?? new Date().toISOString(),
    }));
  }, [orders, fallbackExpenses]);

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const byPeriod = expenses.filter((expense) => {
      const expenseDate = new Date(expense.isoDate);
      if (Number.isNaN(expenseDate.getTime())) return true;
      switch (periodFilter) {
        case "week":
          return now.getTime() - expenseDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
        case "month":
          return now.getTime() - expenseDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
        case "quarter":
          return now.getTime() - expenseDate.getTime() <= 90 * 24 * 60 * 60 * 1000;
        case "year":
          return now.getTime() - expenseDate.getTime() <= 365 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });

    return byPeriod.filter((expense) => {
      if (statusFilter === "all") return true;
      const normalized = expense.status.toLowerCase();
      if (statusFilter === "en cours") return normalized.includes("cours");
      if (statusFilter === "livré") return normalized.includes("livr");
      if (statusFilter === "en attente") return normalized.includes("attente");
      return true;
    });
  }, [expenses, periodFilter, statusFilter]);

  const totalSpent = useMemo(
    () => filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [filteredExpenses],
  );
  const averageSpent = useMemo(
    () => (filteredExpenses.length ? totalSpent / filteredExpenses.length : 0),
    [filteredExpenses, totalSpent],
  );
  const pendingCount = useMemo(
    () => filteredExpenses.filter((expense) => expense.status.toLowerCase().includes("attente")).length,
    [filteredExpenses],
  );

  const stats: Array<{ label: string; value: string | number; icon: LucideIcon; color?: string; trend?: { value: number; isPositive: boolean } }> = [
    {
      label: "Total dépensé",
      value: `${totalSpent.toFixed(2)} €`,
      icon: PiggyBank,
      color: "text-primary",
      trend: { value: Math.round(totalSpent / 10), isPositive: totalSpent >= 0 },
    },
    {
      label: "Panier moyen",
      value: `${averageSpent.toFixed(2)} €`,
      icon: LineChart,
      color: "text-secondary",
    },
    {
      label: "En attente",
      value: pendingCount,
      icon: Timer,
      color: "text-warning",
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "En cours": "bg-info/10 text-info border-info/20",
      "Livré": "bg-success/10 text-success border-success/20",
      "En attente": "bg-warning/10 text-warning border-warning/20",
    };
    return colors[status] || colors["En cours"];
  };

  const handleExportCsv = useCallback(() => {
    if (typeof window === "undefined") return;
    const headers = "Commande,Date,Statut,Montant";
    const rows = filteredExpenses.map((expense) => {
      const formattedDate = formatDateTime(expense.isoDate, "fr-FR");
      return `${expense.id},${formattedDate},${expense.status},${expense.amount.toFixed(2)}`;
    });
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "depenses.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Export CSV prêt",
      description: "Le fichier des dépenses a été téléchargé.",
    });
  }, [filteredExpenses, toast]);

  const handleExportPdf = useCallback(() => {
    if (typeof window === "undefined") return;
    const summaryWindow = window.open("", "_blank", "noopener,width=900,height=600");
    if (!summaryWindow) {
      toast({
        variant: "destructive",
        title: "Ouverture impossible",
        description: "Veuillez autoriser les pop-ups pour générer la synthèse.",
      });
      return;
    }
    const rows = filteredExpenses
      .map(
        (expense) =>
          `<tr><td>${expense.id}</td><td>${formatDateTime(expense.isoDate, "fr-FR")}</td><td>${expense.status}</td><td>${expense.amount.toFixed(2)} €</td></tr>`,
      )
      .join("");
    summaryWindow.document.write(`<!DOCTYPE html><html lang="fr"><head><title>Synthèse des dépenses</title></head><body>`);
    summaryWindow.document.write(`<h1>Synthèse des dépenses</h1>`);
    summaryWindow.document.write(`<p>Total dépensé : <strong>${totalSpent.toFixed(2)} €</strong></p>`);
    summaryWindow.document.write(`<table border="1" cellpadding="6" cellspacing="0">`);
    summaryWindow.document.write(`<thead><tr><th>Commande</th><th>Date</th><th>Statut</th><th>Montant</th></tr></thead>`);
    summaryWindow.document.write(`<tbody>${rows}</tbody>`);
    summaryWindow.document.write(`</table>`);
    summaryWindow.document.write(`<script>window.print();</script>`);
    summaryWindow.document.write(`</body></html>`);
    summaryWindow.document.close();
  }, [filteredExpenses, totalSpent, toast]);

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={<Topbar userName={currentUser?.name ?? "Client"} notifications={formattedNotifications} />}
    >
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dépenses</h1>
            <p className="text-muted-foreground">Analysez vos coûts de transport</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 sm:justify-end">
            <CreateOrderButton className="mt-3 sm:mt-0" />
            <div className="mt-2 flex flex-col gap-2 sm:mt-0 sm:flex-row">
              <Button variant="outline" onClick={handleExportCsv}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="cta" onClick={handleExportPdf}>
                <Download className="h-4 w-4 mr-2" />
                Synthèse PDF
              </Button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <StatsCard key={i} {...stat} />
          ))}
        </div>

        {/* Graphique évolution */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-6">
              <div className="grid h-full w-full grid-cols-12 items-end gap-2">
                {filteredExpenses.slice(0, 12).map((expense) => {
                  const ratio = Math.min(100, Math.round((expense.amount / Math.max(1, averageSpent || 1)) * 25));
                  return (
                    <div
                      key={expense.id}
                      className="rounded-t bg-primary/60"
                      style={{ height: `${ratio}%` }}
                      title={`${expense.id} • ${expense.amount.toFixed(2)}€`}
                    />
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Répartition */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par statut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Graphique circulaire des statuts</p>
            </div>
          </CardContent>
        </Card>

        {/* Filtres */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en cours">En cours</SelectItem>
                  <SelectItem value="livré">Livré</SelectItem>
                  <SelectItem value="en attente">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tableau détaillé */}
        <Card>
          <CardHeader>
            <CardTitle>Détail des dépenses</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold">Commande</th>
                    <th className="text-left p-4 text-sm font-semibold">Date</th>
                    <th className="text-left p-4 text-sm font-semibold">Statut</th>
                    <th className="text-right p-4 text-sm font-semibold">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-sm text-muted-foreground">
                        Chargement des dépenses…
                      </td>
                    </tr>
                  ) : filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-sm text-muted-foreground">
                        Aucune dépense enregistrée pour le moment.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="border-b hover:bg-muted/30">
                        <td className="p-4 font-mono text-sm">{expense.id}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDateTime(expense.isoDate, "fr-FR")}
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(expense.status)}>{expense.status}</Badge>
                        </td>
                        <td className="p-4 text-right font-semibold">{expense.amount.toFixed(2)}€</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientExpenses;
