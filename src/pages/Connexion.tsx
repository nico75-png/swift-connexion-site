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
import heroVisual from "@/assets/hero-courier.jpg"; // Remplacez ce visuel par votre image de panneau si nécessaire.
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthProfile } from "@/providers/AuthProvider";

const rememberEmailStorageKey = "auth:remember-email";
const forgotPasswordRoute = "/mot-de-passe-oublie"; // Ajustez cette route selon votre configuration.

const signInSchema = z.object({
  email: z.string().trim().min(1, "Email requis").email("Email invalide"),
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
    defaultValues: { email: "", password: "", rememberMe: false },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    const storedEmail = localStorage.getItem(rememberEmailStorageKey);
    if (storedEmail) {
      form.setValue("email", storedEmail);
      form.setValue("rememberMe", true);
    }
  }, [form]);

  const isFormValid = form.formState.isValid;

  const handleSubmit = async (values: SignInValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      }); // Remplacez cette méthode si vous utilisez un autre provider d'authentification.

      if (error) {
        throw error;
      }

      if (values.rememberMe) {
        localStorage.setItem(rememberEmailStorageKey, values.email);
      } else {
        localStorage.removeItem(rememberEmailStorageKey);
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
        label: "A WISE QUOTE",
        headline: "Orchestrez vos livraisons avec sérénité",
        description: "Planifiez, suivez et optimisez vos transports en temps réel grâce à la plateforme One Connexion.",
        imageUrl: heroVisual,
        imageAlt: "Livreur stylisé sur fond lumineux",
      }}
    >
      <div className="mx-auto w-full max-w-md space-y-10">
        <div className="space-y-3 text-left">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Heureux de vous revoir</h1>
          <p className="text-base text-muted-foreground">
            Entrez votre email et votre mot de passe pour accéder à votre espace client sécurisé.
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold text-foreground">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="vous@entreprise.fr"
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
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-semibold text-foreground">Mot de passe</FormLabel>
                    <Link
                      to={forgotPasswordRoute}
                      className="text-sm font-semibold text-primary transition-smooth hover:text-primary-dark hover:underline"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
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
                  <FormItem className="flex items-center space-x-3 space-y-0">
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs font-semibold uppercase text-muted-foreground">
                <span className="bg-card px-3">ou</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <GoogleIcon />
              )}
              <span className="ml-2">Se connecter avec Google</span>
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          Vous n&apos;avez pas encore de compte ?{" "}
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
