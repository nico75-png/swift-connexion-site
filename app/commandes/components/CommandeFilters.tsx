"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type CommandeStatus = "Livrée" | "En attente" | "Annulée";

type SortOption = "date-desc" | "date-asc" | "montant-desc" | "montant-asc";

export interface CommandeFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: CommandeStatus | "Toutes";
  onStatusChange: (value: CommandeStatus | "Toutes") => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
}

export const statusOptions: (CommandeStatus | "Toutes")[] = ["Toutes", "Livrée", "En attente", "Annulée"];

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: "date-desc", label: "Date décroissante" },
  { value: "date-asc", label: "Date croissante" },
  { value: "montant-desc", label: "Montant décroissant" },
  { value: "montant-asc", label: "Montant croissant" }
];

export function CommandeFilters({ search, onSearchChange, status, onStatusChange, sort, onSortChange }: CommandeFiltersProps) {
  const currentStatusLabel = useMemo(() => (status === "Toutes" ? "Tous les statuts" : status), [status]);

  return (
    <div className="grid gap-4 rounded-xl border bg-card p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="search">Recherche client</Label>
        <Input
          id="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Rechercher un client"
          className="h-10"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Statut</Label>
        <Select value={status} onValueChange={(value) => onStatusChange(value as CommandeStatus | "Toutes")}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent className="max-h-48">
            {statusOptions.map((option) => (
              <SelectItem key={option} value={option} className={cn(option === status && "font-semibold")}>{option === "Toutes" ? "Tous les statuts" : option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Tri</Label>
        <Select value={sort} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent className="max-h-48">
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className={cn(option.value === sort && "font-semibold")}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col justify-center rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
        <p className="font-medium text-muted-foreground">Statut actuel :</p>
        <p className="text-base font-semibold text-foreground">{currentStatusLabel}</p>
      </div>
    </div>
  );
}

export type { CommandeStatus, SortOption };
