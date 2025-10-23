import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Layout from "@/components/layout/Layout";
import PageMetadata from "@/components/seo/PageMetadata";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, HelpCircle, Loader2, MapPin } from "lucide-react";

const META_TITLE = "Commander une course – Sans compte";
const META_DESCRIPTION =
  "Réservez une course en Île-de-France sans créer de compte. Estimation instantanée et confirmation par email en quelques minutes.";

const sectorEnum = z.enum(
  [
    "sante",
    "juridique",
    "evenementiel_media",
    "retail_luxe_ecommerce",
    "industrie_services",
    "optique",
  ] as const,
);

const formulaEnum = z.enum(["standard", "express", "flash"] as const);

type SectorValue = z.infer<typeof sectorEnum>;
type FormulaValue = z.infer<typeof formulaEnum>;

const SECTOR_OPTIONS: { value: SectorValue; label: string }[] = [
  { value: "sante", label: "Santé" },
  { value: "juridique", label: "Juridique" },
  { value: "evenementiel_media", label: "Événementiel & Média" },
  { value: "retail_luxe_ecommerce", label: "Retail / Luxe / E-commerce" },
  { value: "industrie_services", label: "Industrie & Services de proximité" },
  { value: "optique", label: "Optique" },
];

const PACKAGE_OPTIONS_BY_SECTOR: Record<SectorValue, string[]> = {
  sante: [
    "Échantillons biologiques (PSL, analyses, prélèvements)",
    "Médicaments, ordonnances et traitements",
    "Dispositifs médicaux",
    "Chaîne du froid (vaccins, poches de sang, perfusions, insuline)",
    "Dossiers médicaux confidentiels",
    "Petits équipements hospitaliers",
    "Urgences techniques (pièces détachées respirateurs, brancards)",
  ],
  juridique: [
    "Dossiers juridiques et confidentiels",
    "Contrats à signer",
    "Scellés et pièces de justice",
    "Supports numériques (clé USB, disque)",
    "Clés et badges d’accès",
  ],
  evenementiel_media: [
    "Matériel audiovisuel",
    "Kits d’accueil / badges / PLV",
    "Décors et éléments scéniques",
    "Produits presse / lancement",
    "Urgences techniques plateau",
  ],
  retail_luxe_ecommerce: [
    "Produits boutique",
    "Échantillons et pièces de collection",
    "Retours e-commerce",
    "Accessoires / vitrines",
    "Colis premium sécurisés",
  ],
  industrie_services: [
    "Pièces détachées",
    "Outils",
    "Matériel IT / maintenance corporate",
    "Clés / badges (serrurier)",
    "Chaussures / accessoires (cordonnier)",
  ],
  optique: [
    "Lunettes et montures",
    "Équipements d’optométrie",
    "Lentilles et consommables",
    "Dossiers patients",
    "Vitrines et présentoirs",
  ],
};

const FORMULA_OPTIONS: { value: FormulaValue; title: string; description: string; eta: string }[] = [
  { value: "standard", title: "Standard", description: "Retrait dans la journée, livraison < 4 h.", eta: "Aujourd’hui" },
  { value: "express", title: "Express", description: "Coursier dédié, départ sous 90 min.", eta: "Sous 2 h" },
  { value: "flash", title: "Flash Express", description: "Départ immédiat, suivi prioritaire.", eta: "Sous 60 min" },
];

const IDF_POSTAL_CODE = /(75|77|78|91|92|93|94|95)\d{3}/;

const isIdfAddress = (value: string) => IDF_POSTAL_CODE.test(value);

