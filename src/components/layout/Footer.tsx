import { Link } from "react-router-dom";
import { Package, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* À propos */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cta">
                <Package className="h-5 w-5 text-cta-foreground" />
              </div>
              <span className="text-lg font-bold">One Connexion</span>
            </div>
            <p className="text-sm text-primary-foreground/80">
              Transport B2B express en Île-de-France. Solutions rapides et sécurisées pour tous vos besoins professionnels.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/expertises" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  Expertises
                </Link>
              </li>
              <li>
                <Link to="/tarifs" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>Livraison médicale</li>
              <li>Transport optique</li>
              <li>Coursier juridique</li>
              <li>B2B Express</li>
              <li>Événementiel</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href="tel:+33123456789" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  01 23 45 67 89
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:contact@oneconnexion.fr" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  contact@oneconnexion.fr
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80">
                  123 Avenue de Paris<br />75001 Paris, France
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
            <div>
              © {currentYear} One Connexion. Tous droits réservés.
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/mentions-legales" className="hover:text-primary-foreground transition-smooth">
                Mentions légales
              </Link>
              <Link to="/cgv" className="hover:text-primary-foreground transition-smooth">
                CGV
              </Link>
              <Link to="/cookies" className="hover:text-primary-foreground transition-smooth">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
