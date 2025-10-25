// Auto-generated order seeds

export type AdminOrderSector =
  | "B2B Express"
  | "Juridique"
  | "Optique"
  | "Santé & Médical"
  | "Événementiel";
export type AdminOrderStatus = "En attente" | "Enlevé" | "En cours" | "Livré" | "Annulé";

export interface AdminOrderSeed {
  number: string;
  client: string;
  sector: AdminOrderSector;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  transportType: string;
  status: AdminOrderStatus;
  amount: number;
  pickupAddress: string;
  deliveryAddress: string;
  zone: "INTRA_PARIS" | "PETITE_COURONNE" | "GRANDE_COURONNE";
  volume: number;
  weight: number;
  instructions: string;
  express: boolean;
  fragile: boolean;
  temperatureControlled: boolean;
  driverId: string | null;
}

export const SECTOR_DISPLAY_MAP: Record<string, AdminOrderSector> = {
  MEDICAL: "Santé & Médical",
  OPTIQUE: "Optique",
  JURIDIQUE: "Juridique",
  B2B: "B2B Express",
  EVENT: "Événementiel",
};

type ClientDirectoryEntry = {
  sector: AdminOrderSector;
  siret: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
};

export const CLIENT_DIRECTORY: Partial<Record<string, ClientDirectoryEntry>> = {};

export const ADMIN_ORDER_SEEDS: AdminOrderSeed[] = [
  {
    number: "1000",
    client: "Futura Logistics",
    sector: "B2B Express",
    date: "2025-01-15",
    time: "10:30",
    transportType: "Course urgente intra-muros",
    status: "En attente",
    amount: 95.5,
    pickupAddress: "24 Rue de Rivoli, 75001 Paris",
    deliveryAddress: "18 Rue de Lyon, 75012 Paris",
    zone: "INTRA_PARIS",
    volume: 1.5,
    weight: 60,
    instructions: "Prévenir le destinataire 10 minutes avant l'arrivée.",
    express: true,
    fragile: false,
    temperatureControlled: false,
    driverId: null,
  },
];