const formSchema = z
  .object({
    fullName: z.string().min(2, "Indiquez votre nom complet."),
    companyName: z.string().min(2, "Indiquez le nom de votre entreprise."),
    email: z.string().email("Adresse email invalide."),
    siret: z
      .string()
      .min(1, "Le numéro de SIRET est obligatoire.")
      .refine((value) => /^\d{14}$/.test(value.replace(/\s+/g, "")), {
        message: "Le SIRET doit contenir 14 chiffres.",
      }),
    sector: sectorEnum,
    packageType: z.string().min(1, "Sélectionnez un type de colis."),
    customPackage: z.string().max(50, "50 caractères maximum.").optional(),
    departureAddress: z.string().min(5, "Adresse de départ obligatoire."),
    arrivalAddress: z.string().min(5, "Adresse d’arrivée obligatoire."),
    weight: z.coerce.number().gt(0, "Le poids doit être supérieur à 0."),
    length: z.coerce.number().gt(0, "Longueur obligatoire."),
    width: z.coerce.number().gt(0, "Largeur obligatoire."),
    height: z.coerce.number().gt(0, "Hauteur obligatoire."),
    nowToggle: z.boolean(),
    scheduledDate: z.string().optional(),
    scheduledTime: z.string().optional(),
    formula: formulaEnum,
    instructions: z.string().max(120, "120 caractères maximum.").optional(),
    remiseCode: z.boolean(),
    consent: z.literal(true, {
      errorMap: () => ({ message: "Veuillez accepter les conditions et la politique de confidentialité." }),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.packageType === "autre" && !data.customPackage?.trim()) {
      ctx.addIssue({
        path: ["customPackage"],
        code: z.ZodIssueCode.custom,
        message: "Précisez votre type de colis.",
      });
    }

    const sectorPackages = PACKAGE_OPTIONS_BY_SECTOR[data.sector];
    if (data.packageType !== "autre" && !sectorPackages.includes(data.packageType)) {
      ctx.addIssue({
        path: ["packageType"],
        code: z.ZodIssueCode.custom,
        message: "Ce type de colis n’est pas disponible pour ce secteur.",
      });
    }

    if (!isIdfAddress(data.departureAddress)) {
      ctx.addIssue({
        path: ["departureAddress"],
        code: z.ZodIssueCode.custom,
        message: "Adresse hors Île-de-France (veuillez préciser le code postal).",
      });
    }

    if (!isIdfAddress(data.arrivalAddress)) {
      ctx.addIssue({
        path: ["arrivalAddress"],
        code: z.ZodIssueCode.custom,
        message: "Adresse hors Île-de-France (veuillez préciser le code postal).",
      });
    }

    if (!data.nowToggle) {
      if (!data.scheduledDate) {
        ctx.addIssue({
          path: ["scheduledDate"],
          code: z.ZodIssueCode.custom,
          message: "Sélectionnez une date de retrait.",
        });
      }
      if (!data.scheduledTime) {
        ctx.addIssue({
          path: ["scheduledTime"],
          code: z.ZodIssueCode.custom,
          message: "Sélectionnez une heure de retrait.",
        });
      }
    }
  });

type GuestOrderFormValues = z.infer<typeof formSchema>;

interface EstimationState {
  distanceKm: number | null;
  subtotal: number | null;
  kmSurcharge: number | null;
  supplements: number | null;
  vat: number | null;
  totalTtc: number | null;
}

interface GuestOrderSuccess {
  reference: string;
  eta?: string;
  submittedAt: string;
  summary: {
    totalTtc: number | null;
    distanceKm: number | null;
    formula: FormulaValue;
  };
  formValues: GuestOrderFormValues;
}

const computeFallbackEstimate = (
  distanceKm: number | null,
  chargeableWeight: number,
  formula: FormulaValue,
): EstimationState => {
  const formulaMultiplier: Record<FormulaValue, number> = {
    standard: 1,
    express: 1.2,
    flash: 1.45,
  };

  const supplementsByFormula: Record<FormulaValue, number> = {
    standard: 0,
    express: 6,
    flash: 12,
  };

  const effectiveDistance = distanceKm ?? Math.max(8, chargeableWeight * 1.5);
  const baseFare = 22;
  const kmSurcharge = Math.max(effectiveDistance - 5, 0) * 1.8;
  const weightSurcharge = Math.max(chargeableWeight - 3, 0) * 2.5;
  const subtotal = (baseFare + kmSurcharge + weightSurcharge) * formulaMultiplier[formula];
  const supplements = supplementsByFormula[formula];
  const vat = (subtotal + supplements) * 0.2;
  const totalTtc = subtotal + supplements + vat;

  return {
    distanceKm: Number(effectiveDistance.toFixed(1)),
    subtotal: Number(subtotal.toFixed(2)),
    kmSurcharge: Number(kmSurcharge.toFixed(2)),
    supplements: Number(supplements.toFixed(2)),
    vat: Number(vat.toFixed(2)),
    totalTtc: Number(totalTtc.toFixed(2)),
  };
};

const formatCurrency = (value: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  return value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
};

const formatDistance = (value: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "En attente";
  }

  return `${value.toFixed(1)} km`;
};

const createGuestReference = () => {
  const now = new Date();
  const ymd = format(now, "yyyyMMdd");
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `OC-GUEST-${ymd}-${random}`;
};

