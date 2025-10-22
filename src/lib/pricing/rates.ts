export type PricingPlan = {
  id: string;
  name: string;
  base: number;
  perKm: number;
  sla: string;
};

export const PLANS: PricingPlan[] = [
  {
    id: "standard",
    name: "Standard",
    base: 20,
    perKm: 1.5,
    sla: "≤ 3 h",
  },
  {
    id: "express",
    name: "Express",
    base: 26,
    perKm: 1.7,
    sla: "≤ 2 h",
  },
  {
    id: "flash",
    name: "Flash Express",
    base: 32,
    perKm: 2.0,
    sla: "≤ 45 min",
  },
];
// Mettre à jour les bases et prix au kilomètre ici pour modifier la grille tarifaire.

export const EXAMPLES_KM = [5, 15, 27];
// Étendre ce tableau pour ajouter ou retirer des distances de référence affichées dans le tableau.

export function estimate(plan: PricingPlan, km: number): number {
  if (km <= 10) {
    return plan.base;
  }

  return plan.base + (km - 10) * plan.perKm;
}
// Le formattage monnaie est géré côté UI pour se brancher facilement sur le formateur global du projet.
