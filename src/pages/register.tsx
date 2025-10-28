import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { upsertProfile } from "@/lib/api/profiles";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
const heroImage = "{image_url}"; // Placez ici {image_url}

const COUNTRY_VALUES = ["fr", "be", "ch"] as const;
type CountryValue = (typeof COUNTRY_VALUES)[number];
type CountryOption = {
  value: CountryValue;
  label: string;
  dialCode: string;
  pattern: readonly number[];
  example: string;
};
const COUNTRY_OPTIONS = [{
  value: "fr",
  label: "France (+33)",
  dialCode: "+33",
  pattern: [1, 2, 2, 2, 2],
  example: "6 12 34 56 78"
}, {
  value: "be",
  label: "Belgique (+32)",
  dialCode: "+32",
  pattern: [2, 3, 2, 2],
  example: "470 12 34 56"
}, {
  value: "ch",
  label: "Suisse (+41)",
  dialCode: "+41",
  pattern: [2, 3, 2, 2],
  example: "78 123 45 67"
}] satisfies readonly CountryOption[];
const registrationSchema = z.object({
  fullName: z.string().min(2, "Veuillez saisir votre nom complet.").max(100, "Le nom complet ne peut pas dépasser 100 caractères."),
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères.").regex(/^[a-zA-Z0-9._-]+$/, "Utilisez uniquement des lettres, chiffres ou ._-"),
  country: z.enum(COUNTRY_VALUES),
  phone: z.string().min(8, "Le numéro de téléphone est incomplet."),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
  acceptTerms: z.literal(true, {
    errorMap: () => ({
      message: "Vous devez accepter les conditions pour continuer."
    })
  })
}).refine(data => data.phone.replace(/\D/g, "").length >= 8, {
  path: ["phone"],
  message: "Le numéro de téléphone est incomplet."
});
type RegistrationFormValues = z.infer<typeof registrationSchema>;
const GoogleIcon = () => <svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2045C17.64 8.56682 17.5827 7.95295 17.4764 7.36395H9V10.8454H13.8436C13.635 11.9704 13.0009 12.9236 12.0477 13.5613V15.8195H14.9563C16.6581 14.2522 17.64 11.9454 17.64 9.2045Z" fill="#4285F4" />
    <path d="M9 18C11.43 18 13.4677 17.1941 14.9563 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4209 9 14.4209C6.65591 14.4209 4.67182 12.8377 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853" />
    <path d="M3.96409 10.7101C3.78409 10.1701 3.68182 9.59319 3.68182 9.00005C3.68182 8.40691 3.78409 7.83005 3.96409 7.29005V4.95828H0.957273C0.347727 6.17328 0 7.54787 0 9.00005C0 10.4522 0.347727 11.8268 0.957273 13.0419L3.96409 10.7101Z" fill="#FBBC05" />
    <path d="M9 3.57909C10.3214 3.57909 11.5077 4.03318 12.4336 4.92137L15.0218 2.33318C13.4632 0.864545 11.4255 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.28996C4.67182 5.16273 6.65591 3.57909 9 3.57909Z" fill="#EA4335" />
  </svg>;