const defaultValues: GuestOrderFormValues = {
  fullName: "",
  companyName: "",
  email: "",
  siret: "",
  sector: "sante",
  packageType: "",
  customPackage: "",
  departureAddress: "",
  arrivalAddress: "",
  weight: 1,
  length: 10,
  width: 10,
  height: 10,
  nowToggle: true,
  scheduledDate: "",
  scheduledTime: "",
  formula: "standard",
  instructions: "",
  remiseCode: true,
  consent: false,
};

const CommandeSansCompte = () => {
  const [estimation, setEstimation] = useState<EstimationState | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimationError, setEstimationError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<GuestOrderSuccess | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GuestOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = form;

  const sector = watch("sector");
  const packageType = watch("packageType");
  const customPackage = watch("customPackage");
  const departureAddress = watch("departureAddress");
  const arrivalAddress = watch("arrivalAddress");
  const nowToggle = watch("nowToggle");
  const scheduledDate = watch("scheduledDate");
  const scheduledTime = watch("scheduledTime");
  const formula = watch("formula");
  const weight = watch("weight");
  const length = watch("length");
  const width = watch("width");
  const height = watch("height");
  const instructionsValue = watch("instructions") ?? "";

  const filteredPackageOptions = useMemo(() => PACKAGE_OPTIONS_BY_SECTOR[sector], [sector]);

  useEffect(() => {
    setValue("packageType", "");
    setValue("customPackage", "");
  }, [sector, setValue]);

  const volumetricWeight = useMemo(() => {
    if (!length || !width || !height) {
      return null;
    }

    const value = (length * width * height) / 5000;
    if (!Number.isFinite(value)) {
      return null;
    }

    return Number(value.toFixed(2));
  }, [height, length, width]);

  useEffect(() => {
    if (successData) {
      return;
    }

    const effectivePackage = packageType === "autre" ? customPackage?.trim() : packageType;
    const readyForEstimate =
      sector &&
      effectivePackage &&
      departureAddress &&
      arrivalAddress &&
      weight > 0 &&
      length > 0 &&
      width > 0 &&
      height > 0 &&
      (nowToggle || (scheduledDate && scheduledTime));

    if (!readyForEstimate) {
      setEstimation(null);
      setEstimationError(null);
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const chargeableWeight = Math.max(weight, volumetricWeight ?? 0);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsEstimating(true);
      setEstimationError(null);

      try {
        const scheduledAt = !nowToggle && scheduledDate && scheduledTime
          ? new Date(`${scheduledDate}T${scheduledTime}`)
          : null;

        const response = await fetch("/api/estimate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            secteur: sector,
            type_colis: effectivePackage,
            depart: departureAddress,
            arrivee: arrivalAddress,
            poids_kg: weight,
            dims_cm: { L: length, l: width, H: height },
            formule: formula,
            date_iso: scheduledAt?.toISOString() ?? null,
            now_toggle: nowToggle,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Estimation indisponible");
        }

        const data = await response.json();

        setEstimation({
          distanceKm: typeof data?.distance_km === "number" ? Number(data.distance_km.toFixed(1)) : null,
          subtotal: typeof data?.subtotal === "number" ? Number(data.subtotal.toFixed(2)) : null,
          kmSurcharge: typeof data?.km_supp === "number" ? Number(data.km_supp.toFixed(2)) : null,
          supplements: typeof data?.supplements === "number" ? Number(data.supplements.toFixed(2)) : null,
          vat: typeof data?.tva === "number" ? Number(data.tva.toFixed(2)) : null,
          totalTtc: typeof data?.total_ttc === "number" ? Number(data.total_ttc.toFixed(2)) : null,
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setEstimationError("Estimation indisponible. Nous utilisons une approximation provisoire.");
        setEstimation(computeFallbackEstimate(estimation?.distanceKm ?? null, chargeableWeight, formula));
      } finally {
        setIsEstimating(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    arrivalAddress,
    customPackage,
    estimation?.distanceKm,
    formula,
    height,
    length,
    nowToggle,
    packageType,
    scheduledDate,
    scheduledTime,
    sector,
    successData,
    volumetricWeight,
    weight,
    width,
    departureAddress,
  ]);

  const onSubmit = useCallback(
    async (values: GuestOrderFormValues) => {
      setIsSubmitting(true);
      try {
        const effectivePackage = values.packageType === "autre" ? values.customPackage?.trim() : values.packageType;
        const scheduledAt = !values.nowToggle && values.scheduledDate && values.scheduledTime
          ? new Date(`${values.scheduledDate}T${values.scheduledTime}`)
          : null;

        const response = await fetch("/api/order/guest", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nom_complet: values.fullName,
            entreprise: values.companyName,
            email: values.email,
            siret: values.siret.replace(/\s+/g, ""),
            secteur: values.sector,
            type_colis: effectivePackage,
            depart: values.departureAddress,
            arrivee: values.arrivalAddress,
            poids_kg: values.weight,
            dims_cm: { L: values.length, l: values.width, H: values.height },
            formule: values.formula,
            instructions: values.instructions,
            remise_controle: values.remiseCode,
            consentement: values.consent,
            date_iso: scheduledAt?.toISOString() ?? null,
            now_toggle: values.nowToggle,
          }),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || "Impossible d’enregistrer la commande.");
        }

        const payload = await response.json().catch(() => null);
        const reference = payload?.reference ?? createGuestReference();

        toast.success("Commande envoyée. Référence transmise par email.");

        setSuccessData({
          reference,
          eta: payload?.eta ?? payload?.estimated_eta,
          submittedAt: new Date().toISOString(),
          summary: {
            totalTtc: payload?.total_ttc ?? estimation?.totalTtc ?? null,
            distanceKm: payload?.distance_km ?? estimation?.distanceKm ?? null,
            formula: values.formula,
          },
          formValues: values,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Impossible d’enregistrer la commande.";
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [estimation?.distanceKm, estimation?.totalTtc],
  );

  const handleNewOrder = () => {
    setSuccessData(null);
    setEstimation(null);
    setEstimationError(null);
    reset(defaultValues);
  };

  if (successData) {
    const submittedDate = format(new Date(successData.submittedAt), "d MMMM yyyy 'à' HH'h'mm", { locale: fr });
    const distanceLabel = formatDistance(successData.summary.distanceKm);
    const totalLabel = formatCurrency(successData.summary.totalTtc);

    return (
      <Layout>
        <PageMetadata title={META_TITLE} description={META_DESCRIPTION} canonicalPath="/commande-sans-compte" />
        <section className="bg-muted/20 py-16">
          <div className="container mx-auto px-4">
            <Card className="mx-auto max-w-3xl border-none shadow-large">
              <CardHeader className="items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
                  <CheckCircle2 className="h-10 w-10 text-success" aria-hidden="true" />
                </div>
                <CardTitle>Merci ! Votre commande est en attente</CardTitle>
                <CardDescription>
                  Référence <span className="font-semibold text-foreground">{successData.reference}</span> — envoyée par email.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
                  Suivi GPS réservé aux comptes clients. Pensez à créer votre espace pour accéder au tracking temps réel.
                </div>
                <div className="grid gap-4 rounded-xl bg-muted/60 p-6 text-left md:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Date</p>
                    <p className="text-sm font-medium text-foreground">{submittedDate}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Distance estimée</p>
                    <p className="text-sm font-medium text-foreground">{distanceLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Total TTC estimé</p>
                    <p className="text-sm font-medium text-foreground">{totalLabel}</p>
                  </div>
                </div>
                {successData.eta && (
                  <div className="flex items-start gap-3 rounded-lg border border-info/30 bg-info/10 p-4 text-sm text-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 text-info" aria-hidden="true" />
                    <p>ETA communiqué : {successData.eta}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3 md:flex-row md:justify-between">
                <div className="flex flex-1 flex-col gap-3 md:flex-row">
                  <Button variant="default" size="lg" className="flex-1" asChild>
                    <Link to="/inscription">Créer un compte</Link>
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1" onClick={handleNewOrder}>
                    Nouvelle commande
                  </Button>
                </div>
                <Button variant="ghost" size="lg" asChild className="w-full md:w-auto">
                  <Link to="/">Accueil</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageMetadata title={META_TITLE} description={META_DESCRIPTION} canonicalPath="/commande-sans-compte" />
      <TooltipProvider>
        <section className="bg-muted/20 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <Badge className="mb-3 bg-primary/10 text-primary">Sans compte</Badge>
              <h1 className="text-3xl font-semibold text-foreground md:text-4xl">Commander une course</h1>
              <p className="mt-3 max-w-2xl text-base text-muted-foreground">
                Complétez ce formulaire invité pour obtenir une estimation immédiate et déclencher l’intervention de nos coursiers
                en Île-de-France. Confirmation par email et SMS en quelques minutes.
              </p>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
              <div className="space-y-6">
                <Form {...form}>
                  <form id="guest-order-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Card className="border-none shadow-soft">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl">Informations client</CardTitle>
                        <CardDescription>Ces informations nous permettent de vous identifier et de confirmer la course.</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom complet*</FormLabel>
                              <FormControl>
                                <Input placeholder="Prénom Nom" autoComplete="name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom de l’entreprise*</FormLabel>
                              <FormControl>
                                <Input placeholder="Votre société" autoComplete="organization" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email professionnel*</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="vous@entreprise.fr" autoComplete="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="siret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>N° de SIRET*</FormLabel>
                              <FormControl>
                                <Input
                                  inputMode="numeric"
                                  maxLength={14}
                                  placeholder="12345678901234"
                                  {...field}
                                  onChange={(event) => field.onChange(event.target.value.replace(/\D+/g, ""))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="sector"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Secteur d’activité*</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Sélectionnez votre secteur" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {SECTOR_OPTIONS.map((option) => (
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
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-soft">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl">Votre colis</CardTitle>
                        <CardDescription>Précisez le contenu et les dimensions pour un transport adapté.</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4">
                        <FormField
                          control={control}
                          name="packageType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type de colis*</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Choisissez un type de colis" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {filteredPackageOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="autre">Autre (50 caractères max)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {packageType === "autre" && (
                          <FormField
                            control={control}
                            name="customPackage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Précision (50 caractères max)*</FormLabel>
                                <FormControl>
                                  <Input placeholder="Description courte" maxLength={50} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={control}
                            name="departureAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Adresse de départ*</FormLabel>
                                <FormControl>
                                  <Input placeholder="Adresse complète (IDF)" autoComplete="street-address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name="arrivalAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Adresse d’arrivée*</FormLabel>
                                <FormControl>
                                  <Input placeholder="Adresse complète (IDF)" autoComplete="street-address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={control}
                            name="weight"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Poids (kg)*</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.1" min="0" placeholder="Ex. 8" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid gap-4 md:grid-cols-3">
                            <FormField
                              control={control}
                              name="length"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>L (cm)*</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="1" min="0" placeholder="Longueur" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={control}
                              name="width"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>l (cm)*</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="1" min="0" placeholder="Largeur" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={control}
                              name="height"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>H (cm)*</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="1" min="0" placeholder="Hauteur" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/40 p-3 text-sm text-muted-foreground">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-primary" aria-hidden="true" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs text-xs">
                              Poids volumétrique = (L × l × H) / 5000. Le poids facturé correspond au plus élevé entre le poids réel et le poids volumétrique.
                            </TooltipContent>
                          </Tooltip>
                          <p>
                            Poids volumétrique estimé :
                            <span className="ml-1 font-semibold text-foreground">
                              {volumetricWeight ? `${volumetricWeight.toFixed(2)} kg` : "—"}
                            </span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-soft">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl">Logistique</CardTitle>
                        <CardDescription>Planifiez la prise en charge et ajoutez vos instructions.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <FormField
                          control={control}
                          name="nowToggle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quand souhaitez-vous la course ?*</FormLabel>
                              <FormDescription>Choisissez entre un départ immédiat ou une planification.</FormDescription>
                              <FormControl>
                                <RadioGroup
                                  className="mt-3 grid gap-3 md:grid-cols-2"
                                  value={field.value ? "now" : "scheduled"}
                                  onValueChange={(value) => field.onChange(value === "now")}
                                >
                                  <div
                                    className={`flex cursor-pointer flex-col rounded-xl border p-4 transition-smooth ${
                                      field.value ? "border-primary bg-primary/5 shadow-soft" : "border-border/70"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-base font-semibold">Maintenant</p>
                                        <p className="text-sm text-muted-foreground">Coursier déclenché immédiatement.</p>
                                      </div>
                                      <RadioGroupItem value="now" className="h-5 w-5" />
                                    </div>
                                  </div>
                                  <div
                                    className={`flex cursor-pointer flex-col rounded-xl border p-4 transition-smooth ${
                                      !field.value ? "border-primary bg-primary/5 shadow-soft" : "border-border/70"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-base font-semibold">Programmer</p>
                                        <p className="text-sm text-muted-foreground">Sélectionnez une date et une heure.</p>
                                      </div>
                                      <RadioGroupItem value="scheduled" className="h-5 w-5" />
                                    </div>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {!nowToggle && (
                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={control}
                              name="scheduledDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date de retrait*</FormLabel>
                                  <FormControl>
                                    <Input type="date" min={format(new Date(), "yyyy-MM-dd")} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={control}
                              name="scheduledTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Heure de retrait*</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                        <FormField
                          control={control}
                          name="formula"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Formule*</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  className="mt-3 grid gap-4 md:grid-cols-3"
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  {FORMULA_OPTIONS.map((option) => {
                                    const id = `formula-${option.value}`;
                                    const selected = field.value === option.value;

                                    return (
                                      <div key={option.value} className="relative">
                                        <RadioGroupItem id={id} value={option.value} className="sr-only" />
                                        <label
                                          htmlFor={id}
                                          className={`flex h-full cursor-pointer flex-col rounded-xl border p-4 transition-smooth ${
                                            selected
                                              ? "border-primary bg-primary/5 shadow-soft"
                                              : "border-border/70 bg-background"
                                          }`}
                                        >
                                          <span className="text-base font-semibold text-foreground">{option.title}</span>
                                          <span className="mt-1 text-sm text-muted-foreground">{option.description}</span>
                                          <span className="mt-3 text-xs font-medium uppercase tracking-wide text-primary">
                                            Livraison estimée : {option.eta}
                                          </span>
                                          {selected && (
                                            <CheckCircle2
                                              className="absolute right-4 top-4 h-5 w-5 text-primary"
                                              aria-hidden="true"
                                            />
                                          )}
                                        </label>
                                      </div>
                                    );
                                  })}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="instructions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instructions pour le coursier</FormLabel>
                              <FormDescription>120 caractères maximum.</FormDescription>
                              <FormControl>
                                <Textarea rows={3} maxLength={120} placeholder="Digicode, étage, personne de contact…" {...field} />
                              </FormControl>
                              <p className="text-right text-xs text-muted-foreground">{instructionsValue.length}/120</p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="remiseCode"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-muted-foreground/20 bg-muted/40 p-4">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1">
                                <FormLabel className="text-sm font-semibold">Remise contre code de livraison</FormLabel>
                                <FormDescription>
                                  Sécurité renforcée : le colis est remis uniquement avec le code communiqué (activé par défaut).
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="consent"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-muted-foreground/30 p-4">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <FormLabel className="text-sm font-medium text-foreground">
                                  J’accepte les CGV et la politique de confidentialité.
                                </FormLabel>
                                <p>
                                  En soumettant ce formulaire, vous consentez au traitement de vos données pour la gestion de votre commande invité.
                                </p>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <div className="flex justify-end">
                      <Button type="submit" variant="default" size="lg" className="min-w-[220px]" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                            Envoi en cours…
                          </>
                        ) : (
                          "Commander sans compte"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>

              <aside className="space-y-4">
                <Card className="sticky top-28 border-none shadow-medium">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Estimation en temps réel</CardTitle>
                    <CardDescription>Mise à jour automatique selon vos informations.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span>Sans compte : suivi GPS non disponible. Estimation envoyée par message.</span>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Distance estimée</span>
                        <span className="font-semibold text-foreground">{formatDistance(estimation?.distanceKm ?? null)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Sous-total</span>
                        <span className="font-semibold text-foreground">{formatCurrency(estimation?.subtotal ?? null)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">KM supplémentaires</span>
                        <span className="font-semibold text-foreground">{formatCurrency(estimation?.kmSurcharge ?? null)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Suppléments</span>
                        <span className="font-semibold text-foreground">{formatCurrency(estimation?.supplements ?? null)}</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-base font-semibold text-foreground">
                      <span>Total TTC</span>
                      <span>{formatCurrency(estimation?.totalTtc ?? null)}</span>
                    </div>
                    {isEstimating && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Recalcul de l’estimation…
                      </div>
                    )}
                    {estimationError && (
                      <Alert variant="default" className="border-warning/40 bg-warning/10 text-warning-foreground">
                        <AlertTitle>Estimation provisoire</AlertTitle>
                        <AlertDescription>{estimationError}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3">
                    <Button variant="outline" size="lg" form="guest-order-form" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Envoi en cours…" : "Valider ma commande"}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Dès réception, un conseiller vérifie vos informations et vous recontacte en moins de 30 minutes.
                    </p>
                  </CardFooter>
                </Card>
              </aside>
            </div>
          </div>
        </section>
      </TooltipProvider>
    </Layout>
  );
};

export default CommandeSansCompte;
