import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Euro, RefreshCcw } from "lucide-react";

const invoices = [
  { id: "FAC-2025-128", client: "TechNova", amount: 4820, status: "Payée", issueDate: "01 déc. 2025", dueDate: "15 déc. 2025" },
  { id: "FAC-2025-127", client: "Studio Aurora", amount: 3120, status: "En attente", issueDate: "28 nov. 2025", dueDate: "12 déc. 2025" },
  { id: "FAC-2025-126", client: "PharmaOuest", amount: 5870, status: "Payée", issueDate: "25 nov. 2025", dueDate: "09 déc. 2025" },
  { id: "FAC-2025-125", client: "Maison des Fleurs", amount: 1680, status: "Retard", issueDate: "18 nov. 2025", dueDate: "02 déc. 2025" },
  { id: "FAC-2025-124", client: "Atelier Graphique", amount: 2240, status: "Payée", issueDate: "14 nov. 2025", dueDate: "28 nov. 2025" },
];

const revenueData = [
  { month: "Jan", revenus: 28400 },
  { month: "Fév", revenus: 31200 },
  { month: "Mar", revenus: 32850 },
  { month: "Avr", revenus: 30120 },
  { month: "Mai", revenus: 35210 },
  { month: "Juin", revenus: 36840 },
  { month: "Juil", revenus: 37560 },
  { month: "Août", revenus: 34230 },
  { month: "Sep", revenus: 38200 },
  { month: "Oct", revenus: 40120 },
  { month: "Nov", revenus: 41880 },
  { month: "Déc", revenus: 43750 },
];

const statusMap: Record<string, string> = {
  Payée: "bg-[#10B981]/10 text-[#047857]",
  "En attente": "bg-[#F97316]/10 text-[#B45309]",
  Retard: "bg-[#EF4444]/10 text-[#B91C1C]",
};

const Factures = () => (
  <div className="space-y-8">
    <header className="flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-lg sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2563EB]">Comptabilité</p>
        <h1 className="mt-2 font-['Inter'] text-3xl font-semibold text-slate-900">Facturation & règlements</h1>
        <p className="mt-2 text-sm text-slate-500">Suivez vos encaissements et anticipez les relances.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          className="rounded-2xl border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-[#2563EB]/40 hover:text-[#2563EB]"
        >
          <RefreshCcw className="mr-2 h-4 w-4" /> Rafraîchir
        </Button>
        <Button className="rounded-2xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1D4ED8]">
          <Download className="mr-2 h-4 w-4" /> Exporter le journal
        </Button>
      </div>
    </header>

    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="rounded-3xl border-none bg-white/95 shadow-lg lg:col-span-2">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-200/70 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl">Liste des factures</CardTitle>
            <CardDescription>Statuts, échéances et montants à encaisser</CardDescription>
          </div>
          <Badge className="rounded-2xl bg-[#2563EB]/10 px-3 py-1 text-[#2563EB]">Mise à jour il y a 4 min</Badge>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-hidden rounded-3xl border border-slate-200/70">
            <Table>
              <TableHeader className="bg-slate-50/90 text-xs uppercase tracking-[0.15em] text-slate-500">
                <TableRow>
                  <TableHead className="px-6 py-4">Facture</TableHead>
                  <TableHead className="px-6 py-4">Client</TableHead>
                  <TableHead className="px-6 py-4">Montant</TableHead>
                  <TableHead className="px-6 py-4">Statut</TableHead>
                  <TableHead className="px-6 py-4">Émise le</TableHead>
                  <TableHead className="px-6 py-4 text-right">Échéance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="text-sm text-slate-700">
                    <TableCell className="px-6 py-4 font-semibold text-slate-900">{invoice.id}</TableCell>
                    <TableCell className="px-6 py-4">{invoice.client}</TableCell>
                    <TableCell className="px-6 py-4 font-semibold text-slate-900">
                      {invoice.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge className={`rounded-2xl px-3 py-1 text-xs font-semibold ${statusMap[invoice.status]}`}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">{invoice.issueDate}</TableCell>
                    <TableCell className="px-6 py-4 text-right">{invoice.dueDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-none bg-white/95 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Revenus mensuels</CardTitle>
          <CardDescription>Projection de clôture sur 12 mois</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="h-[260px] w-full">
            <ResponsiveContainer>
              <BarChart data={revenueData} barSize={18}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickMargin={12} />
                <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    borderColor: "#E2E8F0",
                    boxShadow: "0 18px 32px -24px rgba(15,23,42,0.25)",
                  }}
                  formatter={(value: number) => [`${value.toLocaleString("fr-FR")} €`, "Revenus"]}
                />
                <Bar dataKey="revenus" fill="url(#barGradient)" radius={[12, 12, 12, 12]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-3xl bg-slate-50/80 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-3 text-[#2563EB]">
              <Euro className="h-5 w-5" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Objectif atteint à 92%</p>
                <p className="text-xs text-slate-500">+ 18% vs. la même période l'an dernier</p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Montant en attente</span>
              <span className="text-sm font-semibold text-[#F97316]">3 120 €</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Retards critiques</span>
              <span className="text-sm font-semibold text-[#EF4444]">1 facture</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Cycle de paiement moyen</span>
              <span className="text-sm font-semibold text-slate-900">18 jours</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Factures;
