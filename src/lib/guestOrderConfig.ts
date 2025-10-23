export type GuestSectorKey =
  | "sante-medical"
  | "juridique-administratif"
  | "evenementiel-media"
  | "retail-luxe-ecommerce"
  | "industrie-services"
  | "optique";

export interface GuestSectorConfig {
  id: GuestSectorKey;
  label: string;
  description: string;
  highlight: string;
  packageTypes: Array<{ value: string; label: string }>;
}

export const GUEST_SECTORS: GuestSectorConfig[] = [
  {
    id: "sante-medical",
    label: "Santé & Médical",
    description: "Transport sécurisé de produits médicaux et sensibles.",
    highlight: "Chaîne du froid maîtrisée et conformité UN3373",
    packageTypes: [
      { value: "echantillons-biologiques", label: "Échantillons biologiques (UN3373)" },
      { value: "traitements-medicaux", label: "Médicaments & traitements" },
      { value: "dispositifs-medicaux", label: "Dispositifs médicaux" },
      { value: "docs-confidentiels", label: "Dossiers médicaux confidentiels" },
      { value: "chaine-du-froid", label: "Colis sous température dirigée" },
      { value: "autre", label: "Autre (max 50 car.)" },
    ],
  },
  {
    id: "juridique-administratif",
    label: "Juridique & Administratif",
    description: "Acheminement nominatif et sécurisé des documents sensibles.",
    highlight: "Remise contre signature & confidentialité assurée",
    packageTypes: [
      { value: "dossiers-plaidoirie", label: "Dossiers de plaidoirie" },
      { value: "contrats", label: "Contrats & pièces officielles" },
      { value: "scelles", label: "Documents scellés" },
      { value: "supports-numeriques", label: "Supports numériques (clé USB, disque)" },
      { value: "cles-badges", label: "Clés & badges d’accès" },
      { value: "autre", label: "Autre (max 50 car.)" },
    ],
  },
  {
    id: "evenementiel-media",
    label: "Événementiel & Média",
    description: "Livraison express de matériel pour plateaux et événements.",
    highlight: "Disponibilité 24/7 et coordination plateau",
    packageTypes: [
      { value: "materiel-audiovisuel", label: "Matériel audiovisuel" },
      { value: "kits-accueil", label: "Kits d’accueil / PLV" },
      { value: "decors", label: "Décors & éléments scéniques" },
      { value: "produits-presse", label: "Produits presse / lancement" },
      { value: "urgences-techniques", label: "Urgences techniques plateau" },
      { value: "autre", label: "Autre (max 50 car.)" },
    ],
  },
  {
    id: "retail-luxe-ecommerce",
    label: "Retail, Luxe & E-commerce",
    description: "Courses premium pour marques et réseaux de boutiques.",
    highlight: "Gestion des flux click & collect et retours VIP",
    packageTypes: [
      { value: "produits-boutique", label: "Produits boutique / flagship" },
      { value: "echantillons-luxe", label: "Échantillons & pièces de collection" },
      { value: "retours-ecommerce", label: "Retours e-commerce" },
      { value: "accessoires-vitrine", label: "Accessoires & vitrines" },
      { value: "colis-securises", label: "Colis premium sécurisés" },
      { value: "autre", label: "Autre (max 50 car.)" },
    ],
  },
  {
    id: "industrie-services",
    label: "Industrie & Services de proximité",
    description: "Acheminement rapide de pièces et matériels critiques.",
    highlight: "Disponibilité en urgence et logistique sur-mesure",
    packageTypes: [
      { value: "pieces-detachees", label: "Pièces détachées" },
      { value: "outillage", label: "Outils & consommables" },
      { value: "materiel-it", label: "Matériel IT / maintenance" },
      { value: "cles-badges", label: "Clés / badges" },
      { value: "urgences-techniques", label: "Urgences techniques" },
      { value: "autre", label: "Autre (max 50 car.)" },
    ],
  },
  {
    id: "optique",
    label: "Optique",
    description: "Distribution contrôlée pour ateliers et points de vente.",
    highlight: "Manipulation délicate et collecte atelier",
    packageTypes: [
      { value: "verres-fragiles", label: "Verres optiques fragiles" },
      { value: "montures", label: "Montures et pièces atelier" },
      { value: "lentilles", label: "Lentilles & solutions" },
      { value: "plv-optique", label: "PLV & réassorts" },
      { value: "sav", label: "SAV / retours atelier" },
      { value: "autre", label: "Autre (max 50 car.)" },
    ],
  },
];

export const getGuestSectorConfig = (sectorId?: GuestSectorKey | "") =>
  GUEST_SECTORS.find((sector) => sector.id === sectorId);

export const getPackageTypeLabel = (
  sectorId: GuestSectorKey | "" | undefined,
  packageValue: string,
): string => {
  if (!sectorId) {
    return packageValue;
  }
  const sector = getGuestSectorConfig(sectorId);
  if (!sector) {
    return packageValue;
  }
  return sector.packageTypes.find((item) => item.value === packageValue)?.label ?? packageValue;
};
