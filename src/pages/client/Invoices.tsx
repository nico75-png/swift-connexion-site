import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, FileText, Loader2, Wallet } from "lucide-react";
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

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    // Vérifie si la date est valide
    if (!date || isNaN(date.getTime()) || date.getTime() === 0) {
      return "Date invalide";
    }
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
    paid: "border-[rgba(0,184,132,0.3)] bg-[rgba(0,184,132,0.12)] text-[#00B884]",
    pending: "border-[rgba(255,176,32,0.35)] bg-[rgba(255,176,32,0.15)] text-[#C46A00]",
    overdue: "border-[rgba(232,76,76,0.35)] bg-[rgba(232,76,76,0.18)] text-[#D64545]",
    cancelled: "border-[rgba(200,224,251,0.6)] bg-[rgba(200,224,251,0.45)] text-[#0B2D55]",
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
      <div className="-mx-6 -my-6 space-y-8 rounded-3xl bg-[#F2F6FA] px-6 py-6 text-[#0B0B0B] shadow-[0_4px_20px_rgba(11,45,85,0.05)] md:-mx-10 md:-my-8 md:px-10 md:py-8">
        {/* En-tête */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="h-8 w-1 rounded-full bg-[#0B2D55]" />
              <h1 className="text-3xl font-semibold tracking-tight text-[#0B2D55]">Factures</h1>
            </div>
            <p className="text-sm text-[#4A4A4A]">Consultez et téléchargez vos factures</p>
          </div>
          <CreateOrderButton className="mt-3 sm:mt-0" />
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatsCard
            label="Factures en attente"
            value={pendingCount}
            icon={Wallet}
            color="text-[#0B2D55]"
          />
          <StatsCard
            label="Montant dû"
            value={`${outstandingTotal.toFixed(2)} €`}
            icon={Download}
            color="text-[#0B2D55]"
          />
          <StatsCard
            label="Factures payées"
            value={paidCount}
            icon={FileText}
            color="text-[#0B2D55]"
          />
        </div>

        {/* Filtres */}
        <Card className="rounded-3xl border border-[rgba(0,0,0,0.08)] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 w-full rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white text-sm text-[#0B0B0B] shadow-[0_4px_12px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-[rgba(11,45,85,0.2)] md:w-48">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white text-sm text-[#0B0B0B] shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
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
        <Card className="rounded-3xl border border-[rgba(0,0,0,0.08)] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="empty-state" role="status" aria-live="polite">
                <Loader2 className="h-8 w-8 animate-spin text-[#0B2D55]" aria-hidden="true" />
                <p className="text-sm text-[#4A4A4A]">Chargement des factures…</p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="empty-state" role="status">
                <FileText className="h-10 w-10 text-[#0B2D55]" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="text-base font-semibold text-[#0B2D55]">Aucune facture disponible pour le moment.</p>
                  <p className="text-sm text-[#4A4A4A]">Vos factures s’afficheront ici dès qu’elles seront générées.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-[#E3EDF8]">
                    <tr>
                      <th className="p-4 text-left text-sm font-semibold uppercase tracking-wide text-[#0B2D55]">N° Facture</th>
                      <th className="p-4 text-left text-sm font-semibold uppercase tracking-wide text-[#0B2D55]">Date de création</th>
                      <th className="p-4 text-left text-sm font-semibold uppercase tracking-wide text-[#0B2D55]">Date d'échéance</th>
                      <th className="p-4 text-right text-sm font-semibold uppercase tracking-wide text-[#0B2D55]">Montant</th>
                      <th className="p-4 text-left text-sm font-semibold uppercase tracking-wide text-[#0B2D55]">Statut</th>
                      <th className="p-4 text-right text-sm font-semibold uppercase tracking-wide text-[#0B2D55]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b transition-colors hover:bg-[#F0F6FD]">
                        <td className="p-4 font-mono text-sm font-semibold text-[#0B2D55]">{invoice.invoice_number}</td>
                        <td className="p-4 text-sm text-[#4A4A4A]">{formatDate(invoice.created_at)}</td>
                        <td className="p-4 text-sm text-[#4A4A4A]">{formatDate(invoice.due_date)}</td>
                        <td className="p-4 text-right text-base font-semibold text-[#0B2D55]">
                          {invoice.amount.toFixed(2)} {invoice.currency}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={`${getStatusColor(invoice.status)} px-3 py-1 text-xs font-semibold`}>
                            {getStatusLabel(invoice.status)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-full bg-transparent px-4 text-[#0B2D55] transition hover:bg-[rgba(255,204,0,0.2)]"
                              asChild
                            >
                              <Link
                                to={`/factures/${invoice.id}`}
                                state={{ invoice }}
                                onClick={() => handleDownload(invoice.invoice_number)}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Télécharger
                              </Link>
                            </Button>
                            {invoice.status === "pending" && (
                              <Button
                                variant="default"
                                size="sm"
                                className="rounded-full bg-[#FFCC00] px-4 py-2 text-sm font-semibold text-[#0B2D55] shadow-[0_6px_16px_rgba(255,204,0,0.25)] transition hover:bg-[#FFD84D] hover:shadow-[0_8px_20px_rgba(255,204,0,0.3)]"
                                asChild
                              >
                                <Link to={`/factures/${invoice.id}`} state={{ invoice }}>
                                  Régler
                                </Link>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientInvoices;
