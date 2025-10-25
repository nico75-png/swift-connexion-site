
import { describe, expect, it } from "vitest";

import { SECTOR_OPTIONS } from "@/config/secteurs";
import { registrationSchema, sanitizeSiret } from "../inscriptionSchema";

const validInput = {
  companyName: "Ma Société",
  email: "contact@exemple.fr",
  phone: "+33612345678",
  siret: "73282932000074",
  sector: SECTOR_OPTIONS[0].value,
  billingAddress: {
    line1: "12 rue de l'Innovation",
    line2: "",
    postalCode: "75008",
    city: "Paris",
    country: "France",
  },
} as const;

describe("registrationSchema", () => {
  it("rejette une adresse e-mail invalide", () => {
    const result = registrationSchema.safeParse({
      ...validInput,
      email: "email-invalide",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toContain("Adresse e-mail invalide.");
    }
  });

  it("normalise l'adresse e-mail et le numéro de téléphone", () => {
    const result = registrationSchema.parse({
      ...validInput,
      email: " CONTACT@EXEMPLE.FR ",
      phone: "06 12 34 56 78",
    });

    expect(result.email).toBe("contact@exemple.fr");
    expect(result.phone).toBe("0612345678");
  });

  it("rejette un numéro de téléphone trop court", () => {
    const result = registrationSchema.safeParse({
      ...validInput,
      phone: "01234",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.phone).toContain("Saisissez un numéro de téléphone valide.");
    }
  });

  it("rejette un SIRET qui ne passe pas le contrôle de Luhn", () => {
    const result = registrationSchema.safeParse({
      ...validInput,
      siret: "11111111111111",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.siret).toContain("Le SIRET est invalide.");
    }
  });

  it("rejette un secteur en dehors de la configuration", () => {
    const result = registrationSchema.safeParse({
      ...validInput,
      sector: "AUTRE_SECTEUR",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.sector).toContain("Sélectionnez un secteur.");
    }
  });

  it("retourne une adresse de facturation nettoyée", () => {
    const result = registrationSchema.parse({
      ...validInput,
      billingAddress: {
        ...validInput.billingAddress,
        line2: "  Bâtiment A  ",
      },
    });

    expect(result.billingAddress.line1).toBe("12 rue de l'Innovation");
    expect(result.billingAddress.line2).toBe("Bâtiment A");
    expect(result.billingAddress.postalCode).toBe("75008");
  });

  it("supprime les caractères non numériques du SIRET avant validation", () => {
    const result = registrationSchema.parse({
      ...validInput,
      siret: " 732 829 320 00074 ",
    });

    expect(result.siret).toBe(sanitizeSiret(" 732 829 320 00074 "));
  });
});
