import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  CheckCircle,
  CheckCircle2,
  Loader2,
  Package,
  Truck,
  type LucideIcon,
} from "lucide-react";

import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  GUEST_SECTORS,
  GuestSectorKey,
  getGuestSectorConfig,
  getPackageTypeLabel,
} from "@/lib/guestOrderConfig";
import { toast } from "sonner";

declare global {
  interface Window {
    grecaptcha?: {
      execute(siteKey: string, options: { action: string }): Promise<string>;
      ready(callback: () => void): void;
    };
  }
}

type ShippingFormula = "standard" | "express" | "eco" | "flash";
type ManualShippingFormula = Exclude<ShippingFormula, "flash">;

type StepId = 1 | 2 | 3;

type StepDefinition = {
  id: StepId;
  title: string;
  description: string;
  icon: LucideIcon;
};

type SummaryStepValue = "step1" | "step2" | "step3";

type StepCompletion = {
  completed: number;
  total: number;
};

type SummaryFieldProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  isEmpty?: boolean;
  className?: string;
  valueClassName?: string;
};

const SummaryField = ({
  label,
  value,
  hint,
  isEmpty = false,
  className,
  valueClassName,
}: SummaryFieldProps) => (
  <div className={cn("space-y-1", className)}>
    <dt className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
      {label}
    </dt>
    <dd
      className={cn(
        "text-sm font-medium text-foreground",
        isEmpty ? "text-muted-foreground/70" : undefined,
        valueClassName,
      )}
    >
      {value}
    </dd>
    {hint ? (
      <dd className="text-xs text-muted-foreground/80">{hint}</dd>
    ) : null}
  </div>
);

const SUMMARY_STEP_VALUES: Record<StepId, SummaryStepValue> = {
  1: "step1",
  2: "step2",
  3: "step3",
};

type EstimateSurcharge = {
  label: string;
  amount: number;
};

type EstimateResponse = {
  distance_km: number;
  subtotal: number;
  extra_distance_km?: number;
  extra_distance_fee?: number;
  surcharges?: EstimateSurcharge[];
  vat?: number;
  total: number;
};

type GuestOrderPayload = {
  contact_name: string;
  entreprise: string;
  email: string;
  phone: string;
  siret?: string | null;
  secteur: GuestSectorKey;
  type_colis: string;
  autre_type?: string | null;
  depart: string;
  arrivee: string;
  poids_kg: number;
  dims_cm: { L: number; l: number; H: number };
  planification: { now: boolean; date_iso?: string };
  formule: ShippingFormula;
};

type GuestOrderSuccess = {
  reference: string;
  eta?: string | null;
};

const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const siretRegex = /^\d{14}$/;

const guestOrderSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Nom complet requis")
      .max(120, "Nom complet trop long"),
    company: z
      .string()
      .trim()
      .max(200, "Nom de la société trop longue")
      .optional()
      .or(z.literal(""))
      .refine((value) => {
        if (!value) {
          return true;
        }
        return value.length >= 2;
      }, "Nom de la société trop court (2 caractères minimum)"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Email invalide")
      .max(255, "Email trop long"),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, "Numéro de téléphone invalide"),
    siret: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((value) => {
        if (!value) return true;
        const sanitized = value.replace(/\s+/g, "");
        return siretRegex.test(sanitized);
      }, "Numéro de SIRET invalide"),
    sector: z.custom<GuestSectorKey>(),
    packageType: z.string().min(1, "Type de colis requis"),
    otherPackage: z
      .string()
      .max(50, "50 caractères maximum")
      .optional()
      .or(z.literal("")),
    pickupAddress: z
      .string()
      .trim()
      .min(5, "Adresse de départ requise")
      .max(300, "Adresse trop longue"),
    dropoffAddress: z
      .string()
      .trim()
      .min(5, "Adresse d'arrivée requise")
      .max(300, "Adresse trop longue"),
    weightKg: z.coerce
      .number({ invalid_type_error: "Poids requis" })
      .min(0.1, "Poids minimum 0,1 kg"),
    lengthCm: z.coerce
      .number({ invalid_type_error: "Longueur requise" })
      .min(1, "Longueur minimum 1 cm"),
    widthCm: z.coerce
      .number({ invalid_type_error: "Largeur requise" })
      .min(1, "Largeur minimum 1 cm"),
    heightCm: z.coerce
      .number({ invalid_type_error: "Hauteur requise" })
      .min(1, "Hauteur minimum 1 cm"),
    pickupTime: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((value) => {
        if (!value) return true;
        return timeRegex.test(value);
      }, "Heure invalide (format HH:MM)"),
    deliveryTime: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((value) => {
        if (!value) return true;
        return timeRegex.test(value);
      }, "Heure invalide (format HH:MM)"),
    deliveryDate: z.date({ required_error: "Date de livraison requise" }),
    formula: z.enum(["standard", "express", "eco", "flash"]),
  })
  .superRefine((values, ctx) => {
    if (values.packageType === "autre" && !values.otherPackage?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otherPackage"],
        message: "Merci de préciser le type de colis",
      });
    }
  });

type GuestOrderFormValues = z.infer<typeof guestOrderSchema>;

const defaultValues: Partial<GuestOrderFormValues> = {
  fullName: "",
  company: "",
  email: "",
  phone: "",
  siret: "",
  sector: "sante-medical",
  packageType: "",
  otherPackage: "",
  pickupAddress: "",
  dropoffAddress: "",
  weightKg: 0.5,
  lengthCm: 30,
  widthCm: 20,
  heightCm: 15,
  pickupTime: "",
  deliveryTime: "",
  deliveryDate: undefined,
  formula: "standard",
};

const OPTIONAL_STEP_FIELDS: FieldPath<GuestOrderFormValues>[] = [
  "company",
  "siret",
  "pickupTime",
  "deliveryTime",
];

const shippingFormulas: Array<{ id: ShippingFormula; title: string; description: string }> = [
  {
    id: "flash",
    title: "Flash Express",
    description: "Livraison éclair en moins d'une heure",
  },
  {
    id: "standard",
    title: "Standard",
    description: "Collecte sous 4h, livraison dans la journée",
  },
  {
    id: "express",
    title: "Express",
    description: "Collecte prioritaire en moins de 90 minutes",
  },
  {
    id: "eco",
    title: "Éco",
    description: "Planification souple, tarif optimisé",
  },
];

