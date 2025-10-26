"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { CommandeFiltersProps, CommandeStatus, SortOption } from "./CommandeFilters";

export interface Commande {
  id: string;
  client: string;
  date: string;
  statut: CommandeStatus;
  montant: number;
}

export interface CommandeTableProps {
  commandes: Commande[];
  filters: Pick<CommandeFiltersProps, "search" | "status" | "sort">;
}

export function getStatusColor(statut: CommandeStatus) {
  switch (statut) {
    case "Livrée":
      return "border-emerald-200 bg-emerald-100 text-emerald-700";
    case "En attente":
      return "border-amber-200 bg-amber-100 text-amber-700";
    case "Annulée":
      return "border-rose-200 bg-rose-100 text-rose-700";
    default:
      return "border-muted bg-muted text-muted-foreground";
  }
}

function sortCommandes(data: Commande[], sort: SortOption) {
  return [...data].sort((a, b) => {
    if (sort === "date-desc" || sort === "date-asc") {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sort === "date-desc" ? -diff : diff;
    }

    const diff = a.montant - b.montant;
    return sort === "montant-desc" ? -diff : diff;
  });
}

function filterCommandes(data: Commande[], search: string, status: CommandeStatus | "Toutes") {
  return data.filter((commande) => {
    const matchSearch = commande.client.toLowerCase().includes(search.trim().toLowerCase());
    const matchStatus = status === "Toutes" ? true : commande.statut === status;
    return matchSearch && matchStatus;
  });
}

export function CommandeTable({ commandes, filters }: CommandeTableProps) {
  const filteredData = useMemo(() => {
    const afterFilter = filterCommandes(commandes, filters.search, filters.status);
    return sortCommandes(afterFilter, filters.sort);
  }, [commandes, filters.search, filters.status, filters.sort]);

  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="min-w-[140px]">ID</TableHead>
                <TableHead className="min-w-[180px]">Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((commande) => (
                <TableRow key={commande.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{commande.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{commande.client}</span>
                      <span className="text-xs text-muted-foreground">Client fidèle</span>
                    </div>
                  </TableCell>
                  <TableCell>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(commande.date))}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("capitalize", getStatusColor(commande.statut))}>
                      {commande.statut}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{commande.montant.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/commandes/${commande.id}`}>Voir détail</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Aucune commande ne correspond à vos filtres pour le moment.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
