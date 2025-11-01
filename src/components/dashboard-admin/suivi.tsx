import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { CalendarDays, Download, FileText, Mail, MoreVertical, Printer, SendHorizonal, TrendingUp } from "lucide-react";

interface SuiviProps {
  onCreateOrder?: () => void;
  onSendMessage?: () => void;
}

const invoices = [
  {
    id: "FAC-2025-128",
    client: "TechNova",
    amount: 4820,
    status: "Payée",
    issueDate: "01 déc. 2025",
    dueDate: "15 déc. 2025",
    orderId: "CMD-54812",
    contact: "compta@technova.fr",
  },
  {
    id: "FAC-2025-127",
    client: "Studio Aurora",
    amount: 3120,
    status: "En attente",
    issueDate: "28 nov. 2025",
    dueDate: "12 déc. 2025",
    orderId: "CMD-54802",
    contact: "finance@aurora.fr",
  },
  {
    id: "FAC-2025-126",
    client: "PharmaOuest",
    amount: 5870,
    status: "Payée",
    issueDate: "25 nov. 2025",
    dueDate: "09 déc. 2025",
    orderId: "CMD-54788",
    contact: "accounts@pharmaouest.fr",
  },
  {
    id: "FAC-2025-125",
    client: "Maison des Fleurs",
    amount: 1680,
    status: "Retard",
    issueDate: "18 nov. 2025",
    dueDate: "02 déc. 2025",
    orderId: "CMD-54763",
    contact: "facturation@maisonfleurs.fr",
  },
];

const statusMap: Record<string, string> = {
  Payée: "bg-[#10B981]/10 text-[#047857]",
  "En attente": "bg-[#F97316]/10 text-[#B45309]",
  Retard: "bg-[#EF4444]/10 text-[#B91C1C]",
};