const buildPlaceholder = (country: (typeof COUNTRY_OPTIONS)[number]) => `${country.dialCode} ${country.example}`;
const formatPhone = (country: (typeof COUNTRY_OPTIONS)[number], digits: string) => {
  const sanitized = digits.replace(/\D/g, "");
  const maxLength = country.pattern.reduce((total, part) => total + part, 0);
  const trimmed = sanitized.slice(0, maxLength);
  const chunks: string[] = [];
  let cursor = 0;
  for (const size of country.pattern) {
    if (cursor >= trimmed.length) {
      break;
    }
    const chunk = trimmed.slice(cursor, cursor + size);
    if (chunk) {
      chunks.push(chunk);
    }
    cursor += size;
  }
  return `${country.dialCode} ${chunks.join(" ")}`.trim();
};
const normalizePhoneForSubmit = (country: (typeof COUNTRY_OPTIONS)[number], digits: string) => {
  const sanitized = digits.replace(/\D/g, "");
  const withoutLeadingZero = sanitized.replace(/^0+/, "");
  return `${country.dialCode}${withoutLeadingZero}`;
};
const Inscription = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      username: "",
      country: "fr",
      phone: "",
      password: ""
    },
    mode: "onChange"
  });
  const watchCountry = form.watch("country");
  const watchPhone = form.watch("phone");
  const selectedCountry = useMemo(() => COUNTRY_OPTIONS.find(option => option.value === watchCountry) ?? COUNTRY_OPTIONS[0], [watchCountry]);
  const formattedPhone = formatPhone(selectedCountry, watchPhone);
  const phonePlaceholder = buildPlaceholder(selectedCountry);
  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard-client`
        }
      });
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
  const onSubmit = async (values: RegistrationFormValues) => {
    setIsSubmitting(true);
    try {
      const names = values.fullName.trim().split(/\s+/);
      const firstName = names.shift() ?? "";
      const lastName = names.join(" ") || firstName;
      const phoneForSubmit = normalizePhoneForSubmit(selectedCountry, values.phone);
      const {
        data,
        error
      } = await supabase.auth.signUp({
        // Branchez ici l'action d'inscription (Supabase)
        phone: phoneForSubmit,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            username: values.username,
            country: values.country
          }
        }
      });
      if (error) {
        throw error;
      }
      const user = data.user;
      if (user) {
        try {
          await upsertProfile({
            userId: user.id,
            firstName,
            lastName
          });
          await refreshProfile();
        } catch (profileError) {
          console.error("Failed to persist profile", profileError);
        }
      }
      toast.success("Compte créé avec succès ! Bienvenue chez One Connexion");
      navigate("/dashboard-client");
    } catch (error) {
      const message = error instanceof Error ? error.message : "La création du compte a échoué.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const isFormValid = form.formState.isValid;
  return <div className="relative flex min-h-screen flex-col bg-muted/30">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-muted/60 to-white" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-primary shadow-soft transition-smooth hover:text-primary-dark">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span aria-hidden="true" className="text-base font-bold">
                OC
              </span>
            </div>
            <span className="tracking-tight">One Connexion</span>
          </Link>
          
        </div>

        <div className="grid flex-1 rounded-[42px] border border-border/60 bg-card shadow-large sm:rounded-[48px] lg:grid-cols-[0.4fr_0.6fr] lg:overflow-hidden xl:grid-cols-2" data-testid="registration-shell">
          <div className="order-2 flex min-h-0 items-stretch bg-card lg:order-1 lg:min-h-[360px]" data-testid="registration-form-panel">
            <div className="flex w-full flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-12" data-testid="registration-form-scroll-area">
                <div className="flex min-h-full flex-col gap-8 lg:gap-10">
                  <div className="space-y-3">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Créer un compte</h1>
                    <p className="text-base text-muted-foreground">
                      Rejoignez la communauté One Connexion et pilotez vos livraisons avec précision.
                    </p>
                  </div>

                  <div className="flex flex-1 flex-col gap-8">
                    <Button type="button" variant="outline" size="lg" className="w-full justify-center gap-3 text-sm font-semibold" onClick={handleGoogleSignUp} disabled={isSubmitting || isGoogleLoading}>
                      {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <GoogleIcon />}
                      Continuer avec Google
                    </Button>

                    <div className="relative">
                      <Separator className="bg-border" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-card px-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          ou remplissez le formulaire…
                        </span>
                      </div>
                    </div>

                    <Form {...form}>
                      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                        <FormField control={form.control} name="fullName" render={({
                        field
                      }) => <FormItem>
                          <FormLabel className="text-sm font-semibold text-foreground">Nom complet</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Jean Dupont" autoComplete="name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name="username" render={({
                    field
                  }) => <FormItem>
                          <FormLabel className="text-sm font-semibold text-foreground">Nom d&apos;utilisateur</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                                @
                              </span>
                              <Input {...field} className="pl-8" placeholder="oneconnexion" autoComplete="username" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <div className="grid gap-4 sm:grid-cols-[0.4fr_1fr]">
                      <FormField control={form.control} name="country" render={({
                      field
                    }) => <FormItem>
                            <FormLabel className="text-sm font-semibold text-foreground">Pays</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionnez" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {COUNTRY_OPTIONS.map(option => <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>} />

                      <FormField control={form.control} name="phone" render={({
                      field
                    }) => <FormItem>
                            <FormLabel className="text-sm font-semibold text-foreground">Téléphone</FormLabel>
                            <FormControl>
                              <Input ref={field.ref} name={field.name} value={formattedPhone} onBlur={field.onBlur} onChange={event => field.onChange(event.target.value.replace(/\D/g, ""))} placeholder={phonePlaceholder} inputMode="tel" autoComplete="tel" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                    </div>

                    <FormField control={form.control} name="password" render={({
                    field
                  }) => <FormItem>
                          <FormLabel className="text-sm font-semibold text-foreground">Mot de passe</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input ref={field.ref} name={field.name} value={field.value} onChange={field.onChange} onBlur={field.onBlur} type={isPasswordVisible ? "text" : "password"} autoComplete="new-password" placeholder="••••••••" />
                              <button type="button" onClick={() => setIsPasswordVisible(previous => !previous)} className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-smooth hover:text-foreground" aria-label={isPasswordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                                {isPasswordVisible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name="acceptTerms" render={({
                    field
                  }) => <FormItem className="flex items-start gap-3 space-y-0 rounded-2xl border border-border/60 bg-muted/20 p-4">
                          <FormControl>
                            <Checkbox id="acceptTerms" checked={field.value} onCheckedChange={checked => field.onChange(checked === true)} className="mt-0.5" />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel htmlFor="acceptTerms" className="text-sm font-medium text-foreground">
                              J&apos;accepte la Politique de confidentialité et les Conditions d&apos;utilisation
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              <Link to="/mentions-legales" className="font-semibold text-primary transition-smooth hover:text-primary-dark hover:underline">
                                Politique de confidentialité
                              </Link>{" "}
                              et{" "}
                              <Link to="/cgv" className="font-semibold text-primary transition-smooth hover:text-primary-dark hover:underline">
                                Conditions d&apos;utilisation
                              </Link>
                            </p>
                            <FormMessage />
                          </div>
                        </FormItem>} />

                        <Button type="submit" variant="cta" size="lg" className="w-full" disabled={isSubmitting || !isFormValid}>
                          {isSubmitting ? <span className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                              Inscription en cours…
                            </span> : "Continuer"}
                        </Button>
                      </form>
                    </Form>

                    <p className="mt-auto text-center text-sm text-muted-foreground">
                      Déjà inscrit ?{" "}
                    <Link to="/login" className="font-semibold text-primary transition-smooth hover:text-primary-dark hover:underline">
                      Se connecter
                    </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative order-1 flex items-center justify-center overflow-hidden bg-primary text-primary-foreground lg:order-2">
            <img src={heroImage} alt="Athlète en action" className="absolute inset-0 h-full w-full object-cover" />
            <div aria-hidden="true" className="absolute inset-0 bg-primary/30 mix-blend-multiply" />
            <div className="absolute inset-6 rounded-[40px] border border-white/30 opacity-70" aria-hidden="true" />
            <div className="relative z-10 flex h-full w-full flex-col items-end justify-between px-8 py-10 text-right text-white sm:px-12 sm:py-14">
              <span className="text-[11px] font-semibold uppercase tracking-[0.5em] text-white/70">Sharp. Fast.</span>
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
                  Rejoignez la logistique de pointe
                </h2>
                <p className="max-w-[320px] text-sm text-white/80">
                  Optimisez vos flux de transport et gagnez en réactivité grâce à une plateforme conçue pour la vitesse.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Inscription;