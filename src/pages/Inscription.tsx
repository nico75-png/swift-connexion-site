import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";

import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { upsertProfile } from "@/lib/api/profiles";
import { useAuthProfile } from "@/providers/AuthProvider";
import { toast } from "sonner";

const heroVisual = "{image_url}"; // Remplacez {image_url} par l'URL finale du visuel côté marketing.

const phoneCountries = [
  { code: "FR", name: "France", dialCode: "+33", mask: "## ## ## ## ##", placeholder: "06 12 34 56 78" },
  { code: "BE", name: "Belgique", dialCode: "+32", mask: "### ## ## ##", placeholder: "0470 12 34 56" },
  { code: "CH", name: "Suisse", dialCode: "+41", mask: "## ### ## ##", placeholder: "079 123 45 67" },
  { code: "LU", name: "Luxembourg", dialCode: "+352", mask: "### ### ###", placeholder: "621 123 456" },
  { code: "DE", name: "Allemagne", dialCode: "+49", mask: "#### #######", placeholder: "0151 1234567" },
] as const;

const defaultCountryCode = phoneCountries[0].code;

const usernameRegex = /^[a-z0-9._-]{3,}$/i;

const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Nom complet requis")
      .refine((value) => value.trim().split(/\s+/).length >= 2, "Indiquez vos prénom et nom"),
    email: z.string().trim().min(1, "Email requis").email("Adresse email invalide"),
    username: z
      .string()
      .trim()
      .min(3, "Nom d'utilisateur trop court")
      .max(24, "Nom d'utilisateur trop long")
      .regex(usernameRegex, "Caractères autorisés : lettres, chiffres, ., -, _"),
    country: z.string().min(1, "Sélectionnez un indicatif"),
    phone: z
      .string()
      .trim()
      .min(1, "Numéro requis")
      .refine((value) => value.replace(/\D/g, "").length >= 6, "Numéro de téléphone invalide"),
    password: z.string().min(8, "Minimum 8 caractères"),
    acceptPolicies: z.literal(true, {
      errorMap: () => ({ message: "Vous devez accepter les conditions pour continuer" }),
    }),
  })
  .superRefine(({ phone, country }, ctx) => {
    const countryOption = phoneCountries.find((option) => option.code === country);
    if (!countryOption) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Sélectionnez un indicatif", path: ["country"] });
      return;
    }

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 6) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Numéro de téléphone invalide", path: ["phone"] });
    }
  });

type SignUpValues = z.infer<typeof signUpSchema>;

type PhoneCountry = (typeof phoneCountries)[number];

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden="true" className="h-5 w-5">
    <path
      fill="#4285F4"
      d="M21.805 10.023h-9.18v3.955h5.273c-.227 1.23-1.25 3.61-5.273 3.61-3.175 0-5.763-2.626-5.763-5.86 0-3.234 2.588-5.86 5.763-5.86 1.806 0 3.02.77 3.71 1.436l2.53-2.46C17.165 3.316 15.093 2.4 12.352 2.4 6.903 2.4 2.4 6.85 2.4 12.2c0 5.35 4.503 9.8 9.952 9.8 5.745 0 9.545-4.04 9.545-9.74 0-.653-.07-1.147-.192-1.737Z"
    />
  </svg>
);

const formatPhoneWithMask = (value: string, mask: PhoneCountry["mask"]) => {
  const digits = value.replace(/\D/g, "");
  let formatted = "";
  let digitIndex = 0;

  for (const char of mask) {
    if (char === "#") {
      if (digitIndex >= digits.length) {
        break;
      }
      formatted += digits[digitIndex];
      digitIndex += 1;
    } else {
      if (digitIndex === 0 && formatted.length === 0) {
        continue;
      }
      formatted += char;
    }
  }

  if (digitIndex < digits.length) {
    formatted += digits.slice(digitIndex);
  }

  return formatted;
};

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0] };
  }
  const firstName = parts.slice(0, -1).join(" ");
  const lastName = parts.slice(-1).join(" ");
  return { firstName, lastName };
};

