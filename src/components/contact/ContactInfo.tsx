import ContactCard from "./ContactCard";
import { BookOpen, Mail, MapPin, Phone } from "lucide-react";

const SUPPORT_DOCS_URL = import.meta.env.VITE_SUPPORT_DOCS_URL ?? "https://docs.oneconnexion.fr"; // Update with your live documentation URL if it differs.
const SUPPORT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL ?? "contact@oneconnexion.fr"; // Update when the official support email changes.
const SUPPORT_PHONE = import.meta.env.VITE_CONTACT_PHONE ?? "+33123456789"; // Update with the canonical international phone number.
const SUPPORT_PHONE_DISPLAY = import.meta.env.VITE_CONTACT_PHONE_DISPLAY ?? "01 23 45 67 89"; // Update with your preferred local display format.
const SUPPORT_ADDRESS =
  import.meta.env.VITE_CONTACT_ADDRESS ?? "123 Avenue de Paris, 75001 Paris, France"; // Update with your actual office address.
const SUPPORT_VISIT_URL =
  import.meta.env.VITE_CONTACT_VISIT_URL ??
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SUPPORT_ADDRESS)}`; // Replace with a dedicated maps link if available.

const normalizeUrlDisplay = (url: string) => url.replace(/^https?:\/\//, "");

const ContactInfo = () => {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold text-foreground md:text-5xl">Contact Us</h1>
        <p className="max-w-xl text-base text-muted-foreground md:text-lg">
          We'll show you self-help options first. Additional help is available below, including live chat with our specialists.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ContactCard
          icon={BookOpen}
          title="Documentation"
          detail={
            <>
              <p>Browse guides, API references, and best practices.</p>
              <p className="mt-1 font-medium text-foreground">{normalizeUrlDisplay(SUPPORT_DOCS_URL)}</p>
            </>
          }
          href={SUPPORT_DOCS_URL}
          actionLabel="View documentation"
          ariaLabel="Open documentation portal"
        />
        <ContactCard
          icon={Mail}
          title="Our Email"
          detail={<p>{SUPPORT_EMAIL}</p>}
          href={`mailto:${SUPPORT_EMAIL}`}
          actionLabel="Send us an email"
          ariaLabel="Send an email to our team"
        />
        <ContactCard
          icon={Phone}
          title="Phone"
          detail={<p>{SUPPORT_PHONE_DISPLAY}</p>}
          href={`tel:${SUPPORT_PHONE}`}
          actionLabel="Call our team"
          ariaLabel="Call our team"
        />
        <ContactCard
          icon={MapPin}
          title="Visit Us"
          detail={<p>{SUPPORT_ADDRESS}</p>}
          href={SUPPORT_VISIT_URL}
          actionLabel="Plan your visit"
          ariaLabel="Open our address on maps"
        />
      </div>
    </div>
  );
};

export default ContactInfo;
