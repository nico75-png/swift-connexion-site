import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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

type ShippingFormula = "standard" | "express" | "eco";

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

const phoneRegex = /^(?:\+33|0)[1-9](?:[ .-]?\d{2}){4}$/;

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
      .max(120, "Nom de la société trop long")
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Email invalide"),
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
        return /^[0-9A-Za-z]{9,20}$/.test(sanitized);
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
      .min(5, "Adresse de départ requise"),
    dropoffAddress: z
      .string()
      .trim()
      .min(5, "Adresse d’arrivée requise"),
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
      .or(z.literal("")),
    deliveryTime: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),
    deliveryDate: z.date({ required_error: "Date de livraison requise" }),
    formula: z.enum(["standard", "express", "eco"]),
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

const shippingFormulas: Array<{ id: ShippingFormula; title: string; description: string }> = [
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

  const packageOptions = useMemo(
    () => selectedSectorConfig?.packageTypes ?? [],
    [selectedSectorConfig],
  );

  const selectedFormula = shippingFormulas.find((item) => item.id === watchedValues.formula);

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
        <section className="bg-[#f6f8fa] py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <Card className="rounded-3xl border-none bg-white/95 shadow-2xl">
                <CardHeader className="space-y-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-3xl font-semibold">Commande envoyée avec succès !</CardTitle>
                  <p className="text-base text-slate-600">
                    Nous finalisons la planification. Vous recevrez un message de confirmation avec l’heure estimée d’arrivée.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 rounded-3xl border border-emerald-100 bg-emerald-50/80 p-6 text-left">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Référence</p>
                      <p className="text-2xl font-bold text-emerald-600">{success.reference}</p>
                    </div>
                    {success.eta ? (
                      <p className="text-sm text-emerald-700">
                        Estimation d’arrivée communiquée : <span className="font-semibold">{success.eta}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-emerald-700">Vous recevrez votre estimation d’arrivée par email.</p>
                    )}
                  </div>
                  <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-wider text-slate-500">Contact</span>
                      <span className="font-semibold text-slate-800">{submittedPayload.contact_name}</span>
                      {submittedPayload.entreprise ? (
                        <span>{submittedPayload.entreprise}</span>
                      ) : null}
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
      : "100 €";

  const sectorLabel = selectedSectorConfig?.label ?? "—";
  const packageLabel = watchedValues.packageType
    ? getPackageTypeLabel(watchedValues.sector, watchedValues.packageType)
    : "—";
  const fullNameDisplay = watchedValues.fullName?.trim() || "—";
  const companyDisplay = watchedValues.company?.trim() || "—";
  const hasCompany = Boolean(watchedValues.company?.trim());
  const siretDisplay = watchedValues.siret?.trim() || "—";
  const pickupAddressDisplay = watchedValues.pickupAddress?.trim() || "—";
  const dropoffAddressDisplay = watchedValues.dropoffAddress?.trim() || "—";

  return (
    <Layout>
      <section className="bg-[#f6f8fa] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl space-y-12">
            <div className="text-center">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Commande sans compte</span>
              <h1 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">Commandez votre transport en toute simplicité</h1>
              <p className="mt-4 text-base text-slate-600 md:text-lg">Saisissez vos informations, visualisez immédiatement le récapitulatif et validez votre demande.</p>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
                  <div className="space-y-10">
                    <div className="rounded-3xl border border-white/40 bg-white p-8 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.3)]">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">🧍 Vos informations</p>
                        <h2 className="text-3xl font-semibold text-slate-900">Coordonnées de contact</h2>
                        <p className="text-sm text-slate-600">Remplissez vos informations pour une prise en charge rapide.</p>
                      </div>
                      <div className="mt-8 grid gap-6">
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
                                <FormLabel>Nom de la société (facultatif)</FormLabel>
                                <FormControl>
                                  <Input {...field} autoComplete="organization" placeholder="Swift Connexion" />
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
                                <FormLabel>Téléphone *</FormLabel>
                                <FormControl>
                                  <Input {...field} type="tel" autoComplete="tel" placeholder="06 12 34 56 78" />
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
                                  <Input {...field} inputMode="numeric" placeholder="123 456 789 00010" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/40 bg-white p-8 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.3)]">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">🚚 Détails du transport</p>
                        <h2 className="text-2xl font-semibold text-slate-900">Planifiez votre course</h2>
                        <p className="text-sm text-slate-600">Complétez les détails logistiques pour ajuster l’estimation en temps réel.</p>
                      </div>
                      <div className="mt-8 grid gap-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="sector"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Secteur *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="rounded-2xl border-slate-200 bg-white text-slate-700 shadow-sm">
                                      <SelectValue placeholder="Sélectionnez un secteur" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="rounded-2xl border border-slate-200 bg-white">
                                    {Object.entries(GUEST_SECTORS).map(([key, value]) => (
                                      <SelectItem key={key} value={key}>
                                        {value.label}
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
                                    <SelectTrigger className="rounded-2xl border-slate-200 bg-white text-slate-700 shadow-sm">
                                      <SelectValue placeholder="Sélectionnez un type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="rounded-2xl border border-slate-200 bg-white">
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
                        <FormField
                          control={form.control}
                          name="pickupAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adresse complète du lieu d’enlèvement *</FormLabel>
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
                              <FormLabel>Adresse complète du lieu de livraison *</FormLabel>
                              <FormControl>
                                <Input {...field} autoComplete="street-address" placeholder="45 Avenue Victor Hugo, 92100 Boulogne" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
                          <FormField
                            control={form.control}
                            name="weightKg"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Poids du colis (kg) *</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" step="0.1" min={0.1} inputMode="decimal" placeholder="0.5" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid gap-4 md:grid-cols-3">
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
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="pickupTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Heure d’enlèvement prévue</FormLabel>
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
                                <FormLabel>Heure de livraison prévue</FormLabel>
                                <FormControl>
                                  <Input {...field} type="time" placeholder="12:00" />
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
                              <FormLabel>Date souhaitée *</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "justify-start rounded-2xl border-slate-200 bg-white text-left font-normal text-slate-700",
                                        !field.value && "text-slate-400",
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                                      {field.value ? format(field.value, "PPP", { locale: fr }) : "Choisir une date"}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto rounded-2xl border border-slate-200 bg-white p-2" align="start">
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
                          name="formula"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Formule souhaitée *</FormLabel>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="grid gap-3 md:grid-cols-3"
                              >
                                {shippingFormulas.map((formulaOption) => (
                                  <Label
                                    key={formulaOption.id}
                                    htmlFor={`formula-${formulaOption.id}`}
                                    className={cn(
                                      "flex cursor-pointer flex-col gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm shadow-sm transition",
                                      field.value === formulaOption.id
                                        ? "border-yellow-400 bg-yellow-50 text-slate-900 shadow-md"
                                        : "hover:border-slate-300 hover:bg-white",
                                    )}
                                  >
                                    <RadioGroupItem
                                      value={formulaOption.id}
                                      id={`formula-${formulaOption.id}`}
                                      className="sr-only"
                                    />
                                    <span className="font-semibold">{formulaOption.title}</span>
                                    <span className="text-xs text-slate-500">{formulaOption.description}</span>
                                  </Label>
                                ))}
                              </RadioGroup>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <aside className="xl:sticky xl:top-24 xl:self-start">
                    <div className="w-full rounded-3xl border border-slate-200/80 bg-white/95 p-3.5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.45)] transition-all duration-300 xl:max-w-[420px] xl:min-w-[360px]">
                      <div className="space-y-0.5">
                        <h2 className="text-base font-semibold text-slate-900">✅ Récapitulatif instantané</h2>
                        <p className="text-xs text-slate-500">Visualisez vos informations avant validation.</p>
                      </div>
                      <div className="mt-3 space-y-2 text-sm text-slate-600">
                        <div className="space-y-1">
                          <div className="space-y-0.5">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Nom complet</p>
                            <p className="font-medium text-slate-900">{fullNameDisplay}</p>
                          </div>
                          {hasCompany ? (
                            <div className="space-y-0.5">
                              <p className="text-[11px] uppercase tracking-wide text-slate-500">Nom de la société</p>
                              <p className="font-medium text-slate-900">{companyDisplay}</p>
                            </div>
                          ) : null}
                          <div className="space-y-0.5">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Numéro de SIRET</p>
                            <p className="font-medium text-slate-900">{siretDisplay}</p>
                          </div>
                        </div>
                        <div className="h-px bg-slate-200" />
                        <div className="space-y-1">
                          <div className="space-y-0.5">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Lieu d’enlèvement</p>
                            <p className="font-medium text-slate-900">{pickupAddressDisplay}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Lieu de livraison</p>
                            <p className="font-medium text-slate-900">{dropoffAddressDisplay}</p>
                          </div>
                        </div>
                        <div className="h-px bg-slate-200" />
                        <div className="grid gap-1">
                          <div className="space-y-0.5">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Secteur choisi</p>
                            <p className="font-medium text-slate-900">{sectorLabel}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Type de colis</p>
                            <p className="font-medium text-slate-900">{packageLabel}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Poids du colis</p>
                            <p className="font-medium text-slate-900">{weightDisplay}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Dimensions</p>
                            <p className="font-medium text-slate-900">{dimensionsDisplay}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Formule souhaitée</p>
                            <p className="font-medium text-slate-900">{selectedFormula?.title ?? "—"}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Heure d’enlèvement prévue</p>
                            <p className="font-medium text-slate-900">{pickupTimeDisplay}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Heure de livraison prévue</p>
                            <p className="font-medium text-slate-900">{deliveryTimeDisplay}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Date souhaitée</p>
                            <p className="font-medium text-slate-900">{deliveryDateDisplay}</p>
                          </div>
                        </div>
                        <div className="space-y-1.5 rounded-3xl border border-emerald-200 bg-emerald-50/80 p-2.5 text-slate-700">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">TOTAL ESTIMÉ</p>
                          <p className="text-2xl font-bold text-emerald-700">{totalDisplay}</p>
                          <p className="text-xs">Estimation indicative selon vos informations. Le tarif final vous sera confirmé par nos équipes.</p>
                          {estimateError ? <p className="text-sm text-red-500">{estimateError}</p> : null}
                          {estimateLoading ? (
                            <div className="space-y-2">
                              <Skeleton className="h-3 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          ) : null}
                        </div>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full rounded-full bg-yellow-400 px-6 py-4 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-yellow-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                              Validation en cours…
                            </span>
                          ) : (
                            "Valider ma commande"
                          )}
                        </Button>
                        <p className="text-center text-[11px] text-slate-500">Pas de mot de passe, pas d’inscription : vous serez recontacté(e) dès validation de la demande.</p>
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
