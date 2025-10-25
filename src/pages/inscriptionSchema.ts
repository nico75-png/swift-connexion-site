import { z } from "zod";

import { SECTOR_VALUES, type SectorValue } from "@/config/secteurs";
import { validateSiret } from "@/lib/validation/validateSiret";

export const sanitizePhone = (value: string) =>
  value
    .replace(/\u00A0/g, " ")
    .replace(/[\s.\-]/g, "")
    .replace(/\(([^)]+)\)/g, "$1");

export const sanitizeSiret = (value: string) => value.replace(/\D/g, "");

export const normalizePhoneForSubmit = (value: string) => {
  const sanitized = sanitizePhone(value);

  if (sanitized.startsWith("+")) {
    return `+${sanitized.slice(1)}`;
  }

  if (sanitized.startsWith("0")) {
    return `+33${sanitized.slice(1)}`;
  }

  return sanitized;
};

export const registrationSchema = z.object({
  companyName: z
    .string({ required_error: "Le nom de la société est requis." })
    .trim()
    .min(2, "Indiquez un nom de société (2 caractères min.).")
    .max(120, "120 caractères maximum."),
  email: z
    .string({ required_error: "L'adresse e-mail est requise." })
    .trim()
    .min(1, "L'adresse e-mail est requise.")
    .toLowerCase()
    .email("Adresse e-mail invalide."),
  phone: z
    .string({ required_error: "Le numéro de téléphone est requis." })
    .trim()
    .min(1, "Le numéro de téléphone est requis.")
    .superRefine((value, ctx) => {
      const sanitized = sanitizePhone(value);

      if (!sanitized) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Saisissez un numéro de téléphone valide." });
        return;
      }

      if (sanitized.startsWith("+")) {
        const digits = sanitized.slice(1);
        if (!/^\d{8,15}$/.test(digits)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Saisissez un numéro de téléphone valide." });
        }
        return;
      }

      if (!/^0\d{9}$/.test(sanitized)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Saisissez un numéro de téléphone valide." });
      }
    })
    .transform((value) => sanitizePhone(value)),
  siret: z
    .string({ required_error: "Le numéro de SIRET est requis." })
    .trim()
    .min(1, "Le numéro de SIRET est requis.")
    .superRefine((value, ctx) => {
      const digitsOnly = sanitizeSiret(value);

      if (!/^\d{14}$/.test(digitsOnly)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Le SIRET doit contenir 14 chiffres." });
        return;
      }

      if (!validateSiret(digitsOnly)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Le SIRET est invalide." });
      }
    })
    .transform((value) => sanitizeSiret(value)),
  sector: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    },
    z.enum(SECTOR_VALUES, { errorMap: () => ({ message: "Sélectionnez un secteur." }) }),
  ),
  billingAddress: z.object({
    line1: z
      .string({ required_error: "L'adresse de facturation est requise." })
      .trim()
      .min(5, "Adresse (ligne 1) requise.")
      .max(120, "120 caractères maximum."),
    line2: z
      .string()
      .trim()
      .max(120, "120 caractères maximum.")
      .optional()
      .transform((value) => (value && value.length > 0 ? value : undefined)),
    postalCode: z
      .string({ required_error: "Le code postal est requis." })
      .trim()
      .min(1, "Le code postal est requis.")
      .regex(/^\d{5}$/, "Code postal invalide (5 chiffres)."),
    city: z
      .string({ required_error: "La ville est requise." })
      .trim()
      .min(1, "La ville est requise.")
      .min(2, "Ville requise.")
      .max(80, "80 caractères maximum."),
    country: z
      .string({ required_error: "Le pays est requis." })
      .trim()
      .min(1, "Le pays est requis.")
      .min(2, "Pays requis.")
      .max(56, "56 caractères maximum."),
  }),
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;
export type RegistrationFormInput = z.input<typeof registrationSchema>;

export const registrationDefaultValues: RegistrationFormInput = {
  companyName: "",
  email: "",
  phone: "",
  siret: "",
  sector: "",
  billingAddress: {
    line1: "",
    line2: "",
    postalCode: "",
    city: "",
    country: "France",
  },
};

export type RegistrationSector = SectorValue;
