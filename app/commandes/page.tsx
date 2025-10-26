"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { CommandeFilters, type CommandeStatus, type SortOption } from "./components/CommandeFilters";
import { CommandeTable, type Commande, getStatusColor } from "./components/CommandeTable";

const commandesMock: Commande[] = [
  { id: "CMD-1024", client: "Laura Martin", date: "2025-10-18", statut: "Livrée", montant: 129.99 },
  { id: "CMD-1025", client: "Antoine Lefèvre", date: "2025-10-22", statut: "En attente", montant: 89.5 },
  { id: "CMD-1026", client: "Sophie Dubois", date: "2025-10-25", statut: "Annulée", montant: 45.0 },
];

function getSummary(commandes: Commande[]) {
  const total = commandes.reduce((acc, commande) => acc + commande.montant, 0);
  const delivered = commandes.filter((commande) => commande.statut === "Livrée").length;
  const pending = commandes.filter((commande) => commande.statut === "En attente").length;
  return { total, delivered, pending };
}

export default function CommandesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CommandeStatus | "Toutes">("Toutes");
  const [sort, setSort] = useState<SortOption>("date-desc");

  const summary = useMemo(() => getSummary(commandesMock), []);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6 md:p-8">
      <header className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Suivi des commandes clients</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Commandes</h1>
            <p className="text-sm text-muted-foreground">Consultez, filtrez et analysez vos commandes en temps réel.</p>
          </div>
          <Badge variant="outline" className={getStatusColor("Livrée")}>Prêt pour Supabase</Badge>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-soft">
          <CardHeader className="pb-2">
            <CardDescription>Total commandes</CardDescription>
            <CardTitle className="text-3xl">{commandesMock.length}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">Toutes périodes confondues</CardContent>
        </Card>
        <Card className="border-none shadow-soft">
          <CardHeader className="pb-2">
            <CardDescription>CA total</CardDescription>
            <CardTitle className="text-3xl">{summary.total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">Inclut les commandes livrées et en attente</CardContent>
        </Card>
        <Card className="border-none shadow-soft">
          <CardHeader className="pb-2">
            <CardDescription>Commandes livrées</CardDescription>
            <CardTitle className="text-3xl">{summary.delivered}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 pt-0 text-xs text-muted-foreground">
            <Badge variant="outline" className={getStatusColor("Livrée")}>Livrée</Badge>
            <span className="text-muted-foreground">statut confirmé</span>
          </CardContent>
        </Card>
        <Card className="border-none shadow-soft">
          <CardHeader className="pb-2">
            <CardDescription>En attente</CardDescription>
            <CardTitle className="text-3xl">{summary.pending}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 pt-0 text-xs text-muted-foreground">
            <Badge variant="outline" className={getStatusColor("En attente")}>En attente</Badge>
            <span>à suivre</span>
          </CardContent>
        </Card>
      </div>

      <CommandeFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        sort={sort}
        onSortChange={setSort}
      />

      <Separator className="my-2" />

      <CommandeTable
        commandes={commandesMock}
        filters={{ search, status, sort }}
      />
    </section>
  );
}
