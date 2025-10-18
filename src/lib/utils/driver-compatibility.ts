import type { Driver } from "@/lib/stores/driversOrders.store";

export interface AssignmentRequirements {
  weight?: number | null;
  volume?: number | null;
  excludedDriverIds?: string[] | null;
}

export interface DriverCompatibilityResult {
  assignable: boolean;
  reasons: string[];
  warnings: string[];
  capacityKg: number | null;
  capacityVolumeM3: number | null;
  meetsWeight: boolean;
  meetsVolume: boolean;
  isAvailable: boolean;
  isExcluded: boolean;
}

const parseNumericValue = (value: string | undefined | null): number | null => {
  if (!value) {
    return null;
  }
  const normalized = value.replace(/,/g, ".");
  const match = normalized.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (!match) {
    return null;
  }
  const parsed = Number.parseFloat(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseWeightCapacityKg = (value: string | undefined | null): number | null => {
  if (!value) {
    return null;
  }
  const lower = value.toLowerCase();
  const numeric = parseNumericValue(lower);
  if (numeric == null) {
    return null;
  }
  if (lower.includes("t") && !lower.includes("kg")) {
    return numeric * 1000;
  }
  return numeric;
};

const parseVolumeCapacityM3 = (value: string | undefined | null): number | null => {
  if (!value) {
    return null;
  }
  const lower = value.toLowerCase();
  if (!lower.includes("m3") && !lower.includes("m³")) {
    return null;
  }
  const numeric = parseNumericValue(lower);
  return numeric;
};

const normalizeRequirement = (value?: number | null): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  return value > 0 ? value : 0;
};

export const resolveDriverCapacity = (driver: Driver) => {
  const capacityString = driver.vehicle?.capacity;
  const capacityKg =
    typeof driver.vehicle?.capacityKg === "number"
      ? driver.vehicle.capacityKg
      : parseWeightCapacityKg(capacityString);
  const capacityVolumeM3 = parseVolumeCapacityM3(capacityString);

  return {
    capacityKg: capacityKg != null ? Math.max(0, capacityKg) : null,
    capacityVolumeM3: capacityVolumeM3 != null ? Math.max(0, capacityVolumeM3) : null,
  };
};

export const evaluateDriverCompatibility = (
  driver: Driver,
  requirements: AssignmentRequirements,
): DriverCompatibilityResult => {
  const requiredWeight = normalizeRequirement(requirements.weight);
  const requiredVolume = normalizeRequirement(requirements.volume);
  const excludedIds = requirements.excludedDriverIds ?? [];

  const { capacityKg, capacityVolumeM3 } = resolveDriverCapacity(driver);

  const meetsWeight = requiredWeight === 0 || (capacityKg ?? 0) >= requiredWeight;
  const meetsVolume =
    requiredVolume === 0 || capacityVolumeM3 == null ? true : capacityVolumeM3 >= requiredVolume;

  const reasons: string[] = [];
  const warnings: string[] = [];

  const isActive = driver.active !== false && driver.lifecycleStatus !== "INACTIF";
  const status = driver.status;
  const isAvailable = status === "AVAILABLE" && isActive;

  if (!isActive) {
    reasons.push("Ce chauffeur est inactif.");
  }

  if (status === "PAUSED") {
    reasons.push("Ce chauffeur est en pause.");
  } else if (status === "ON_TRIP") {
    reasons.push("Ce chauffeur est actuellement en course.");
  } else if (status !== "AVAILABLE") {
    reasons.push("Ce chauffeur n'est pas disponible.");
  }

  if (!meetsWeight) {
    reasons.push(
      capacityKg != null
        ? `Poids requis (${requiredWeight} kg) supérieur à la capacité (${capacityKg} kg).`
        : "Capacité de chargement inconnue pour ce chauffeur.",
    );
  }

  if (requiredVolume > 0) {
    if (capacityVolumeM3 == null) {
      warnings.push("Volume du véhicule non renseigné pour ce chauffeur.");
    } else if (!meetsVolume) {
      reasons.push(
        `Volume requis (${requiredVolume} m³) supérieur à la capacité (${capacityVolumeM3} m³).`,
      );
    }
  }

  const isExcluded = excludedIds.includes(driver.id);
  if (isExcluded) {
    reasons.push("Ce chauffeur est exclu de cette commande.");
  }

  return {
    assignable: reasons.length === 0,
    reasons,
    warnings,
    capacityKg: capacityKg ?? null,
    capacityVolumeM3,
    meetsWeight,
    meetsVolume,
    isAvailable,
    isExcluded,
  };
};
