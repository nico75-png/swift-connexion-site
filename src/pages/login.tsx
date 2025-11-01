import { FormEvent, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { upsertProfile } from "@/lib/api/profiles";
import { useAuth } from "@/providers/AuthProvider";
import { setAuthState } from "@/lib/stores/auth.store";

const TEST_CLIENT_EMAIL = import.meta.env.VITE_TEST_CLIENT_EMAIL ?? "keisha.khotothinu@gmail.com";
const TEST_CLIENT_PASSWORD = import.meta.env.VITE_TEST_CLIENT_PASSWORD ?? "TestUser2024!";
const TEST_ADMIN_EMAIL = import.meta.env.VITE_TEST_ADMIN_EMAIL ?? "cherkinicolas@gmail.com";
const TEST_ADMIN_PASSWORD = import.meta.env.VITE_TEST_ADMIN_PASSWORD ?? "AdminTest2024!";
import "./login.css";

const AuthLoadingScreen = () => (
  <div className="onecx-auth onecx-auth--loading">
    <div className="onecx-auth__bg" aria-hidden="true" />
    <div className="onecx-auth__loader-card" role="status" aria-live="polite">
      <div className="onecx-auth__loader-icon" aria-hidden="true">
        <span className="onecx-auth__loader-spinner" />
      </div>
      <p className="onecx-auth__loader-title">Vérification de votre session</p>
      <p className="onecx-auth__loader-subtitle">
        Préparation du tableau de bord client…
      </p>
    </div>
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [magicLinkSuccess, setMagicLinkSuccess] = useState<string | null>(null);
  const [magicLinkError, setMagicLinkError] = useState<string | null>(null);
  const { session, status, refreshProfile, userRole, isRefreshingProfile } = useAuth();
  
  // Attendre que le profil soit chargé avant de rediriger pour utiliser le bon rôle
  const isRoleLoaded = !isRefreshingProfile;
  
  const redirectTarget = useMemo(() => {
    const redirectParam = searchParams.get("redirect");
    if (!redirectParam) {
      // Redirection automatique selon le rôle
      return userRole === "admin" ? "/dashboard-admin" : "/dashboard-client";
    }
    try {
      const decoded = decodeURIComponent(redirectParam);
      return decoded.startsWith("/") ? decoded : (userRole === "admin" ? "/dashboard-admin" : "/dashboard-client");
    } catch (error) {
      console.warn("Failed to decode redirect parameter", error);
      return userRole === "admin" ? "/dashboard-admin" : "/dashboard-client";
    }
  }, [searchParams, userRole]);
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setIsSignUp(true);
    } else if (mode === "login") {
      setIsSignUp(false);
    }
  }, [searchParams]);
  if (status === "loading") {
    return <AuthLoadingScreen />;
  }

  // Attendre que le rôle soit chargé avant de rediriger
  if (status === "authenticated" && session && isRoleLoaded) {
    return <Navigate to={redirectTarget} replace />;
  }
  const handleToggle = (next: boolean) => {
    setIsSignUp(next);
    setLoginError(null);
    setSignUpError(null);
    setMagicLinkSuccess(null);
    setMagicLinkError(null);
    if (next) {
      setSignUpSuccess(null);
    }
    const redirectParam = searchParams.get("redirect");
    const params: Record<string, string> = {
      mode: next ? "signup" : "login"
    };
    if (redirectParam) {
      params.redirect = redirectParam;
    }
    setSearchParams(params);
  };
  const handleMagicLinkSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSendingMagicLink) {
      return;
    }
    setMagicLinkError(null);
    setMagicLinkSuccess(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    if (!email) {
      setMagicLinkError("Veuillez renseigner votre email.");
      return;
    }

    setIsSendingMagicLink(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/login`
              : undefined,
          shouldCreateUser: false
        }
      });

      if (error) {
        throw error;
      }

      setMagicLinkSuccess(
        "Un email de connexion vous a été envoyé. Vérifiez votre boîte mail."
      );
      (event.currentTarget as HTMLFormElement).reset();
    } catch (error) {
      let message = "L'envoi de l'email a échoué.";

      if (error instanceof AuthError) {
        if (error.message.toLowerCase().includes("user not found")) {
          message = "Aucun compte n'est associé à cet email. Veuillez vous inscrire.";
        } else if (error.status === 429) {
          message = "Vous avez demandé trop de liens en peu de temps. Réessayez plus tard.";
        } else {
          message = error.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }

      setMagicLinkError(message);
    } finally {
      setIsSendingMagicLink(false);
    }
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoggingIn) {
      return;
    }
    setLoginError(null);
    setMagicLinkSuccess(null);
    setMagicLinkError(null);
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
        password
      });
      if (error) {
        throw error;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "La connexion a échoué.";
      setLoginError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };
  const handleLoginAsTestClient = () => {
    setAuthState({
      currentUser: {
        id: "test-client-001",
        name: "Client Test",
        role: "client",
        email: "client.test@example.com"
      },
      currentClient: {
        id: "test-client-001",
        contactName: "Client Test",
        company: "Entreprise Test",
        sector: "Santé"
      }
    });
    navigate("/dashboard-client");
  };

  const handleLoginAsTestAdmin = () => {
    setAuthState({
      currentUser: {
        id: "test-admin-001",
        name: "Admin Test",
        role: "admin",
        email: "admin.test@example.com"
      },
      currentClient: null
    });
    navigate("/dashboard-admin");
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
      const {
        data,
        error
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: fullName,
            first_name: firstName,
            last_name: lastName,
            phone
          }
        }
      });
      if (error) {
        throw error;
      }
      if (data.user) {
        try {
          await upsertProfile({
            userId: data.user.id,
            firstName,
            lastName
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
      const params: Record<string, string> = {
        mode: "login"
      };
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
  return <div className="onecx-auth">
      <div className="onecx-auth__bg" aria-hidden="true" />
      <div className="onecx-auth__grid">
        <section className="onecx-auth__intro" aria-labelledby="onecx-auth-intro-heading">
          <div className="onecx-auth__brand">
            <div className="onecx-auth__brand-badge" aria-hidden="true">
              OC
            </div>
            <div>
              <p className="onecx-auth__brand-eyebrow">One connexion</p>
              <h1 id="onecx-auth-intro-heading">Portail client</h1>
            </div>
          </div>
          <p className="onecx-auth__intro-lead">
            Retrouvez l'environnement du dashboard client : informations clés, suivi en temps réel et expérience fluide sur tous
            vos appareils.
          </p>
          <ul className="onecx-auth__benefits" aria-label="Fonctionnalités du portail">
            <li>
              <span aria-hidden="true">📦</span>
              Pilotage instantané des commandes
            </li>
            <li>
              <span aria-hidden="true">📍</span>
              Suivi logistique multi-sites
            </li>
            <li>
              <span aria-hidden="true">🛡️</span>
              Authentification sécurisée Supabase
            </li>
          </ul>
          <div className="onecx-auth__test-drive">
            <button
              type="button"
              className="onecx-auth__test-button"
              onClick={handleLoginAsTestClient}
              disabled={isLoggingIn}
            >
              <span aria-hidden="true">👤</span>
              Se connecter en tant que client test
            </button>
            <button
              type="button"
              className="onecx-auth__test-button"
              onClick={handleLoginAsTestAdmin}
              disabled={isLoggingIn}
            >
              <span aria-hidden="true">🔐</span>
              Se connecter en tant qu'admin test
            </button>
            <p className="onecx-auth__test-drive-note">
              Accès complet au dashboard pour découvrir l'expérience.
            </p>
          </div>
        </section>

        <section className="onecx-auth__panel" role="region" aria-labelledby="onecx-auth-heading">
          <header className="onecx-auth__panel-header">
            <div className="onecx-auth__panel-meta">
              <p className="onecx-auth__panel-eyebrow">Portail sécurisé</p>
              <h2 id="onecx-auth-heading">One Connexion</h2>
              <p className="onecx-auth__panel-subtitle">
                Accédez à votre espace client pour suivre vos flux logistiques, gérer vos factures et dialoguer avec nos équipes.
              </p>
            </div>

            <div className="onecx-auth__tabs" role="tablist" aria-label="Choisissez votre mode d'accès">
              <span className={`onecx-auth__tabs-indicator ${isSignUp ? "is-signup" : ""}`} aria-hidden="true" />
              <button type="button" role="tab" aria-selected={!isSignUp} className={`onecx-auth__tab ${!isSignUp ? "is-active" : ""}`} onClick={() => handleToggle(false)}>
                Connexion
              </button>
              <button type="button" role="tab" aria-selected={isSignUp} className={`onecx-auth__tab ${isSignUp ? "is-active" : ""}`} onClick={() => handleToggle(true)}>
                Inscription
              </button>
            </div>
          </header>

          <div className="onecx-auth__forms-wrapper" aria-live="polite">
            <div className={`onecx-auth__forms ${isSignUp ? "is-signup" : ""}`}>
              <div
                className={`onecx-auth__form ${!isSignUp ? "is-active" : ""}`}
                aria-hidden={isSignUp}
              >
                <form onSubmit={handleLoginSubmit} noValidate>
                  <div className="onecx-auth__form-headline">
                    <h3>Bienvenue</h3>
                    <p>Connectez-vous pour poursuivre vos opérations en temps réel.</p>
                  </div>

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

                  {loginError ? (
                    <p className="onecx-auth__feedback onecx-auth__feedback--error" role="alert">
                      {loginError}
                    </p>
                  ) : null}

                  {!isSignUp && signUpSuccess ? (
                    <p className="onecx-auth__feedback onecx-auth__feedback--success" role="status">
                      {signUpSuccess}
                    </p>
                  ) : null}

                  <button type="submit" className="onecx-auth__primary" disabled={isLoggingIn}>
                    {isLoggingIn ? "Connexion…" : "Se connecter"}
                  </button>

                  <div className="onecx-auth__aux">
                    <span>Pas encore de compte ?</span>
                    <button type="button" className="onecx-auth__link" onClick={() => handleToggle(true)}>
                      Inscrivez-vous
                    </button>
                  </div>
                </form>

                <div className="onecx-auth__divider" role="separator" aria-hidden="true">
                  <span>ou</span>
                </div>

                <form onSubmit={handleMagicLinkSubmit}>
                  <div className="onecx-auth__form-headline" style={{ marginBottom: "1rem" }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: "600" }}>Connexion par email</h4>
                    <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>Recevez un lien de connexion sans mot de passe</p>
                  </div>

                  <label className="onecx-auth__field" htmlFor="magic-link-email">
                    <span>Email professionnel</span>
                    <input
                      id="magic-link-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="exemple@oneconnexion.fr"
                      required
                    />
                  </label>

                  {magicLinkSuccess ? (
                    <p className="onecx-auth__feedback onecx-auth__feedback--success" role="status">
                      {magicLinkSuccess}
                    </p>
                  ) : null}

                  {magicLinkError ? (
                    <p className="onecx-auth__feedback onecx-auth__feedback--error" role="alert">
                      {magicLinkError}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    className="onecx-auth__primary"
                    disabled={isSendingMagicLink}
                    style={{ background: "hsl(var(--secondary))" }}
                  >
                    {isSendingMagicLink ? "Envoi en cours…" : "📧 Recevoir le lien de connexion"}
                  </button>
                </form>
              </div>

              <form className={`onecx-auth__form ${isSignUp ? "is-active" : ""}`} onSubmit={handleSignUpSubmit} aria-hidden={!isSignUp} noValidate>
                <div className="onecx-auth__form-headline">
                  <h3>Créer mon compte</h3>
                  <p>Renseignez vos informations pour rejoindre l'espace One Connexion.</p>
                </div>

                <label className="onecx-auth__field" htmlFor="signup-name">
                  <span>Nom complet</span>
                  <input id="signup-name" type="text" name="fullname" autoComplete="name" placeholder="Prénom Nom" required />
                </label>

                <label className="onecx-auth__field" htmlFor="signup-email">
                  <span>Email professionnel</span>
                  <input id="signup-email" type="email" name="email" autoComplete="email" placeholder="contact@entreprise.fr" required />
                </label>

                <label className="onecx-auth__field" htmlFor="signup-phone">
                  <span>Téléphone</span>
                  <input id="signup-phone" type="tel" name="phone" autoComplete="tel" placeholder="06 12 34 56 78" />
                </label>

                <label className="onecx-auth__field" htmlFor="signup-password">
                  <span>Mot de passe</span>
                  <input id="signup-password" type="password" name="password" autoComplete="new-password" placeholder="Créer un mot de passe sécurisé" required />
                </label>

                {signUpError && <p className="onecx-auth__feedback onecx-auth__feedback--error" role="alert">
                    {signUpError}
                  </p>}

                <button type="submit" className="onecx-auth__primary" disabled={isSigningUp}>
                  {isSigningUp ? "Création en cours…" : "Créer mon compte"}
                </button>

                <div className="onecx-auth__aux">
                  <span>Déjà inscrit ?</span>
                  <button type="button" className="onecx-auth__link" onClick={() => handleToggle(false)}>
                    Se connecter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>;
};
export default Login;