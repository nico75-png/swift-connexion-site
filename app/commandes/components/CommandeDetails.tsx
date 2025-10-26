import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { CommandeStatus } from "./CommandeFilters";
import { getStatusColor } from "./CommandeTable";

type StatutBadge = CommandeStatus | "Payé" | "En retard" | "Expédiée" | "Préparation";

type CommandeProduit = {
  nom: string;
  quantite: number;
  prixUnitaire: number;
};

type AdresseLivraison = {
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
};

type CommandeDetailsProps = {
  id: string;
  client: string;
  date: string;
  statut: CommandeStatus;
  montant: number;
  paiementStatut: StatutBadge;
  livraisonStatut: StatutBadge;
  produits: CommandeProduit[];
  adresseLivraison: AdresseLivraison;
  backHref?: string;
};

const badgeColors: Record<StatutBadge, string> = {
  "Payé": "border-emerald-200 bg-emerald-100 text-emerald-700",
  "En attente": "border-amber-200 bg-amber-100 text-amber-700",
  "En retard": "border-rose-200 bg-rose-100 text-rose-700",
  "Expédiée": "border-sky-200 bg-sky-100 text-sky-700",
  "Préparation": "border-blue-200 bg-blue-100 text-blue-700",
  "Livrée": "border-emerald-200 bg-emerald-100 text-emerald-700",
  "Annulée": "border-rose-200 bg-rose-100 text-rose-700",
};

export function CommandeDetails({
  id,
  client,
  date,
  statut,
  montant,
  paiementStatut,
  livraisonStatut,
  produits,
  adresseLivraison,
  backHref,
}: CommandeDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-muted-foreground">Commande #{id}</p>
          <h1 className="text-3xl font-bold text-foreground">Détails de la commande</h1>
          <p className="text-sm text-muted-foreground">Passée le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" }).format(new Date(date))}</p>
        </div>
        {backHref ? (
          <Button variant="outline" asChild className="self-start md:self-auto">
            <Link href={backHref}>Retour à la liste</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="border-none shadow-lg">
          <CardHeader className="flex flex-col gap-2 border-b bg-muted/40">
            <CardTitle className="text-lg font-semibold">Informations principales</CardTitle>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{client}</span>
              <Separator orientation="vertical" className="hidden h-4 md:block" />
              <span>Montant total : <span className="font-semibold text-foreground">{montant.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span></span>
              <Badge variant="outline" className={cn("capitalize", getStatusColor(statut))}>
                {statut}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Produit</TableHead>
                  <TableHead className="text-center">Quantité</TableHead>
                  <TableHead className="text-right">Prix unitaire</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produits.map((produit) => (
                  <TableRow key={produit.nom}>
                    <TableCell className="font-medium text-foreground">{produit.nom}</TableCell>
                    <TableCell className="text-center">{produit.quantite}</TableCell>
                    <TableCell className="text-right">{produit.prixUnitaire.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {(produit.quantite * produit.prixUnitaire).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b bg-muted/40">
              <CardTitle className="text-lg font-semibold">Statuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Paiement</span>
                <Badge variant="outline" className={cn("capitalize", badgeColors[paiementStatut])}>
                  {paiementStatut}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Livraison</span>
                <Badge variant="outline" className={cn("capitalize", badgeColors[livraisonStatut])}>
                  {livraisonStatut}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="border-b bg-muted/40">
              <CardTitle className="text-lg font-semibold">Adresse de livraison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 py-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">{adresseLivraison.nom}</p>
              <p>{adresseLivraison.adresse}</p>
              <p>
                {adresseLivraison.codePostal} {adresseLivraison.ville}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

