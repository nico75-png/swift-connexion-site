import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createOrder } from "@/lib/services/orders.service";
import type { AuthClient } from "@/lib/stores/auth.store";

const parseLocaleNumber = (value: string) => Number.parseFloat(value.replace(",", "."));

const formSchema = z
  .object({
    transportType: z.string().trim().min(1, "Sélectionnez un type de transport"),
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
  })
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
}

const CreateOrderForm = ({ customer }: CreateOrderFormProps) => {
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(false);
  const initialValues = useMemo(
    () => ({
      transportType: "",
      pickupAddress: customer.defaultPickupAddress ?? "",
      deliveryAddress: customer.defaultDeliveryAddress ?? "",
      date: "",
      time: "",
      weight: "",
      volume: "",
      driverInstructions: "",
    }),
    [customer.defaultDeliveryAddress, customer.defaultPickupAddress],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  const onSubmit = async (values: FormValues) => {
    const weightValue = parseLocaleNumber(values.weight);
    const volumeValue = parseLocaleNumber(values.volume);

    const payload = {
      customerId: customer.id,
      transportType: values.transportType,
      pickupAddress: values.pickupAddress,
      deliveryAddress: values.deliveryAddress,
      date: values.date,
      time: values.time,
      weight: weightValue,
      volume: volumeValue,
      driverInstructions: values.driverInstructions?.trim() ? values.driverInstructions.trim() : undefined,
    };

    try {
      const result = await createOrder(payload, {
        customerDisplayName: customer.contactName,
        customerCompany: customer.company,
      });

      if (result.success && result.orderId) {
        toast.success("Commande créée", {
          description: "Votre commande a bien été enregistrée.",
        });
        navigate(`/espace-client/commandes/${result.orderId}`);
        return;
      }

      toast.error("Création impossible", {
        description: result.error ?? "Une erreur est survenue. Veuillez réessayer.",
      });
    } catch (error) {
      toast.error("Création impossible", {
        description:
          error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer.",
      });
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
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
          name="transportType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de transport</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={form.formState.isSubmitting}>
                <FormControl>
                  <SelectTrigger aria-label="Type de transport">
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="medical">Médical</SelectItem>
                  <SelectItem value="juridique">Juridique</SelectItem>
                  <SelectItem value="optique">Optique</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  disabled={form.formState.isSubmitting}
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
                  disabled={form.formState.isSubmitting}
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
                    disabled={form.formState.isSubmitting}
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
                    disabled={form.formState.isSubmitting}
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
                    disabled={form.formState.isSubmitting}
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
                    disabled={form.formState.isSubmitting}
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
            disabled={form.formState.isSubmitting}
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
                      disabled={form.formState.isSubmitting}
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
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Enregistrement..." : "Créer la commande"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateOrderForm;
