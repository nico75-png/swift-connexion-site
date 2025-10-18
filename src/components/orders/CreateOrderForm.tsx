import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AuthClient } from "@/lib/stores/auth.store";
import { usePackageTypes } from "@/hooks/usePackageTypes";
import { Checkbox } from "@/components/ui/checkbox";
import { SECTORS, type Sector } from "@/lib/packageTaxonomy";

export const parseLocaleNumber = (value: string) => Number.parseFloat(value.replace(",", "."));

const formSchema = z
  .object({
    packageType: z.string().trim().min(1, "Type de colis requis"),
    packageNote: z.string().optional().or(z.literal("")),
    pickupAddress: z.string().trim().min(1, "Adresse de départ requise"),
    deliveryAddress: z.string().trim().min(1, "Adresse de livraison requise"),
    date: z.string().trim().min(1, "Date requise"),
    time: z.string().trim().min(1, "Heure requise"),
    weight: z
      .string()
      .trim()
      .min(1, "Indiquez un poids")
      .refine(value => !Number.isNaN(parseLocaleNumber(value)), "Indiquez un poids valide")
      .refine(value => parseLocaleNumber(value) > 0, "Le poids doit être supérieur à 0"),
    volume: z
      .string()
      .trim()
      .min(1, "Indiquez une taille/volume")
      .refine(value => !Number.isNaN(parseLocaleNumber(value)), "Indiquez une taille/volume valide")
      .refine(value => parseLocaleNumber(value) > 0, "La taille/volume doit être supérieure à 0"),
    driverInstructions: z
      .string()
      .max(500, "500 caractères maximum")
      .optional()
      .or(z.literal("")),
    expressDelivery: z.boolean().default(false),
    fragilePackage: z.boolean().default(false),
    temperatureControlled: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.packageType === "AUTRE") {
        return data.packageNote && data.packageNote.trim().length >= 5;
      }
      return true;
    },
    {
      message: "Veuillez préciser le contenu du colis (minimum 5 caractères)",
      path: ["packageNote"],
    }
  )
  .superRefine((values, ctx) => {
    if (!values.date || !values.time) {
      return;
    }
    const candidate = new Date(`${values.date}T${values.time}`);
    if (Number.isNaN(candidate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indiquez une date et une heure valides",
        path: ["time"],
      });
      return;
    }
    if (candidate.getTime() <= Date.now()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Planifiez une collecte dans le futur",
        path: ["time"],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

interface CreateOrderFormProps {
  customer: AuthClient;
  defaultValues: FormValues;
  onSubmit: (values: FormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

const CreateOrderForm = ({ customer, defaultValues, onSubmit, isSubmitting }: CreateOrderFormProps) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const packageTypes = usePackageTypes(customer.sector as Sector | undefined);
  const isMedicalSector = (customer.sector as Sector | undefined) === SECTORS.MEDICAL;

  const initialValues = useMemo(
    () => ({
      packageType: defaultValues.packageType ?? "",
      packageNote: defaultValues.packageNote ?? "",
      pickupAddress: defaultValues.pickupAddress ?? customer.defaultPickupAddress ?? "",
      deliveryAddress: defaultValues.deliveryAddress ?? customer.defaultDeliveryAddress ?? "",
      date: defaultValues.date ?? "",
      time: defaultValues.time ?? "",
      weight: defaultValues.weight ?? "",
      volume: defaultValues.volume ?? "",
      driverInstructions: defaultValues.driverInstructions ?? "",
      expressDelivery: defaultValues.expressDelivery ?? false,
      fragilePackage: defaultValues.fragilePackage ?? false,
      temperatureControlled: defaultValues.temperatureControlled ?? false,
    }),
    [
      customer.defaultDeliveryAddress,
      customer.defaultPickupAddress,
      defaultValues.date,
      defaultValues.deliveryAddress,
      defaultValues.driverInstructions,
      defaultValues.packageNote,
      defaultValues.packageType,
      defaultValues.pickupAddress,
      defaultValues.time,
      defaultValues.volume,
      defaultValues.weight,
      defaultValues.expressDelivery,
      defaultValues.fragilePackage,
      defaultValues.temperatureControlled,
    ],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  const handleSubmit = async (values: FormValues) => {
    await onSubmit({
      ...values,
      packageNote: values.packageNote?.trim() ?? "",
      driverInstructions: values.driverInstructions?.trim() ?? "",
    });
  };

  const selectedPackageType = form.watch("packageType");

  useEffect(() => {
    if (initialValues.driverInstructions) {
      setShowInstructions(true);
    }
  }, [initialValues.driverInstructions]);

  useEffect(() => {
    if (!isMedicalSector && form.getValues("temperatureControlled")) {
      form.setValue("temperatureControlled", false, { shouldDirty: true, shouldValidate: true });
    }
  }, [form, isMedicalSector]);

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold">Étape 1</span>
          <span>•</span>
          <span>Informations de transport</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Nom de la société</label>
            <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium">
              {customer.company}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">N° SIRET</label>
            <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium">
              {customer.siret}
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="packageType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de transport *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={form.formState.isSubmitting || isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type de colis" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {packageTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <p className="text-sm font-semibold">Options</p>
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="expressDelivery"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3 rounded-lg border bg-background px-4 py-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                      disabled={form.formState.isSubmitting || isSubmitting}
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel className="text-sm font-medium leading-none">
                      Livraison express (+30 %)
                    </FormLabel>
                    <FormDescription className="text-xs text-muted-foreground">
                      Priorité immédiate et traitement accéléré de votre transport.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fragilePackage"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3 rounded-lg border bg-background px-4 py-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                      disabled={form.formState.isSubmitting || isSubmitting}
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel className="text-sm font-medium leading-none">
                      Colis fragile (+15 %)
                    </FormLabel>
                    <FormDescription className="text-xs text-muted-foreground">
                      Manipulation renforcée et sécurisation du conditionnement.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            {isMedicalSector ? (
              <FormField
                control={form.control}
                name="temperatureControlled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 rounded-lg border bg-background px-4 py-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                        disabled={form.formState.isSubmitting || isSubmitting}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="text-sm font-medium leading-none">
                        Température contrôlée
                      </FormLabel>
                      <FormDescription className="text-xs text-muted-foreground">
                        Maintien de la chaîne du froid (2–8 °C) pour les envois sensibles.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            ) : null}
          </div>
        </div>

        {selectedPackageType === "AUTRE" && (
          <FormField
            control={form.control}
            name="packageNote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Précisez le contenu *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Décrivez précisément le contenu du colis..."
                    rows={3}
                    disabled={form.formState.isSubmitting || isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="pickupAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse de départ</FormLabel>
              <FormControl>
                  <Input
                    {...field}
                    placeholder="Saisissez l'adresse de collecte"
                    autoComplete="street-address"
                    disabled={form.formState.isSubmitting || isSubmitting}
                  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deliveryAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse de livraison</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Saisissez l'adresse de livraison"
                  autoComplete="street-address"
                  disabled={form.formState.isSubmitting || isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="date"
                    disabled={form.formState.isSubmitting || isSubmitting}
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="time"
                    disabled={form.formState.isSubmitting || isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Poids (kg)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min={0.1}
                    placeholder="0,5"
                    disabled={form.formState.isSubmitting || isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="volume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volume (m³)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min={0.01}
                    placeholder="0,20"
                    disabled={form.formState.isSubmitting || isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowInstructions(!showInstructions)}
            disabled={form.formState.isSubmitting || isSubmitting}
          >
            {showInstructions ? "Masquer" : "Ajouter"} instructions particulières
          </Button>
          {showInstructions && (
            <FormField
              control={form.control}
              name="driverInstructions"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Instructions pour le chauffeur</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Indications d'accès, codes, consignes spécifiques..."
                      rows={4}
                      disabled={form.formState.isSubmitting || isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full"
            variant="cta"
            disabled={form.formState.isSubmitting || isSubmitting}
          >
            {form.formState.isSubmitting || isSubmitting
              ? "Préparation du récapitulatif..."
              : "Passer au récapitulatif"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export type { FormValues as CreateOrderFormValues };

export default CreateOrderForm;
