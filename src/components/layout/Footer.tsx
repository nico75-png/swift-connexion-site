import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Clock, Share2 } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Livraison urbaine Île-de-France</h3>
            <p className="text-sm text-slate-300">
              Courses express ou programmées, flotte mixte deux-roues / utilitaires, POD numérique et support dispatch 7j/7.
            </p>
            <div className="space-y-2 text-sm text-slate-300">
              <p className="flex items-start gap-2">
                <MapPin className="mt-1 h-4 w-4" aria-hidden="true" />
                {{Adresse}}
              </p>
              <p className="flex items-start gap-2">
                <Phone className="mt-1 h-4 w-4" aria-hidden="true" />
                <a className="hover:underline" href="tel:{{Phone}}">{{Phone}}</a>
              </p>
              <p className="flex items-start gap-2">
                <Mail className="mt-1 h-4 w-4" aria-hidden="true" />
                <a className="hover:underline" href="mailto:{{EmailSupport}}">{{EmailSupport}}</a>
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <h4 className="text-base font-semibold">Navigation</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a className="hover:text-white" href="/#services">Services</a></li>
              <li><a className="hover:text-white" href="/#tarifs">Tarifs</a></li>
              <li><a className="hover:text-white" href="/#zones">Zones couvertes</a></li>
              <li><a className="hover:text-white" href="/#entreprise">Portail entreprise</a></li>
              <li><a className="hover:text-white" href="/#avis">Avis & cas</a></li>
              <li><a className="hover:text-white" href="/#faq">FAQ</a></li>
            </ul>
          </div>

          <div className="space-y-4 text-sm">
            <h4 className="text-base font-semibold">Opérations</h4>
            <p className="flex items-start gap-2 text-slate-300">
              <Clock className="mt-1 h-4 w-4" aria-hidden="true" />
              Dispatch : {{HorairesDispatch}}
            </p>
            <p className="text-slate-300">RC Pro &gt; {{RCPro}} · Paiement sécurisé · RGPD</p>
            <div className="space-y-2 text-slate-300">
              <p>Réseaux :
                <span className="ml-2 inline-flex gap-3">
                  <a className="hover:text-white" href="{{LienLinkedIn}}">LinkedIn</a>
                  <a className="hover:text-white" href="{{LienInstagram}}">Instagram</a>
                  <a className="hover:text-white" href="{{LienFacebook}}">Facebook</a>
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <h4 className="text-base font-semibold">Ressources</h4>
            <ul className="space-y-2 text-slate-300">
              <li><Link className="hover:text-white" to="/mentions-legales">Mentions légales</Link></li>
              <li><Link className="hover:text-white" to="/cgv">CGV</Link></li>
              <li><a className="hover:text-white" href="{{LienPolitiqueConfidentialite}}">Politique de confidentialité</a></li>
              <li><a className="hover:text-white" href="{{LienGestionCookies}}">Gestion des cookies</a></li>
              <li><a className="hover:text-white" href="{{LienRCPro}}">Attestation RC Pro</a></li>
            </ul>
            <div className="flex items-center gap-2 text-slate-300">
              <Share2 className="h-4 w-4" aria-hidden="true" />
              <span>API & webhooks sécurisés</span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 text-sm text-slate-400">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>© {currentYear} Service de livraison urbaine Île-de-France. Tous droits réservés.</p>
            <p>Conformité RGPD · Consentement cookies · Données chiffrées.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