const stepsConfig: StepDefinition[] = [
  {
    id: 1,
    title: "Informations entreprise",
    description: "Coordonnées de facturation et de contact.",
    icon: Package,
  },
  {
    id: 2,
    title: "Détails de livraison",
    description: "Logistique, colis et planification.",
    icon: Truck,
  },
  {
    id: 3,
    title: "Formule & confirmation",
    description: "Choisissez la formule puis validez.",
    icon: CheckCircle,
  },
];

const sanitizeValue = (value: string) => value.replace(/[<>"'`]/g, "").trim();

const buildPayload = (values: GuestOrderFormValues): GuestOrderPayload => {
  const entreprise = sanitizeValue(values.company || values.fullName);
  const contact_name = sanitizeValue(values.fullName);
  const planification = {
    now: false,
    date_iso: values.deliveryDate?.toISOString(),
  };

  return {
    contact_name,
    entreprise,
    email: sanitizeValue(values.email),
    phone: sanitizeValue(values.phone),
    siret: sanitizeValue(values.siret ?? "") || null,
    secteur: values.sector,
    type_colis: values.packageType,
    autre_type: values.packageType === "autre" ? sanitizeValue(values.otherPackage ?? "") : null,
    depart: sanitizeValue(values.pickupAddress),
    arrivee: sanitizeValue(values.dropoffAddress),
    poids_kg: Number(values.weightKg),
    dims_cm: {
      L: Number(values.lengthCm),
      l: Number(values.widthCm),
      H: Number(values.heightCm),
    },
    planification,
    formule: values.formula,
  };
};

const generateLocalReference = () => {
  const now = new Date();
  const date = format(now, "yyyyMMdd");
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `OC-GUEST-${date}-${random}`;
};

const CommandeSansCompte = () => {
  const [estimate, setEstimate] = useState<EstimateResponse | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [success, setSuccess] = useState<GuestOrderSuccess | null>(null);
  const [submittedPayload, setSubmittedPayload] = useState<GuestOrderPayload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [summaryOpenStep, setSummaryOpenStep] = useState<SummaryStepValue | "">(SUMMARY_STEP_VALUES[1]);

  const form = useForm<GuestOrderFormValues>({
    resolver: zodResolver(guestOrderSchema),
    defaultValues,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const stepFieldMap = useMemo<Record<StepId, FieldPath<GuestOrderFormValues>[]>>(
    () => ({
      1: ["fullName", "company", "siret", "email", "phone"],
      2: [
        "sector",
        "packageType",
        "otherPackage",
        "pickupAddress",
        "dropoffAddress",
        "weightKg",
        "lengthCm",
        "widthCm",
        "heightCm",
        "pickupTime",
        "deliveryTime",
        "deliveryDate",
      ],
      3: ["formula"],
    }),
    [],
  );

  const handleNextStep = useCallback(async () => {
    const fields = stepFieldMap[currentStep];
    const isValid = await form.trigger(fields, { shouldFocus: true });

    if (isValid) {
      setCurrentStep((previous) => (previous >= 3 ? previous : ((previous + 1) as StepId)));
    }
  }, [currentStep, form, stepFieldMap]);

  const handlePreviousStep = useCallback(() => {
    setCurrentStep((previous) => (previous <= 1 ? previous : ((previous - 1) as StepId)));
  }, []);

  const formWatchValues = useWatch({ control: form.control }) as Partial<GuestOrderFormValues> | undefined;

  const watchedValues = useMemo(
    () => ({ ...defaultValues, ...(formWatchValues ?? {}) }),
    [formWatchValues],
  );

  const stepCompletionMap = useMemo<Record<StepId, StepCompletion>>(() => {
    const result: Record<StepId, StepCompletion> = {
      1: { completed: 0, total: stepFieldMap[1].length },
      2: { completed: 0, total: stepFieldMap[2].length },
      3: { completed: 0, total: stepFieldMap[3].length },
    };
    const watchedRecord = watchedValues as Record<string, unknown>;

    (Object.keys(stepFieldMap) as unknown as StepId[]).forEach((stepId) => {
        const fields = stepFieldMap[stepId];
        let completed = 0;

        fields.forEach((field) => {
          if (field === "otherPackage" && watchedValues.packageType !== "autre") {
            completed += 1;
            return;
          }

          if (OPTIONAL_STEP_FIELDS.includes(field)) {
            completed += 1;
            return;
          }

          const rawValue = watchedRecord[field];

          if (rawValue instanceof Date) {
            completed += 1;
            return;
          }

          if (typeof rawValue === "number") {
            if (!Number.isNaN(rawValue) && rawValue > 0) {
              completed += 1;
            }
            return;
          }

          if (typeof rawValue === "string") {
            if (rawValue.trim().length > 0) {
              completed += 1;
            }
            return;
          }

          if (rawValue !== undefined && rawValue !== null) {
            completed += 1;
          }
      });

      result[stepId] = {
        completed,
        total: fields.length,
      };
    });

    return result;
  }, [stepFieldMap, watchedValues]);

  useEffect(() => {
    const nextValue = SUMMARY_STEP_VALUES[currentStep];
    setSummaryOpenStep((previous) => (previous === nextValue ? previous : nextValue));
  }, [currentStep]);

  const isStepCompleted = useCallback(
    (stepId: StepId) => {
      const completion = stepCompletionMap[stepId];
      return completion.completed >= completion.total && completion.total > 0;
    },
    [stepCompletionMap],
  );

  const completedSteps = useMemo(() => {
    return stepsConfig.reduce((count, step) => {
      if (step.id < currentStep) {
        return isStepCompleted(step.id) ? count + 1 : count;
      }

      if (step.id === currentStep && step.id === stepsConfig.length) {
        return isStepCompleted(step.id) ? count + 1 : count;
      }

      return count;
    }, 0);
  }, [currentStep, isStepCompleted]);

  const getSummaryValue = useCallback((value: string) => {
    const normalized = value?.toString().trim();
    if (!normalized || normalized === "—") {
      return { text: "À compléter", isEmpty: true } as const;
    }

    return { text: value, isEmpty: false } as const;
  }, []);

  const handleSummaryAccordionChange = useCallback((value: string) => {
    setSummaryOpenStep(value ? (value as SummaryStepValue) : "");
  }, []);

  const selectedSectorConfig = useMemo(
    () => getGuestSectorConfig(watchedValues.sector),
    [watchedValues.sector],
  );

  const packageOptions = useMemo(
    () => selectedSectorConfig?.packageTypes ?? [],
    [selectedSectorConfig],
  );

  const summarySectorLabel = selectedSectorConfig?.label ?? "—";
  const summarySectorDescription = selectedSectorConfig?.description ?? "";
  const summaryPackageLabel = useMemo(() => {
    if (selectedSectorConfig && watchedValues.packageType) {
      return getPackageTypeLabel(selectedSectorConfig.id, watchedValues.packageType);
    }
    return "—";
  }, [selectedSectorConfig, watchedValues.packageType]);

  const previousSectorRef = useRef<GuestSectorKey | null>(null);

  const selectedFormula = shippingFormulas.find((item) => item.id === watchedValues.formula);
  const manualFormulaRef = useRef<ManualShippingFormula>(
    (defaultValues.formula as ManualShippingFormula | undefined) ?? "standard",
  );

  const timeDifferenceMinutes = useMemo<number | null>(() => {
    const pickupTime = watchedValues.pickupTime?.trim();
    const deliveryTime = watchedValues.deliveryTime?.trim();
    
    if (!pickupTime || !deliveryTime) {
      return null;
    }

    const [pickupHour, pickupMinute] = pickupTime.split(":").map(Number);
    const [deliveryHour, deliveryMinute] = deliveryTime.split(":").map(Number);

    if (
      isNaN(pickupHour) || isNaN(pickupMinute) ||
      isNaN(deliveryHour) || isNaN(deliveryMinute)
    ) {
      return null;
    }

    const pickupTotalMinutes = pickupHour * 60 + pickupMinute;
    const deliveryTotalMinutes = deliveryHour * 60 + deliveryMinute;

    const diff = deliveryTotalMinutes - pickupTotalMinutes;
    return diff > 0 ? diff : null;
  }, [watchedValues.pickupTime, watchedValues.deliveryTime]);

  const enforcedFormula = useMemo<ShippingFormula | null>(() => {
    if (timeDifferenceMinutes === null) {
      return null;
    }
    if (timeDifferenceMinutes <= 60) {
      return "flash";
    }
    if (timeDifferenceMinutes <= 90) {
      return "express";
    }
    return null;
  }, [timeDifferenceMinutes]);

  useEffect(() => {
    const currentFormula = watchedValues.formula;

    if (enforcedFormula) {
    if (currentFormula && currentFormula !== enforcedFormula) {
      if (currentFormula !== "flash") {
        manualFormulaRef.current = currentFormula as ManualShippingFormula;
      }
    }

      if (currentFormula !== enforcedFormula) {
        form.setValue("formula", enforcedFormula, { shouldDirty: true, shouldValidate: true });
      }
      return;
    }

    if (currentFormula === "flash") {
      form.setValue("formula", manualFormulaRef.current, { shouldDirty: true, shouldValidate: true });
      return;
    }

    if (currentFormula) {
      manualFormulaRef.current = currentFormula as ManualShippingFormula;
    }
  }, [enforcedFormula, form, watchedValues.formula]);

  const isFormulaLocked = Boolean(enforcedFormula);
  const formulaLockMessage = useMemo(() => {
    if (enforcedFormula === "flash" && timeDifferenceMinutes !== null) {
      return `Formule Flash Express automatiquement appliquée (délai de ${timeDifferenceMinutes} min).`;
    }
    if (enforcedFormula === "express" && timeDifferenceMinutes !== null) {
      return `Formule Express automatiquement appliquée (délai de ${timeDifferenceMinutes} min).`;
    }
    return null;
  }, [enforcedFormula, timeDifferenceMinutes]);

  const formulasToDisplay = useMemo(() => {
    if (selectedFormula?.id === "flash") {
      return shippingFormulas;
    }
    return shippingFormulas.filter((formula) => formula.id !== "flash");
  }, [selectedFormula?.id]);

  const formulaBadge = useMemo(() => {
    switch (selectedFormula?.id) {
      case "flash":
        return {
          className: "bg-red-100 text-red-700",
          label: "⚡ Flash Express",
          detail: timeDifferenceMinutes !== null ? `(livraison sous ${timeDifferenceMinutes} min)` : null,
        };
      case "express":
        return {
          className: "bg-orange-100 text-orange-700",
          label: "🚀 Express",
          detail: timeDifferenceMinutes !== null && timeDifferenceMinutes <= 90 ? `(livraison sous ${timeDifferenceMinutes} min)` : null,
        };
      case "standard":
        return {
          className: "bg-emerald-100 text-emerald-700",
          label: "💼 Standard",
          detail: null,
        };
      case "eco":
        return {
          className: "bg-emerald-100 text-emerald-700",
          label: "🌱 Éco",
          detail: null,
        };
      default:
        return {
          className: "bg-slate-100 text-slate-500",
          label: "—",
          detail: null,
        };
    }
  }, [selectedFormula?.id, timeDifferenceMinutes]);

  const formulaSummaryText = useMemo(() => {
    if (!selectedFormula) {
      return "—";
    }
    if (selectedFormula.id === "flash" && timeDifferenceMinutes !== null) {
      return `Livraison en moins d'une heure (${timeDifferenceMinutes} min)`;
    }
    if (selectedFormula.id === "express" && timeDifferenceMinutes !== null && timeDifferenceMinutes <= 90) {
      return `Livraison en moins de 90 minutes (${timeDifferenceMinutes} min)`;
    }
    return selectedFormula.title;
  }, [selectedFormula, timeDifferenceMinutes]);

  const readyForEstimate = useMemo(() => {
    const hasAddresses =
      sanitizeValue(watchedValues.pickupAddress ?? "").length >= 5 &&
      sanitizeValue(watchedValues.dropoffAddress ?? "").length >= 5;
    const hasSector = Boolean(watchedValues.sector);
    const hasPackage = Boolean(watchedValues.packageType);
    const hasOtherPackage =
      watchedValues.packageType !== "autre" || Boolean(sanitizeValue(watchedValues.otherPackage ?? ""));
    const weight = Number(watchedValues.weightKg);
    const length = Number(watchedValues.lengthCm);
    const width = Number(watchedValues.widthCm);
    const height = Number(watchedValues.heightCm);
    const hasDimensions = weight >= 0.1 && length > 0 && width > 0 && height > 0;
    const hasDate = watchedValues.deliveryDate instanceof Date;

    return hasAddresses && hasSector && hasPackage && hasOtherPackage && hasDimensions && hasDate;
  }, [
    watchedValues.dropoffAddress,
    watchedValues.heightCm,
    watchedValues.lengthCm,
    watchedValues.otherPackage,
    watchedValues.packageType,
    watchedValues.pickupAddress,
    watchedValues.sector,
    watchedValues.weightKg,
    watchedValues.widthCm,
    watchedValues.deliveryDate,
  ]);

  useEffect(() => {
    if (!readyForEstimate) {
      setEstimate(null);
      return;
    }

    const controller = new AbortController();

    const payload = buildPayload(form.getValues());

    const fetchEstimate = async () => {
      try {
        setEstimateLoading(true);
        setEstimateError(null);
        const response = await fetch("/api/estimate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Impossible d'obtenir l'estimation");
        }

        const data = (await response.json()) as EstimateResponse;
        setEstimate(data);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setEstimateError("Le calcul d'estimation a échoué. Réessayez.");
        setEstimate(null);
      } finally {
        setEstimateLoading(false);
      }
    };

    const debounce = setTimeout(fetchEstimate, 350);

    return () => {
      controller.abort();
      clearTimeout(debounce);
    };
  }, [
    readyForEstimate,
    form,
    watchedValues.fullName,
    watchedValues.company,
    watchedValues.email,
    watchedValues.phone,
    watchedValues.siret,
    watchedValues.sector,
    watchedValues.packageType,
    watchedValues.otherPackage,
    watchedValues.pickupAddress,
    watchedValues.dropoffAddress,
    watchedValues.weightKg,
    watchedValues.lengthCm,
    watchedValues.widthCm,
    watchedValues.heightCm,
    watchedValues.deliveryDate,
    watchedValues.formula,
  ]);

  const executeRecaptcha = useCallback(async () => {
    try {
      if (typeof window === "undefined" || !window.grecaptcha) {
        return undefined;
      }
      const siteKey = document.querySelector<HTMLMetaElement>("meta[name='recaptcha-site-key']")?.content;
      if (!siteKey) {
        return undefined;
      }
      await new Promise<void>((resolve) => window.grecaptcha?.ready(() => resolve()));
      const token = await window.grecaptcha.execute(siteKey, { action: "guest_order" });
      return token;
    } catch (error) {
      console.warn("reCAPTCHA indisponible", error);
      return undefined;
    }
  }, []);

  const onSubmit = useCallback(
    async (values: GuestOrderFormValues) => {
      try {
        setIsSubmitting(true);
        const payload = buildPayload(values);
        const recaptchaToken = await executeRecaptcha();

        const response = await fetch("/api/order/guest", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(recaptchaToken ? { "X-Recaptcha": recaptchaToken } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("La commande n'a pas pu être validée");
        }

        const data = (await response.json()) as Partial<GuestOrderSuccess> & { reference?: string };
        const reference = data.reference ?? generateLocalReference();
        setSubmittedPayload(payload);
        setSuccess({ reference, eta: data.eta ?? null });
        toast.success("Commande confirmée !", {
          description: "Vous recevrez un e-mail de confirmation sous peu.",
        });
      } catch (error) {
        console.error(error);
        toast.error("Impossible de valider la commande pour le moment.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [executeRecaptcha],
  );

  useEffect(() => {
    if (success) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [success]);

  useEffect(() => {
    const currentSector = watchedValues.sector;
    if (!currentSector) return;

    if (previousSectorRef.current && previousSectorRef.current !== currentSector) {
      form.resetField("packageType", { defaultValue: "" });
      form.resetField("otherPackage", { defaultValue: "" });
      form.clearErrors(["packageType", "otherPackage"]);
    }

    previousSectorRef.current = currentSector;
  }, [form, watchedValues.sector]);

  if (success && submittedPayload) {
    const sectorLabel = getGuestSectorConfig(submittedPayload.secteur)?.label ?? submittedPayload.secteur;
    const packageLabel = getPackageTypeLabel(submittedPayload.secteur, submittedPayload.type_colis);

    return (
      <Layout>
        <section className="relative overflow-hidden bg-slate-950">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%)]" />
          <div className="relative">
            <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
              <Card className="rounded-2xl border border-white/10 bg-white/95 text-slate-900 shadow-xl shadow-slate-900/20 backdrop-blur">
                <CardHeader className="space-y-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
                    <span className="sr-only">Commande validée</span>
                  </div>
                  <CardTitle className="text-3xl font-semibold text-slate-900">Commande envoyée avec succès !</CardTitle>
                  <p className="text-base text-slate-600">
                    Nous finalisons la planification. Vous recevrez un message de confirmation avec l'heure estimée d'arrivée.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-left">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Référence</p>
                      <p className="text-2xl font-bold text-emerald-700">{success.reference}</p>
                    </div>
                    {success.eta ? (
                      <p className="text-sm text-emerald-700">
                        Estimation d'arrivée communiquée : <span className="font-semibold">{success.eta}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-emerald-700">Vous recevrez votre estimation d'arrivée par email.</p>
                    )}
                  </div>
                  <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-wider text-slate-500">Contact</span>
                      <span className="font-semibold text-slate-800">{submittedPayload.contact_name}</span>
                      {submittedPayload.entreprise ? <span>{submittedPayload.entreprise}</span> : null}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-wider text-slate-500">Trajet</span>
                      <span className="font-semibold text-slate-800">{submittedPayload.depart}</span>
                      <span>{submittedPayload.arrivee}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-wider text-slate-500">Détails</span>
                      <span className="font-semibold text-slate-800">{sectorLabel}</span>
                      <span>{packageLabel}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const weightDisplay = watchedValues.weightKg ? `${Number(watchedValues.weightKg || 0).toFixed(1)} kg` : "—";
  const dimensionsDisplay =
    Number(watchedValues.lengthCm) && Number(watchedValues.widthCm) && Number(watchedValues.heightCm)
      ? `${Number(watchedValues.lengthCm)} × ${Number(watchedValues.widthCm)} × ${Number(watchedValues.heightCm)} cm`
      : "—";
  const deliveryDateDisplay = watchedValues.deliveryDate
    ? format(watchedValues.deliveryDate, "PPP", { locale: fr })
    : "—";
  const pickupTimeDisplay = watchedValues.pickupTime?.trim() ? watchedValues.pickupTime : "—";
  const deliveryTimeDisplay = watchedValues.deliveryTime?.trim() ? watchedValues.deliveryTime : "—";
  const totalDisplay = estimate
    ? `${estimate.total.toFixed(2)} €`
    : estimateLoading
      ? "Calcul en cours…"
      : "—";
  const sectorLabel = summarySectorLabel;
  const sectorDescription = summarySectorDescription;
  const packageLabel = summaryPackageLabel;
  const fullNameDisplay = watchedValues.fullName?.trim() || "—";
  const companyDisplay = watchedValues.company?.trim() || "—";
  const siretDisplay = watchedValues.siret?.trim() || "—";
  const pickupAddressDisplay = watchedValues.pickupAddress?.trim() || "—";
  const dropoffAddressDisplay = watchedValues.dropoffAddress?.trim() || "—";
  const emailDisplay = watchedValues.email?.trim() || "—";
  const phoneDisplay = watchedValues.phone?.trim() || "—";
  const currentStepDefinition =
    stepsConfig.find((step) => step.id === currentStep) ?? stepsConfig[0];
  const progressPercentage = Math.min(
    100,
    Math.max(0, (currentStep / stepsConfig.length) * 100),
  );
  const otherPackageDisplay =
    watchedValues.packageType === "autre"
      ? watchedValues.otherPackage?.trim() || "—"
      : null;
  const packageSummaryDisplay =
    otherPackageDisplay && otherPackageDisplay !== "—"
      ? (packageLabel !== "—" ? `${packageLabel} · ${otherPackageDisplay}` : otherPackageDisplay)
      : packageLabel;

  const fullNameSummary = getSummaryValue(fullNameDisplay);
  const companySummary = getSummaryValue(companyDisplay);
  const siretSummary = getSummaryValue(siretDisplay);
  const emailSummary = getSummaryValue(emailDisplay);
  const phoneSummary = getSummaryValue(phoneDisplay);
  const pickupAddressSummary = getSummaryValue(pickupAddressDisplay);
  const dropoffAddressSummary = getSummaryValue(dropoffAddressDisplay);
  const sectorSummary = getSummaryValue(sectorLabel);
  const packageSummary = getSummaryValue(packageSummaryDisplay);
  const weightSummary = getSummaryValue(weightDisplay);
  const dimensionsSummary = getSummaryValue(dimensionsDisplay);
  const pickupTimeSummary = getSummaryValue(pickupTimeDisplay);
  const deliveryTimeSummary = getSummaryValue(deliveryTimeDisplay);
  const deliveryDateSummary = getSummaryValue(deliveryDateDisplay);
  const formulaSummary = getSummaryValue(formulaSummaryText);
  const totalAmountSummary = getSummaryValue(totalDisplay);
  const totalDisplayValue = totalAmountSummary.isEmpty ? totalAmountSummary.text : totalDisplay;

  const getStepBadgeLabel = (stepId: StepId): string => {
    if (stepId === currentStep) {
      return "En cours";
    }

    if (isStepCompleted(stepId)) {
      return "Terminé";
    }

    return "À compléter";
  };

  const getStepBadgeClasses = (stepId: StepId): string => {
    if (stepId === currentStep) {
      return "bg-blue-100 text-blue-700";
    }

    if (isStepCompleted(stepId)) {
      return "bg-emerald-100 text-emerald-700";
    }

    return "bg-slate-100 text-slate-500";
  };

  return (
    <Layout>
      <section className="relative overflow-hidden bg-slate-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_transparent_60%)]" />
        <div className="relative">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center text-slate-100 animate-slide-up">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-200/90">
                Commande sans compte
              </span>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Commandez votre transport en toute fluidité
              </h1>
              <p className="mt-4 text-sm text-slate-200 md:text-base">
                Saisissez vos informations, visualisez le récapitulatif et validez votre demande en trois étapes.
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                noValidate
                className="mt-12"
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    currentStep < stepsConfig.length
                  ) {
                    event.preventDefault();
                    void handleNextStep();
                  }
                }}
              >
                <div className="grid gap-8 md:grid-cols-3">
                  <div className="space-y-6 md:col-span-2">
                    <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-white shadow-[0_40px_120px_-60px_rgba(59,130,246,0.65)] backdrop-blur">
                      <ol className="grid gap-4 md:grid-cols-3 md:gap-6">
                        {stepsConfig.map((step) => {
                          const Icon = step.icon;
                          const isActive = currentStep === step.id;
                          return (
                            <li key={step.id} className="space-y-2">
                              <div
                                className={cn(
                                  "flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 transition-smooth",
                                  isActive ? "border-white/30 bg-white/20" : "opacity-80 hover:opacity-100",
                                )}
                              >
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white">
                                  <Icon className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <div className="flex-1 space-y-1">
                                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                                    Étape {step.id}
                                  </p>
                                  <p className="text-sm font-semibold text-white">{step.title}</p>
                                  <p className="text-xs text-white/70">{step.description}</p>
                                </div>
                              </div>
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold transition-smooth",
                                  getStepBadgeClasses(step.id),
                                )}
                              >
                                {getStepBadgeLabel(step.id)}
                              </span>
                            </li>
                          );
                        })}
                      </ol>
                      <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-400 transition-all duration-500 ease-out"
                          style={{ width: `${progressPercentage}%` }}
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="animate-slide-up"
                      >
                        <Card className="rounded-3xl border border-slate-200/80 bg-white/95 text-slate-900 shadow-xl shadow-slate-900/15">
                          <CardHeader className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600">
                              {`Étape ${currentStep}`}
                            </p>
                            <CardTitle className="text-2xl font-semibold text-slate-900 md:text-3xl">
                              {currentStepDefinition.title}
                            </CardTitle>
                            <p className="text-sm text-slate-600">{currentStepDefinition.description}</p>
                          </CardHeader>
                          <CardContent className="mt-4 space-y-6">
                            {currentStep === 1 ? (
                              <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                  control={form.control}
                                  name="fullName"
                                  render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                      <FormLabel>Nom complet *</FormLabel>
                                      <FormControl>
                                        <Input {...field} autoComplete="name" placeholder="Jean Dupont" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="company"
                                  render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                      <FormLabel>Nom de la société</FormLabel>
                                      <FormControl>
                                        <Input {...field} autoComplete="organization" placeholder="One Connexion" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="siret"
                                  render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                      <FormLabel>Numéro de SIRET</FormLabel>
                                      <FormControl>
                                        <Input {...field} inputMode="numeric" placeholder="12345678900010" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="email"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Adresse e-mail *</FormLabel>
                                      <FormControl>
                                        <Input {...field} type="email" autoComplete="email" placeholder="vous@exemple.com" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="phone"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Numéro de téléphone *</FormLabel>
                                      <FormControl>
                                        <Input {...field} type="tel" autoComplete="tel" placeholder="06 12 34 56 78" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            ) : null}

                            {currentStep === 2 ? (
                              <div className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <FormField
                                    control={form.control}
                                    name="sector"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Secteur *</FormLabel>
                                        <Select
                                          onValueChange={(value) => {
                                            field.onChange(value as GuestSectorKey);
                                          }}
                                          value={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger className="rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500">
                                              <SelectValue placeholder="Sélectionnez un secteur" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent className="rounded-xl border border-slate-200 bg-white shadow-lg">
                                            {GUEST_SECTORS.map((sector) => (
                                              <SelectItem key={sector.id} value={sector.id}>
                                                {sector.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="packageType"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Type de colis *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!packageOptions.length}>
                                          <FormControl>
                                            <SelectTrigger className="rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500">
                                              <SelectValue placeholder="Sélectionnez un type" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent className="rounded-xl border border-slate-200 bg-white shadow-lg">
                                            {packageOptions.map((option) => (
                                              <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                {watchedValues.packageType === "autre" ? (
                                  <FormField
                                    control={form.control}
                                    name="otherPackage"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Précision sur le colis *</FormLabel>
                                        <FormControl>
                                          <Input {...field} placeholder="Décrivez le contenu" />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                ) : null}
                                <div className="grid gap-4">
                                  <FormField
                                    control={form.control}
                                    name="pickupAddress"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Adresse d'enlèvement *</FormLabel>
                                        <FormControl>
                                          <Input {...field} autoComplete="street-address" placeholder="123 Rue de Paris, 75001 Paris" />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="dropoffAddress"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Adresse de livraison *</FormLabel>
                                        <FormControl>
                                          <Input {...field} autoComplete="street-address" placeholder="45 Avenue Victor Hugo, 92100 Boulogne" />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <div className="grid gap-4 md:grid-cols-4">
                                  <FormField
                                    control={form.control}
                                    name="weightKg"
                                    render={({ field }) => (
                                      <FormItem className="md:col-span-1">
                                        <FormLabel>Poids (kg) *</FormLabel>
                                        <FormControl>
                                          <Input {...field} type="number" step="0.1" min={0.1} inputMode="decimal" placeholder="0.5" />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="lengthCm"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Longueur (cm) *</FormLabel>
                                        <FormControl>
                                          <Input {...field} type="number" min={1} inputMode="numeric" placeholder="30" />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="widthCm"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Largeur (cm) *</FormLabel>
                                        <FormControl>
                                          <Input {...field} type="number" min={1} inputMode="numeric" placeholder="20" />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="heightCm"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Hauteur (cm) *</FormLabel>
                                        <FormControl>
                                          <Input {...field} type="number" min={1} inputMode="numeric" placeholder="15" />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <FormField
                                    control={form.control}
                                    name="pickupTime"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Heure d'enlèvement</FormLabel>
                                        <FormControl>
                                          <Input {...field} type="time" placeholder="08:30" />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="deliveryTime"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Heure de livraison</FormLabel>
                                        <FormControl>
                                          <Input {...field} type="time" placeholder="10:15" />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <FormField
                                  control={form.control}
                                  name="deliveryDate"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                      <FormLabel>Date de livraison *</FormLabel>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <FormControl>
                                            <Button
                                              variant="outline"
                                              className={cn(
                                                "w-full justify-between rounded-xl border border-slate-200 bg-white text-left font-normal text-slate-900 shadow-sm transition-smooth hover:bg-white",
                                                !field.value && "text-slate-500",
                                              )}
                                            >
                                              {field.value ? format(field.value, "PPP", { locale: fr }) : "Choisir une date"}
                                              <CalendarIcon className="h-4 w-4 opacity-70" />
                                            </Button>
                                          </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto rounded-xl border border-slate-200 bg-white p-0 shadow-lg">
                                          <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(date) => field.onChange(date)}
                                            disabled={(date) => date < new Date()}
                                            initialFocus
                                          />
                                        </PopoverContent>
                                      </Popover>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            ) : null}

                            {currentStep === 3 ? (
                              <div className="space-y-6">
                                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 text-sm text-slate-600">
                                  Vérifiez votre récapitulatif à droite avant de confirmer votre commande. Vous pouvez revenir aux étapes précédentes à tout moment.
                                </div>
                                <FormField
                                  control={form.control}
                                  name="formula"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Formule souhaitée *</FormLabel>
                                      <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="grid gap-3 md:grid-cols-3"
                                      >
                                        {formulasToDisplay.map((formulaOption) => {
                                          const isOptionLocked =
                                            isFormulaLocked && enforcedFormula && formulaOption.id !== enforcedFormula;

                                          return (
                                            <Label
                                              key={formulaOption.id}
                                              htmlFor={`formula-${formulaOption.id}`}
                                              className={cn(
                                                "group flex cursor-pointer flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm transition-smooth focus-within:ring-2 focus-within:ring-blue-500",
                                                field.value === formulaOption.id
                                                  ? "border-blue-500 bg-blue-50 text-slate-900 shadow-md"
                                                  : "hover:border-blue-200 hover:bg-blue-50/40",
                                                isOptionLocked && "cursor-not-allowed opacity-60 hover:border-slate-200 hover:bg-white",
                                              )}
                                            >
                                              <RadioGroupItem
                                                value={formulaOption.id}
                                                id={`formula-${formulaOption.id}`}
                                                className="sr-only"
                                                disabled={isOptionLocked}
                                              />
                                              <span className="text-sm font-semibold">{formulaOption.title}</span>
                                              <span className="text-xs text-slate-500">{formulaOption.description}</span>
                                            </Label>
                                          );
                                        })}
                                      </RadioGroup>
                                      {formulaLockMessage ? (
                                        <p className="mt-2 text-xs font-medium text-slate-600">{formulaLockMessage}</p>
                                      ) : (
                                        <p className="mt-2 text-xs text-slate-500">
                                          Choisissez la formule adaptée à votre délai et à votre budget.
                                        </p>
                                      )}
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 text-sm text-slate-600">
                                  Une fois confirmée, notre équipe finalise la planification et vous envoie un e-mail récapitulatif.
                                </div>
                              </div>
                            ) : null}
                          </CardContent>
                        </Card>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          {currentStep > 1 ? (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={handlePreviousStep}
                              className="w-full justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-700 transition-smooth hover:bg-white sm:w-auto"
                            >
                              Précédent
                            </Button>
                          ) : (
                            <span className="hidden sm:block" />
                          )}

                          {currentStep < stepsConfig.length ? (
                            <Button
                              type="button"
                              onClick={() => void handleNextStep()}
                              className="w-full justify-center rounded-xl bg-slate-900 text-white transition-smooth hover:bg-slate-800 sm:w-auto"
                            >
                              Suivant
                            </Button>
                          ) : (
                            <Button
                              type="submit"
                              variant="ghost"
                              disabled={isSubmitting}
                              className={cn(
                                "w-full justify-center rounded-xl bg-gradient-to-r from-secondary to-accent text-white transition-smooth hover:shadow-glow hover:scale-105 hover:from-secondary/95 hover:to-accent/95 focus-visible:ring-secondary/50 sm:w-auto",
                                "disabled:cursor-not-allowed disabled:opacity-70",
                              )}
                            >
                              {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                                  Envoi en cours…
                                </span>
                              ) : (
                                "Confirmer la commande"
                              )}
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <aside className="md:col-span-1">
                    <div className="mt-12 md:mt-0">
                      <div className="md:sticky md:top-6 md:max-h-[80vh] md:overflow-y-auto scrollbar-thin scrollbar-thumb-muted/40">
                        <Card className="animate-slide-up rounded-3xl border border-white/15 bg-white/95 p-0 text-slate-900 shadow-2xl shadow-slate-900/20 backdrop-blur">
                          <div className="space-y-4 p-4 sm:p-5">
                            <div className="space-y-1">
                              <h2 className="text-base font-semibold text-slate-900">Récapitulatif en direct</h2>
                              <p className="text-xs text-muted-foreground">
                                Les informations se mettent à jour automatiquement.
                              </p>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                              <span className="text-sm text-muted-foreground">Progression</span>
                              <span className="text-sm font-medium text-foreground">
                                {completedSteps}/{stepsConfig.length} étapes complétées
                              </span>
                            </div>
                            <Accordion
                              type="single"
                              collapsible
                              value={summaryOpenStep}
                              onValueChange={handleSummaryAccordionChange}
                              className="space-y-3"
                            >
                              <AccordionItem
                                value={SUMMARY_STEP_VALUES[1]}
                                className="group relative overflow-hidden rounded-2xl border border-b-0 border-slate-200/80 bg-white/80 px-0 shadow-sm shadow-slate-900/5 transition-all duration-200 data-[state=open]:border-slate-200 data-[state=open]:shadow-md data-[state=open]:bg-gradient-to-br data-[state=open]:from-primary/5 data-[state=open]:via-secondary/5 data-[state=open]:to-transparent"
                              >
                                <span
                                  className={cn(
                                    "absolute inset-y-0 left-0 w-1 rounded-r-full bg-slate-200/70 transition-colors duration-200",
                                    currentStep === 1
                                      ? "bg-primary"
                                      : isStepCompleted(1)
                                        ? "bg-emerald-500/80"
                                        : "bg-slate-200/70",
                                  )}
                                  aria-hidden="true"
                                />
                                <AccordionTrigger className="items-start px-3 py-3 text-left text-sm font-medium hover:no-underline">
                                  <div className="flex w-full items-start gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                                      <Package className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                    <div className="flex flex-1 flex-col gap-0.5 text-left">
                                      <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                                        Étape 1
                                      </span>
                                      <span className="text-sm font-semibold text-foreground">
                                        Informations entreprise
                                      </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      <span className="text-[11px] font-medium text-muted-foreground">
                                        {stepCompletionMap[1].completed} champs complétés / {stepCompletionMap[1].total}
                                      </span>
                                      <span
                                        className={cn(
                                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                                          getStepBadgeClasses(1),
                                        )}
                                      >
                                        {getStepBadgeLabel(1)}
                                      </span>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-3 pb-3 pt-0 text-sm text-slate-600">
                                  <dl className="grid gap-3 sm:grid-cols-2">
                                    <SummaryField
                                      label="Nom complet"
                                      value={fullNameSummary.text}
                                      isEmpty={fullNameSummary.isEmpty}
                                      className="sm:col-span-2"
                                    />
                                    <SummaryField
                                      label="Nom de la société"
                                      value={companySummary.text}
                                      isEmpty={companySummary.isEmpty}
                                      className="sm:col-span-2"
                                    />
                                    <SummaryField
                                      label="Numéro de SIRET"
                                      value={siretSummary.text}
                                      isEmpty={siretSummary.isEmpty}
                                      className="sm:col-span-2"
                                    />
                                    <SummaryField
                                      label="Adresse e-mail"
                                      value={emailSummary.text}
                                      isEmpty={emailSummary.isEmpty}
                                      valueClassName="break-words"
                                    />
                                    <SummaryField
                                      label="Téléphone"
                                      value={phoneSummary.text}
                                      isEmpty={phoneSummary.isEmpty}
                                      valueClassName="break-words"
                                    />
                                  </dl>
                                </AccordionContent>
                              </AccordionItem>

                              <AccordionItem
                                value={SUMMARY_STEP_VALUES[2]}
                                className="group relative overflow-hidden rounded-2xl border border-b-0 border-slate-200/80 bg-white/80 px-0 shadow-sm shadow-slate-900/5 transition-all duration-200 data-[state=open]:border-slate-200 data-[state=open]:shadow-md data-[state=open]:bg-gradient-to-br data-[state=open]:from-primary/5 data-[state=open]:via-secondary/5 data-[state=open]:to-transparent"
                              >
                                <span
                                  className={cn(
                                    "absolute inset-y-0 left-0 w-1 rounded-r-full bg-slate-200/70 transition-colors duration-200",
                                    currentStep === 2
                                      ? "bg-primary"
                                      : isStepCompleted(2)
                                        ? "bg-emerald-500/80"
                                        : "bg-slate-200/70",
                                  )}
                                  aria-hidden="true"
                                />
                                <AccordionTrigger className="items-start px-3 py-3 text-left text-sm font-medium hover:no-underline">
                                  <div className="flex w-full items-start gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                                      <Truck className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                    <div className="flex flex-1 flex-col gap-0.5 text-left">
                                      <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                                        Étape 2
                                      </span>
                                      <span className="text-sm font-semibold text-foreground">
                                        Détails de livraison
                                      </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      <span className="text-[11px] font-medium text-muted-foreground">
                                        {stepCompletionMap[2].completed} champs complétés / {stepCompletionMap[2].total}
                                      </span>
                                      <span
                                        className={cn(
                                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                                          getStepBadgeClasses(2),
                                        )}
                                      >
                                        {getStepBadgeLabel(2)}
                                      </span>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-3 pb-3 pt-0 text-sm text-slate-600">
                                  <dl className="grid gap-3 sm:grid-cols-2">
                                    <SummaryField
                                      label="Adresse d'enlèvement"
                                      value={pickupAddressSummary.text}
                                      isEmpty={pickupAddressSummary.isEmpty}
                                      className="sm:col-span-2"
                                    />
                                    <SummaryField
                                      label="Adresse de livraison"
                                      value={dropoffAddressSummary.text}
                                      isEmpty={dropoffAddressSummary.isEmpty}
                                      className="sm:col-span-2"
                                    />
                                    <SummaryField
                                      label="Secteur"
                                      value={sectorSummary.text}
                                      isEmpty={sectorSummary.isEmpty}
                                      hint={!sectorSummary.isEmpty && sectorDescription ? sectorDescription : undefined}
                                      className="sm:col-span-2"
                                    />
                                    <SummaryField
                                      label="Type de colis"
                                      value={packageSummary.text}
                                      isEmpty={packageSummary.isEmpty}
                                      className="sm:col-span-2"
                                    />
                                    <SummaryField
                                      label="Poids"
                                      value={weightSummary.text}
                                      isEmpty={weightSummary.isEmpty}
                                    />
                                    <SummaryField
                                      label="Dimensions"
                                      value={dimensionsSummary.text}
                                      isEmpty={dimensionsSummary.isEmpty}
                                    />
                                    <SummaryField
                                      label="Heure d'enlèvement"
                                      value={pickupTimeSummary.text}
                                      isEmpty={pickupTimeSummary.isEmpty}
                                    />
                                    <SummaryField
                                      label="Heure de livraison"
                                      value={deliveryTimeSummary.text}
                                      isEmpty={deliveryTimeSummary.isEmpty}
                                    />
                                    <SummaryField
                                      label="Date souhaitée"
                                      value={deliveryDateSummary.text}
                                      isEmpty={deliveryDateSummary.isEmpty}
                                      className="sm:col-span-2"
                                    />
                                  </dl>
                                </AccordionContent>
                              </AccordionItem>

                              <AccordionItem
                                value={SUMMARY_STEP_VALUES[3]}
                                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 px-0 shadow-sm shadow-slate-900/5 transition-all duration-200 data-[state=open]:border-slate-200 data-[state=open]:shadow-md data-[state=open]:bg-gradient-to-br data-[state=open]:from-primary/5 data-[state=open]:via-secondary/5 data-[state=open]:to-transparent"
                              >
                                <span
                                  className={cn(
                                    "absolute inset-y-0 left-0 w-1 rounded-r-full bg-slate-200/70 transition-colors duration-200",
                                    currentStep === 3
                                      ? "bg-primary"
                                      : isStepCompleted(3)
                                        ? "bg-emerald-500/80"
                                        : "bg-slate-200/70",
                                  )}
                                  aria-hidden="true"
                                />
                                <AccordionTrigger className="items-start px-3 py-3 text-left text-sm font-medium hover:no-underline">
                                  <div className="flex w-full items-start gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                                      <CheckCircle className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                    <div className="flex flex-1 flex-col gap-0.5 text-left">
                                      <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                                        Étape 3
                                      </span>
                                      <span className="text-sm font-semibold text-foreground">
                                        Formule & confirmation
                                      </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      <span className="text-[11px] font-medium text-muted-foreground">
                                        {stepCompletionMap[3].completed} champs complétés / {stepCompletionMap[3].total}
                                      </span>
                                      <span
                                        className={cn(
                                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                                          getStepBadgeClasses(3),
                                        )}
                                      >
                                        {getStepBadgeLabel(3)}
                                      </span>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-3 pb-3 pt-0 text-sm text-slate-600">
                                  <div className="space-y-3">
                                    <SummaryField
                                      label="Formule sélectionnée"
                                      value={selectedFormula ? (
                                        <div
                                          className={cn(
                                            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                                            formulaBadge.className,
                                          )}
                                        >
                                          <span>{formulaBadge.label}</span>
                                          {formulaBadge.detail ? (
                                            <span className="text-[11px] font-medium text-current/80">{formulaBadge.detail}</span>
                                          ) : null}
                                        </div>
                                      ) : (
                                        formulaSummary.text
                                      )}
                                      isEmpty={!selectedFormula}
                                      hint={!formulaSummary.isEmpty ? formulaSummary.text : undefined}
                                    />
                                    <div className="rounded-2xl border border-dashed border-muted/40 p-3">
                                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                                        Total estimé
                                      </p>
                                      <p
                                        className={cn(
                                          "mt-1 text-lg font-semibold text-foreground",
                                          totalAmountSummary.isEmpty ? "text-muted-foreground/70" : undefined,
                                        )}
                                      >
                                        {totalDisplayValue}
                                      </p>
                                      {estimateLoading ? (
                                        <div className="mt-2 space-y-2">
                                          <Skeleton className="h-3 w-3/4" />
                                          <Skeleton className="h-3 w-1/2" />
                                        </div>
                                      ) : null}
                                      {estimateError ? (
                                        <p className="mt-2 text-xs text-red-500">{estimateError}</p>
                                      ) : (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                          Estimation indicative selon vos informations. Le tarif final sera confirmé par nos équipes.
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </aside>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CommandeSansCompte;
