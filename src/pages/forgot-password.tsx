import { FormEvent, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || !email.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        throw error;
      }

      setSuccessMessage(
        "Si un compte existe avec cet email, un lien de réinitialisation vient de vous être envoyé."
      );
      setEmail("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Une erreur est survenue lors de la demande de réinitialisation.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-semibold text-gray-900">Mot de passe oublié</h1>
        <p className="text-sm text-gray-600">
          Indiquez votre adresse email pour recevoir un lien de réinitialisation.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <label className="flex flex-col gap-2 text-left" htmlFor="forgot-password-email">
          <span className="text-sm font-medium text-gray-700">Email professionnel</span>
          <input
            id="forgot-password-email"
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="exemple@oneconnexion.fr"
            required
            autoComplete="email"
          />
        </label>

        {errorMessage && (
          <p className="text-sm text-red-600" role="alert">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="text-sm text-green-600" role="status">
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Envoi en cours…" : "Envoyer le lien"}
        </button>
      </form>
    </section>
  );
};

export default ForgotPassword;
