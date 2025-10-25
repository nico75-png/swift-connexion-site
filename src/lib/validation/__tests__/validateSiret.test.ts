
import { describe, expect, it } from "vitest";

import { validateSiret } from "../validateSiret";

describe("validateSiret", () => {
  it("valide un numéro de SIRET conforme", () => {
    expect(validateSiret("73282932000074")).toBe(true);
  });

  it("rejette un numéro de SIRET trop court", () => {
    expect(validateSiret("1234567890123")).toBe(false);
  });

  it("rejette un SIRET avec des caractères non numériques", () => {
    expect(validateSiret("73282932A000074")).toBe(false);
  });

  it("rejette un SIRET qui échoue au contrôle de Luhn", () => {
    expect(validateSiret("73282932000075")).toBe(false);
  });
});
