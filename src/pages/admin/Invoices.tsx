import { useMemo, useState } from "react";
import { Search, Filter, Download, FileDown } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

type InvoiceStatus = "Payée" | "En attente" | "En retard";

type Invoice = {
  id: string;
  client: string;
  clientEmail: string;
  period: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  paidDate: string | null;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);

const AdminInvoices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { toast } = useToast();

  const months = useMemo(
    () => Array.from(new Set(invoices.map((invoice) => invoice.period))),
    [invoices],
  );

  const filteredInvoices = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesSearch =
        lowerSearch.length === 0 ||
        invoice.id.toLowerCase().includes(lowerSearch) ||
        invoice.client.toLowerCase().includes(lowerSearch);

      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      const matchesMonth = monthFilter === "all" || invoice.period === monthFilter;

      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [invoices, monthFilter, searchTerm, statusFilter]);

  const totalByStatus = useMemo(() => {
    return filteredInvoices.reduce(
      (acc, invoice) => {
        acc[invoice.status] += invoice.amount;
        return acc;
      },
      {
        Payée: 0,
        "En attente": 0,
        "En retard": 0,
      } as Record<InvoiceStatus, number>,
    );
  }, [filteredInvoices]);

  const getStatusColor = (status: InvoiceStatus) => {
    const colors: Record<InvoiceStatus, string> = {
      Payée: "border-[rgba(0,184,132,0.3)] bg-[rgba(0,184,132,0.12)] text-[#00B884]",
      "En attente": "border-[rgba(255,176,32,0.35)] bg-[rgba(255,176,32,0.15)] text-[#C46A00]",
      "En retard": "border-[rgba(232,76,76,0.35)] bg-[rgba(232,76,76,0.15)] text-[#D64545]",
    };
    return colors[status];
  };

  const handleDownload = (invoiceId: string) => {
    toast({
      title: "Téléchargement",
      description: `Facture ${invoiceId} en cours de téléchargement...`,
    });
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === invoiceId
          ? {
              ...invoice,
              status: "Payée",
              paidDate: new Date().toISOString().slice(0, 10),
            }
          : invoice,
      ),
    );

    toast({
      title: "Facture marquée comme payée",
      description: `La facture ${invoiceId} a été marquée comme payée`,
    });
  };

  const handleResend = (invoiceId: string, clientEmail: string) => {
    toast({
      title: "Facture renvoyée",
      description: `La facture ${invoiceId} a été renvoyée à ${clientEmail}`,
    });
  };

  const handleExportMonthly = () => {
    toast({
      title: "Export mensuel",
      description: "Génération de l'export PDF du mois en cours...",
    });
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />} topbar={<Topbar />}>
      <div className="-mx-6 -my-6 space-y-8 rounded-3xl bg-[#F2F6FA] px-6 py-6 text-[#0B0B0B] shadow-[0_4px_20px_rgba(11,45,85,0.05)] md:-mx-10 md:-my-8 md:px-10 md:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 rounded-full bg-[#0B2D55]" />
              <h1 className="text-3xl font-semibold tracking-tight text-[#0B2D55]">Gestion des factures</h1>
            </div>
            <p className="text-sm text-[#4A4A4A]">
              Visualisez chaque facture client, filtrez vos listes et agissez en un clic.
            </p>
          </div>
          <Button
            variant="default"
            size="lg"
            className="gap-2 rounded-2xl bg-[#FFCC00] px-6 py-4 text-base font-semibold text-[#0B2D55] shadow-[0_6px_16px_rgba(255,204,0,0.25)] transition hover:shadow-[0_8px_20px_rgba(255,204,0,0.35)] hover:bg-[#FFD84D]"
            onClick={handleExportMonthly}
          >
            <FileDown className="h-5 w-5 text-[#0B2D55] transition-colors" />
            Export mensuel PDF
          </Button>
        </div>

        <div className="grid gap-4 rounded-3xl border border-[rgba(0,0,0,0.05)] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] lg:grid-cols-[1fr_auto_auto]">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#4A4A4A]" />
            <Input
              placeholder="Rechercher par N° ou client..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-12 rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white pl-11 text-sm text-[#0B0B0B] shadow-[0_4px_12px_rgba(0,0,0,0.05)] placeholder:text-[rgba(74,74,74,0.6)] focus:border-[#0B2D55] focus:ring-2 focus:ring-[rgba(11,45,85,0.2)]"
            />
          </div>

          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="h-12 w-full min-w-[220px] justify-between rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white text-sm text-[#0B0B0B] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-2 text-sm text-[#4A4A4A]">
                <Filter className="h-4 w-4 text-[#0B2D55]" />
                <span>Période</span>
              </div>
              <SelectValue placeholder="Toutes les périodes" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white text-sm text-[#0B0B0B] shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
              <SelectItem value="all">Toutes les périodes</SelectItem>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 w-full min-w-[220px] justify-between rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white text-sm text-[#0B0B0B] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <span className="text-sm text-[#4A4A4A]">Statut</span>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white text-sm text-[#0B0B0B] shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="Payée">Payée ✅</SelectItem>
              <SelectItem value="En attente">En attente 🟠</SelectItem>
              <SelectItem value="En retard">En retard 🔴</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-3xl border border-[rgba(0,0,0,0.08)] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto rounded-3xl">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#E3EDF8]">
                <TableHead className="font-semibold uppercase tracking-wide text-[#0B2D55]">N° Facture</TableHead>
                <TableHead className="font-semibold uppercase tracking-wide text-[#0B2D55]">Client</TableHead>
                <TableHead className="font-semibold uppercase tracking-wide text-[#0B2D55]">Période</TableHead>
                <TableHead className="text-right font-semibold uppercase tracking-wide text-[#0B2D55]">Montant</TableHead>
                <TableHead className="font-semibold uppercase tracking-wide text-[#0B2D55]">Échéance</TableHead>
                <TableHead className="font-semibold uppercase tracking-wide text-[#0B2D55]">Statut</TableHead>
                <TableHead className="text-right font-semibold uppercase tracking-wide text-[#0B2D55]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const isPaid = invoice.status === "Payée";

                return (
                  <TableRow key={invoice.id} className="transition-colors hover:bg-[#F0F6FD]">
                    <TableCell className="font-mono text-sm font-semibold text-[#0B2D55]">{invoice.id}</TableCell>
                    <TableCell className="max-w-[220px] truncate">
                      <p className="font-medium text-[#0B0B0B]">{invoice.client}</p>
                      <p className="text-xs text-[#4A4A4A]">{invoice.clientEmail}</p>
                    </TableCell>
                    <TableCell className="text-sm text-[#4A4A4A]">{invoice.period}</TableCell>
                    <TableCell className="text-right text-lg font-semibold text-[#0B2D55]">
                      {formatCurrency(invoice.amount)}
                    </TableCell>
                    <TableCell className="text-sm text-[#4A4A4A]">{invoice.dueDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(invoice.status)} px-3 py-1 text-xs font-semibold`}
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full text-[#0B2D55] transition hover:bg-[rgba(255,204,0,0.2)] hover:text-[#0B2D55]"
                          onClick={() => handleDownload(invoice.id)}
                          aria-label={`Télécharger ${invoice.id}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPaid}
                          onClick={() => handleMarkAsPaid(invoice.id)}
                          className={`rounded-full border border-transparent px-4 font-medium transition ${
                            isPaid
                              ? "pointer-events-none cursor-default bg-[#E1E7EE] text-[#4A4A4A]"
                              : "bg-[rgba(0,184,132,0.12)] text-[#00A372] hover:bg-[rgba(0,184,132,0.2)]"
                          }`}
                        >
                          Payée
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border border-[rgba(11,45,85,0.2)] bg-transparent px-4 font-medium text-[#0B2D55] transition hover:bg-[rgba(11,45,85,0.1)]"
                          onClick={() => handleResend(invoice.id, invoice.clientEmail)}
                        >
                          Renvoyer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-[#4A4A4A]">Aucune facture ne correspond à votre recherche.</p>
          </div>
        )}

        <div className="border-t border-[rgba(0,0,0,0.05)] bg-[#EAF2FB]">
          <div className="grid gap-4 p-6 text-sm text-[#4A4A4A] sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p>Total de factures générées</p>
              <p className="text-2xl font-semibold text-[#0B0B0B]">{filteredInvoices.length}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#00A372]">Montant total payé</p>
              <p className="text-2xl font-semibold text-[#00B884]">{formatCurrency(totalByStatus.Payée)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#C46A00]">Montant en attente</p>
              <p className="text-2xl font-semibold text-[#FFB020]">{formatCurrency(totalByStatus["En attente"])}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#D64545]">Montant en retard</p>
              <p className="text-2xl font-semibold text-[#E84C4C]">{formatCurrency(totalByStatus["En retard"])}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminInvoices;
