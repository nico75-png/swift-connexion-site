import { SECTOR_LABELS, SECTORS, type Sector } from "@/lib/packageTaxonomy";

const sectorValues = Object.values(SECTORS) as [Sector, ...Sector[]];

export const SECTOR_VALUES = sectorValues;

export type SectorValue = (typeof SECTOR_VALUES)[number];

export interface SectorOption {
  value: SectorValue;
  label: string;
}

export const SECTOR_OPTIONS: SectorOption[] = sectorValues.map((value) => ({
  value,
  label: SECTOR_LABELS[value],
}));

export const isSectorValue = (value: unknown): value is SectorValue =>
  typeof value === "string" && sectorValues.includes(value as SectorValue);
