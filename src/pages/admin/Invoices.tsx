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
      <div className="-mx-6 -my-6 space-y-8 rounded-3xl bg-muted px-6 py-6 text-foreground shadow-soft md:-mx-10 md:-my-8 md:px-10 md:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 rounded-full bg-primary" />
              <h1 className="text-3xl font-semibold tracking-tight text-primary">Gestion des factures</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Visualisez chaque facture client, filtrez vos listes et agissez en un clic.
            </p>
          </div>
          <Button
            variant="cta"
            size="lg"
            className="gap-2"
            onClick={handleExportMonthly}
          >
            <FileDown className="h-5 w-5" />
            Export mensuel PDF
          </Button>
        </div>

        <div className="grid gap-4 rounded-3xl border border-border bg-card p-4 shadow-soft lg:grid-cols-[1fr_auto_auto]">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par N° ou client..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-12 pl-11"
            />
          </div>

          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="h-12 w-full min-w-[220px]">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4 text-primary" />
                <span>Période</span>
              </div>
              <SelectValue placeholder="Toutes les périodes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les périodes</SelectItem>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 w-full min-w-[220px]">
              <span className="text-sm text-muted-foreground">Statut</span>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="Payée">Payée ✅</SelectItem>
              <SelectItem value="En attente">En attente 🟠</SelectItem>
              <SelectItem value="En retard">En retard 🔴</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-3xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto rounded-3xl">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-semibold uppercase tracking-wide text-primary">N° Facture</TableHead>
                <TableHead className="font-semibold uppercase tracking-wide text-primary">Client</TableHead>
                <TableHead className="font-semibold uppercase tracking-wide text-primary">Période</TableHead>
                <TableHead className="text-right font-semibold uppercase tracking-wide text-primary">Montant</TableHead>
                <TableHead className="font-semibold uppercase tracking-wide text-primary">Échéance</TableHead>
                <TableHead className="font-semibold uppercase tracking-wide text-primary">Statut</TableHead>
                <TableHead className="text-right font-semibold uppercase tracking-wide text-primary">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const isPaid = invoice.status === "Payée";

                return (
                  <TableRow key={invoice.id} className="transition-colors hover:bg-muted/50">
                    <TableCell className="font-mono text-sm font-semibold text-primary">{invoice.id}</TableCell>
                    <TableCell className="max-w-[220px] truncate">
                      <p className="font-medium text-foreground">{invoice.client}</p>
                      <p className="text-xs text-muted-foreground">{invoice.clientEmail}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{invoice.period}</TableCell>
                    <TableCell className="text-right text-lg font-semibold text-primary">
                      {formatCurrency(invoice.amount)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{invoice.dueDate}</TableCell>
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
                          className="h-9 w-9 rounded-full"
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
                          className={`rounded-full ${
                            isPaid
                              ? "pointer-events-none cursor-default opacity-50"
                              : ""
                          }`}
                        >
                          Payée
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
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
            <p className="text-sm text-muted-foreground">Aucune facture ne correspond à votre recherche.</p>
          </div>
        )}

        <div className="border-t border-border bg-muted">
          <div className="grid gap-4 p-6 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p>Total de factures générées</p>
              <p className="text-2xl font-semibold text-foreground">{filteredInvoices.length}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-success">Montant total payé</p>
              <p className="text-2xl font-semibold text-success">{formatCurrency(totalByStatus.Payée)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-warning">Montant en attente</p>
              <p className="text-2xl font-semibold text-warning">{formatCurrency(totalByStatus["En attente"])}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-destructive">Montant en retard</p>
              <p className="text-2xl font-semibold text-destructive">{formatCurrency(totalByStatus["En retard"])}</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminInvoices;
