import { useMemo } from 'react';
import {
  type Sector,
  type PackageType,
  getPackageTypesForSector,
  getClientPackageLabel,
} from '@/lib/packageTaxonomy';

interface PackageTypeOption {
  value: PackageType;
  label: string;
}

/**
 * Hook pour récupérer les types de colis disponibles selon le secteur
 * Retourne une liste d'options formatées pour un select
 */
export const usePackageTypes = (sector: Sector | undefined): PackageTypeOption[] => {
  return useMemo(() => {
    const allowedTypes = getPackageTypesForSector(sector);
    
    return allowedTypes.map(type => ({
      value: type,
      label: getClientPackageLabel(type),
    }));
  }, [sector]);
};
