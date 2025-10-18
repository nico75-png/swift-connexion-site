import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, FileText, Wallet } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import CreateOrderButton from "@/components/dashboard/CreateOrderButton";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/stores/auth.store";
import { getNotifications } from "@/lib/stores/driversOrders.store";
import type { NotificationEntry } from "@/lib/stores/driversOrders.store";
import { listClientInvoices } from "@/lib/stores/data/clientInvoices";

const MONTH_MAP: Record<string, string> = {
  janvier: "01",
  février: "02",
  fevrier: "02",
  mars: "03",
  avril: "04",
  mai: "05",
  juin: "06",
  juillet: "07",
  août: "08",
  aout: "08",
  septembre: "09",
  octobre: "10",
  novembre: "11",
  décembre: "12",
  decembre: "12",
};

/**
 * Page de gestion des factures
 * Liste, filtres, téléchargement PDF
 */
const ClientInvoices = () => {
  const { currentUser } = useAuth();
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("2025");
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

  const invoices = useMemo(() => listClientInvoices(), []);

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      success: "bg-success/10 text-success border-success/20",
      warning: "bg-warning/10 text-warning border-warning/20",
    };
    return colors[color];
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const [monthLabel, yearLabel] = invoice.period.split(" ");
      const normalizedMonth = MONTH_MAP[monthLabel.toLowerCase()] ?? invoice.date.slice(3, 5);
      const matchesYear = yearFilter === "all" || yearLabel === yearFilter;
      const matchesMonth = monthFilter === "all" || normalizedMonth === monthFilter;
      return matchesYear && matchesMonth;
    });
  }, [invoices, monthFilter, yearFilter]);

  const outstandingTotal = useMemo(
    () =>
      invoices
        .filter((invoice) => invoice.statusColor === "warning")
        .reduce((sum, invoice) => sum + invoice.amount, 0),
    [invoices],
  );

  const handleDownload = useCallback((invoiceId: string) => {
    const invoice = invoices.find((item) => item.id === invoiceId);
    if (!invoice || typeof window === "undefined") return;

    const content = [
      `Facture ${invoice.id}`,
      `Période : ${invoice.period}`,
      `Commandes : ${invoice.orders}`,
      `Montant TTC : ${invoice.amount.toFixed(2)}€`,
      `Statut : ${invoice.status}`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }, [invoices]);

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={<Topbar userName={currentUser?.name ?? "Client"} notifications={formattedNotifications} />}
    >
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Factures</h1>
            <p className="text-muted-foreground">Consultez et téléchargez vos factures</p>
          </div>
          <CreateOrderButton className="mt-3 sm:mt-0" />
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            label="Factures en cours"
            value={invoices.filter((invoice) => invoice.statusColor === "warning").length}
            icon={Wallet}
            color="text-warning"
          />
          <StatsCard
            label="Montant dû"
            value={`${outstandingTotal.toFixed(2)} €`}
            icon={Download}
            color="text-destructive"
          />
          <StatsCard
            label="Factures payées"
            value={`${invoices.filter((invoice) => invoice.statusColor === "success").length}`}
            icon={FileText}
            color="text-success"
          />
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Tous les mois" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les mois</SelectItem>
                  <SelectItem value="01">Janvier</SelectItem>
                  <SelectItem value="02">Février</SelectItem>
                  <SelectItem value="12">Décembre</SelectItem>
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des factures */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold">N° Facture</th>
                    <th className="text-left p-4 text-sm font-semibold">Date</th>
                    <th className="text-left p-4 text-sm font-semibold">Période</th>
                    <th className="text-left p-4 text-sm font-semibold">Commandes</th>
                    <th className="text-right p-4 text-sm font-semibold">Montant</th>
                    <th className="text-left p-4 text-sm font-semibold">Statut</th>
                    <th className="text-right p-4 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-sm text-muted-foreground">
                        Aucune facture disponible pour le moment.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-mono text-sm">{invoice.id}</td>
                        <td className="p-4 text-sm text-muted-foreground">{invoice.date}</td>
                        <td className="p-4 text-sm">{invoice.period}</td>
                        <td className="p-4 text-sm">{invoice.orders} courses</td>
                        <td className="p-4 text-right font-semibold">{invoice.amount.toFixed(2)}€</td>
                        <td className="p-4">
                          <Badge className={getStatusColor(invoice.statusColor)}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleDownload(invoice.id)}>
                              <Download className="h-4 w-4 mr-2" />
                              Télécharger
                            </Button>
                            {invoice.statusColor === "warning" && (
                              <Button variant="cta" size="sm" asChild>
                                <Link to={`/espace-client/factures/${invoice.id}/paiement`} state={{ invoice }}>
                                  Régler
                                </Link>
                              </Button>
                            )}
                          </div>
                        </td>
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

export default ClientInvoices;
