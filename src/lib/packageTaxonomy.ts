/**
 * Taxonomie d'expertise et types de colis
 * Définit les secteurs d'activité et les types de colis autorisés pour chaque secteur
 */

export const SECTORS = {
  MEDICAL: 'MEDICAL',
  OPTIQUE: 'OPTIQUE',
  JURIDIQUE: 'JURIDIQUE',
  B2B: 'B2B',
  EVENT: 'EVENT',
} as const;

export type Sector = typeof SECTORS[keyof typeof SECTORS];

export const SECTOR_LABELS: Record<Sector, string> = {
  MEDICAL: '🩺 Santé & Médical',
  OPTIQUE: '👓 Optique',
  JURIDIQUE: '⚖️ Juridique',
  B2B: '🚚 B2B Express',
  EVENT: '🎤 Événementiel',
};

// Types de colis (valeurs côté client)
export type PackageType =
  // Santé & Médical
  | 'DM_CONSOMMABLES'
  | 'UN3373'
  | 'MEDICAMENTS_AMBIANT'
  | 'MEDICAMENTS_2_8'
  | 'DOCS_CONFIDENTIELS'
  // Optique
  | 'VERRES_FRAGILES'
  | 'MONTURES_FRAGILES'
  | 'LENTILLES_LIQUIDE'
  | 'PLV_REASSORT'
  | 'SAV_ATELIER'
  // Juridique
  | 'DOSSIERS_CONFIDENTIELS'
  | 'DEPOTS_GREFFE_NOMINATIF'
  | 'JEUX_SIGNATURE_NOMINATIF'
  | 'DOCS_SCELLES'
  // B2B Express
  | 'PROTOTYPE'
  | 'PIECE_DEPANNAGE'
  | 'IT_ELECTRONIQUE'
  | 'DOCS_SENSIBLES'
  // Événementiel
  | 'PLV_SIGNAL'
  | 'GOODIES_WELCOME'
  | 'REGIE_MATERIEL'
  | 'DOCS_PROD_CONF'
  // Commun
  | 'AUTRE';

// Libellés affichés au client (détaillés)
export const CLIENT_PACKAGE_LABELS: Record<PackageType, string> = {
  // Santé & Médical
  DM_CONSOMMABLES: 'DM/Consommables',
  UN3373: 'UN3373',
  MEDICAMENTS_AMBIANT: 'Médicaments ambiants',
  MEDICAMENTS_2_8: 'Médicaments 2–8 °C',
  DOCS_CONFIDENTIELS: 'Documents scellés',
  // Optique
  VERRES_FRAGILES: 'Verres – Fragile',
  MONTURES_FRAGILES: 'Montures & pièces atelier – Fragile',
  LENTILLES_LIQUIDE: 'Lentilles & solutions – Liquide',
  PLV_REASSORT: 'PLV & réassorts',
  SAV_ATELIER: 'SAV labo/fabricant',
  // Juridique
  DOSSIERS_CONFIDENTIELS: 'Dossiers audience',
  DEPOTS_GREFFE_NOMINATIF: 'Dépôts greffe / apostilles',
  JEUX_SIGNATURE_NOMINATIF: 'Jeux de signature',
  DOCS_SCELLES: 'Documents scellés – remise nominative',
  // B2B Express
  PROTOTYPE: 'Prototypes & échantillons',
  PIECE_DEPANNAGE: 'Pièces de dépannage',
  IT_ELECTRONIQUE: 'IT (laptops, routeurs)',
  DOCS_SENSIBLES: 'Documents sensibles',
  // Événementiel
  PLV_SIGNAL: 'Signalétique & PLV',
  GOODIES_WELCOME: 'Goodies / welcome packs',
  REGIE_MATERIEL: 'Matériel de régie',
  DOCS_PROD_CONF: 'Documents prod (feuilles de service, listes)',
  // Commun
  AUTRE: 'Autre (préciser)',
};

