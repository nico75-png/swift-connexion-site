import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Filter, Plus, Search, UsersRound } from "lucide-react";

const clients = [
  { id: "CL-2035", name: "Clara Dupont", company: "Studio Aurora", status: "Actif", orders: 68, segment: "Premium" },
  { id: "CL-2034", name: "Romain Petit", company: "Maison des Fleurs", status: "Actif", orders: 45, segment: "Standard" },
  { id: "CL-2033", name: "Anaïs Bernard", company: "Atelier Graphique", status: "Inactif", orders: 12, segment: "Starter" },
  { id: "CL-2032", name: "Hugo Ferrand", company: "TechNova", status: "Actif", orders: 94, segment: "Premium" },
  { id: "CL-2031", name: "Laurie Vidal", company: "PharmaOuest", status: "Actif", orders: 58, segment: "Standard" },
];

const statusMap: Record<string, string> = {
  Actif: "bg-[#10B981]/10 text-[#047857]",
  Inactif: "bg-[#EF4444]/10 text-[#B91C1C]",
};

const Clients = () => {
  const [searchValue, setSearchValue] = useState("");
  const [segment, setSegment] = useState("tous");

  const segments = useMemo(
    () => [
      { id: "tous", label: "Tous" },
      { id: "premium", label: "Premium" },
      { id: "standard", label: "Standard" },
      { id: "starter", label: "Starter" },
    ],
    [],
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2563EB]">Base clients</p>
          <h1 className="mt-2 font-['Inter'] text-3xl font-semibold text-slate-900">Relation client centralisée</h1>
          <p className="mt-2 text-sm text-slate-500">
            Identifiez vos meilleurs comptes et activez des campagnes ciblées.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-[#2563EB]/40 hover:text-[#2563EB]"
          >
            <Filter className="mr-2 h-4 w-4" /> Filtres avancés
          </Button>
          <Button className="rounded-2xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1D4ED8]">
            <Plus className="mr-2 h-4 w-4" /> Ajouter un client
          </Button>
        </div>
      </header>

      <Card className="rounded-3xl border-none bg-white/95 shadow-lg">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-200/70 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-xl">Tableau des clients</CardTitle>
            <CardDescription>Recherchez et triez vos clients pour un suivi personnalisé</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Rechercher par nom ou entreprise"
                className="h-11 w-64 rounded-2xl border border-slate-200 bg-slate-50 pl-10 text-sm text-slate-700 placeholder:text-slate-400"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="flex gap-2 rounded-2xl bg-slate-100/70 p-1">
              {segments.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSegment(item.id)}
                  className={`rounded-2xl px-4 py-2 text-xs font-semibold transition ${
                    segment === item.id ? "bg-white text-[#2563EB] shadow" : "text-slate-500 hover:text-[#2563EB]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="overflow-hidden rounded-3xl border border-slate-200/70">
            <Table>
              <TableHeader className="bg-slate-50/90 text-xs uppercase tracking-[0.15em] text-slate-500">
                <TableRow>
                  <TableHead className="px-6 py-4">Client</TableHead>
                  <TableHead className="px-6 py-4">Entreprise</TableHead>
                  <TableHead className="px-6 py-4">Statut</TableHead>
                  <TableHead className="px-6 py-4">Commandes</TableHead>
                  <TableHead className="px-6 py-4 text-right">Segment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients
                  .filter((client) =>
                    `${client.name}${client.company}`.toLowerCase().includes(searchValue.toLowerCase()),
                  )
                  .filter((client) => (segment === "tous" ? true : client.segment.toLowerCase() === segment))
                  .map((client) => (
                    <TableRow key={client.id} className="text-sm text-slate-700">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-[#2563EB]/10 text-xs font-semibold text-[#2563EB]">
                              {client.name
                                .split(" ")
                                .map((part) => part[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-slate-900">{client.name}</p>
                            <p className="text-xs text-slate-500">{client.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">{client.company}</TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge className={`rounded-2xl px-3 py-1 text-xs font-semibold ${statusMap[client.status]}`}>
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-semibold text-slate-900">{client.orders}</TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Badge className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {client.segment}
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
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                  <UsersRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Clients actifs</p>
                  <p className="text-lg font-semibold text-slate-900">318 comptes</p>
                </div>
              </div>
            </Card>
            <Card className="rounded-3xl border-none bg-slate-50/90 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#10B981]/10 text-[#047857]">
                  <UsersRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Taux de rétention</p>
                  <p className="text-lg font-semibold text-slate-900">92%</p>
                </div>
              </div>
            </Card>
            <Card className="rounded-3xl border-none bg-slate-50/90 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F97316]/10 text-[#B45309]">
                  <UsersRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Campagnes actives</p>
                  <p className="text-lg font-semibold text-slate-900">3 segments</p>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Clients;
