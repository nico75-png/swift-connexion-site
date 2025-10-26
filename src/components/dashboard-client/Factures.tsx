import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutGroup, AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CreditCard, Download, FileDown, Search } from "lucide-react";

import invoicesData from "@/data/invoices.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { type AssociatedOrder, type OrderStatus } from "./ModalCommandesAssociees";

type InvoiceStatus = "Payée" | "En attente" | "En retard";

type InvoiceItem = {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
};

type InvoiceCompany = {
  name: string;
  siret: string;
  address: string;
  email: string;
  phone: string;
};

type Invoice = {
  invoice_number: string;
  order_number: string;
  date_issued: string;
  due_date: string;
  status: InvoiceStatus;
  total: number;
  total_ht: number;
  tva: number;
  currency: string;
  payment_method: string;
  payment_reference?: string;
  customer: InvoiceCompany;
  issuer: InvoiceCompany;
  items: InvoiceItem[];
  notes?: string;
  associatedOrders?: AssociatedOrder[];
};

type PeriodFilter = "month" | "quarter" | "year";

type StatusFilterValue = InvoiceStatus | "all";

const STATUS_FILTERS: { label: string; value: StatusFilterValue; emoji?: string }[] = [
  { label: "Toutes", value: "all", emoji: "📁" },
  { label: "Payées", value: "Payée", emoji: "✅" },
  { label: "En attente", value: "En attente", emoji: "⏳" },
  { label: "En retard", value: "En retard", emoji: "❌" },
];

const PERIOD_OPTIONS: { label: string; value: PeriodFilter }[] = [
  { label: "Mois en cours", value: "month" },
  { label: "Trimestre", value: "quarter" },
  { label: "Année", value: "year" },
];

const STATUS_CONFIG: Record<InvoiceStatus, { badgeClass: string; label: string }> = {
  Payée: {
    badgeClass: "bg-[#D1FAE5] text-[#047857]",
    label: "Payée ✅",
  },
  "En attente": {
    badgeClass: "bg-[#FEF3C7] text-[#B45309]",
    label: "En attente ⏳",
  },
  "En retard": {
    badgeClass: "bg-[#FEE2E2] text-[#DC2626]",
    label: "En retard ❌",
  },
};



const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const formatDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : dateFormatter.format(parsed);
};

const matchPeriod = (invoice: Invoice, period: PeriodFilter, referenceDate: Date) => {
  const issuedDate = new Date(invoice.date_issued);
  if (Number.isNaN(issuedDate.getTime())) {
    return false;
  }

  const referenceYear = referenceDate.getFullYear();
  const referenceMonth = referenceDate.getMonth();
  const referenceQuarterStartMonth = referenceMonth - (referenceMonth % 3);

  switch (period) {
    case "month":
      return (
        issuedDate.getFullYear() === referenceYear && issuedDate.getMonth() === referenceMonth
      );
    case "quarter": {
      if (issuedDate.getFullYear() !== referenceYear) {
        return false;
      }
      const issuedQuarterStart = issuedDate.getMonth() - (issuedDate.getMonth() % 3);
      return issuedQuarterStart === referenceQuarterStartMonth;
    }
    case "year":
      return issuedDate.getFullYear() === referenceYear;
    default:
      return true;
  }
};

const getPaymentEmoji = (paymentMethod: string) => {
  const method = paymentMethod.toLowerCase();
  if (method.includes("carte")) {
    return "💳";
  }
  if (method.includes("virement")) {
    return "🏦";
  }
  if (method.includes("sepa")) {
    return "🔄";
  }
  return "💶";
};

const INVOICE_TO_ORDER_STATUS: Record<InvoiceStatus, OrderStatus> = {
  Payée: "Livrée",
  "En attente": "En attente",
  "En retard": "En transit",
};

const FALLBACK_ASSOCIATED_ORDERS: Record<string, AssociatedOrder[]> = {
  "FAC-2025-032": [
    {
      id: "CMD-2025-441",
      code: "CMD-2025-441",
      date: "2025-10-12",
      status: "Livrée",
      total: 648,
    },
    {
      id: "CMD-2025-445",
      code: "CMD-2025-445",
      date: "2025-10-14",
      status: "En attente",
      total: 320,
    },
    {
      id: "CMD-2025-456",
      code: "CMD-2025-456",
      date: "2025-10-16",
      status: "En transit",
      total: 480,
    },
  ],
};

