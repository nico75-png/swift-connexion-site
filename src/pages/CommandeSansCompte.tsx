import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarIcon,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  MapPin,
  MoveRight,
  Phone,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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

type ShippingFormula = "standard" | "express" | "flash";

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
  entreprise: string;
  email: string;
  phone: string;
  secteur: GuestSectorKey;
  type_colis: string;
  autre_type?: string | null;
  depart: string;
  arrivee: string;
  poids_kg: number;
  dims_cm: { L: number; l: number; H: number };
  planification: { now: boolean; date_iso?: string; time?: string };
  formule: ShippingFormula;
};

type GuestOrderSuccess = {
  reference: string;
  eta?: string | null;
};

const phoneRegex = /^(?:\+33|0)[1-9](?:[ .-]?\d{2}){4}$/;

const guestOrderSchema = z
  .object({
    company: z
      .string()
      .trim()
      .min(2, "Nom de l’entreprise requis")
      .max(120, "Nom de l’entreprise trop long"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Email invalide"),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, "Numéro de téléphone FR/E.164 invalide"),
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
      .min(5, "Adresse de départ requise"),
    dropoffAddress: z
      .string()
      .trim()
      .min(5, "Adresse d’arrivée requise"),
    weightKg: z.coerce
      .number({ invalid_type_error: "Indiquez un poids" })
      .min(0.1, "Poids minimum 0,1 kg"),
    lengthCm: z.coerce
      .number({ invalid_type_error: "Indiquez une longueur" })
      .min(1, "Longueur minimale 1 cm"),
    widthCm: z.coerce
      .number({ invalid_type_error: "Indiquez une largeur" })
      .min(1, "Largeur minimale 1 cm"),
    heightCm: z.coerce
      .number({ invalid_type_error: "Indiquez une hauteur" })
      .min(1, "Hauteur minimale 1 cm"),
    planificationMode: z.enum(["now", "schedule"]).default("now"),
    scheduledDate: z.date().optional(),
    scheduledTime: z.string().optional(),
    formula: z.enum(["standard", "express", "flash"]),
  })
  .superRefine((values, ctx) => {
    if (values.packageType === "autre" && !values.otherPackage?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otherPackage"],
        message: "Merci de préciser le type de colis",
      });
    }

    if (values.planificationMode === "schedule") {
      if (!values.scheduledDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduledDate"],
          message: "Sélectionnez une date",
        });
      }
      if (!values.scheduledTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduledTime"],
          message: "Sélectionnez une heure",
        });
      }
      if (values.scheduledDate) {
        const dateOnly = new Date(values.scheduledDate);
        dateOnly.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dateOnly < today) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["scheduledDate"],
            message: "Planifiez dans le futur",
          });
        }
      }
    }
  });

type GuestOrderFormValues = z.infer<typeof guestOrderSchema>;

const defaultValues: GuestOrderFormValues = {
  company: "",
  email: "",
  phone: "",
  sector: "sante-medical",
  packageType: "",
  otherPackage: "",
  pickupAddress: "",
  dropoffAddress: "",
  weightKg: 0.1,
  lengthCm: 10,
  widthCm: 10,
  heightCm: 10,
  planificationMode: "now",
  scheduledDate: undefined,
  scheduledTime: undefined,
  formula: "standard",
};

const steps = ["Informations", "Détails du transport", "Récapitulatif"] as const;

const shippingFormulas: Array<{ id: ShippingFormula; title: string; description: string; eta: string }> = [
  {
    id: "standard",
    title: "Standard",
    description: "Collecte sous 4h, livraison dans la journée",
    eta: "🏷️ Inclus dans l’estimation",
  },
  {
    id: "express",
    title: "Express",
    description: "Collecte en 90 minutes, livraison prioritaire",
    eta: "⚡ +20% sur la base",
  },
  {
    id: "flash",
    title: "Flash Express",
    description: "Collecte immédiate, chauffeur dédié",
    eta: "🚀 +35% sur la base",
  },
];

