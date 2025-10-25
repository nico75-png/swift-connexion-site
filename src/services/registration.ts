import type { SectorValue } from "@/config/secteurs";

export interface BillingAddressPayload {
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface RegistrationPayload {
  companyName: string;
  email: string;
  phone: string;
  siret: string;
  sector: SectorValue;
  billingAddress: BillingAddressPayload;
}

export interface RegistrationResponse {
  ok: boolean;
}

export const submitRegistration = async (_payload: RegistrationPayload): Promise<RegistrationResponse> => {
  // TODO: brancher avec l'API d'inscription côté serveur.
  return { ok: true };
};
