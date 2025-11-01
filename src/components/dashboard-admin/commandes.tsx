import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarRange, ChevronDown, Download, Filter, MapPinned, Search, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";

const orders = [
  {
    id: "CMD-54820",
    client: "Clara Dupont",
    driver: "Marc Leroy",
    status: "En cours",
    date: "05 déc. 2025",
    eta: "16:45",
    type: "Express",
  },
  {
    id: "CMD-54819",
    client: "Atelier Lumière",
    driver: "Nadia Bensaïd",
    status: "Livrée",
    date: "05 déc. 2025",
    eta: "14:10",
    type: "Dernier km",
  },
  {
    id: "CMD-54818",
    client: "Boulangerie Montparnasse",
    driver: "Alex Robin",
    status: "En cours",
    date: "05 déc. 2025",
    eta: "17:30",
    type: "Régional",
  },
  {
    id: "CMD-54817",
    client: "Pharmacie République",
    driver: "Sonia Tazi",
    status: "En attente",
    date: "05 déc. 2025",
    eta: "À planifier",
    type: "Express",
  },
  {
    id: "CMD-54816",
    client: "Maison Delcourt",
    driver: "Yanis Ben Amar",
    status: "Annulée",
    date: "04 déc. 2025",
    eta: "-",
    type: "International",
  },
];

const statusColorMap: Record<string, string> = {
  "En cours": "bg-[#2563EB]/10 text-[#2563EB]",
  Livrée: "bg-[#10B981]/10 text-[#047857]",
  "En attente": "bg-[#F97316]/10 text-[#B45309]",
  Annulée: "bg-[#EF4444]/10 text-[#B91C1C]",
};

const Commandes = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>("toutes");

  const filters = useMemo(
    () => [
      { id: "toutes", label: "Toutes" },
      { id: "en-cours", label: "En cours" },
      { id: "livrees", label: "Livrées" },
      { id: "annulees", label: "Annulées" },
    ],
    [],
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#0F172A] p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">Gestion des commandes</p>
          <h1 className="mt-2 font-['Inter'] text-3xl font-semibold">Pilotez vos livraisons en temps réel</h1>
          <p className="mt-2 text-sm text-white/70">
            Planifiez, suivez et ajustez les commandes clients en un coup d'œil.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="rounded-2xl border-white/40 bg-white/10 px-4 py-2 text-white shadow-sm transition hover:bg-white/20"
          >
            <Download className="mr-2 h-4 w-4" /> Exporter
          </Button>
          <Button className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[#2563EB] shadow-lg transition hover:bg-slate-100">
            + Créer une commande
          </Button>
        </div>
      </header>

      <Card className="rounded-3xl border-none bg-white/95 shadow-lg">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-200/70 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-xl">Suivi des commandes</CardTitle>
            <CardDescription>Filtrez par statut ou par période pour isoler vos priorités</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Input
                className="h-11 w-56 rounded-2xl border border-slate-200 bg-slate-50 pl-10 text-sm text-slate-700 placeholder:text-slate-400"
                placeholder="Rechercher une commande"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            <Button
              variant="outline"
              className="inline-flex items-center gap-2 rounded-2xl border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-[#2563EB]/40 hover:text-[#2563EB]"
            >
              <CalendarRange className="h-4 w-4" />
              Période
            </Button>
            <Button
              variant="outline"
              className="inline-flex items-center gap-2 rounded-2xl border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-[#2563EB]/40 hover:text-[#2563EB]"
            >
              <Filter className="h-4 w-4" />
              Filtres avancés
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedFilter === filter.id ? "default" : "outline"}
                className={
                  selectedFilter === filter.id
                    ? "rounded-2xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow"
                    : "rounded-2xl border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-[#2563EB]/40 hover:text-[#2563EB]"
                }
                onClick={() => setSelectedFilter(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200/70">
            <Table>
              <TableHeader className="bg-slate-50/90 text-xs uppercase tracking-[0.15em] text-slate-500">
                <TableRow>
                  <TableHead className="px-6 py-4">Commande</TableHead>
                  <TableHead className="px-6 py-4">Client</TableHead>
                  <TableHead className="px-6 py-4">Chauffeur</TableHead>
                  <TableHead className="px-6 py-4">Statut</TableHead>
                  <TableHead className="px-6 py-4">Date</TableHead>
                  <TableHead className="px-6 py-4">ETA</TableHead>
                  <TableHead className="px-6 py-4 text-right">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="text-sm text-slate-700">
                    <TableCell className="px-6 py-4 font-semibold text-slate-900">{order.id}</TableCell>
                    <TableCell className="px-6 py-4">{order.client}</TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage alt={order.driver} />
                          <AvatarFallback className="bg-[#2563EB]/10 text-xs font-semibold text-[#2563EB]">
                            {order.driver
                              .split(" ")
                              .map((part) => part[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{order.driver}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge className={`rounded-2xl px-3 py-1 text-xs font-semibold ${statusColorMap[order.status]}`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">{order.date}</TableCell>
                    <TableCell className="px-6 py-4">{order.eta}</TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Badge className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {order.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-3xl border-none bg-slate-50/90 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#10B981]/10 text-[#047857]">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Livraisons en route</p>
                  <p className="text-lg font-semibold text-slate-900">23 missions</p>
                </div>
              </div>
            </Card>
            <Card className="rounded-3xl border-none bg-slate-50/90 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                  <MapPinned className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Dernière mise à jour</p>
                  <p className="text-lg font-semibold text-slate-900">Il y a 2 min</p>
                </div>
              </div>
            </Card>
            <Card className="rounded-3xl border-none bg-slate-50/90 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F97316]/10 text-[#B45309]">
                  <ChevronDown className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Commandes à prioriser</p>
                  <p className="text-lg font-semibold text-slate-900">6 urgences</p>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Commandes;
