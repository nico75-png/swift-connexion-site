import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  ArrowUpDown,
  Download,
  FileDown,
  Search,
} from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";

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

const STATUS_CONFIG: Record<InvoiceStatus, { badgeClass: string; icon: string }> = {
  Payée: {
    badgeClass: "bg-[#D1FAE5] text-[#047857]",
    icon: "✅",
  },
  "En attente": {
    badgeClass: "bg-[#FEF3C7] text-[#B45309]",
    icon: "⏳",
  },
  "En retard": {
    badgeClass: "bg-[#FEE2E2] text-[#DC2626]",
    icon: "❌",
  },
};

const columnHelper = createColumnHelper<Invoice>();

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
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date_issued", desc: true },
  ]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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

  const columns = useMemo(
    () => [
      columnHelper.accessor("invoice_number", {
        header: "Facture",
        cell: ({ row }) => {
          const invoice = row.original;
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  {invoice.invoice_number}
                </span>
                {isRecentInvoice(invoice) ? (
                  <Badge className="bg-blue-600/10 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                    Nouveau
                  </Badge>
                ) : null}
              </div>
              <p className="text-xs text-slate-500">Commande {invoice.order_number}</p>
            </div>
          );
        },
      }),
      columnHelper.accessor("date_issued", {
        header: ({ column }) => (
          <button
            type="button"
            onClick={column.getToggleSortingHandler()}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Date d'émission
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const invoice = row.original;
          return (
            <div className="space-y-1 text-sm text-slate-600">
              <p className="font-medium text-slate-800">{formatDate(invoice.date_issued)}</p>
              <p className="text-xs text-slate-500">Échéance : {formatDate(invoice.due_date)}</p>
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const a = new Date(rowA.original.date_issued).getTime();
          const b = new Date(rowB.original.date_issued).getTime();
          return a - b;
        },
      }),
      columnHelper.accessor("total", {
        header: ({ column }) => (
          <button
            type="button"
            onClick={column.getToggleSortingHandler()}
            className="flex items-center justify-end gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Montant TTC
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ getValue }) => (
          <div className="text-right text-sm font-semibold text-slate-900">
            {formatCurrency(getValue())}
          </div>
        ),
        sortingFn: (rowA, rowB) => rowA.original.total - rowB.original.total,
      }),
      columnHelper.accessor("status", {
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Statut</span>
        ),
        cell: ({ getValue }) => {
          const status = getValue();
          const config = STATUS_CONFIG[status];
          return (
            <AnimatePresence mode="wait">
              <motion.span
                key={status}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1.05 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-sm",
                  config.badgeClass,
                )}
              >
                <span aria-hidden>{config.icon}</span>
                {status}
              </motion.span>
            </AnimatePresence>
          );
        },
      }),
      columnHelper.accessor("payment_method", {
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paiement</span>
        ),
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span aria-hidden className="text-base">
              {getPaymentEmoji(getValue())}
            </span>
            <span>{getValue()}</span>
          </div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-[#BFDBFE] text-sm font-medium text-[#1D4ED8] hover:bg-[#DBEAFE]"
              onClick={(event) => {
                event.stopPropagation();
                handleDownload(row.original);
              }}
              aria-label={`Télécharger la facture ${row.original.invoice_number}`}
            >
              <Download className="h-4 w-4" aria-hidden />
              Télécharger PDF
            </Button>
          </div>
        ),
      }),
    ],
    [handleDownload, isRecentInvoice],
  );

  const table = useReactTable({
    data: filteredInvoices,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          scope="col"
                          className={cn(
                            "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500",
                            header.column.id === "total" && "text-right",
                            header.column.id === "actions" && "text-right",
                          )}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <motion.tr
                        key={row.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        whileHover={{ y: -2 }}
                        className="cursor-pointer border-b border-slate-100 bg-white transition-shadow hover:bg-[#F9FAFB] hover:shadow-md"
                        onClick={() => handleRowClick(row.original)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={cn(
                              "px-4 py-4 align-top",
                              cell.column.id === "total" && "text-right",
                              cell.column.id === "actions" && "text-right",
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={columns.length}>
                        <div className="mx-auto max-w-md space-y-4">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
                            <FileDown aria-hidden />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-base font-semibold text-slate-800">Aucune facture disponible pour cette période.</h3>
                            <p>
                              Ajustez vos filtres ou élargissez la période de recherche pour retrouver vos factures.
                            </p>
                          </div>
                          <div className="flex justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              className="border-[#BFDBFE] text-[#1D4ED8]"
                            >
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
                      "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
                      STATUS_CONFIG[selectedInvoice.status].badgeClass,
                    )}
                  >
                    <span aria-hidden>{STATUS_CONFIG[selectedInvoice.status].icon}</span>
                    {selectedInvoice.status}
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
    </section>
  );
};

export default Factures;