const Factures = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailView, setDetailView] = useState<"invoice" | "orders">("invoice");
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      if (Array.isArray(invoicesData)) {
        setInvoices(invoicesData as Invoice[]);
      } else {
        throw new Error("INVALID_DATA");
      }
    } catch (error) {
      console.error("Erreur de chargement des factures", error);
      setLoadError("Impossible de charger les factures. Veuillez réessayer.");
    }
  }, []);

  const referenceDate = useMemo(() => {
    if (!invoices.length) {
      return new Date();
    }

    return invoices.reduce((latest, invoice) => {
      const issued = new Date(invoice.date_issued);
      if (Number.isNaN(issued.getTime())) {
        return latest;
      }
      return issued > latest ? issued : latest;
    }, new Date(invoices[0].date_issued));
  }, [invoices]);

  useEffect(() => {
    // Ajuste la période sur une valeur pertinente si aucune facture ne correspond.
    if (invoices.length === 0) {
      return;
    }

    const hasInvoicesForPeriod = invoices.some((invoice) =>
      matchPeriod(invoice, periodFilter, referenceDate),
    );

    if (!hasInvoicesForPeriod) {
      setPeriodFilter("quarter");
    }
  }, [invoices, periodFilter, referenceDate]);

  const invoicesForPeriod = useMemo(
    () => invoices.filter((invoice) => matchPeriod(invoice, periodFilter, referenceDate)),
    [invoices, periodFilter, referenceDate],
  );

  const filteredInvoices = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return invoicesForPeriod
      .filter((invoice) => {
        if (statusFilter === "all") {
          return true;
        }
        return invoice.status === statusFilter;
      })
      .filter((invoice) => {
        if (!normalizedQuery) {
          return true;
        }

        return (
          invoice.invoice_number.toLowerCase().includes(normalizedQuery) ||
          invoice.order_number.toLowerCase().includes(normalizedQuery) ||
          invoice.payment_method.toLowerCase().includes(normalizedQuery) ||
          invoice.status.toLowerCase().includes(normalizedQuery)
        );
      });
  }, [invoicesForPeriod, statusFilter, searchQuery]);

  const statusCounts = useMemo(
    () =>
      invoicesForPeriod.reduce(
        (acc, invoice) => {
          acc[invoice.status] += 1;
          return acc;
        },
        {
          Payée: 0,
          "En attente": 0,
          "En retard": 0,
        } as Record<InvoiceStatus, number>,
      ),
    [invoicesForPeriod],
  );

  const totalBilled = useMemo(
    () => invoicesForPeriod.reduce((total, invoice) => total + invoice.total, 0),
    [invoicesForPeriod],
  );

  const isRecentInvoice = useCallback(
    (invoice: Invoice) => {
      const issued = new Date(invoice.date_issued);
      if (Number.isNaN(issued.getTime())) {
        return false;
      }

      const diff = referenceDate.getTime() - issued.getTime();
      const hours = diff / (1000 * 60 * 60);
      return hours <= 48;
    },
    [referenceDate],
  );

  const handleRowClick = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailView("invoice");
    setIsDetailOpen(true);
  }, []);

  const closeDetailView = useCallback(() => {
    setIsDetailOpen(false);
    setDetailView("invoice");
    setSelectedInvoice(null);
  }, []);

  const openPaymentModal = useCallback((invoice: Invoice) => {
    setPaymentInvoice(invoice);
    setIsPaymentModalOpen(true);
  }, []);

  const closePaymentModal = useCallback(() => {
    setIsPaymentModalOpen(false);
    setPaymentInvoice(null);
  }, []);

  const handleMockPayment = useCallback(
    (invoice: Invoice, method: "card" | "bank") => {
      const paymentMethodLabel = method === "card" ? "Carte bancaire" : "Virement bancaire";

      if (method === "card" && typeof window !== "undefined") {
        const paymentUrl = `/paiement?invoice=${encodeURIComponent(invoice.invoice_number)}&method=${method}`;
        window.open(paymentUrl, "_blank", "noopener,noreferrer");
      }

      setInvoices((previousInvoices) =>
        previousInvoices.map((currentInvoice) =>
          currentInvoice.invoice_number === invoice.invoice_number
            ? {
                ...currentInvoice,
                status: "Payée",
                payment_method: paymentMethodLabel,
              }
            : currentInvoice,
        ),
      );

      setSelectedInvoice((current) =>
        current && current.invoice_number === invoice.invoice_number
          ? { ...current, status: "Payée", payment_method: paymentMethodLabel }
          : current,
      );

      toast({
        title:
          method === "card" ? "Paiement par carte initié" : "Facture marquée comme payée",
        description:
          method === "card"
            ? `Redirection vers la page de paiement sécurisée pour ${invoice.invoice_number}.`
            : `Le virement bancaire est confirmé pour la facture ${invoice.invoice_number}.`,
      });

      closePaymentModal();
    },
    [closePaymentModal, toast],
  );

  const handleDownload = useCallback(
    (invoice: Invoice) => {
      setSelectedInvoice(invoice);
      setDetailView("invoice");
      setIsDetailOpen(true);
      toast({
        title: "Téléchargement en préparation",
        description: `La facture ${invoice.invoice_number} sera générée en PDF.`,
      });
    },
    [toast],
  );

  const resolveAssociatedOrders = useCallback(
    (invoice: Invoice): AssociatedOrder[] => {
      if (invoice.associatedOrders && invoice.associatedOrders.length) {
        return invoice.associatedOrders;
      }

      if (FALLBACK_ASSOCIATED_ORDERS[invoice.invoice_number]) {
        return FALLBACK_ASSOCIATED_ORDERS[invoice.invoice_number];
      }

      return [
        {
          id: invoice.order_number,
          code: invoice.order_number,
          date: invoice.date_issued,
          status: INVOICE_TO_ORDER_STATUS[invoice.status],
          total: invoice.total,
        },
      ];
    },
    [],
  );

  const handleOpenOrder = useCallback(
    (orderId: string) => {
      toast({
        title: "Commande ouverte",
        description: `Ouverture de la commande ${orderId}.`,
      });
    },
    [toast],
  );

  const selectedInvoiceOrders = useMemo(() => {
    if (!selectedInvoice) {
      return [] as AssociatedOrder[];
    }

    return resolveAssociatedOrders(selectedInvoice);
  }, [resolveAssociatedOrders, selectedInvoice]);

  const hasMultipleSelectedOrders = selectedInvoiceOrders.length > 1;
  const isOrdersView = detailView === "orders";
  const ordersTotal = useMemo(
    () => selectedInvoiceOrders.reduce((sum, order) => sum + order.total, 0),
    [selectedInvoiceOrders],
  );



  const periodLabel = useMemo(() => {
    const option = PERIOD_OPTIONS.find((item) => item.value === periodFilter);
    return option ? option.label.toLowerCase() : "";
  }, [periodFilter]);

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-[22px] font-semibold text-slate-900">Factures 💶</h1>
          <p className="text-sm text-slate-600">
            Consultez et téléchargez vos factures en toute transparence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-[#F9FAFB] px-5 py-4 text-sm text-[#4B5563] shadow-sm">
          <span aria-hidden className="text-lg">📊</span>
          <p>
            <span className="font-semibold text-slate-900">{statusCounts["Payée"]}</span> factures payées •{' '}
            <span className="font-semibold text-slate-900">{statusCounts["En attente"]}</span> en attente •{' '}
            <span className="font-semibold text-slate-900">{statusCounts["En retard"]}</span> en retard • Total facturé :{' '}
            <span className="font-semibold text-slate-900">{formatCurrency(totalBilled)}</span> ce {periodLabel}
          </p>
        </div>
      </header>

      {loadError ? (
        <div
          className="rounded-xl border border-[#FDE68A] bg-[#FEF3C7] px-4 py-3 text-sm text-[#92400E]"
          role="alert"
          aria-live="polite"
        >
          {loadError}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <LayoutGroup>
            <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filtres de factures">
              {STATUS_FILTERS.map((filter) => {
                const isActive = statusFilter === filter.value;
                return (
                  <motion.button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatusFilter(filter.value)}
                    className={cn(
                      "relative overflow-hidden rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD] focus-visible:ring-offset-2",
                      isActive ? "text-[#1D4ED8]" : "text-slate-600 hover:text-[#1D4ED8]",
                    )}
                    whileTap={{ scale: 0.97 }}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="filter-pill"
                        className="absolute inset-0 rounded-full bg-[#DBEAFE]"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        aria-hidden
                      />
                    ) : null}
                    <span className="relative z-10 flex items-center gap-1">
                      <span aria-hidden>{filter.emoji}</span>
                      {filter.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </LayoutGroup>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Select value={periodFilter} onValueChange={(value) => setPeriodFilter(value as PeriodFilter)}>
              <SelectTrigger className="w-full min-w-[180px] border-slate-200 focus:ring-[#93C5FD] focus:ring-offset-2">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative w-full min-w-[260px] sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <Input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Rechercher une facture ou un numéro de commande…"
                className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 text-sm text-slate-700 focus-visible:ring-[#93C5FD]"
                aria-label="Rechercher une facture ou un numéro de commande"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Facture</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date d'émission</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Montant TTC</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Paiement</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length ? (
                    [...filteredInvoices]
                      .sort((a, b) => new Date(b.date_issued).getTime() - new Date(a.date_issued).getTime())
                      .map((invoice) => (
                        <motion.tr
                          key={invoice.invoice_number}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="cursor-pointer border-b border-slate-100 bg-white transition-shadow hover:bg-[#F9FAFB] hover:shadow-md"
                          onClick={() => handleRowClick(invoice)}
                        >
                          <td className="px-4 py-4 align-top">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-900">{invoice.invoice_number}</span>
                                {isRecentInvoice(invoice) ? (
                                  <Badge className="bg-blue-600/10 text-[11px] font-semibold uppercase tracking-wide text-blue-700">Nouveau</Badge>
                                ) : null}
                              </div>
                              <p className="text-xs text-slate-500">Commande {invoice.order_number}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="space-y-1 text-sm text-slate-600">
                              <p className="font-medium text-slate-800">{formatDate(invoice.date_issued)}</p>
                              <p className="text-xs text-slate-500">Échéance : {formatDate(invoice.due_date)}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 align-top text-right">
                            <div className="text-right text-sm font-semibold text-slate-900">{formatCurrency(invoice.total)}</div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium uppercase leading-4 shadow-sm",
                                STATUS_CONFIG[invoice.status].badgeClass,
                              )}
                            >
                              {STATUS_CONFIG[invoice.status].label}
                            </span>
                          </td>
                          <td className="px-4 py-4 align-top">
                            {invoice.status === "Payée" ? (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span aria-hidden className="text-base">{getPaymentEmoji(invoice.payment_method)}</span>
                                <span>{invoice.payment_method}</span>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                className="bg-[#2563EB] px-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openPaymentModal(invoice);
                                }}
                                aria-label={`Payer la facture ${invoice.invoice_number}`}
                              >
                                💶 Payer maintenant
                              </Button>
                            )}
                          </td>
                          <td className="px-4 py-4 align-top text-right">
                            <div className="flex justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-[#BFDBFE] text-sm font-medium text-[#1D4ED8] hover:bg-[#DBEAFE]"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDownload(invoice);
                                }}
                                aria-label={`Télécharger la facture ${invoice.invoice_number}`}
                              >
                                <Download className="h-4 w-4" aria-hidden />
                                Télécharger PDF
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                  ) : (
                    <tr>
                      <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={6}>
                        <div className="mx-auto max-w-md space-y-4">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
                            <FileDown aria-hidden />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-base font-semibold text-slate-800">Aucune facture disponible pour cette période.</h3>
                            <p> Ajustez vos filtres ou élargissez la période de recherche pour retrouver vos factures. </p>
                          </div>
                          <div className="flex justify-center">
                            <Button type="button" variant="outline" className="border-[#BFDBFE] text-[#1D4ED8]">
                              Voir toutes mes commandes
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDetailOpen && selectedInvoice ? (
          <motion.div
            key={selectedInvoice.invoice_number}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/30 px-4 py-8 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="facture-detail-title"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                closeDetailView();
              }
            }}
          >
            <motion.div
              layout
              className="relative w-full max-w-4xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <div className="absolute -top-10 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white/90 px-5 py-2 text-xs font-medium text-slate-600 shadow-lg shadow-slate-900/10 backdrop-blur">
                <span className="text-slate-400">ℹ️</span>
                <span>Consultation des commandes associées à cette facture — affichage temporaire.</span>
              </div>

              <div
                className={cn(
                  "group relative overflow-hidden rounded-3xl transition-all duration-300",
                  isOrdersView
                    ? "bg-slate-50 shadow-inner shadow-slate-900/10"
                    : "bg-white shadow-xl shadow-slate-900/10",
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100/40 via-transparent to-blue-100/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />

                <div className="relative flex flex-col gap-8 px-6 py-8 sm:px-10">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{isOrdersView ? "Vue commandes" : "Vue facture"}</p>
                      <h2
                        id="facture-detail-title"
                        className="text-2xl font-semibold text-slate-900"
                      >
                        {isOrdersView
                          ? `Commandes associées à la facture ${selectedInvoice.invoice_number}`
                          : `Facture ${selectedInvoice.invoice_number}`}
                      </h2>
                      <p className="text-sm text-slate-600">
                        Commande associée principale : {selectedInvoice.order_number}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>Émise le {formatDate(selectedInvoice.date_issued)}</span>
                        <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline" aria-hidden />
                        <span>Échéance {formatDate(selectedInvoice.due_date)}</span>
                        {selectedInvoice.payment_reference ? (
                          <>
                            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline" aria-hidden />
                            <span>Réf. paiement : {selectedInvoice.payment_reference}</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 text-right">
                      <motion.span
                        layout
                        className={cn(
                          "inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-wide",
                          STATUS_CONFIG[selectedInvoice.status].badgeClass,
                        )}
                      >
                        {STATUS_CONFIG[selectedInvoice.status].label}
                      </motion.span>
                      <button
                        type="button"
                        onClick={closeDetailView}
                        className="text-xs font-semibold text-slate-400 transition-colors duration-200 hover:text-slate-600"
                        aria-label="Fermer la fiche facture"
                      >
                        Fermer ✕
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={detailView}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="space-y-6"
                      >
                        {detailView === "invoice" ? (
                          <div className="space-y-6">
                            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-slate-500">Total TTC</p>
                                  <p className="text-xl font-semibold text-slate-900">
                                    {formatCurrency(selectedInvoice.total)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-slate-500">Total HT</p>
                                  <p className="text-sm font-medium text-slate-800">
                                    {formatCurrency(selectedInvoice.total_ht)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-slate-500">TVA</p>
                                  <p className="text-sm font-medium text-slate-800">
                                    {formatCurrency(selectedInvoice.tva)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-3 text-sm text-slate-600">
                                <p className="flex items-center gap-2 text-slate-700">
                                  <span role="img" aria-hidden>
                                    {getPaymentEmoji(selectedInvoice.payment_method)}
                                  </span>
                                  <span>Moyen de paiement : {selectedInvoice.payment_method}</span>
                                </p>
                                {selectedInvoice.status !== "Payée" ? (
                                  <p className="text-sm font-medium text-slate-700">
                                    Montant à payer : {formatCurrency(selectedInvoice.total)} — Échéance : {formatDate(selectedInvoice.due_date)}
                                  </p>
                                ) : (
                                  <p className="text-sm font-semibold text-emerald-600">Facture réglée ✅</p>
                                )}
                                <div className="flex flex-col space-y-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start sm:space-y-0 sm:space-x-3">
                                  <Button
                                    type="button"
                                    size="sm"
                                    disabled={selectedInvoice.status === "Payée"}
                                    onClick={() => openPaymentModal(selectedInvoice)}
                                    className={cn(
                                      "inline-flex h-[42px] w-full items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium shadow-sm transition-colors duration-200 sm:w-auto",
                                      selectedInvoice.status === "Payée"
                                        ? "cursor-not-allowed bg-slate-200 text-slate-500 opacity-60"
                                        : "bg-green-600 text-white hover:bg-green-700",
                                    )}
                                    aria-disabled={selectedInvoice.status === "Payée"}
                                  >
                                    {selectedInvoice.status === "Payée" ? (
                                      <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden />
                                        Déjà payée ✅
                                      </>
                                    ) : (
                                      <>
                                        <CreditCard className="mr-2 h-4 w-4" aria-hidden />
                                        💳 Payer la facture
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="inline-flex h-[42px] w-full items-center justify-center rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-[#1D4ED8] sm:w-auto"
                                    onClick={() => handleDownload(selectedInvoice)}
                                    aria-label="Télécharger la facture"
                                  >
                                    <Download className="mr-2 h-4 w-4" aria-hidden />
                                    Télécharger le PDF
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="inline-flex h-[42px] w-full items-center justify-center rounded-xl border-[#BFDBFE] px-5 py-2.5 text-sm font-medium text-[#1D4ED8] shadow-sm transition-colors duration-200 hover:bg-[#DBEAFE] sm:w-auto"
                                    onClick={() =>
                                      toast({
                                        title: "Service facturation",
                                        description: "Un conseiller vous recontacte sous 24h.",
                                      })
                                    }
                                  >
                                    Contacter un conseiller
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="inline-flex h-[42px] w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-slate-700 sm:w-auto"
                                    onClick={() => setDetailView("orders")}
                                  >
                                    Accéder aux commandes associées
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between rounded-xl bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-inner">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{hasMultipleSelectedOrders ? "🧾" : "📄"}</span>
                                  <div>
                                    <p className="font-medium text-slate-900">
                                      {hasMultipleSelectedOrders
                                        ? `${selectedInvoiceOrders.length} commandes associées`
                                        : "Commande associée"}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {hasMultipleSelectedOrders
                                        ? "Visualisez le détail de chaque livraison."
                                        : "Accédez directement au bon de commande."}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-xs text-slate-500">
                                  Utilisez l'action « Accéder aux commandes associées » ci-dessus pour consulter le détail.
                                </div>
                              </div>
                            </div>

                            <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white/90 p-5">
                              <h3 className="text-sm font-semibold text-slate-900">Informations de facturation</h3>
                              <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Client</p>
                                  <p className="font-medium text-slate-900">{selectedInvoice.customer.name}</p>
                                  <p>{selectedInvoice.customer.address}</p>
                                  <p>SIRET : {selectedInvoice.customer.siret}</p>
                                  <p>Email : {selectedInvoice.customer.email}</p>
                                  <p>Téléphone : {selectedInvoice.customer.phone}</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Swift Connexion</p>
                                  <p className="font-medium text-slate-900">{selectedInvoice.issuer.name}</p>
                                  <p>{selectedInvoice.issuer.address}</p>
                                  <p>SIRET : {selectedInvoice.issuer.siret}</p>
                                  <p>Email : {selectedInvoice.issuer.email}</p>
                                  <p>Téléphone : {selectedInvoice.issuer.phone}</p>
                                </div>
                              </div>
                            </div>

                            <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white/90 p-5">
                              <h3 className="text-sm font-semibold text-slate-900">Détail de la facture</h3>
                              <ScrollArea className="max-h-72 pr-2">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-xs uppercase tracking-wide text-slate-500">
                                      <th className="py-2 text-left">Désignation</th>
                                      <th className="py-2 text-center">Quantité</th>
                                      <th className="py-2 text-right">Prix unitaire</th>
                                      <th className="py-2 text-right">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {selectedInvoice.items.map((item) => (
                                      <tr key={`${item.description}-${item.total}`} className="border-t border-slate-100">
                                        <td className="py-3 pr-4 text-slate-700">{item.description}</td>
                                        <td className="py-3 text-center text-slate-600">{item.quantity}</td>
                                        <td className="py-3 text-right text-slate-600">
                                          {formatCurrency(item.unit_price)}
                                        </td>
                                        <td className="py-3 text-right font-medium text-slate-800">
                                          {formatCurrency(item.total)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </ScrollArea>
                            </div>

                            {selectedInvoice.notes ? (
                              <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 text-sm text-slate-600">
                                <p className="font-medium text-slate-800">Notes</p>
                                <p className="mt-1 leading-relaxed">{selectedInvoice.notes}</p>
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <p className="text-sm font-semibold text-slate-900">
                                    Total des commandes associées
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Visualisez les bons de commande liés à cette facture.
                                  </p>
                                </div>
                                <p className="text-2xl font-semibold text-slate-900">
                                  {formatCurrency(ordersTotal)}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                                  {selectedInvoiceOrders.length} commande(s)
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-700">
                                  Facture {selectedInvoice.invoice_number}
                                </span>
                              </div>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                              <table className="w-full text-sm">
                                <thead className="bg-slate-100/70 text-xs uppercase tracking-wide text-slate-500">
                                  <tr>
                                    <th className="px-4 py-3 text-left">Numéro</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-left">Statut</th>
                                    <th className="px-4 py-3 text-right">Montant TTC</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                  {selectedInvoiceOrders.map((order) => (
                                    <motion.tr
                                      key={order.id}
                                      initial={{ opacity: 0, y: 8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.25, ease: "easeOut" }}
                                      className="bg-white/80 hover:bg-slate-50"
                                    >
                                      <td className="px-4 py-3 font-medium text-slate-900">{order.code}</td>
                                      <td className="px-4 py-3 text-sm">{formatDate(order.date)}</td>
                                      <td className="px-4 py-3">
                                        <Badge
                                          className={cn(
                                            "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold",
                                            order.status === "Livrée"
                                              ? "bg-emerald-100 text-emerald-700"
                                              : order.status === "En transit"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-amber-100 text-amber-700",
                                          )}
                                        >
                                          {order.status}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-3 text-right font-medium">
                                        {formatCurrency(order.total)}
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="outline"
                                          className="border-slate-200 text-slate-700 hover:bg-slate-100"
                                          onClick={() => handleOpenOrder(order.id)}
                                        >
                                          Ouvrir
                                        </Button>
                                      </td>
                                    </motion.tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-5 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                              <div className="space-y-1">
                                <p className="font-medium text-slate-900">Timeline de facturation</p>
                                <p className="text-xs text-slate-500">
                                  Des commandes à la facture : suivez les étapes clés.
                                </p>
                                <div className="mt-3 grid gap-2 text-xs">
                                  <div className="flex items-center gap-3">
                                    <span className="h-2 w-2 rounded-full bg-blue-500" aria-hidden />
                                    <span>Validation de la commande</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                                    <span>Livraison confirmée</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="h-2 w-2 rounded-full bg-slate-400" aria-hidden />
                                    <span>Facture émise</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                  📦
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">Suivi logistique</p>
                                  <p className="text-xs text-slate-500">3 commandes en cours de suivi.</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <Button
                                type="button"
                                variant="ghost"
                                className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                                onClick={() => setDetailView("invoice")}
                              >
                                ← Retour à la facture
                              </Button>
                              <div className="flex flex-col gap-2 text-xs text-slate-500 sm:text-right">
                                <span>
                                  Besoin d'aide ? Contactez le support commandes.
                                </span>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="self-start bg-[#2563EB] text-white hover:bg-[#1D4ED8] sm:self-end"
                                  onClick={() =>
                                    toast({
                                      title: "Support commandes",
                                      description: "Un conseiller vous rappelle dans l'heure.",
                                    })
                                  }
                                >
                                  Contacter le support
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Dialog
        open={isPaymentModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closePaymentModal();
          }
        }}
      >
        <DialogContent className="max-w-[520px] rounded-[14px] border-none bg-white p-0 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          {paymentInvoice ? (
            <div className="overflow-hidden rounded-[14px]">
              <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
                <DialogHeader className="items-start space-y-4 text-left">
                  <div className="space-y-2">
                    <DialogTitle className="text-lg font-semibold text-slate-900">
                      Choisir un mode de paiement
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-600">
                      Sélectionnez votre méthode de règlement pour la facture {paymentInvoice.invoice_number}.
                    </DialogDescription>
                  </div>
                  <div className="grid w-full gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-white px-4 py-3 shadow-inner">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Montant TTC</p>
                      <p className="text-base font-semibold text-slate-900">
                        {formatCurrency(paymentInvoice.total)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white px-4 py-3 shadow-inner">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date d'échéance</p>
                      <p className="text-sm font-medium text-slate-800">
                        {formatDate(paymentInvoice.due_date)}
                      </p>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <div className="space-y-5 px-6 py-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-900">Moyens de paiement disponibles</h3>
                  <p className="text-sm text-slate-600">
                    Choisissez la solution la plus adaptée pour finaliser le règlement.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">💳 Carte bancaire</p>
                        <p className="text-xs text-slate-500">Paiement immédiat et sécurisé en ligne.</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-[#2563EB] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8]"
                        onClick={() => handleMockPayment(paymentInvoice, "card")}
                      >
                        Payer par carte
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">🏦 Virement bancaire</p>
                        <p className="text-xs text-slate-500">Utilisez les coordonnées bancaires Swift Connexion.</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-green-50 px-4 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-100"
                        onClick={() => handleMockPayment(paymentInvoice, "bank")}
                      >
                        Marquer comme payé
                      </Button>
                    </div>
                    <div className="grid gap-2 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      <p>
                        <span className="font-semibold text-slate-800">Titulaire :</span> Swift Transport
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">Banque :</span> BNP Paribas
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">IBAN :</span> FR76 3000 4000 1234 5678 9012 345
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">BIC :</span> BNPAFRPPXXX
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                  onClick={closePaymentModal}
                >
                  Annuler
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Factures;
