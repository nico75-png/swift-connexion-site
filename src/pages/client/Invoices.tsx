import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, FileText, Wallet } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import CreateOrderButton from "@/components/dashboard/CreateOrderButton";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/stores/auth.store";
import { getNotifications } from "@/lib/stores/driversOrders.store";
import type { NotificationEntry } from "@/lib/stores/driversOrders.store";
import { useInvoices } from "@/hooks/useInvoices";

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";
    return format(date, "dd/MM/yyyy", { locale: fr });
  } catch {
    return "Date invalide";
  }
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: "En attente de paiement",
    paid: "Payée",
    overdue: "En retard",
    cancelled: "Annulée",
  };
  return labels[status] || status;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    paid: "bg-success/10 text-success border-success/20",
    pending: "bg-warning/10 text-warning border-warning/20",
    overdue: "bg-destructive/10 text-destructive border-destructive/20",
    cancelled: "bg-muted text-muted-foreground border-muted",
  };
  return colors[status] || colors.pending;
};

/**
 * Page de gestion des factures
 * Liste, filtres, téléchargement PDF
 */
const ClientInvoices = () => {
  const { currentUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
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

  const { data: invoices = [], isLoading } = useInvoices(currentUser?.id);

  const filteredInvoices = useMemo(() => {
    if (statusFilter === "all") return invoices;
    return invoices.filter((invoice) => invoice.status === statusFilter);
  }, [invoices, statusFilter]);

  const outstandingTotal = useMemo(
    () =>
      invoices
        .filter((invoice) => invoice.status === "pending")
        .reduce((sum, invoice) => sum + invoice.amount, 0),
    [invoices],
  );

  const paidCount = useMemo(
    () => invoices.filter((invoice) => invoice.status === "paid").length,
    [invoices],
  );

  const pendingCount = useMemo(
    () => invoices.filter((invoice) => invoice.status === "pending").length,
    [invoices],
  );

  const handleDownload = useCallback((invoiceNumber: string) => {
    const invoice = invoices.find((item) => item.invoice_number === invoiceNumber);
    if (!invoice || typeof window === "undefined") return;

    const content = [
      `Facture ${invoice.invoice_number}`,
      `Date : ${formatDate(invoice.created_at)}`,
      `Date d'échéance : ${formatDate(invoice.due_date)}`,
      `Montant : ${invoice.amount.toFixed(2)} ${invoice.currency}`,
      `Statut : ${getStatusLabel(invoice.status)}`,
      invoice.notes ? `Notes : ${invoice.notes}` : "",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice.invoice_number}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }, [invoices]);

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={<Topbar userName={currentUser?.name ?? undefined} notifications={formattedNotifications} />}
      showProfileReminder
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
            label="Factures en attente"
            value={pendingCount}
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
            value={paidCount}
            icon={FileText}
            color="text-success"
          />
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="paid">Payée</SelectItem>
                  <SelectItem value="overdue">En retard</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
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
                    <th className="text-left p-4 text-sm font-semibold">Date de création</th>
                    <th className="text-left p-4 text-sm font-semibold">Date d'échéance</th>
                    <th className="text-right p-4 text-sm font-semibold">Montant</th>
                    <th className="text-left p-4 text-sm font-semibold">Statut</th>
                    <th className="text-right p-4 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                        Chargement...
                      </td>
                    </tr>
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                        Aucune facture disponible pour le moment.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-mono text-sm">{invoice.invoice_number}</td>
                        <td className="p-4 text-sm text-muted-foreground">{formatDate(invoice.created_at)}</td>
                        <td className="p-4 text-sm text-muted-foreground">{formatDate(invoice.due_date)}</td>
                        <td className="p-4 text-right font-semibold">
                          {invoice.amount.toFixed(2)} {invoice.currency}
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(invoice.status)}>
                            {getStatusLabel(invoice.status)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleDownload(invoice.invoice_number)}>
                              <Download className="h-4 w-4 mr-2" />
                              Télécharger
                            </Button>
                            {invoice.status === "pending" && (
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
