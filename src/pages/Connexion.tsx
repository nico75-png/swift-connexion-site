import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Apple, Eye, EyeOff, Loader2 } from "lucide-react";
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

const rememberIdentifierStorageKey = "auth:remember-identifier";
const forgotPasswordRoute = "/mot-de-passe-oublie"; // Ajustez cette route selon votre configuration.

const signInSchema = z.object({
  identifier: z.string().trim().min(1, "Identifiant requis"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  rememberMe: z.boolean().default(false),
});

type SignInValues = z.infer<typeof signInSchema>;

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden="true" className="h-5 w-5 text-primary">
    <path
      fill="currentColor"
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
  const [isAppleLoading, setIsAppleLoading] = useState(false);

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

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/espace-client`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de se connecter avec Apple.";
      toast.error(message);
    } finally {
      setIsAppleLoading(false);
    }
  };

  return (
    <AuthLayout className="dark bg-background text-foreground">
      <div className="space-y-10">
        <div className="space-y-4 text-left">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">Se connecter</h1>
          <p className="text-base text-muted-foreground/90">
            Retrouvons-nous pour piloter vos opérations logistiques en toute sérénité.
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-14 justify-center rounded-[calc(var(--radius)*1.6)] border-border/70 bg-card/20 text-card-foreground shadow-soft transition-smooth hover:border-accent hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting || isGoogleLoading || isAppleLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <GoogleIcon />
                )}
                <span className="text-sm font-semibold">Google</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-14 justify-center rounded-[calc(var(--radius)*1.6)] border-border/70 bg-card/20 text-card-foreground shadow-soft transition-smooth hover:border-accent hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                onClick={handleAppleSignIn}
                disabled={isSubmitting || isAppleLoading || isGoogleLoading}
                aria-label="Se connecter avec Apple"
              >
                {isAppleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <Apple className="h-5 w-5" aria-hidden="true" />
                )}
                <span className="text-sm font-semibold">Apple</span>
              </Button>
            </div>

            <div className="flex items-center gap-3 text-muted-foreground/70">
              <Separator className="h-px flex-1 bg-border/60" />
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground/70">— OR —</span>
              <Separator className="h-px flex-1 bg-border/60" />
            </div>

            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold text-muted-foreground/80">Email ou Nom d&apos;utilisateur</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      inputMode="email"
                      autoComplete="username"
                      placeholder="vous@entreprise.fr ou pseudo"
                      className="h-14 rounded-[calc(var(--radius)*1.6)] border-border/70 bg-card/10 px-4 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card"
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
                  <FormLabel className="text-sm font-semibold text-muted-foreground/80">Mot de passe</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={isPasswordVisible ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="h-14 rounded-[calc(var(--radius)*1.6)] border-border/70 bg-card/10 px-4 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                      />
                      <button
                        type="button"
                        onClick={() => setIsPasswordVisible((previous) => !previous)}
                        className="absolute inset-y-0 right-3 flex items-center text-muted-foreground/70 transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card"
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

            <div className="flex flex-wrap items-center justify-between gap-3 text-muted-foreground/80">
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
                className="text-sm font-semibold text-accent transition-smooth hover:text-accent/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <Button
              type="submit"
              variant="cta"
              size="lg"
              className="h-14 w-full rounded-[calc(var(--radius)*1.6)] bg-gradient-to-r from-primary to-accent text-white shadow-large transition-smooth hover:from-primary-dark hover:to-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-70"
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              <span>Se connecter</span>
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground/80">
          Nouveau ?{" "}
          <Link
            to="/inscription"
            className="font-semibold text-accent underline underline-offset-4 transition-smooth hover:text-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Connexion;