const sanitizeValue = (value: string) => value.replace(/[<>"'`]/g, "").trim();

const buildPayload = (values: GuestOrderFormValues): GuestOrderPayload => {
  const planification =
    values.planificationMode === "now"
      ? { now: true }
      : {
          now: false,
          date_iso: values.scheduledDate?.toISOString(),
          time: values.scheduledTime,
        };

  return {
    entreprise: sanitizeValue(values.company),
    email: sanitizeValue(values.email),
    phone: sanitizeValue(values.phone),
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
  const [currentStep, setCurrentStep] = useState(0);
  const [estimate, setEstimate] = useState<EstimateResponse | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [success, setSuccess] = useState<GuestOrderSuccess | null>(null);
  const [submittedPayload, setSubmittedPayload] = useState<GuestOrderPayload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GuestOrderFormValues>({
    resolver: zodResolver(guestOrderSchema),
    defaultValues,
    mode: "onBlur",
  });

  const watchedValues = useWatch({ control: form.control });

  const selectedSectorConfig = useMemo(
    () => getGuestSectorConfig(watchedValues.sector),
    [watchedValues.sector],
  );

  const packageOptions = useMemo(() => selectedSectorConfig?.packageTypes ?? [], [selectedSectorConfig]);

  const {
    company,
    email,
    phone,
    sector,
    packageType,
    otherPackage,
    pickupAddress,
    dropoffAddress,
    weightKg,
    lengthCm,
    widthCm,
    heightCm,
    planificationMode,
    scheduledDate,
    scheduledTime,
    formula,
  } = watchedValues;

  const volumetricWeight = useMemo(() => {
    const length = Number(lengthCm) || 0;
    const width = Number(widthCm) || 0;
    const height = Number(heightCm) || 0;
    if (!length || !width || !height) return 0;
    return Math.round(((length * width * height) / 5000) * 100) / 100;
  }, [heightCm, lengthCm, widthCm]);

  const readyForEstimate = useMemo(() => {
    const hasAddresses =
      sanitizeValue(pickupAddress ?? "").length >= 5 &&
      sanitizeValue(dropoffAddress ?? "").length >= 5;
    const hasSector = Boolean(sector);
    const hasPackage = Boolean(packageType);
    const hasOtherPackage = packageType !== "autre" || Boolean(sanitizeValue(otherPackage ?? ""));
    const weight = Number(weightKg);
    const length = Number(lengthCm);
    const width = Number(widthCm);
    const height = Number(heightCm);
    const hasDimensions = weight >= 0.1 && length > 0 && width > 0 && height > 0;
    const hasFormula = Boolean(formula);

    return hasAddresses && hasSector && hasPackage && hasOtherPackage && hasDimensions && hasFormula;
  }, [
    dropoffAddress,
    formula,
    heightCm,
    lengthCm,
    otherPackage,
    packageType,
    pickupAddress,
    sector,
    weightKg,
    widthCm,
  ]);

  useEffect(() => {
    if (!readyForEstimate) {
      setEstimate(null);
      return;
    }

    const controller = new AbortController();

    const payload = buildPayload({
      company,
      email,
      phone,
      sector,
      packageType,
      otherPackage,
      pickupAddress,
      dropoffAddress,
      weightKg,
      lengthCm,
      widthCm,
      heightCm,
      planificationMode,
      scheduledDate,
      scheduledTime,
      formula,
    });

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
          throw new Error("Impossible d’obtenir l’estimation");
        }

        const data = (await response.json()) as EstimateResponse;
        setEstimate(data);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setEstimateError("Le calcul d’estimation a échoué. Réessayez.");
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
    company,
    email,
    phone,
    sector,
    packageType,
    otherPackage,
    pickupAddress,
    dropoffAddress,
    weightKg,
    lengthCm,
    widthCm,
    heightCm,
    planificationMode,
    scheduledDate,
    scheduledTime,
    formula,
  ]);

  const focusFirstError = useCallback(() => {
    const firstErrorKey = Object.keys(form.formState.errors)[0] as keyof GuestOrderFormValues | undefined;
    if (firstErrorKey) {
      form.setFocus(firstErrorKey);
    }
  }, [form]);

  const handleStepValidation = useCallback(async () => {
    if (currentStep === 0) {
      const valid = await form.trigger(["company", "email", "phone"], { shouldFocus: true });
      if (!valid) focusFirstError();
      return valid;
    }

    if (currentStep === 1) {
      const fields: Array<keyof GuestOrderFormValues> = [
        "sector",
        "packageType",
        "pickupAddress",
        "dropoffAddress",
        "weightKg",
        "lengthCm",
        "widthCm",
        "heightCm",
        "formula",
      ];

      if (watchedValues.packageType === "autre") {
        fields.push("otherPackage");
      }
      if (watchedValues.planificationMode === "schedule") {
        fields.push("scheduledDate", "scheduledTime");
      }

      const valid = await form.trigger(fields, { shouldFocus: true });
      if (!valid) focusFirstError();
      return valid;
    }

    return true;
  }, [currentStep, focusFirstError, form, watchedValues.packageType, watchedValues.planificationMode]);

  const handleNext = useCallback(async () => {
    const isValid = await handleStepValidation();
    if (!isValid) {
      toast.error("Veuillez corriger les champs en surbrillance.");
      return;
    }
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }, [handleStepValidation]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }, []);

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
          throw new Error("La commande n’a pas pu être validée");
        }

        const data = (await response.json()) as Partial<GuestOrderSuccess> & { reference?: string };
        const reference = data.reference ?? generateLocalReference();
        setSubmittedPayload(payload);
        setSuccess({ reference, eta: data.eta ?? null });
        toast.success("Votre commande a été créée.");
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

  if (success && submittedPayload) {
    const sectorLabel = getGuestSectorConfig(submittedPayload.secteur)?.label ?? submittedPayload.secteur;
    const packageLabel = getPackageTypeLabel(submittedPayload.secteur, submittedPayload.type_colis);

    return (
      <Layout>
        <section className="bg-muted/40 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <Card className="border-none bg-background/80 shadow-xl">
                <CardHeader className="space-y-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-3xl font-semibold">Commande envoyée avec succès !</CardTitle>
                  <p className="text-muted-foreground">
                    Notre équipe finalise la planification. Vous recevrez une confirmation avec l’heure estimée d’arrivée.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-left">
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary">Référence</p>
                    <p className="text-2xl font-bold text-primary">{success.reference}</p>
                    {success.eta ? (
                      <p className="mt-2 text-sm text-primary/80">
                        Estimation d’arrivée communiquée : <span className="font-semibold">{success.eta}</span>
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-primary/80">Vous recevrez votre estimation d’arrivée par email.</p>
                    )}
                  </div>
                  <div className="grid gap-4 rounded-2xl border bg-muted/20 p-6 text-sm">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Entreprise</p>
                        <p className="font-medium">{submittedPayload.entreprise}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Trajet</p>
                        <p className="font-medium">{submittedPayload.depart}</p>
                        <p className="text-muted-foreground">→ {submittedPayload.arrivee}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Contact</p>
                        <p className="font-medium">{submittedPayload.email}</p>
                        <p className="text-muted-foreground">{submittedPayload.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Info className="h-5 w-5 text-primary" aria-hidden="true" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Détails</p>
                        <p className="font-medium">{sectorLabel}</p>
                        <p className="text-muted-foreground">{packageLabel}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6 text-sm text-primary">
                    <p className="font-semibold">Pour le suivi GPS en direct, créez un compte client.</p>
                    <p className="mt-1 text-primary/80">
                      Accédez à vos commandes, factures et notifications temps réel.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button variant="cta" size="lg" asChild>
                    <Link to="/inscription">Créer un compte</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/commande-sans-compte">Nouvelle commande</Link>
                  </Button>
                  <Button variant="ghost" size="lg" asChild>
                    <Link to="/">Accueil</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </Layout>
    );
  }
  return (
    <Layout>
      <section className="bg-muted/30 py-10">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 xl:grid-cols-12">
            <div className="order-2 xl:order-1 xl:col-span-8">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-indigo-700 p-8 text-primary-foreground shadow-xl">
                <div className="pointer-events-none absolute -top-16 -right-10 hidden h-64 w-64 rounded-full bg-primary/40 blur-3xl xl:block" />
                <div className="pointer-events-none absolute -bottom-10 -left-16 hidden h-72 w-72 rotate-6 bg-white/10 backdrop-blur xl:block" />
                <div className="relative z-10 grid gap-8">
                  <div className="flex flex-col gap-3">
                    <Badge variant="secondary" className="w-fit bg-white/10 text-white">
                      Commande instantanée
                    </Badge>
                    <h1 className="text-3xl font-semibold md:text-4xl">
                      Commandez sans compte, en quelques étapes.
                    </h1>
                    <p className="max-w-xl text-white/80">
                      Renseignez votre course et obtenez une estimation dynamique. Un expert vous recontacte immédiatement pour
                      déclencher l’enlèvement.
                    </p>
                  </div>
                  <div className="grid gap-4 rounded-3xl bg-white/10 p-6 backdrop-blur">
                    <div className="flex items-center justify-between text-sm text-white/80">
                      <span>Secteur</span>
                      <span className="font-semibold text-white">
                        {selectedSectorConfig?.label ?? "Sélectionnez un secteur"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-white/80">
                      <span>Type de colis</span>
                      <span className="font-semibold text-white">
                        {watchedValues.packageType
                          ? getPackageTypeLabel(watchedValues.sector, watchedValues.packageType)
                          : "À définir"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-white/80">
                      <span>Statut</span>
                      <span className="flex items-center gap-2 font-semibold text-white">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            estimateLoading ? "bg-amber-300 animate-ping" : "bg-emerald-300",
                          )}
                        />
                        {estimateLoading
                          ? "Préparation…"
                          : currentStep === steps.length - 1
                            ? "Prêt à valider"
                            : "Complétez le formulaire"}
                      </span>
                    </div>
                  </div>
                  {selectedSectorConfig ? (
                    <div className="grid gap-4 rounded-3xl bg-white/5 p-6 text-sm">
                      <p className="font-semibold uppercase tracking-wide text-white/70">
                        {selectedSectorConfig.description}
                      </p>
                      <p className="text-white/80">{selectedSectorConfig.highlight}</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSectorConfig.packageTypes.slice(0, 3).map((item) => (
                          <span key={item.value} className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70">
                            {item.label}
                          </span>
                        ))}
                        <span className="rounded-full border border-dashed border-white/20 px-3 py-1 text-xs text-white/60">
                          + options sur-mesure
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="absolute inset-y-12 right-8 hidden w-40 -skew-y-6 space-y-4 xl:block">
                  <div className="h-24 rounded-2xl bg-white/20 shadow-lg backdrop-blur transition-transform duration-500 hover:-translate-y-1" />
                  <div className="h-24 rounded-2xl bg-white/10 shadow-lg backdrop-blur transition-transform duration-500 hover:-translate-y-1" />
                  <div className="h-24 rounded-2xl bg-white/5 shadow-lg backdrop-blur transition-transform duration-500 hover:-translate-y-1" />
                </div>
              </div>
            </div>
            <div className="order-1 xl:order-2 xl:col-span-4">
              <div className="flex flex-col gap-6" aria-live="polite">
                <Form {...form}>
                  <form className="space-y-6" noValidate>
                    <div className="space-y-4 rounded-2xl border bg-background/90 p-6 shadow-lg">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Checkout invité</p>
                        <span className="text-sm text-muted-foreground">
                          Étape {currentStep + 1} / {steps.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        {steps.map((label, index) => {
                          const isActive = index === currentStep;
                          const isCompleted = index < currentStep;
                          return (
                            <div key={label} className="flex flex-1 items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition",
                                  isCompleted
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : isActive
                                      ? "border-primary bg-primary/10 text-primary"
                                      : "border-muted-foreground/30 text-muted-foreground",
                                )}
                                aria-current={isActive ? "step" : undefined}
                                aria-label={label}
                              >
                                {index + 1}
                              </div>
                              <div className="hidden flex-1 border-t border-dashed border-muted-foreground/30 lg:block" />
                            </div>
                          );
                        })}
                      </div>
                      <h2 className="text-xl font-semibold">{steps[currentStep]}</h2>
                      {currentStep === 0 ? (
                        <div className="grid gap-4">
                          <FormField
                            control={form.control}
                            name="company"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom de l’entreprise *</FormLabel>
                                <FormControl>
                                  <Input {...field} autoComplete="organization" placeholder="Ex : Swift Labs" />
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
                                <FormLabel>Email *</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    inputMode="email"
                                    autoComplete="email"
                                    placeholder="contact@exemple.fr"
                                  />
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
                                <FormLabel>Téléphone *</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    inputMode="tel"
                                    autoComplete="tel"
                                    placeholder="+33 1 23 45 67 89"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end pt-2">
                            <Button type="button" onClick={handleNext}>
                              Suivant
                              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </div>
                      ) : null}
                      {currentStep === 1 ? (
                        <div className="grid gap-4">
                          <FormField
                            control={form.control}
                            name="sector"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Secteur *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionnez un secteur" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
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
                                    <SelectTrigger>
                                      <SelectValue placeholder={packageOptions.length ? "Sélectionnez" : "Choisissez un secteur"} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
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
                          {watchedValues.packageType === "autre" ? (
                            <FormField
                              control={form.control}
                              name="otherPackage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Précision (50 caractères max)</FormLabel>
                                  <FormControl>
                                    <Input {...field} maxLength={50} placeholder="Ex : documents sensibles" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ) : null}
                          <FormField
                            control={form.control}
                            name="pickupAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Adresse de départ *</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    autoComplete="street-address"
                                    placeholder="123 Rue de Paris, 75001 Paris"
                                  />
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
                                <FormLabel>Adresse d’arrivée *</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    autoComplete="street-address"
                                    placeholder="45 Avenue Victor Hugo, 92100 Boulogne"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="weightKg"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Poids (kg) *</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.1"
                                      min={0.1}
                                      inputMode="decimal"
                                      placeholder="0.5"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid gap-4 sm:grid-cols-3">
                              <FormField
                                control={form.control}
                                name="lengthCm"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="flex items-center justify-between">
                                      <FormLabel>Longueur *</FormLabel>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            type="button"
                                            className="text-xs text-muted-foreground transition hover:text-foreground"
                                            aria-label="Poids volumétrique"
                                          >
                                            <Info className="h-3.5 w-3.5" aria-hidden="true" />
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[220px] text-xs">
                                          Poids volumétrique = (L × l × H) / 5000
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
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
                                    <FormLabel>Largeur *</FormLabel>
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
                                    <FormLabel>Hauteur *</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="number" min={1} inputMode="numeric" placeholder="15" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="planificationMode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Planification</FormLabel>
                                  <div className="rounded-xl border bg-muted/40 p-2">
                                    <RadioGroup
                                      onValueChange={field.onChange}
                                      value={field.value}
                                      className="grid gap-2 sm:grid-cols-2"
                                    >
                                      <Label
                                        htmlFor="plan-now"
                                        className={cn(
                                          "flex cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm shadow-sm transition",
                                          field.value === "now" ? "border-primary text-primary" : "border-transparent text-muted-foreground",
                                        )}
                                      >
                                        <RadioGroupItem value="now" id="plan-now" className="sr-only" />
                                        <Clock className="h-4 w-4" aria-hidden="true" />
                                        Maintenant
                                      </Label>
                                      <Label
                                        htmlFor="plan-later"
                                        className={cn(
                                          "flex cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm shadow-sm transition",
                                          field.value === "schedule" ? "border-primary text-primary" : "border-transparent text-muted-foreground",
                                        )}
                                      >
                                        <RadioGroupItem value="schedule" id="plan-later" className="sr-only" />
                                        <CalendarIcon className="h-4 w-4" aria-hidden="true" />
                                        Planifier
                                      </Label>
                                    </RadioGroup>
                                  </div>
                                </FormItem>
                              )}
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                              {watchedValues.planificationMode === "schedule" ? (
                                <>
                                  <FormField
                                    control={form.control}
                                    name="scheduledDate"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-col">
                                        <FormLabel>Date</FormLabel>
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <FormControl>
                                              <Button
                                                variant="outline"
                                                className={cn(
                                                  "justify-start text-left font-normal",
                                                  !field.value && "text-muted-foreground",
                                                )}
                                              >
                                                <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                                                {field.value ? format(field.value, "PPP", { locale: fr }) : "Choisir"}
                                              </Button>
                                            </FormControl>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                              mode="single"
                                              selected={field.value}
                                              onSelect={field.onChange}
                                              initialFocus
                                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                            />
                                          </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="scheduledTime"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Heure</FormLabel>
                                        <FormControl>
                                          <Input {...field} type="time" step={300} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </>
                              ) : (
                                <div className="col-span-2 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-4 text-sm text-muted-foreground">
                                  Collecte immédiate : un chauffeur est missionné dès validation.
                                </div>
                              )}
                            </div>
                          </div>
                          <FormField
                            control={form.control}
                            name="formula"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Choix de la formule *</FormLabel>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="grid gap-3"
                                >
                                  {shippingFormulas.map((formula) => {
                                    const isSelected = field.value === formula.id;
                                    return (
                                      <Label
                                        key={formula.id}
                                        htmlFor={`formula-${formula.id}`}
                                        className={cn(
                                          "flex cursor-pointer items-center justify-between rounded-2xl border bg-background px-4 py-3 transition",
                                          isSelected
                                            ? "border-primary shadow-lg"
                                            : "border-border hover:border-primary/50",
                                        )}
                                      >
                                        <RadioGroupItem id={`formula-${formula.id}`} className="sr-only" value={formula.id} />
                                        <div>
                                          <p className="font-semibold">{formula.title}</p>
                                          <p className="text-sm text-muted-foreground">{formula.description}</p>
                                        </div>
                                        <span className="text-sm text-primary">{formula.eta}</span>
                                      </Label>
                                    );
                                  })}
                                </RadioGroup>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex items-center justify-between pt-2">
                            <Button type="button" variant="ghost" onClick={handlePrevious}>
                              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                              Précédent
                            </Button>
                            <Button type="button" onClick={handleNext}>
                              Suivant
                              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </div>
                      ) : null}
                      {currentStep === 2 ? (
                        <div className="space-y-4">
                          <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 text-sm text-primary">
                            <p className="font-medium">Vérifiez vos informations.</p>
                            <p className="text-primary/80">
                              Le récapitulatif à droite se met à jour en temps réel. Vous pouvez revenir aux étapes précédentes si
                              besoin.
                            </p>
                          </div>
                          <div className="grid gap-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Entreprise</span>
                              <span className="font-semibold">{watchedValues.company || "—"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Contact</span>
                              <span className="font-semibold">{watchedValues.email || "—"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Secteur</span>
                              <span className="font-semibold">
                                {selectedSectorConfig?.label ?? "—"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Formule</span>
                              <span className="font-semibold">
                                {shippingFormulas.find((formula) => formula.id === watchedValues.formula)?.title ?? "—"}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-start">
                            <Button type="button" variant="ghost" onClick={handlePrevious}>
                              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                              Modifier les détails
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </form>
                </Form>

                <Card className="border-primary/30 bg-background/90 shadow-lg lg:sticky lg:top-6">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-xl font-semibold">Récapitulatif</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Distance calculée via Directions API et ajustements en fonction des options choisies.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Secteur</span>
                        <span className="font-medium">
                          {selectedSectorConfig?.label ?? "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Type de colis</span>
                        <span className="font-medium">
                          {watchedValues.packageType
                            ? getPackageTypeLabel(watchedValues.sector, watchedValues.packageType)
                            : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Poids volumétrique</span>
                        <span className="font-medium">{volumetricWeight ? `${volumetricWeight} kg` : "—"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Formule</span>
                        <span className="font-medium">
                          {shippingFormulas.find((formula) => formula.id === watchedValues.formula)?.title ?? "—"}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-dashed border-muted/40 p-4 text-sm">
                      {estimateLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-1/3" />
                        </div>
                      ) : estimate ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Distance estimée</span>
                            <span className="font-semibold">{estimate.distance_km.toFixed(1)} km</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Sous-total</span>
                            <span className="font-semibold">{estimate.subtotal.toFixed(2)} €</span>
                          </div>
                          {typeof estimate.extra_distance_km === "number" && typeof estimate.extra_distance_fee === "number" ? (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Km additionnels</span>
                              <span className="font-semibold">
                                {estimate.extra_distance_km.toFixed(1)} km · {estimate.extra_distance_fee.toFixed(2)} €
                              </span>
                            </div>
                          ) : null}
                          {estimate.surcharges?.length ? (
                            <div className="space-y-1">
                              {estimate.surcharges.map((surcharge) => (
                                <div key={surcharge.label} className="flex items-center justify-between text-muted-foreground">
                                  <span>{surcharge.label}</span>
                                  <span className="font-semibold text-foreground">{surcharge.amount.toFixed(2)} €</span>
                                </div>
                              ))}
                            </div>
                          ) : null}
                          {typeof estimate.vat === "number" ? (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">TVA</span>
                              <span className="font-semibold">{estimate.vat.toFixed(2)} €</span>
                            </div>
                          ) : null}
                          <div className="flex items-center justify-between text-base font-semibold">
                            <span>Total TTC</span>
                            <span>{estimate.total.toFixed(2)} €</span>
                          </div>
                        </div>
                      ) : estimateError ? (
                        <p className="text-sm text-destructive">{estimateError}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Complétez les informations de transport pour obtenir une estimation.
                        </p>
                      )}
                    </div>

                    <Badge variant="outline" className="w-full justify-start gap-2 border-primary/50 bg-primary/5 text-primary">
                      <Info className="h-4 w-4" aria-hidden="true" />
                      Sans compte : pas de suivi GPS live. Une estimation d’arrivée vous sera envoyée.
                    </Badge>
                  </CardContent>
                  <CardFooter className="hidden items-center justify-between gap-3 border-t border-muted/40 bg-muted/20 p-4 lg:flex">
                    <Button type="button" variant="ghost" onClick={handlePrevious} disabled={currentStep === 0}>
                      <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                      Précédent
                    </Button>
                    <Button
                      type="button"
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={currentStep !== steps.length - 1 || isSubmitting}
                      className="min-w-[180px]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                          Validation…
                        </>
                      ) : (
                        <>
                          Valider la commande
                          <MoveRight className="ml-2 h-4 w-4" aria-hidden="true" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {currentStep === steps.length - 1 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-muted/40 bg-background/95 px-4 py-3 shadow-lg lg:hidden">
          <div className="mx-auto flex w-full max-w-xl items-center gap-3">
            <Button type="button" variant="ghost" onClick={handlePrevious} className="shrink-0">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Précédent
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Validation…
                </>
              ) : (
                <>
                  Valider la commande
                  <MoveRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </div>
        </div>
      ) : null}
    </Layout>
  );
};

export default CommandeSansCompte;