const Inscription = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuthProfile();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
      country: defaultCountryCode,
      phone: "",
      password: "",
      acceptPolicies: false,
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const isFormValid = form.formState.isValid;
  const countryCode = form.watch("country");
  const selectedCountry = useMemo<PhoneCountry>(() => {
    return phoneCountries.find((option) => option.code === countryCode) ?? phoneCountries[0];
  }, [countryCode]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/espace-client`,
        },
      }); // Branchez ici votre fournisseur OAuth si différent.

      if (error) {
        throw error;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de continuer avec Google.";
      toast.error(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (values: SignUpValues) => {
    setIsSubmitting(true);
    try {
      const countryOption = phoneCountries.find((option) => option.code === values.country) ?? phoneCountries[0];
      const normalizedPhone = `${countryOption.dialCode}${values.phone.replace(/\D/g, "")}`;
      const { firstName, lastName } = splitFullName(values.fullName);

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            username: values.username,
            phone: normalizedPhone,
            phone_country: countryOption.code,
          },
        },
      }); // Branchez ici votre action d'inscription si vous n'utilisez pas Supabase.

      if (error) {
        throw error;
      }

      const user = data.user;

      if (user) {
        try {
          await upsertProfile({
            userId: user.id,
            firstName,
            lastName,
          });
          await refreshProfile();
        } catch (profileError) {
          console.error("Failed to persist profile", profileError);
        }
      }

      toast.success("Compte créé avec succès ! Redirection en cours…");
      navigate("/espace-client");
    } catch (error) {
      const message = error instanceof Error ? error.message : "La création du compte a échoué.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      contentPosition="left"
      visual={{
        label: "SHARP. FAST.",
        headline: "Un compte unique pour piloter vos livraisons",
        description: "Rejoignez la plateforme One Connexion et planifiez vos transports professionnels en un clin d'œil.",
        imageUrl: heroVisual,
        imageAlt: "Athlète concentrée en plein service.",
      }}
    >
      <div className="mx-auto w-full max-w-md space-y-10">
        <div className="space-y-3 text-left">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Créer un compte</h1>
          <p className="text-base text-muted-foreground">
            Démarrez en quelques secondes pour accéder à tous vos services One Connexion.
          </p>
        </div>

        <div className="space-y-8">
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full justify-center gap-3 rounded-xl border-border/70 py-3 text-base font-semibold"
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <GoogleIcon />}
            Continuer avec Google
          </Button>

          <div className="relative flex items-center">
            <Separator className="bg-border" />
            <span className="absolute inset-x-0 mx-auto w-fit bg-card px-3 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              ou remplissez le formulaire…
            </span>
          </div>

          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" autoComplete="name" placeholder="Prénom Nom" />
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
                    <FormLabel>Adresse email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" inputMode="email" autoComplete="email" placeholder="vous@entreprise.fr" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d'utilisateur</FormLabel>
                    <FormControl>
                      <div className="flex items-center rounded-md border border-input bg-background px-3 py-2 text-base focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 md:text-sm">
                        <span className="mr-2 text-muted-foreground" aria-hidden="true">
                          @
                        </span>
                        <input
                          {...field}
                          type="text"
                          className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
                          autoComplete="username"
                          placeholder="votre.identifiant"
                        />
                      </div>
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
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <div className="flex gap-3">
                        <Select
                          value={form.watch("country")}
                          onValueChange={(value) => {
                            const countryOption = phoneCountries.find((option) => option.code === value) ?? phoneCountries[0];
                            const reformatted = formatPhoneWithMask(form.getValues("phone"), countryOption.mask);
                            form.setValue("country", value, { shouldValidate: true, shouldDirty: true });
                            form.setValue("phone", reformatted, { shouldValidate: true, shouldDirty: true });
                          }}
                        >
                          <SelectTrigger
                            className="w-[140px] rounded-md border border-input bg-background text-sm font-semibold"
                            aria-label="Indicatif pays"
                            aria-invalid={form.formState.errors.country ? "true" : "false"}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {phoneCountries.map((option) => (
                              <SelectItem key={option.code} value={option.code}>
                                {option.name} ({option.dialCode})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          {...field}
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder={selectedCountry.placeholder}
                          onChange={(event) => {
                            const formatted = formatPhoneWithMask(event.target.value, selectedCountry.mask);
                            event.target.value = formatted;
                            field.onChange(formatted);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                    {form.formState.errors.country ? (
                      <p className="text-sm font-medium text-destructive">{form.formState.errors.country.message}</p>
                    ) : null}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={isPasswordVisible ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setIsPasswordVisible((previous) => !previous)}
                          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-smooth hover:text-foreground"
                          aria-label={isPasswordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        >
                          {isPasswordVisible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptPolicies"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3 rounded-xl bg-muted/20 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                        className="mt-1"
                        id="acceptPolicies"
                      />
                    </FormControl>
                    <div className="space-y-1 text-sm">
                      <FormLabel htmlFor="acceptPolicies" className="text-sm font-medium leading-snug">
                        J'accepte la <Link to="/mentions-legales" className="text-primary underline-offset-4 hover:underline">Politique de confidentialité</Link> et les{" "}
                        <Link to="/cgv" className="text-primary underline-offset-4 hover:underline">Conditions d'utilisation</Link>.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                variant="cta"
                size="lg"
                className="w-full rounded-xl text-base"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : "Continuer"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground">
            Déjà inscrit ?{" "}
            <Link to="/connexion" className="font-semibold text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Inscription;
