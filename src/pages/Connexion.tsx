import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

import "./connexion.css";

const Connexion = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleSignUpSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="onecx-auth">
      <div className="onecx-auth__wrapper">
        <p className="onecx-auth__title">Portail sécurisé</p>
        <h1 className="onecx-auth__headline">One Connexion</h1>
        <p className="onecx-auth__description">
          Organisez vos flux logistiques urgents et programmés depuis un espace unique, conçu pour la
          réactivité des équipes médicales et opérationnelles.
        </p>

        <div className="onecx-auth__toggle" role="tablist" aria-label="Choix du mode d'authentification">
          <span
            className={`onecx-auth__toggle-indicator ${isSignUp ? "is-signup" : ""}`}
            aria-hidden="true"
          />
          <button
            type="button"
            role="tab"
            aria-selected={!isSignUp}
            className={`onecx-auth__toggle-button ${!isSignUp ? "active" : ""}`}
            onClick={() => setIsSignUp(false)}
          >
            Connexion
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isSignUp}
            className={`onecx-auth__toggle-button ${isSignUp ? "active" : ""}`}
            onClick={() => setIsSignUp(true)}
          >
            Inscription
          </button>
        </div>

        <div className="onecx-auth__card-wrap" aria-live="polite">
          <div className={`onecx-auth__card-inner ${isSignUp ? "is-flipped" : ""}`}>
            <section className="onecx-auth__face" aria-hidden={isSignUp}>
              <div className="onecx-auth__face-content">
                <header>
                  <h2 className="onecx-auth__face-title">Accédez à votre espace</h2>
                  <p className="onecx-auth__face-subtitle">
                    Pilotez vos livraisons, suivez les équipes et gagnez en sérénité.
                  </p>
                </header>

                <form className="onecx-auth__form-group" onSubmit={handleLoginSubmit} noValidate>
                  <div>
                    <label className="onecx-auth__label" htmlFor="login-email">
                      Adresse e-mail
                    </label>
                    <div className="onecx-auth__field">
                      <input
                        id="login-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="exemple@oneconnexion.fr"
                        required
                      />
                      <i className="onecx-auth__icon uil uil-at" aria-hidden="true" />
                    </div>
                  </div>

                  <div>
                    <label className="onecx-auth__label" htmlFor="login-password">
                      Mot de passe
                    </label>
                    <div className="onecx-auth__field">
                      <input
                        id="login-password"
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        placeholder="Votre mot de passe"
                        required
                      />
                      <i className="onecx-auth__icon uil uil-lock" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="onecx-auth__actions">
                    <button type="submit" className="onecx-auth__button">
                      Se connecter
                    </button>
                    <Link to="/mot-de-passe-oublie" className="onecx-auth__link">
                      Mot de passe oublié ?
                    </Link>
                  </div>
                </form>
              </div>
            </section>

            <section className="onecx-auth__face onecx-auth__face--back" aria-hidden={!isSignUp}>
              <div className="onecx-auth__face-content">
                <header>
                  <h2 className="onecx-auth__face-title">Créer un compte client</h2>
                  <p className="onecx-auth__face-subtitle">
                    Bénéficiez d’un accompagnement personnalisé pour vos flux sensibles.
                  </p>
                </header>

                <form className="onecx-auth__form-group" onSubmit={handleSignUpSubmit} noValidate>
                  <div>
                    <label className="onecx-auth__label" htmlFor="signup-name">
                      Nom complet
                    </label>
                    <div className="onecx-auth__field">
                      <input
                        id="signup-name"
                        type="text"
                        name="fullname"
                        autoComplete="name"
                        placeholder="Prénom Nom"
                        required
                      />
                      <i className="onecx-auth__icon uil uil-user" aria-hidden="true" />
                    </div>
                  </div>

                  <div>
                    <label className="onecx-auth__label" htmlFor="signup-phone">
                      Téléphone professionnel
                    </label>
                    <div className="onecx-auth__field">
                      <input
                        id="signup-phone"
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        placeholder="06 12 34 56 78"
                      />
                      <i className="onecx-auth__icon uil uil-phone" aria-hidden="true" />
                    </div>
                  </div>

                  <div>
                    <label className="onecx-auth__label" htmlFor="signup-email">
                      Adresse e-mail
                    </label>
                    <div className="onecx-auth__field">
                      <input
                        id="signup-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="contact@entreprise.fr"
                        required
                      />
                      <i className="onecx-auth__icon uil uil-envelope" aria-hidden="true" />
                    </div>
                  </div>

                  <div>
                    <label className="onecx-auth__label" htmlFor="signup-password">
                      Mot de passe
                    </label>
                    <div className="onecx-auth__field">
                      <input
                        id="signup-password"
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        placeholder="Créer un mot de passe"
                        required
                      />
                      <i className="onecx-auth__icon uil uil-lock" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="onecx-auth__actions">
                    <button type="submit" className="onecx-auth__button">
                      Créer mon compte
                    </button>
                    <Link to="/contact" className="onecx-auth__link">
                      Besoin d’un devis personnalisé ?
                    </Link>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connexion;
