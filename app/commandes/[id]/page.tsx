import { notFound } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { CommandeDetails } from "../components/CommandeDetails";
import type { Commande } from "../components/CommandeTable";

type CommandeDetail = Commande & {
  paiementStatut: "Payé" | "En attente" | "En retard";
  livraisonStatut: "Livrée" | "Préparation" | "Expédiée";
  produits: { nom: string; quantite: number; prixUnitaire: number }[];
  adresseLivraison: { nom: string; adresse: string; ville: string; codePostal: string };
  notes?: string;
};

const commandesDetails: Record<string, CommandeDetail> = {
  "CMD-1024": {
    id: "CMD-1024",
    client: "Laura Martin",
    date: "2025-10-18",
    statut: "Livrée",
    montant: 129.99,
    paiementStatut: "Payé",
    livraisonStatut: "Livrée",
    produits: [
      { nom: "Pack découverte One Connexion", quantite: 1, prixUnitaire: 79.99 },
      { nom: "Atelier onboarding", quantite: 1, prixUnitaire: 50 },
    ],
    adresseLivraison: {
      nom: "Laura Martin",
      adresse: "12 rue des Lilas",
      ville: "Lyon",
      codePostal: "69003",
    },
    notes: "Livraison effectuée en main propre au point relais.",
  },
  "CMD-1025": {
    id: "CMD-1025",
    client: "Antoine Lefèvre",
    date: "2025-10-22",
    statut: "En attente",
    montant: 89.5,
    paiementStatut: "En attente",
    livraisonStatut: "Préparation",
    produits: [
      { nom: "Abonnement mensuel", quantite: 1, prixUnitaire: 59.5 },
      { nom: "Support prioritaire", quantite: 1, prixUnitaire: 30 },
    ],
    adresseLivraison: {
      nom: "Antoine Lefèvre",
      adresse: "78 avenue de la République",
      ville: "Paris",
      codePostal: "75011",
    },
    notes: "Attente de confirmation de paiement avant expédition.",
  },
  "CMD-1026": {
    id: "CMD-1026",
    client: "Sophie Dubois",
    date: "2025-10-25",
    statut: "Annulée",
    montant: 45,
    paiementStatut: "En retard",
    livraisonStatut: "Préparation",
    produits: [{ nom: "Kit découverte", quantite: 1, prixUnitaire: 45 }],
    adresseLivraison: {
      nom: "Sophie Dubois",
      adresse: "5 place du Capitole",
      ville: "Toulouse",
      codePostal: "31000",
    },
    notes: "Commande annulée par le client avant expédition.",
  },
};

type PageProps = {
  params: { id: string };
};

export default function CommandeDetailPage({ params }: PageProps) {
  const commande = commandesDetails[params.id];

  if (!commande) {
    notFound();
  }

  const produitsTotal = commande.produits.reduce((total, produit) => total + produit.prixUnitaire * produit.quantite, 0);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 md:p-8">
      <CommandeDetails
        id={commande.id}
        client={commande.client}
        date={commande.date}
        statut={commande.statut}
        montant={commande.montant}
        paiementStatut={commande.paiementStatut}
        livraisonStatut={commande.livraisonStatut}
        produits={commande.produits}
        adresseLivraison={commande.adresseLivraison}
        backHref="/commandes"
      />

      <Card className="border-none shadow-lg">
        <CardHeader className="border-b bg-muted/40">
          <CardTitle className="text-lg font-semibold">Notes internes</CardTitle>
          <CardDescription>Historique et suivi pour les équipes relation client.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 py-4 text-sm text-muted-foreground">
          <p>{commande.notes}</p>
          <Separator />
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>Montant produits : <strong>{produitsTotal.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</strong></span>
            <span>Dernière mise à jour : <strong>24 octobre 2025</strong></span>
            <span>Canal : <strong>Dashboard client</strong></span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
