import { isWeekend } from "date-fns";

export type ServiceType = "standard" | "express" | "flash-express";

export interface ServiceOption {
  value: ServiceType;
  label: string;
  description: string;
}

const SERVICE_CONFIG: Record<
  ServiceType,
  {
    label: string;
    baseFare: number;
    includedDistanceKm: number;
    ratePerKm: number;
    typicalDurationMinutes: number;
  }
> = {
  standard: {
    label: "Standard",
    baseFare: 20,
    includedDistanceKm: 10,
    ratePerKm: 1.5,
    typicalDurationMinutes: 120,
  },
  express: {
    label: "Express",
    baseFare: 26,
    includedDistanceKm: 10,
    ratePerKm: 1.7,
    typicalDurationMinutes: 90,
  },
  "flash-express": {
    label: "Flash Express",
    baseFare: 32,
    includedDistanceKm: 10,
    ratePerKm: 2,
    typicalDurationMinutes: 60,
  },
};

export const SERVICE_TYPES: ServiceOption[] = [
  {
    value: "standard",
    label: SERVICE_CONFIG.standard.label,
    description: "Livraison programmée dans la journée",
  },
  {
    value: "express",
    label: SERVICE_CONFIG.express.label,
    description: "Collecte rapide et livraison prioritaire",
  },
  {
    value: "flash-express",
    label: SERVICE_CONFIG["flash-express"].label,
    description: "Départ immédiat avec coursier dédié",
  },
];

export interface FareEstimatorInput {
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: string;
  pickupTime: string;
  serviceType: ServiceType;
}

export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  surchargeAmount: number;
  currency: "EUR";
}

export interface FareEstimate {
  total: number;
  distanceKm: number;
  durationMinutes: number;
  serviceLabel: string;
  breakdown: FareBreakdown;
}

const formatDateFromInput = (date: string, time: string) => {
  if (!date || !time) {
    return null;
  }

  try {
    return new Date(`${date}T${time}`);
  } catch (error) {
    return null;
  }
};

const FALLBACK_DISTANCE_KM = 12.4;

const computeDistance = () => {
  // TODO: Brancher getRouteDistance() ici pour calculer la distance réelle entre les adresses.
  return FALLBACK_DISTANCE_KM;
};

const computeDuration = (serviceType: ServiceType) => {
  // TODO: Brancher getRouteDuration() ici pour récupérer le temps de trajet réel.
  return SERVICE_CONFIG[serviceType].typicalDurationMinutes;
};

const computeSurchargeMultiplier = (scheduledAt: Date | null) => {
  if (!scheduledAt) {
    return 1;
  }

  const hour = scheduledAt.getHours();
  const isEvening = hour >= 20 || hour < 6;
  const weekend = isWeekend(scheduledAt);
  const eveningMultiplier = isEvening ? 1.12 : 1;
  const weekendMultiplier = weekend ? 1.15 : 1;

  return eveningMultiplier * weekendMultiplier;
};

export const estimateFare = (input: FareEstimatorInput): FareEstimate => {
  const config = SERVICE_CONFIG[input.serviceType];

  if (!config) {
    throw new Error("Service type not supported");
  }

  const scheduledAt = formatDateFromInput(input.pickupDate, input.pickupTime);
  const distanceKm = computeDistance();
  const distanceBeyondIncluded = Math.max(distanceKm - config.includedDistanceKm, 0);
  const distanceFare = distanceBeyondIncluded * config.ratePerKm;
  const baseFare = config.baseFare;
  const totalBeforeSurcharge = baseFare + distanceFare;
  const surchargeMultiplier = computeSurchargeMultiplier(scheduledAt);
  const total = Math.round(totalBeforeSurcharge * surchargeMultiplier * 100) / 100;
  const surchargeAmount = Math.max(total - totalBeforeSurcharge, 0);
  const durationMinutes = computeDuration(input.serviceType);

  return {
    total,
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMinutes,
    serviceLabel: config.label,
    breakdown: {
      baseFare,
      distanceFare: Math.round(distanceFare * 100) / 100,
      surchargeAmount: Math.round(surchargeAmount * 100) / 100,
      currency: "EUR",
    },
  };
};

// TODO: Remplacer les constantes ci-dessus par la vraie grille tarifaire lorsque l'API ou la configuration sera disponible.
