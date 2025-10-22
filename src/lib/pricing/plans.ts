export type PricingPlanId = "standard" | "express" | "flash-express";

export type PricingPlan = {
  id: PricingPlanId;
  name: string;
  price: string;
  priceDetails: string;
  tagline: string;
  features: string[];
  badge?: string;
  isFeatured?: boolean;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "standard",
    name: "Standard",
    price: "20 €",
    priceDetails: "forfait 0 à 10 km",
    tagline: "Pour vos livraisons programmées du quotidien",
    // Mettre à jour les montants et conditions tarifaires ici si nécessaire.
    features: [
      "20 € pour la tranche 0 à 10 km",
      "1,50 € par kilomètre supplémentaire",
      "Délai maximum de 3 heures",
      "Assurance colis et suivi en temps réel",
    ],
  },
  {
    id: "express",
    name: "Express",
    price: "26 €",
    priceDetails: "forfait 0 à 10 km",
    tagline: "La solution rapide pour vos urgences professionnelles",
    badge: "POPULAIRE",
    isFeatured: true,
    // Mettre à jour les montants et conditions tarifaires ici si nécessaire.
    features: [
      "26 € pour la tranche 0 à 10 km",
      "1,70 € par kilomètre supplémentaire",
      "Délai garanti sous 2 heures",
      "Support prioritaire dédié",
    ],
  },
  {
    id: "flash-express",
    name: "Flash Express",
    price: "32 €",
    priceDetails: "forfait 0 à 10 km",
    tagline: "Notre service le plus rapide pour les livraisons critiques",
    // Mettre à jour les montants et conditions tarifaires ici si nécessaire.
    features: [
      "32 € pour la tranche 0 à 10 km",
      "2,00 € par kilomètre supplémentaire",
      "Délai record de 45 minutes",
      "Coursier dédié et suivi premium",
    ],
  },
];
