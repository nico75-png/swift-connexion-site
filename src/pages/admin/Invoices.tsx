import { useState } from "react";
import { Search, Filter, Download } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

/**
 * Page admin - Gestion des factures
 * Liste des factures avec actions (télécharger, marquer payée, renvoyer)
 */
const AdminInvoices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const { toast } = useToast();

  const invoices = [
    { id: "FACT-025", client: "Cabinet Dupont", period: "Janvier 2025", amount: 512.50, status: "Payée", dueDate: "2025-01-31", paidDate: "2025-01-28" },
    { id: "FACT-024", client: "Optique Vision", period: "Janvier 2025", amount: 1247.00, status: "Payée", dueDate: "2025-01-31", paidDate: "2025-01-30" },
    { id: "FACT-023", client: "Lab Médical", period: "Janvier 2025", amount: 845.00, status: "En attente", dueDate: "2025-01-31", paidDate: null },
    { id: "FACT-022", client: "Avocat & Associés", period: "Décembre 2024", amount: 687.50, status: "Payée", dueDate: "2024-12-31", paidDate: "2024-12-29" },
    { id: "FACT-021", client: "Pharmacie Centrale", period: "Décembre 2024", amount: 1534.00, status: "Payée", dueDate: "2024-12-31", paidDate: "2024-12-30" },
    { id: "FACT-020", client: "Cabinet Martin", period: "Décembre 2024", amount: 234.00, status: "En retard", dueDate: "2024-12-31", paidDate: null },
  ];

  const months = ["Janvier 2025", "Décembre 2024", "Novembre 2024"];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesMonth = monthFilter === "all" || invoice.period === monthFilter;
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Payée": "bg-success/10 text-success border-success/20",
      "En attente": "bg-warning/10 text-warning border-warning/20",
      "En retard": "bg-destructive/10 text-destructive border-destructive/20",
    };
    return colors[status] || "";
  };

  const handleDownload = (invoiceId: string) => {
    toast({
      title: "Téléchargement",
      description: `Facture ${invoiceId} en cours de téléchargement...`,
    });
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    toast({
      title: "Facture mise à jour",
      description: `La facture ${invoiceId} a été marquée comme payée.`,
    });
  };

  const handleResend = (invoiceId: string, client: string) => {
    toast({
      title: "Facture renvoyée",
      description: `La facture ${invoiceId} a été renvoyée à ${client}.`,
    });
  };

  const handleExportMonthly = () => {
    toast({
      title: "Export en cours",
      description: "Génération de l'export mensuel...",
    });
  };

  return (
    <DashboardLayout
      sidebar={<AdminSidebar />}
      topbar={<Topbar />}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des factures</h1>
          <p className="text-muted-foreground mt-1">Gérez et suivez toutes les factures</p>
        </div>
        <Button variant="cta" onClick={handleExportMonthly}>
          <Download className="h-4 w-4 mr-2" />
          Export mensuel PDF
        </Button>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par N° ou client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les périodes</SelectItem>
            {months.map(month => (
              <SelectItem key={month} value={month}>{month}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="Payée">Payées</SelectItem>
            <SelectItem value="En attente">En attente</SelectItem>
            <SelectItem value="En retard">En retard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tableau des factures */}
      <div className="bg-card rounded-lg border border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">N° Facture</TableHead>
                <TableHead className="font-semibold">Client</TableHead>
                <TableHead className="font-semibold">Période</TableHead>
                <TableHead className="font-semibold text-right">Montant</TableHead>
                <TableHead className="font-semibold">Échéance</TableHead>
                <TableHead className="font-semibold">Statut</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono font-semibold">{invoice.id}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>{invoice.period}</TableCell>
                  <TableCell className="text-right font-semibold text-lg">{invoice.amount}€</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{invoice.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(invoice.id)}>
                        <Download className="h-3 w-3" />
                      </Button>
                      {invoice.status !== "Payée" && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleMarkAsPaid(invoice.id)}>
                            Payée
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleResend(invoice.id, invoice.client)}>
                            Renvoyer
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucune facture trouvée</p>
          </div>
        )}
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-1">Total factures</p>
          <p className="text-2xl font-bold">{invoices.length}</p>
        </div>
        <div className="p-4 bg-success/10 rounded-lg border border-success/20">
          <p className="text-xs text-success mb-1">Montant total payé</p>
          <p className="text-2xl font-bold text-success">
            {invoices.filter(i => i.status === "Payée").reduce((acc, i) => acc + i.amount, 0).toFixed(2)}€
          </p>
        </div>
        <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
          <p className="text-xs text-warning mb-1">En attente</p>
          <p className="text-2xl font-bold text-warning">
            {invoices.filter(i => i.status === "En attente").reduce((acc, i) => acc + i.amount, 0).toFixed(2)}€
          </p>
        </div>
        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-xs text-destructive mb-1">En retard</p>
          <p className="text-2xl font-bold text-destructive">
            {invoices.filter(i => i.status === "En retard").reduce((acc, i) => acc + i.amount, 0).toFixed(2)}€
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminInvoices;
