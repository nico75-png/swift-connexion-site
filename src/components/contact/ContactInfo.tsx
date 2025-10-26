import ContactCard from "./ContactCard";
import { BookOpen, Mail, MapPin, Phone } from "lucide-react";

const SUPPORT_DOCS_URL =
  import.meta.env.VITE_SUPPORT_DOCS_URL ?? "https://docs.one-connexion.com"; // Update with your live documentation URL if it differs.
const SUPPORT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL ?? "contact@one-connexion.com"; // Update when the official support email changes.
const SUPPORT_PHONE = import.meta.env.VITE_CONTACT_PHONE ?? "+33123456789"; // Update with the canonical international phone number.
const SUPPORT_PHONE_DISPLAY = import.meta.env.VITE_CONTACT_PHONE_DISPLAY ?? "01 23 45 67 89"; // Update with your preferred local display format.
const SUPPORT_ADDRESS =
  import.meta.env.VITE_CONTACT_ADDRESS ?? "18 avenue des Transports, 75010 Paris, France"; // Update with your actual office address.
const SUPPORT_VISIT_URL =
  import.meta.env.VITE_CONTACT_VISIT_URL ??
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SUPPORT_ADDRESS)}`; // Replace with a dedicated maps link if available.

const normalizeUrlDisplay = (url: string) => url.replace(/^https?:\/\//, "");

const ContactInfo = () => {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold text-foreground md:text-5xl">Contactez-nous</h1>
        <p className="max-w-xl text-base text-muted-foreground md:text-lg">
          Commencez par nos ressources d'auto-assistance. Vous trouverez ci-dessous des options supplémentaires, dont un chat en
          direct avec nos spécialistes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ContactCard
          icon={BookOpen}
          title="Documentation"
          detail={
            <>
              <p>Consultez nos guides, références API et meilleures pratiques.</p>
              <p className="mt-1 font-medium text-foreground">{normalizeUrlDisplay(SUPPORT_DOCS_URL)}</p>
            </>
          }
          href={SUPPORT_DOCS_URL}
          actionLabel="Consulter la documentation"
          ariaLabel="Ouvrir le portail de documentation"
        />
        <ContactCard
          icon={Mail}
          title="Adresse e-mail"
          detail={<p>{SUPPORT_EMAIL}</p>}
          href={`mailto:${SUPPORT_EMAIL}`}
          actionLabel="Nous écrire"
          ariaLabel="Envoyer un courriel à notre équipe"
        />
        <ContactCard
          icon={Phone}
          title="Téléphone"
          detail={<p>{SUPPORT_PHONE_DISPLAY}</p>}
          href={`tel:${SUPPORT_PHONE}`}
          actionLabel="Appeler notre équipe"
          ariaLabel="Appeler notre équipe"
        />
        <ContactCard
          icon={MapPin}
          title="Nous rendre visite"
          detail={<p>{SUPPORT_ADDRESS}</p>}
          href={SUPPORT_VISIT_URL}
          actionLabel="Préparer votre visite"
          ariaLabel="Ouvrir notre adresse dans Maps"
        />
      </div>
    </div>
  );
};

export default ContactInfo;
