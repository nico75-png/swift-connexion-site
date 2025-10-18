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

export const ADMIN_ORDER_SEEDS: AdminOrderSeed[] = [];
