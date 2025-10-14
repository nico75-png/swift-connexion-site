import { DriverStatus, Driver } from "@/lib/stores/driversOrders.store";

export const driverStatusLabel: Record<DriverStatus, string> = {
  AVAILABLE: "Disponible",
  ON_TRIP: "En course",
  PAUSED: "En pause",
};

export const driverStatusBadgeClass: Record<DriverStatus, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ON_TRIP: "bg-blue-100 text-blue-700 border-blue-200",
  PAUSED: "bg-amber-100 text-amber-700 border-amber-200",
};

export const zoneLabels: Record<Driver["zone"], string> = {
  INTRA_PARIS: "Intra-Paris",
  PETITE_COURONNE: "Petite Couronne",
  GRANDE_COURONNE: "Grande Couronne",
};
