import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { upsertProfile } from "@/lib/api/profiles";
import { useAuthProfile } from "@/providers/AuthProvider";

import "./login.css";

const Login = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const navigate = useNavigate();
  const router = useMemo(
    () => ({
      push: (path: string, options?: { replace?: boolean }) => {
        const normalizedPath = path === "/dashboard/client" ? "/dashboard-client" : path;
        navigate(normalizedPath, { replace: options?.replace ?? false });
      },
    }),
    [navigate]
  );
  const { session, isLoading, refreshProfile } = useAuthProfile();

  const redirectTarget = useMemo(() => {
    const redirectParam = searchParams.get("redirect");
    if (!redirectParam) {
      return "/dashboard-client";
    }

    try {
      const decoded = decodeURIComponent(redirectParam);
      return decoded.startsWith("/") ? decoded : "/dashboard-client";
    } catch (error) {
      console.warn("Failed to decode redirect parameter", error);
      return "/dashboard-client";
    }
  }, [searchParams]);

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setIsSignUp(true);
    } else if (mode === "login") {
      setIsSignUp(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && session) {
      navigate(redirectTarget, { replace: true });
    }
  }, [isLoading, session, redirectTarget, navigate]);

  const handleToggle = (next: boolean) => {
    setIsSignUp(next);
    setLoginError(null);
    setSignUpError(null);
    if (next) {
      setSignUpSuccess(null);
    }

    const redirectParam = searchParams.get("redirect");
    const params: Record<string, string> = { mode: next ? "signup" : "login" };
    if (redirectParam) {
      params.redirect = redirectParam;
    }

    setSearchParams(params);
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoggingIn) {
      return;
    }

    setLoginError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setLoginError("Veuillez renseigner votre email et votre mot de passe.");
      return;
    }

    setIsLoggingIn(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      navigate(redirectTarget, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "La connexion a échoué.";
      setLoginError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignUpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSigningUp) {
      return;
    }

    setSignUpError(null);
    setSignUpSuccess(null);

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullname") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!fullName || !email || !password) {
      setSignUpError("Veuillez compléter les champs obligatoires.");
      return;
    }

    const names = fullName.split(/\s+/).filter(Boolean);
    const firstName = names.shift() ?? "";
    const lastName = names.join(" ") || firstName;

    setIsSigningUp(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard-client`,
          data: {
            full_name: fullName,
            first_name: firstName,
            last_name: lastName,
            phone,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        try {
          await upsertProfile({
            userId: data.user.id,
            firstName,
            lastName,
          });
          await refreshProfile();
        } catch (profileError) {
          console.error("Failed to persist profile", profileError);
        }
      }

      (event.currentTarget as HTMLFormElement).reset();
      setSignUpSuccess("Votre compte a été créé. Vérifiez votre boîte mail pour confirmer votre inscription.");

      setIsSignUp(false);
      const redirectParam = searchParams.get("redirect");
      const params: Record<string, string> = { mode: "login" };
      if (redirectParam) {
        params.redirect = redirectParam;
      }
      setSearchParams(params);
    } catch (error) {
      const message = error instanceof Error ? error.message : "L'inscription a échoué.";
      setSignUpError(message);
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleQuickAccess = (path: string) => {
    window.location.href = path;
  };

  const handleLoginAsTestClient = useCallback(() => {
    if (typeof window === "undefined") {
      console.error(
        "[TestClientLogin] SessionStorage non disponible : impossible de connecter le client de test."
      );
      return;
    }

    const testUser = { id: "test-client", name: "Client Test", role: "client" };

    try {
      const serializedUser = JSON.stringify({
        id: testUser.id,
        name: testUser.name,
        role: testUser.role,
      });

      sessionStorage.setItem("dash:user", serializedUser);
      sessionStorage.setItem("dash:userRole", testUser.role);

      console.info("[TestClientLogin] Connexion réussie pour le client de test.");
      router.push("/dashboard/client", { replace: true });
    } catch (error) {
      console.error(
        "[TestClientLogin] Impossible de connecter le client de test : stockage de session échoué.",
        error
      );
    }
  }, [router]);

  return (
    <div className="onecx-auth">
      <div className="onecx-auth__ambient" aria-hidden="true" />

      <div className="onecx-auth__card" role="region" aria-labelledby="onecx-auth-heading">
        <div className="onecx-auth__logo" aria-hidden="true">
          <span>OC</span>
        </div>
        <div className="onecx-auth__meta">
          <p className="onecx-auth__eyebrow">Portail sécurisé</p>
          <h1 id="onecx-auth-heading" className="onecx-auth__title">
            One Connexion
          </h1>
          <p className="onecx-auth__subtitle">
            Accédez à une expérience premium pour piloter vos flux logistiques en toute fluidité.
          </p>
        </div>

        <section className="onecx-auth__quick-access" aria-label="Accès rapide de test">
          <div className="onecx-auth__quick-actions">
            <button
              type="button"
              className="onecx-auth__quick-button onecx-auth__quick-button--admin"
              onClick={() => handleQuickAccess("/dashboard-admin")}
            >
              Se connecter en tant qu’administrateur
            </button>
            <button
              type="button"
              className="onecx-auth__quick-button onecx-auth__quick-button--client"
              onClick={handleLoginAsTestClient}
            >
              Se connecter en tant que client (test)
            </button>
          </div>
          <p className="onecx-auth__quick-note">
            Accès rapide de test — Aucun identifiant requis. Sera supprimé plus tard.
          </p>
        </section>

        <div className="mt-6 w-full">
          <button
            type="button"
            onClick={handleLoginAsTestClient}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 px-5 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
          >
            <span className="text-lg" aria-hidden="true">
              🚀
            </span>
            Se connecter en tant que client test
          </button>
        </div>

        <div
          className="onecx-auth__toggle"
          role="tablist"
          aria-label="Choisissez entre connexion et inscription"
        >
          <span
            className={`onecx-auth__toggle-indicator ${isSignUp ? "is-signup" : ""}`}
            aria-hidden="true"
          />
          <button
            type="button"
            role="tab"
            aria-selected={!isSignUp}
            className={`onecx-auth__toggle-button ${!isSignUp ? "is-active" : ""}`}
            onClick={() => handleToggle(false)}
          >
            Connexion
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isSignUp}
            className={`onecx-auth__toggle-button ${isSignUp ? "is-active" : ""}`}
            onClick={() => handleToggle(true)}
          >
            Inscription
          </button>
        </div>

        <div className="onecx-auth__forms" aria-live="polite">
          <div className={`onecx-auth__forms-track ${isSignUp ? "is-signup" : ""}`}>
            <form
              className={`onecx-auth__pane ${!isSignUp ? "is-active" : ""}`}
              onSubmit={handleLoginSubmit}
              aria-hidden={isSignUp}
              noValidate
            >
              <header className="onecx-auth__pane-header">
                <h2>Bienvenue</h2>
                <p>Connectez-vous pour poursuivre vos opérations en temps réel.</p>
              </header>

              <label className="onecx-auth__field" htmlFor="login-email">
                <span>Email professionnel</span>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="exemple@oneconnexion.fr"
                  required
                />
              </label>

              <label className="onecx-auth__field" htmlFor="login-password">
                <span>Mot de passe</span>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Votre mot de passe"
                  required
                />
              </label>

              {loginError && (
                <p className="onecx-auth__feedback onecx-auth__feedback--error" role="alert">
                  {loginError}
                </p>
              )}

              {signUpSuccess && !isSignUp && (
                <p className="onecx-auth__feedback onecx-auth__feedback--success" role="status">
                  {signUpSuccess}
                </p>
              )}

              <button type="submit" className="onecx-auth__primary" disabled={isLoggingIn}>
                {isLoggingIn ? "Connexion…" : "Se connecter"}
              </button>

              <div className="onecx-auth__aux">
                <span>Pas encore de compte ?</span>
                <button
                  type="button"
                  className="onecx-auth__link"
                  onClick={() => handleToggle(true)}
                >
                  Inscrivez-vous
                </button>
              </div>

              <div className="onecx-auth__divider" role="separator" aria-hidden="true">
                <span>ou continuez avec</span>
              </div>

              <div className="onecx-auth__social">
                <button type="button" className="onecx-auth__social-button" aria-label="Connexion avec Google">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M21.35 11.1H12V13.9H18.54C18.01 16.32 15.79 18 12 18C8.13 18 5 14.87 5 11C5 7.13 8.13 4 12 4C13.86 4 15.5 4.7 16.77 5.86L18.79 3.84C17.01 2.2 14.7 1.2 12 1.2C6.7 1.2 2.2 5.7 2.2 11C2.2 16.3 6.7 20.8 12 20.8C17.3 20.8 21.8 16.3 21.8 11C21.8 10.45 21.73 10.02 21.63 9.57L21.35 11.1Z"
                      fill="#0B2D55"
                    />
                  </svg>
                  Google
                </button>
                <button type="button" className="onecx-auth__social-button" aria-label="Connexion avec Apple">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M16.65 1.2C16.72 1.2 16.8 1.2 16.87 1.2C16.94 1.2 17.01 1.2 17.08 1.21C17.2 2.06 16.87 2.84 16.36 3.45C15.86 4.07 15.08 4.57 14.23 4.5C14.16 3.68 14.54 2.86 15.04 2.31C15.51 1.77 16.16 1.37 16.65 1.2ZM20.64 17.17C20.18 18.21 19.94 18.75 19.34 19.7C18.57 20.93 17.6 22.29 16.23 22.31C14.99 22.33 14.69 21.5 13.04 21.5C11.39 21.5 11.06 22.29 9.86 22.33C8.63 22.37 7.76 21.16 6.99 19.94C5.14 16.99 4.02 12.3 5.91 9.13C6.68 7.84 8.09 7 9.55 6.98C10.75 6.96 11.88 7.79 12.61 7.79C13.33 7.79 14.71 6.78 16.18 6.93C16.8 6.96 18.44 7.18 19.49 8.76C19.4 8.82 17.48 9.94 17.5 12.29C17.53 14.99 19.87 15.91 19.9 15.93C19.87 16 20.28 16.87 20.64 17.17Z" />
                  </svg>
                  Apple
                </button>
              </div>
            </form>

            <form
              className={`onecx-auth__pane ${isSignUp ? "is-active" : ""}`}
              onSubmit={handleSignUpSubmit}
              aria-hidden={!isSignUp}
              noValidate
            >
              <header className="onecx-auth__pane-header">
                <h2>Créer mon compte</h2>
                <p>Renseignez vos informations pour rejoindre l'espace One Connexion.</p>
              </header>

              <label className="onecx-auth__field" htmlFor="signup-name">
                <span>Nom complet</span>
                <input
                  id="signup-name"
                  type="text"
                  name="fullname"
                  autoComplete="name"
                  placeholder="Prénom Nom"
                  required
                />
              </label>

              <label className="onecx-auth__field" htmlFor="signup-email">
                <span>Email professionnel</span>
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="contact@entreprise.fr"
                  required
                />
              </label>

              <label className="onecx-auth__field" htmlFor="signup-phone">
                <span>Téléphone</span>
                <input
                  id="signup-phone"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  placeholder="06 12 34 56 78"
                />
              </label>

              <label className="onecx-auth__field" htmlFor="signup-password">
                <span>Mot de passe</span>
                <input
                  id="signup-password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="Créer un mot de passe sécurisé"
                  required
                />
              </label>

              {signUpError && (
                <p className="onecx-auth__feedback onecx-auth__feedback--error" role="alert">
                  {signUpError}
                </p>
              )}

              <button type="submit" className="onecx-auth__primary" disabled={isSigningUp}>
                {isSigningUp ? "Création en cours…" : "Créer mon compte"}
              </button>

              <div className="onecx-auth__aux">
                <span>Déjà inscrit ?</span>
                <button
                  type="button"
                  className="onecx-auth__link"
                  onClick={() => handleToggle(false)}
                >
                  Se connecter
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
