import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Mail, Lock, Apple, Chrome, X } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuthProfile } from "@/providers/AuthProvider";
import { toast } from "sonner";

const signInSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email requis")
    .email("Veuillez saisir une adresse email valide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

type SignInValues = z.infer<typeof signInSchema>;

const Connexion = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuthProfile();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isTwitterLoading, setIsTwitterLoading] = useState(false);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: "", password: "" },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const isFormValid = form.formState.isValid;

  const handleSubmit = async (values: SignInValues) => {
    setIsSubmitting(true);
    const identifier = values.identifier.trim();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password: values.password,
      }); // Branchez ici l'action de connexion si vous utilisez un autre provider d'authentification.

      if (error) {
        throw error;
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
      }); // Branchez ici votre fournisseur OAuth si différent.

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

  const handleTwitterSignIn = async () => {
    setIsTwitterLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "twitter",
        options: {
          redirectTo: `${window.location.origin}/espace-client`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de se connecter avec X.";
      toast.error(message);
    } finally {
      setIsTwitterLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(15,53,86,0.35),_rgba(6,21,42,0.95))] px-4 py-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-[conic-gradient(from_45deg,_rgba(0,163,224,0.25),_rgba(11,45,99,0.6))] blur-3xl" />
        <div className="absolute -right-20 bottom-24 h-72 w-72 rounded-full bg-[conic-gradient(from_180deg,_rgba(255,184,0,0.18),_rgba(0,163,224,0.4))] blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-[32px] border border-white/5" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-[hsla(217,80%,18%,0.92)] p-10 shadow-[0_24px_80px_rgba(5,20,45,0.45)] backdrop-blur-xl">
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              <span className="h-2 w-2 rounded-full bg-[hsl(var(--secondary))]" aria-hidden="true" />
              Sign in
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Welcome Back</h1>
            <p className="mt-3 text-sm text-white/70">
              Don&apos;t have an account yet?{" "}
              <Link to="/inscription" className="font-semibold text-[hsl(var(--secondary))] transition-smooth hover:text-[hsl(var(--secondary))]/80">
                Sign up
              </Link>
            </p>
          </div>

          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white/50">
                          <Mail className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <Input
                          {...field}
                          type="email"
                          inputMode="email"
                          autoComplete="username"
                          placeholder="Email address"
                          className="h-12 rounded-2xl border-white/10 bg-white/5 pl-12 text-sm text-white placeholder:text-white/40 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[hsl(var(--secondary))]/60"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs font-medium text-[hsl(43,100%,70%)]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white/50">
                          <Lock className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <Input
                          {...field}
                          type={isPasswordVisible ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="Password"
                          className="h-12 rounded-2xl border-white/10 bg-white/5 pl-12 pr-12 text-sm text-white placeholder:text-white/40 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[hsl(var(--secondary))]/60"
                        />
                        <button
                          type="button"
                          onClick={() => setIsPasswordVisible((previous) => !previous)}
                          className="absolute inset-y-0 right-4 flex items-center text-white/60 transition-smooth hover:text-white"
                          aria-label={isPasswordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                          aria-pressed={isPasswordVisible}
                        >
                          {isPasswordVisible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs font-medium text-[hsl(43,100%,70%)]" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                className="h-12 w-full rounded-2xl bg-[hsl(var(--primary))] text-base text-[hsl(var(--primary-foreground))] shadow-[0_12px_30px_rgba(11,45,99,0.45)] transition-transform hover:-translate-y-0.5 hover:bg-[hsl(var(--primary))]/90"
                disabled={isSubmitting || !isFormValid}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Login in progress…
                  </span>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3 text-white/40">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em]">Or continue with</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10"
                onClick={handleAppleSignIn}
                disabled={isSubmitting || isAppleLoading}
              >
                {isAppleLoading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Apple className="h-5 w-5" aria-hidden="true" />}
                <span className="sr-only">Sign in with Apple</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting || isGoogleLoading}
              >
                {isGoogleLoading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Chrome className="h-5 w-5" aria-hidden="true" />}
                <span className="sr-only">Sign in with Google</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10"
                onClick={handleTwitterSignIn}
                disabled={isSubmitting || isTwitterLoading}
              >
                {isTwitterLoading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <X className="h-5 w-5" aria-hidden="true" />}
                <span className="sr-only">Sign in with X</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connexion;
