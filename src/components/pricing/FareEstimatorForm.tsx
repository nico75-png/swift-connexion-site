import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SERVICE_TYPES } from "@/lib/pricing/pricingEngine";

const fareEstimatorSchema = z.object({
  pickupAddress: z.string().trim().min(1, "Adresse d'enlèvement requise"),
  dropoffAddress: z.string().trim().min(1, "Adresse de destination requise"),
  pickupDate: z.string().trim().min(1, "Date d'enlèvement requise"),
  pickupTime: z.string().trim().min(1, "Heure souhaitée requise"),
  serviceType: z.enum(["standard", "express", "flash-express"] as const),
});

export type FareEstimatorFormValues = z.infer<typeof fareEstimatorSchema>;

interface FareEstimatorFormProps {
  onEstimate: (values: FareEstimatorFormValues) => Promise<void> | void;
  isEstimating?: boolean;
}

const FareEstimatorForm = ({ onEstimate, isEstimating = false }: FareEstimatorFormProps) => {
  const defaultValues = useMemo<FareEstimatorFormValues>(() => ({
    pickupAddress: "",
    dropoffAddress: "",
    pickupDate: "",
    pickupTime: "",
    serviceType: "standard",
  }), []);

  const form = useForm<FareEstimatorFormValues>({
    resolver: zodResolver(fareEstimatorSchema),
    defaultValues,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const handleSubmit = async (values: FareEstimatorFormValues) => {
    await onEstimate(values);
  };

  const { isValid, isSubmitting } = form.formState;

  return (
    <Card className="h-full rounded-[2.25rem] border border-border/60 bg-background/95 shadow-soft supports-[backdrop-filter]:bg-background/80">
      <CardHeader className="space-y-2 pb-0 text-left">
        <CardTitle className="text-2xl font-semibold text-foreground">Renseignez votre trajet</CardTitle>
        <p className="text-sm text-muted-foreground">Toutes les informations sont nécessaires pour calculer une estimation précise.</p>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="pickupAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse d'enlèvement</FormLabel>
                    <FormDescription>Ex. 10 rue du Rivoli, Paris</FormDescription>
                    <FormControl>
                      {/* TODO: Brancher l'autocomplete d'adresse ici. */}
                      <Input
                        {...field}
                        placeholder="Ex. 10 rue du Rivoli, Paris"
                        autoComplete="street-address"
                        className="h-12 rounded-2xl"
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
                    <FormLabel>Adresse de destination</FormLabel>
                    <FormDescription>Ex. 42 avenue Victor Hugo, Paris</FormDescription>
                    <FormControl>
                      {/* TODO: Brancher l'autocomplete d'adresse ici. */}
                      <Input
                        {...field}
                        placeholder="Ex. 42 avenue Victor Hugo, Paris"
                        autoComplete="street-address"
                        className="h-12 rounded-2xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="pickupDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d'enlèvement</FormLabel>
                    <FormDescription>Choisissez la date souhaitée</FormDescription>
                    <FormControl>
                      <Input {...field} type="date" className="h-12 rounded-2xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pickupTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure souhaitée</FormLabel>
                    <FormDescription>Indiquez un créneau précis</FormDescription>
                    <FormControl>
                      <Input {...field} type="time" className="h-12 rounded-2xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de service</FormLabel>
                  <FormDescription>Sélectionnez l'option adaptée à votre besoin</FormDescription>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <SelectTrigger className="h-12 rounded-2xl">
                        <SelectValue placeholder="Sélectionner un service" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_TYPES.map((service) => (
                          <SelectItem key={service.value} value={service.value}>
                            <div className="flex flex-col text-left">
                              <span className="font-medium text-foreground">{service.label}</span>
                              <span className="text-xs text-muted-foreground">{service.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full"
              disabled={!isValid || isSubmitting || isEstimating}
            >
              {isSubmitting || isEstimating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Calcul en cours…
                </>
              ) : (
                "Estimer le tarif"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FareEstimatorForm;