// Libellés génériques pour chauffeur/admin (masquent le contenu sensible)
export const ADMIN_DRIVER_LABELS: Record<PackageType, string> = {
  // Santé & Médical
  DM_CONSOMMABLES: 'DM/Consommables',
  UN3373: 'UN3373',
  MEDICAMENTS_AMBIANT: 'Médicaments ambiants',
  MEDICAMENTS_2_8: 'Thermo 2–8 °C',
  DOCS_CONFIDENTIELS: 'Documents scellés',
  // Optique
  VERRES_FRAGILES: 'Fragile',
  MONTURES_FRAGILES: 'Fragile',
  LENTILLES_LIQUIDE: 'Liquide',
  PLV_REASSORT: 'PLV',
  SAV_ATELIER: 'SAV',
  // Juridique
  DOSSIERS_CONFIDENTIELS: 'Documents scellés – remise nominative',
  DEPOTS_GREFFE_NOMINATIF: 'Documents scellés – remise nominative',
  JEUX_SIGNATURE_NOMINATIF: 'Documents scellés – remise nominative',
  DOCS_SCELLES: 'Documents scellés – remise nominative',
  // B2B Express
  PROTOTYPE: 'Prototype',
  PIECE_DEPANNAGE: 'Pièce urgente',
  IT_ELECTRONIQUE: 'Électronique',
  DOCS_SENSIBLES: 'Documents scellés',
  // Événementiel
  PLV_SIGNAL: 'PLV',
  GOODIES_WELCOME: 'PLV',
  REGIE_MATERIEL: 'Régie',
  DOCS_PROD_CONF: 'Docs scellés',
  // Commun
  AUTRE: 'Autre',
};

// Mapping secteur → types autorisés
export const PACKAGE_TYPES_BY_SECTOR: Record<Sector, PackageType[]> = {
  MEDICAL: [
    'DM_CONSOMMABLES',
    'UN3373',
    'MEDICAMENTS_AMBIANT',
    'MEDICAMENTS_2_8',
    'DOCS_CONFIDENTIELS',
    'AUTRE',
  ],
  OPTIQUE: [
    'VERRES_FRAGILES',
    'MONTURES_FRAGILES',
    'LENTILLES_LIQUIDE',
    'PLV_REASSORT',
    'SAV_ATELIER',
    'AUTRE',
  ],
  JURIDIQUE: [
    'DOSSIERS_CONFIDENTIELS',
    'DEPOTS_GREFFE_NOMINATIF',
    'JEUX_SIGNATURE_NOMINATIF',
    'DOCS_SCELLES',
    'AUTRE',
  ],
  B2B: [
    'PROTOTYPE',
    'PIECE_DEPANNAGE',
    'IT_ELECTRONIQUE',
    'DOCS_SENSIBLES',
    'AUTRE',
  ],
  EVENT: [
    'PLV_SIGNAL',
    'GOODIES_WELCOME',
    'REGIE_MATERIEL',
    'DOCS_PROD_CONF',
    'AUTRE',
  ],
};

/**
 * Récupère les types de colis autorisés pour un secteur donné
 */
export const getPackageTypesForSector = (sector: Sector | undefined): PackageType[] => {
  if (!sector) return ['AUTRE'];
  return PACKAGE_TYPES_BY_SECTOR[sector] || ['AUTRE'];
};

/**
 * Récupère le libellé client pour un type de colis
 */
export const getClientPackageLabel = (packageType: PackageType): string => {
  return CLIENT_PACKAGE_LABELS[packageType] || packageType;
};

/**
 * Récupère le libellé générique (admin/driver) pour un type de colis
 */
export const getAdminDriverLabel = (packageType: PackageType): string => {
  return ADMIN_DRIVER_LABELS[packageType] || 'Colis';
};

/**
 * Récupère le libellé d'un secteur
 */
export const getSectorLabel = (sector: Sector): string => {
  return SECTOR_LABELS[sector] || sector;
};
