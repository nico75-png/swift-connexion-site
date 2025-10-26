import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { Download, FileDown, Search } from "lucide-react";

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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

const Factures = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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
    setIsSheetOpen(true);
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
      const paymentUrl = `/paiement?invoice=${encodeURIComponent(invoice.invoice_number)}&method=${method}`;
      const paymentMethodLabel = method === "card" ? "Carte bancaire" : "Virement bancaire";

      if (typeof window !== "undefined") {
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
        title: "Redirection vers la page de paiement",
        description: `Un nouvel onglet s'ouvre pour finaliser le paiement ${
          method === "card" ? "par carte bancaire" : "par virement bancaire"
        } de ${invoice.invoice_number}.`,
      });

      closePaymentModal();
    },
    [closePaymentModal, toast],
  );

  const handleDownload = useCallback(
    (invoice: Invoice) => {
      setSelectedInvoice(invoice);
      setIsSheetOpen(true);
      toast({
        title: "Téléchargement en préparation",
        description: `La facture ${invoice.invoice_number} sera générée en PDF.`,
      });
    },
    [toast],
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

      <Sheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) {
            setSelectedInvoice(null);
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full max-w-full overflow-y-auto border-l border-slate-200 bg-white sm:max-w-xl"
        >
          {selectedInvoice ? (
            <div className="space-y-6">
              <SheetHeader className="items-start space-y-3 text-left">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <SheetTitle className="text-lg font-semibold text-slate-900">
                      Facture {selectedInvoice.invoice_number}
                    </SheetTitle>
                    <SheetDescription className="text-sm text-slate-500">
                      Commande associée : {selectedInvoice.order_number}
                    </SheetDescription>
                  </div>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium uppercase leading-4",
                      STATUS_CONFIG[selectedInvoice.status].badgeClass,
                    )}
                  >
                    {STATUS_CONFIG[selectedInvoice.status].label}
                  </motion.span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>Émise le {formatDate(selectedInvoice.date_issued)}</span>
                  <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline" aria-hidden />
                  <span>Échéance {formatDate(selectedInvoice.due_date)}</span>
                  {selectedInvoice.payment_reference ? (
                    <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline" aria-hidden />
                  ) : null}
                  {selectedInvoice.payment_reference ? (
                    <span>Réf. paiement : {selectedInvoice.payment_reference}</span>
                  ) : null}
                </div>
              </SheetHeader>

              <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Montant TTC</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {formatCurrency(selectedInvoice.total)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Moyen de paiement</p>
                    <p className="text-sm text-slate-700">
                      {getPaymentEmoji(selectedInvoice.payment_method)} {selectedInvoice.payment_method}
                    </p>
                  </div>
                </div>
                <div>
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-sm text-[#1D4ED8]"
                    onClick={() =>
                      toast({
                        title: "Redirection vers la commande",
                        description: `Ouverture de la commande ${selectedInvoice.order_number}.`,
                      })
                    }
                  >
                    Accéder à la commande associée →
                  </Button>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-4 rounded-2xl border border-slate-200 p-4">
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

                <div className="grid gap-4 rounded-2xl border border-slate-200 p-4">
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
                  <Separator className="bg-slate-200" />
                  <div className="space-y-1 text-sm text-slate-700">
                    <div className="flex items-center justify-between">
                      <span>Total HT</span>
                      <span>{formatCurrency(selectedInvoice.total_ht)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>TVA</span>
                      <span>{formatCurrency(selectedInvoice.tva)}</span>
                    </div>
                    <div className="flex items-center justify-between text-base font-semibold text-slate-900">
                      <span>Total TTC</span>
                      <span>{formatCurrency(selectedInvoice.total)}</span>
                    </div>
                  </div>
                </div>

                {selectedInvoice.notes ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-600">
                    <p className="font-medium text-slate-800">Notes</p>
                    <p className="mt-1 leading-relaxed">{selectedInvoice.notes}</p>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  className="bg-[#2563EB] text-white shadow-md hover:bg-[#1D4ED8]"
                  onClick={() => handleDownload(selectedInvoice)}
                  aria-label="Télécharger la facture"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Télécharger la facture (PDF)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#BFDBFE] text-[#1D4ED8]"
                  onClick={() =>
                    toast({
                      title: "Service facturation",
                      description: "Un conseiller vous recontacte sous 24h.",
                    })
                  }
                >
                  Contacter le service facturation
                </Button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog
        open={isPaymentModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closePaymentModal();
          }
        }}
      >
        <DialogContent className="max-w-[480px] rounded-[14px] border-none bg-white p-0 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          {paymentInvoice ? (
            <div className="overflow-hidden rounded-[14px]">
              <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
                <DialogHeader className="items-start space-y-4 text-left">
                  <div className="space-y-2">
                    <DialogTitle className="text-lg font-semibold text-slate-900">
                      Paiement de la facture {paymentInvoice.invoice_number}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-600">
                      Choisissez un moyen de paiement sécurisé pour régler cette facture.
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
                        className="bg-slate-200 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-300"
                        onClick={() => handleMockPayment(paymentInvoice, "bank")}
                      >
                        Payer par virement
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

              <DialogFooter className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                  onClick={closePaymentModal}
                >
                  Fermer
                </Button>
                <Button
                  type="button"
                  disabled
                  className="cursor-not-allowed bg-slate-200 px-4 text-sm font-semibold text-slate-500 hover:bg-slate-200"
                >
                  Confirmer le paiement
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
