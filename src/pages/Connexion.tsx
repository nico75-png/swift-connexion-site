import { FormEvent, useState } from "react";

import "./connexion.css";

const Connexion = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleSignUpSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleToggle = (next: boolean) => {
    setIsSignUp(next);
  };

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

              <button type="submit" className="onecx-auth__primary">
                Se connecter
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

              <button type="submit" className="onecx-auth__primary">
                Créer mon compte
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

export default Connexion;
