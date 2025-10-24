import { useEffect, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuthProfile } from "@/providers/AuthProvider";
import { toast } from "sonner";

const heroVisual = "{image_url}"; // Remplacez {image_url} par l'URL fournie pour le visuel de la colonne droite.

const rememberIdentifierStorageKey = "auth:remember-identifier";
const forgotPasswordRoute = "/mot-de-passe-oublie"; // Ajustez cette route selon votre configuration.

const signInSchema = z.object({
  identifier: z.string().trim().min(1, "Identifiant requis"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  rememberMe: z.boolean().default(false),
});

type SignInValues = z.infer<typeof signInSchema>;

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden="true" className="h-5 w-5">
    <path
      fill="#4285F4"
      d="M21.805 10.023h-9.18v3.955h5.273c-.227 1.23-1.25 3.61-5.273 3.61-3.175 0-5.763-2.626-5.763-5.86 0-3.234 2.588-5.86 5.763-5.86 1.806 0 3.02.77 3.71 1.436l2.53-2.46C17.165 3.316 15.093 2.4 12.352 2.4 6.903 2.4 2.4 6.85 2.4 12.2c0 5.35 4.503 9.8 9.952 9.8 5.745 0 9.545-4.04 9.545-9.74 0-.653-.07-1.147-.192-1.737Z"
    />
  </svg>
);

const Connexion = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuthProfile();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: "", password: "", rememberMe: false },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    const storedIdentifier = localStorage.getItem(rememberIdentifierStorageKey);
    if (storedIdentifier) {
      form.setValue("identifier", storedIdentifier);
      form.setValue("rememberMe", true);
    }
  }, [form]);

  const isFormValid = form.formState.isValid;

  const handleSubmit = async (values: SignInValues) => {
    setIsSubmitting(true);
    const identifier = values.identifier.trim();

    if (!identifier.includes("@")) {
      form.setError("identifier", {
        type: "manual",
        message: "Veuillez saisir l'adresse e-mail associée à votre compte.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password: values.password,
      }); // Branchez ici l'action de connexion si vous utilisez un autre provider d'authentification.

      if (error) {
        throw error;
      }

      if (values.rememberMe) {
        localStorage.setItem(rememberIdentifierStorageKey, identifier);
      } else {
        localStorage.removeItem(rememberIdentifierStorageKey);
      }

      await refreshProfile();

      toast.success("Connexion réussie ! Redirection vers votre espace…");
      navigate("/espace-client");
    } catch (error) {
      const message = error instanceof Error ? error.message : "La connexion a échoué.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      const message = error instanceof Error ? error.message : "Impossible de se connecter avec Google.";
      toast.error(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      visual={{
        label: "SHARP. FAST.",
        headline: "Gardez une longueur d'avance sur chaque tournée",
        description: "Supervisez vos équipes et vos flux en temps réel avec une interface pensée pour les opérations critiques.",
        imageUrl: heroVisual,
        imageAlt: "Joueuse de tennis concentrée sur un service puissant",
      }}
    >
      <div className="space-y-8">
        <div className="space-y-3 text-left">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Se connecter</h1>
          <p className="text-base text-muted-foreground">
            Retrouvons-nous pour piloter vos opérations logistiques en toute sérénité.
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full justify-center gap-2"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <GoogleIcon />
              )}
              <span>Se connecter avec Google</span>
            </Button>

            <div className="flex items-center gap-4">
              <Separator className="h-px flex-1" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">ou</span>
              <Separator className="h-px flex-1" />
            </div>

            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold text-foreground">Email ou Nom d&apos;utilisateur</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      inputMode="email"
                      autoComplete="username"
                      placeholder="vous@entreprise.fr ou pseudo"
                    />
                  </FormControl>
                  <FormMessage className="text-sm font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold text-foreground">Mot de passe</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={isPasswordVisible ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setIsPasswordVisible((previous) => !previous)}
                        className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-smooth hover:text-foreground"
                        aria-label={isPasswordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        aria-pressed={isPasswordVisible}
                      >
                        {isPasswordVisible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-sm font-medium" />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        id="rememberMe"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                    </FormControl>
                    <FormLabel htmlFor="rememberMe" className="text-sm font-medium text-muted-foreground">
                      Se souvenir de moi
                    </FormLabel>
                  </FormItem>
                )}
              />

              <Link
                to={forgotPasswordRoute}
                className="text-sm font-semibold text-primary transition-smooth hover:text-primary-dark hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <Button
              type="submit"
              variant="cta"
              size="lg"
              className="w-full"
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Connexion en cours…
                </span>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          Nouveau ?{" "}
          <Link
            to="/inscription"
            className="font-semibold text-primary transition-smooth hover:text-primary-dark hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Connexion;