const Suivi = ({ onCreateOrder, onSendMessage }: SuiviProps) => {
  const [selectedInvoice, setSelectedInvoice] = useState<typeof invoices[number] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalAmount = useMemo(
    () => invoices.reduce((total, invoice) => total + invoice.amount, 0),
    [],
  );

  const lateInvoices = useMemo(
    () => invoices.filter((invoice) => invoice.status === "Retard"),
    [],
  );

  const handleInvoiceAction = (invoiceId: string, action: "email" | "pdf" | "print") => {
    const invoice = invoices.find((item) => item.id === invoiceId);
    if (!invoice) {
      return;
    }

    const actionLabel =
      action === "email" ? "Email de relance envoyé" : action === "pdf" ? "Export PDF généré" : "Impression planifiée";

    toast({
      title: actionLabel,
      description: `${invoice.client} - ${invoice.amount.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR",
      })}`,
    });
  };

  const openInvoiceDialog = (invoice: typeof invoices[number]) => {
    setSelectedInvoice(invoice);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/95 px-6 py-5 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0B2D55]">Suivi financier</p>
          <h1 className="mt-2 font-['Inter'] text-3xl font-semibold text-slate-900">Relances & factures clients</h1>
          <p className="mt-2 text-sm text-slate-600">
            Consolidez vos encaissements et déclenchez les relances personnalisées en un clic.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-[#0B2D55]/40 hover:text-[#0B2D55]"
            onClick={onSendMessage}
          >
            <SendHorizonal className="mr-2 h-4 w-4" /> Contacter un client
          </Button>
          <Button className="rounded-2xl bg-[#0B2D55] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#091a33]" onClick={onCreateOrder}>
            + Créer une commande
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-3xl border-none bg-white/95 shadow-lg lg:col-span-2">
          <CardHeader className="flex flex-col gap-4 border-b border-slate-200/70 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl">Suivi des factures</CardTitle>
              <CardDescription>Statuts, échéances et actions rapides</CardDescription>
            </div>
            <Badge className="rounded-2xl bg-[#0B2D55]/10 px-3 py-1 text-[#0B2D55]">{lateInvoices.length} en relance</Badge>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200/70">
              <Table>
                <TableHeader className="bg-slate-50/90 text-xs uppercase tracking-[0.15em] text-slate-500">
                  <TableRow>
                    <TableHead className="px-6 py-4">Facture</TableHead>
                    <TableHead className="px-6 py-4">Client</TableHead>
                    <TableHead className="px-6 py-4">Montant</TableHead>
                    <TableHead className="px-6 py-4">Statut</TableHead>
                    <TableHead className="px-6 py-4">Émise</TableHead>
                    <TableHead className="px-6 py-4">Échéance</TableHead>
                    <TableHead className="px-6 py-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="text-sm text-slate-700">
                      <TableCell className="px-6 py-4 font-semibold text-slate-900">{invoice.id}</TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{invoice.client}</span>
                          <span className="text-xs text-slate-500">Commande {invoice.orderId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-semibold text-slate-900">
                        {invoice.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge className={`rounded-2xl px-3 py-1 text-xs font-semibold ${statusMap[invoice.status]}`}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-xs text-slate-500">{invoice.issueDate}</TableCell>
                      <TableCell className="px-6 py-4 text-xs text-slate-500">{invoice.dueDate}</TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-2xl border border-slate-200/70 bg-white p-1 shadow-lg">
                            <DropdownMenuItem onClick={() => handleInvoiceAction(invoice.id, "email")}>
                              <Mail className="mr-2 h-4 w-4 text-[#0B2D55]" /> Relancer par email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleInvoiceAction(invoice.id, "pdf")}>
                              <Download className="mr-2 h-4 w-4 text-[#0B2D55]" /> Exporter en PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleInvoiceAction(invoice.id, "print")}>
                              <Printer className="mr-2 h-4 w-4 text-[#0B2D55]" /> Imprimer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openInvoiceDialog(invoice)}>
                              <FileText className="mr-2 h-4 w-4 text-[#0B2D55]" /> Consulter le détail
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none bg-white/95 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Vue synthétique</CardTitle>
            <CardDescription>Projection et statut global</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-3xl bg-[#0B2D55]/10 p-4 text-[#0B2D55]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Encaissements</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{totalAmount.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
              })}</p>
              <p className="mt-1 text-xs text-slate-500">+ 18 % vs. le mois précédent</p>
            </div>
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Factures réglées</span>
                <span className="font-semibold text-[#0B2D55]">72 %</span>
              </div>
              <Progress value={72} className="h-2 rounded-full" />
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Relances en cours</span>
                <span className="font-semibold text-[#F97316]">3 clients</span>
              </div>
              <Progress value={35} className="h-2 rounded-full" />
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Cycle moyen de paiement</span>
                <span className="font-semibold text-slate-900">18 jours</span>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <TrendingUp className="h-5 w-5 text-[#0B2D55]" />
                Prévision de trésorerie à 30 jours alignée
              </div>
              <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                {lateInvoices.length > 0
                  ? `${lateInvoices.length} relances recommandées aujourd'hui`
                  : "Aucune relance nécessaire aujourd'hui"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-xl">
          {selectedInvoice && (
            <>
              <DialogHeader>
                <DialogTitle>Détail facture {selectedInvoice.id}</DialogTitle>
                <DialogDescription>
                  Client {selectedInvoice.client} · Commande {selectedInvoice.orderId}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4 md:grid-cols-[1.2fr_1fr]">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Montant total</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                      {selectedInvoice.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays className="h-4 w-4 text-[#0B2D55]" /> Échéance {selectedInvoice.dueDate}
                    </p>
                  </div>
                  <ScrollArea className="h-48 rounded-3xl border border-slate-200 bg-white">
                    <div className="space-y-4 p-4 text-sm text-slate-600">
                      <p>
                        • Services logistiques multi-colis
                        <br />• Livraison express confirmée
                        <br />• Assistance prioritaire client premium
                      </p>
                      <p>
                        Détail des suppléments : gestion de flux à haute valeur ajoutée, stockage temporaire au hub et garantie de
                        livraison sous 24h.
                      </p>
                    </div>
                  </ScrollArea>
                </div>
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-600 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Contact</p>
                    <p className="mt-2 font-semibold text-slate-900">{selectedInvoice.contact}</p>
                    <p className="text-xs text-slate-500">Relance recommandée sous 24h</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="rounded-2xl bg-[#0B2D55] text-xs font-semibold text-white hover:bg-[#091a33]"
                        onClick={() => handleInvoiceAction(selectedInvoice.id, "email")}
                      >
                        <Mail className="mr-2 h-4 w-4" /> Relancer maintenant
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-2xl border-slate-200 text-xs text-slate-600 hover:border-[#0B2D55]/40 hover:text-[#0B2D55]"
                        onClick={onSendMessage}
                      >
                        <SendHorizonal className="mr-2 h-4 w-4" /> Ouvrir la messagerie
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-500">
                    Historique :
                    <br />• 05 déc. 2025 — Relance automatique
                    <br />• 08 déc. 2025 — Accusé de réception client
                    <br />• 10 déc. 2025 — Validation comptabilité en cours
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" className="rounded-2xl border-slate-200" onClick={() => setIsDialogOpen(false)}>
                  Fermer
                </Button>
                <Button className="rounded-2xl bg-[#0B2D55] text-white hover:bg-[#091a33]" onClick={() => handleInvoiceAction(selectedInvoice.id, "pdf")}>
                  Exporter en PDF
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Suivi;
