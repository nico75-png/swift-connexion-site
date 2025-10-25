import { useMemo, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { SECTOR_OPTIONS } from "@/config/secteurs";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import {
  normalizePhoneForSubmit,
  registrationDefaultValues,
  registrationSchema,
  type RegistrationFormInput,
  type RegistrationFormValues,
} from "./inscriptionSchema";
import { submitRegistration } from "@/services/registration";

const countFieldErrors = (errors: FieldErrors): number =>
  Object.values(errors).reduce((total, error) => {
    if (!error || typeof error !== "object") {
      return total;
    }

    if ("message" in error && ("type" in error || "ref" in error)) {
      return total + (error.message ? 1 : 0);
    }

    if (error instanceof Element) {
      return total;
    }

    return total + countFieldErrors(error as FieldErrors);
  }, 0);

const RequiredMark = () => (
  <span className="ml-1 text-destructive" aria-hidden="true">
    *
  </span>
);

const Inscription = () => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegistrationFormInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: registrationDefaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  const errorSummary = useMemo(() => {
    const errorCount = countFieldErrors(form.formState.errors);

    if (!form.formState.isSubmitted || errorCount === 0) {
      return "";
    }

    return `Le formulaire contient ${errorCount} erreur${errorCount > 1 ? "s" : ""}.`;
  }, [form.formState.errors, form.formState.isSubmitted]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const parsed = registrationSchema.parse(values) as RegistrationFormValues;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitRegistration({
        companyName: parsed.companyName,
        email: parsed.email,
        phone: normalizePhoneForSubmit(parsed.phone),
        siret: parsed.siret,
        sector: parsed.sector,
        billingAddress: {
          line1: parsed.billingAddress.line1,
          line2: parsed.billingAddress.line2 ?? undefined,
          postalCode: parsed.billingAddress.postalCode,
          city: parsed.billingAddress.city,
          country: parsed.billingAddress.country,
        },
      });

      toast.success("Demande d'inscription envoyée.");
      form.reset(registrationDefaultValues);
    } catch (error) {
      setSubmitError("Impossible de soumettre le formulaire. Veuillez réessayer plus tard.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <main className="bg-background">
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-2 text-center sm:text-left">
          <h1 className="text-3xl font-semibold text-foreground">Inscription entreprise</h1>
          <p className="text-base text-muted-foreground">
            Renseignez les informations ci-dessous pour créer votre compte professionnel. Les champs marqués d'un astérisque sont obligatoires.
          </p>
        </div>

        <Form {...form}>
          <form
            noValidate
            onSubmit={handleSubmit}
            className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8"
          >
            <div aria-live="polite" className="sr-only" data-testid="form-errors-announcer">
              {errorSummary}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      Nom de la société
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        required
                        autoComplete="organization"
                        placeholder="Société Exemple"
                        className={cn("h-12 text-base", fieldState.invalid && "border-destructive focus-visible:ring-destructive")}
                      />
                    </FormControl>
                    <FormMessage aria-live="polite" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      E-mail professionnel
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        required
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="contact@exemple.fr"
                        className={cn("h-12 text-base", fieldState.invalid && "border-destructive focus-visible:ring-destructive")}
                      />
                    </FormControl>
                    <FormMessage aria-live="polite" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      Téléphone
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        required
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="+33612345678"
                        className={cn("h-12 text-base", fieldState.invalid && "border-destructive focus-visible:ring-destructive")}
                      />
                    </FormControl>
                    <FormMessage aria-live="polite" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siret"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      Numéro de SIRET
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        required
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="12345678901234"
                        className={cn("h-12 text-base", fieldState.invalid && "border-destructive focus-visible:ring-destructive")}
                      />
                    </FormControl>
                    <FormDescription>14 chiffres — ex. : 12345678901234</FormDescription>
                    <FormMessage aria-live="polite" />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-6">
              <FormField
                control={form.control}
                name="sector"
                render={({ field, fieldState }) => (
                  <FormItem className="max-w-xl">
                    <FormLabel>
                      Secteur d'activité
                      <RequiredMark />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger
                          required
                          className={cn("h-12 text-base", fieldState.invalid && "border-destructive focus:ring-destructive")}
                        >
                          <SelectValue placeholder="Sélectionnez un secteur" />
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
                    <FormMessage aria-live="polite" />
                  </FormItem>
                )}
              />
            </div>

            <fieldset className="mt-8 space-y-6">
              <legend className="text-lg font-semibold text-foreground">Adresse de facturation</legend>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="billingAddress.line1"
                  render={({ field, fieldState }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>
                        Adresse — ligne 1
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          required
                          autoComplete="address-line1"
                          placeholder="12 rue de l'Innovation"
                          className={cn("h-12 text-base", fieldState.invalid && "border-destructive focus-visible:ring-destructive")}
                        />
                      </FormControl>
                      <FormMessage aria-live="polite" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingAddress.line2"
                  render={({ field, fieldState }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Adresse — ligne 2 (optionnel)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          autoComplete="address-line2"
                          placeholder="Bâtiment, étage, boîte aux lettres"
                          className={cn("h-12 text-base", fieldState.invalid && "border-destructive focus-visible:ring-destructive")}
                        />
                      </FormControl>
                      <FormMessage aria-live="polite" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingAddress.postalCode"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>
                        Code postal
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          required
                          inputMode="numeric"
                          autoComplete="postal-code"
                          placeholder="75008"
                          className={cn("h-12 text-base", fieldState.invalid && "border-destructive focus-visible:ring-destructive")}
                        />
                      </FormControl>
                      <FormMessage aria-live="polite" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingAddress.city"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>
                        Ville
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          required
                          autoComplete="address-level2"
                          placeholder="Paris"
                          className={cn("h-12 text-base", fieldState.invalid && "border-destructive focus-visible:ring-destructive")}
                        />
                      </FormControl>
                      <FormMessage aria-live="polite" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingAddress.country"
                  render={({ field, fieldState }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>
                        Pays
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          required
                          autoComplete="country-name"
                          placeholder="France"
                          className={cn("h-12 text-base", fieldState.invalid && "border-destructive focus-visible:ring-destructive")}
                        />
                      </FormControl>
                      <FormMessage aria-live="polite" />
                    </FormItem>
                  )}
                />
              </div>
            </fieldset>

            {submitError && (
              <p className="mt-6 text-base font-medium text-destructive" role="alert" aria-live="polite">
                {submitError}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">* Champs obligatoires</p>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 items-center justify-center rounded-md px-6 text-base font-semibold"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    Envoi…
                  </span>
                ) : (
                  "Envoyer ma demande"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </section>
    </main>
  );
};

export default Inscription;
