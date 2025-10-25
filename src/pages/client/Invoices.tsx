import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, FileText, Loader2, Search, Wallet } from "lucide-react";
import { differenceInCalendarDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import CreateOrderButton from "@/components/dashboard/CreateOrderButton";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const formatPeriod = (dateString: string | null | undefined) => {
  if (!dateString) return "Période inconnue";
  try {
    const date = new Date(dateString);
    if (!date || isNaN(date.getTime()) || date.getTime() === 0) {
      return "Période inconnue";
    }
    return format(date, "LLLL yyyy", { locale: fr });
  } catch {
    return "Période inconnue";
  }
};

const periodOptions = [
  { value: "all", label: "Toutes les périodes" },
  { value: "30", label: "30 derniers jours" },
  { value: "90", label: "3 derniers mois" },
  { value: "180", label: "6 derniers mois" },
  { value: "365", label: "12 derniers mois" },
];

/**
 * Page de gestion des factures
 * Liste, filtres, téléchargement PDF
 */
const ClientInvoices = () => {
  const { currentUser, currentClient } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
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
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const now = new Date();

    return invoices.filter((invoice) => {
      if (statusFilter !== "all" && invoice.status !== statusFilter) {
        return false;
      }

      if (periodFilter !== "all") {
        const createdAt = invoice.created_at ? new Date(invoice.created_at) : null;
        if (!createdAt || isNaN(createdAt.getTime())) {
          return false;
        }
        const limitInDays = Number(periodFilter);
        if (differenceInCalendarDays(now, createdAt) > limitInDays) {
          return false;
        }
      }

      if (normalizedSearch) {
        const searchableText = [
          invoice.invoice_number,
          invoice.notes ?? "",
          formatDate(invoice.created_at),
          formatDate(invoice.due_date),
        ]
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(normalizedSearch)) {
          return false;
        }
      }

      return true;
    });
  }, [invoices, periodFilter, searchTerm, statusFilter]);

  const outstandingTotal = useMemo(
    () =>
      filteredInvoices
        .filter((invoice) => invoice.status === "pending")
        .reduce((sum, invoice) => sum + invoice.amount, 0),
    [filteredInvoices],
  );

  const paidCount = useMemo(
    () => filteredInvoices.filter((invoice) => invoice.status === "paid").length,
    [filteredInvoices],
  );

  const pendingCount = useMemo(
    () => filteredInvoices.filter((invoice) => invoice.status === "pending").length,
    [filteredInvoices],
  );

  const summaryTotals = useMemo(
    () =>
      filteredInvoices.reduce(
        (acc, invoice) => {
          acc.total += invoice.amount;
          if (invoice.status === "paid") {
            acc.paid += invoice.amount;
          }
          if (invoice.status === "pending") {
            acc.pending += invoice.amount;
          }
          if (invoice.status === "overdue") {
            acc.overdue += invoice.amount;
          }
          return acc;
        },
        { total: 0, paid: 0, pending: 0, overdue: 0 },
      ),
    [filteredInvoices],
  );

  const summaryTiles = useMemo(
    () => [
      {
        label: "Total des factures",
        value: `${summaryTotals.total.toFixed(2)} €`,
        description: `${filteredInvoices.length} facture${filteredInvoices.length > 1 ? "s" : ""}`,
      },
      {
        label: "Montants payés",
        value: `${summaryTotals.paid.toFixed(2)} €`,
        description: "Factures réglées et archivées",
      },
      {
        label: "Montants en attente",
        value: `${summaryTotals.pending.toFixed(2)} €`,
        description: "Paiements à finaliser",
      },
      {
        label: "Montants en retard",
        value: `${summaryTotals.overdue.toFixed(2)} €`,
        description: "Actions prioritaires recommandées",
      },
    ],
    [filteredInvoices.length, summaryTotals.overdue, summaryTotals.paid, summaryTotals.pending, summaryTotals.total],
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
      <div className="-mx-6 -my-6 space-y-8 rounded-[28px] bg-[#F4F7FB] px-6 py-6 text-[#0B0B0B] shadow-[0_12px_32px_rgba(11,45,85,0.08)] md:-mx-10 md:-my-8 md:px-10 md:py-8">
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

        {/* Outils de recherche */}
        <Card className="rounded-3xl border border-[rgba(11,45,85,0.12)] bg-white/90 shadow-[0_12px_30px_rgba(11,45,85,0.08)] backdrop-blur">
          <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-end">
            <div className="flex-1 space-y-2">
              <label htmlFor="invoice-search" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0B2D55]/80">
                Recherche
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0B2D55]/50" />
                <Input
                  id="invoice-search"
                  placeholder="Rechercher une facture, une note ou une date"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="h-12 rounded-2xl border border-[rgba(11,45,85,0.12)] bg-white pl-11 text-sm text-[#0B0B0B] shadow-[0_4px_14px_rgba(11,45,85,0.08)] focus:border-[#0B2D55] focus:ring-2 focus:ring-[#00A3E0]/20"
                />
              </div>
            </div>
            <div className="grid w-full gap-4 sm:grid-cols-2 lg:w-auto lg:grid-cols-3">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0B2D55]/80">Période</span>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="h-12 min-w-[200px] rounded-2xl border border-[rgba(11,45,85,0.12)] bg-white text-sm text-[#0B0B0B] shadow-[0_4px_14px_rgba(11,45,85,0.08)] focus:ring-2 focus:ring-[#00A3E0]/20">
                    <SelectValue placeholder="Toutes les périodes" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-[rgba(11,45,85,0.12)] bg-white text-sm text-[#0B0B0B] shadow-[0_12px_30px_rgba(11,45,85,0.12)]">
                    {periodOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0B2D55]/80">Statut</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12 min-w-[200px] rounded-2xl border border-[rgba(11,45,85,0.12)] bg-white text-sm text-[#0B0B0B] shadow-[0_4px_14px_rgba(11,45,85,0.08)] focus:ring-2 focus:ring-[#00A3E0]/20">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-[rgba(11,45,85,0.12)] bg-white text-sm text-[#0B0B0B] shadow-[0_12px_30px_rgba(11,45,85,0.12)]">
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="paid">Payée</SelectItem>
                    <SelectItem value="overdue">En retard</SelectItem>
                    <SelectItem value="cancelled">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des factures */}
        <Card className="rounded-3xl border border-[rgba(11,45,85,0.08)] bg-white shadow-[0_20px_45px_rgba(11,45,85,0.08)]">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="empty-state" role="status" aria-live="polite">
                <Loader2 className="h-8 w-8 animate-spin text-[#0B2D55]" aria-hidden="true" />
                <p className="text-sm text-[#4A4A4A]">Chargement des factures…</p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="empty-state px-6 py-12" role="status">
                <FileText className="h-10 w-10 text-[#0B2D55]" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="text-base font-semibold text-[#0B2D55]">Aucune facture ne correspond à vos critères.</p>
                  <p className="text-sm text-[#4A4A4A]">
                    Ajustez les filtres ou élargissez la recherche pour afficher l’historique complet.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#E0E8F3] bg-[#E9F1FB]">
                    <tr>
                      <th className="p-4 text-left font-semibold uppercase tracking-[0.18em] text-[#0B2D55]">N° Facture</th>
                      <th className="p-4 text-left font-semibold uppercase tracking-[0.18em] text-[#0B2D55]">Client</th>
                      <th className="p-4 text-left font-semibold uppercase tracking-[0.18em] text-[#0B2D55]">Période</th>
                      <th className="p-4 text-right font-semibold uppercase tracking-[0.18em] text-[#0B2D55]">Montant</th>
                      <th className="p-4 text-left font-semibold uppercase tracking-[0.18em] text-[#0B2D55]">Échéance</th>
                      <th className="p-4 text-left font-semibold uppercase tracking-[0.18em] text-[#0B2D55]">Statut</th>
                      <th className="p-4 text-right font-semibold uppercase tracking-[0.18em] text-[#0B2D55]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-[#EEF3FA] transition-colors hover:bg-[#F5F9FF]">
                        <td className="p-4 font-mono text-sm font-semibold text-[#0B2D55]">{invoice.invoice_number}</td>
                        <td className="p-4 text-sm text-[#0B2D55]/80">{currentClient?.company ?? "Compte principal"}</td>
                        <td className="p-4 text-sm capitalize text-[#0B2D55]/80">{formatPeriod(invoice.created_at)}</td>
                        <td className="p-4 text-right text-base font-semibold text-[#0B2D55]">
                          {invoice.amount.toFixed(2)} {invoice.currency}
                        </td>
                        <td className="p-4 text-sm text-[#4A4A4A]">{formatDate(invoice.due_date)}</td>
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
                              className="rounded-full bg-transparent px-4 text-[#0B2D55] transition hover:bg-[rgba(0,163,224,0.12)]"
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
                                className="rounded-full bg-[#FFCC00] px-4 py-2 text-sm font-semibold text-[#0B2D55] shadow-[0_8px_18px_rgba(255,204,0,0.32)] transition hover:bg-[#FFD84D] hover:shadow-[0_10px_24px_rgba(255,204,0,0.38)]"
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

        {/* Récapitulatif */}
        <Card className="rounded-3xl border border-[rgba(11,45,85,0.08)] bg-gradient-to-r from-white via-white to-[#F1F6FD] shadow-[0_18px_40px_rgba(11,45,85,0.07)]">
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0B2D55]/70">Synthèse</p>
                <h2 className="text-xl font-semibold text-[#0B2D55]">Vue d'ensemble des encaissements</h2>
              </div>
              <p className="text-sm text-[#4A4A4A]">
                Les montants s’adaptent automatiquement selon vos filtres actifs pour faciliter vos relances.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summaryTiles.map((tile) => (
                <div
                  key={tile.label}
                  className="rounded-2xl border border-[#DCE6F5] bg-white/80 px-5 py-4 shadow-[0_10px_24px_rgba(11,45,85,0.06)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B2D55]/60">{tile.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-[#0B2D55]">{tile.value}</p>
                  <p className="mt-1 text-sm text-[#4A4A4A]">{tile.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientInvoices;
