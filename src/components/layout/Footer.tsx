import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Package,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  Clock8,
  Linkedin,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-24 overflow-hidden bg-primary-dark text-primary-foreground">
      <div className="absolute inset-0 opacity-60 gradient-hero" />
      <div className="absolute inset-0 bg-grid-primary opacity-20" />
      <div className="relative container mx-auto px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.35fr,0.65fr]">
          <div className="space-y-10">
            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground/70">
                <ShieldCheck className="h-4 w-4" /> Coursier certifié & assuré
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10">
                  <Package className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                    One Connexion accompagne les entreprises franciliennes 24/7
                  </h2>
                  <p className="mt-4 text-sm text-primary-foreground/80 md:text-base">
                    Logistique express, transport sensible, tournées planifiées : notre équipe dédiée orchestre chaque livraison avec précision, transparence et suivi en temps réel.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 rounded-3xl border border-primary-foreground/15 bg-white/10 p-6 backdrop-blur-md md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">Disponibilité</p>
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <Clock8 className="h-4 w-4" /> 7j/7 – 24h/24
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">Hotline</p>
                <a href="tel:+33123456789" className="group inline-flex items-center gap-2 text-sm md:text-base transition-smooth hover:text-white">
                  <Phone className="h-4 w-4" /> 01 23 45 67 89
                  <ArrowUpRight className="h-4 w-4 opacity-0 transition-smooth group-hover:opacity-100" />
                </a>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">Support</p>
                <a
                  href="mailto:contact@oneconnexion.fr"
                  className="group inline-flex items-center gap-2 text-sm md:text-base transition-smooth hover:text-white"
                >
                  <Mail className="h-4 w-4" /> contact@oneconnexion.fr
                  <ArrowUpRight className="h-4 w-4 opacity-0 transition-smooth group-hover:opacity-100" />
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-6 rounded-3xl border border-primary-foreground/10 bg-white/5 p-6 backdrop-blur">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Planifiez votre prochaine course</h3>
              <p className="text-sm text-primary-foreground/75">
                Confiez-nous vos urgences, navettes régulières ou tournées multi-destinations. Nous apportons une réponse opérationnelle en moins de 15 minutes.
              </p>
              <Button variant="cta" className="w-full rounded-2xl py-6 text-base font-semibold" asChild>
                <Link to="/commande-sans-compte">Commander maintenant</Link>
              </Button>
              <Button variant="outline-light" className="w-full rounded-2xl py-6 text-base font-semibold" asChild>
                <Link to="/contact">Contacter un expert</Link>
              </Button>
            </div>
            <div className="space-y-3 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">Zones desservies</p>
              <p className="text-sm text-primary-foreground/80">
                Paris & Île-de-France • France & Europe sur devis • Douanes et formalités gérées par notre équipe partenaire.
              </p>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary-foreground/80 transition-smooth hover:text-white"
              >
                <Linkedin className="h-4 w-4" /> Suivez nos actualités
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">Navigation</h4>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
              <li>
                <Link to="/" className="transition-smooth hover:text-white">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/expertises" className="transition-smooth hover:text-white">
                  Expertises
                </Link>
              </li>
              <li>
                <Link to="/tarifs" className="transition-smooth hover:text-white">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link to="/faq" className="transition-smooth hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-smooth hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">Services clés</h4>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
              <li>Transport médical & température dirigée</li>
              <li>Courses juridiques et confidentielles</li>
              <li>Livraisons optiques et retail premium</li>
              <li>Logistique événementielle sur-mesure</li>
              <li>Distribution B2B dernière minute</li>
            </ul>
          </div>
          <div className="space-y-4 text-sm text-primary-foreground/75">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">Coordonnées</h4>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" /> 123 Avenue de Paris, 75001 Paris, France
            </p>
            <p className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 flex-shrink-0" /> 01 23 45 67 89
            </p>
            <p className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" /> contact@oneconnexion.fr
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/15 pt-8 text-sm text-primary-foreground/60">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p>© {currentYear} One Connexion. Tous droits réservés.</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/mentions-legales" className="transition-smooth hover:text-white">
                Mentions légales
              </Link>
              <Link to="/cgv" className="transition-smooth hover:text-white">
                CGV
              </Link>
              <Link to="/cookies" className="transition-smooth hover:text-white">
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
