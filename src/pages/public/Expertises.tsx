import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Gem,
  Heart,
  Mic,
  Scale,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const SLUG_TO_SECTION: Record<string, string> = {
  sante: "sante-medical",
  juridique: "juridique-administratif",
  evenementiel: "evenementiel-media",
  industrie: "industrie-services-proximite",
};

const expertisesSections = [
  {
    id: "sante-medical",
    badgeColor: "from-blue-500 to-purple-600",
    icon: Heart,
    title: "Santé & Médical",
    description: "Transport sécurisé et rapide pour le secteur médical",
    engagements: [
      "Respect de la chaîne du froid pour échantillons biologiques",
      "Coursiers formés aux normes sanitaires",
      "Emballage sécurisé adapté aux dispositifs médicaux",
      "Livraison prioritaire pour urgences médicales",
      "Traçabilité complète conforme aux réglementations",
    ],
    useCases: [
      "Livraison d'analyses médicales entre laboratoires",
      "Transport de prothèses et dispositifs médicaux",
      "Acheminement urgent de médicaments",
      "Distribution d'échantillons biologiques",
    ],
    image: {
      src: "http://static.photos/medical/640x360/1",
      alt: "Transport médical",
    },
    checkColor: "text-green-500",
    arrowColor: "text-blue-500",
  },
  {
    id: "juridique-administratif",
    badgeColor: "from-slate-600 to-slate-800",
    icon: Scale,
    title: "Juridique & Administratif",
    description: "Transport sécurisé et confidentiel pour le secteur juridique",
    engagements: [
      "Confidentialité totale et remise contre signature",
      "Traçabilité GPS et preuve de dépôt horodatée",
      "Transport sécurisé de documents et supports numériques",
      "Gestion express des aller-retours pour signature",
      "Discrétion renforcée pour dossiers sensibles",
    ],
    useCases: [
      "Transport urgent de dossiers juridiques",
      "Envoi de scellés et pièces confidentielles",
      "Dépôt de contrats à signer en express",
      "Livraison sécurisée de clés, badges et preuves matérielles",
    ],
    image: {
      src: "http://static.photos/legal/640x360/1",
      alt: "Transport juridique et administratif",
    },
    checkColor: "text-green-500",
    arrowColor: "text-slate-500",
  },
  {
    id: "evenementiel-media",
    badgeColor: "from-rose-500 to-purple-600",
    icon: Mic,
    title: "Événementiel & Média",
    description: "Livraison express pour l'événementiel et les médias",
    engagements: [
      "Ponctualité garantie sur horaires de montage",
      "Gestion des urgences techniques dernière minute",
      "Livraison sur site, backstage ou régie",
      "Transport sécurisé de matériel fragile",
      "Flexibilité soir / nuit / week-end",
    ],
    useCases: [
      "Livraison de matériel audiovisuel sur événement",
      "Acheminement de PLV, kits d'accueil et badges",
      "Urgence technique pendant montage ou répétition",
      "Transport de décors ou éléments scéniques",
    ],
    image: {
      src: "http://static.photos/event/640x360/5",
      alt: "Logistique événementielle et médias",
    },
    checkColor: "text-green-500",
    arrowColor: "text-rose-500",
  },
  {
    id: "retail-luxe-ecommerce",
    badgeColor: "from-amber-500 to-emerald-600",
    icon: Gem,
    title: "Retail, Luxe & E-commerce",
    description: "Transport premium pour le retail, le luxe et l'e-commerce",
    engagements: [
      "Emballage protégé et transport sans choc",
      "Discrétion et haute exigence pour produits sensibles",
      "Suivi en temps réel côté boutique ou client final",
      "Process premium pour clients VIP",
      "Gestion express des échanges entre boutiques",
    ],
    useCases: [
      "Livraison de produits en boutique",
      "Transport d'échantillons et pièces de collection",
      "Retours e-commerce express",
      "Navette urgente entre magasins",
    ],
    image: {
      src: "http://static.photos/luxury/640x360/2",
      alt: "Transport premium retail et luxe",
    },
    checkColor: "text-green-500",
    arrowColor: "text-emerald-500",
  },
  {
    id: "industrie-services-proximite",
    badgeColor: "from-indigo-600 to-blue-700",
    icon: Wrench,
    title: "Industrie & Services de Proximité",
    description: "Transport express pour l'industrie et les services de proximité",
    engagements: [
      "Réduction maximale du temps d'arrêt opérationnel",
      "Transport robuste pour matériel et pièces techniques",
      "Livraison sur site industriel ou corporate",
      "Prise en charge des artisans (clés, outils, pièces)",
      "Suivi complet et preuve de dépôt",
    ],
    useCases: [
      "Livraison urgente de pièces détachées",
      "Transport d'outillage ou matériel IT",
      "Courses pour serruriers (clés, badges)",
      "Livraison d'articles de cordonnerie aux clients",
    ],
    image: {
      src: "http://static.photos/industry/640x360/3",
      alt: "Transport pour industrie et services de proximité",
    },
    checkColor: "text-green-500",
    arrowColor: "text-blue-500",
  },
];

const Expertises = () => {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const hash = location.hash?.replace("#", "") ?? "";
    const targetId = hash || (slug ? SLUG_TO_SECTION[slug] : "");

    if (!targetId) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);

    return () => window.clearTimeout(timeout);
  }, [location.hash, slug]);

  return (
    <Layout>
      <div className="bg-gray-50">
        <section
          id="expertises"
          className="bg-gradient-to-r from-blue-50 to-purple-50 py-16 sm:py-20"
        >
          <div className="container mx-auto px-4">
            <header className="mx-auto max-w-4xl rounded-3xl border border-blue-200 bg-white/70 p-8 text-center shadow-xl backdrop-blur">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Nos expertises sectorielles
              </h1>
              <p className="mt-6 text-lg text-gray-600 sm:text-xl">
                Des solutions de transport adaptées à chaque métier, avec des engagements spécifiques et un savoir-faire reconnu.
              </p>
              <div className="mt-8 flex flex-col gap-4 text-sm font-medium text-gray-600 sm:flex-row sm:items-center sm:justify-center sm:text-base">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  <span>Expertise sectorielle</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  <span>Sécurité garantie</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-purple-600">
                  <Clock3 className="h-5 w-5" aria-hidden="true" />
                  <span>Rapidité d'exécution</span>
                </div>
              </div>
            </header>

            <div className="mt-20 space-y-20">
              {expertisesSections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <article
                    id={section.id}
                    key={section.id}
                    className="grid gap-12 rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur md:grid-cols-2 md:items-center lg:p-10"
                  >
                    <div className={cn("space-y-6", index % 2 === 1 ? "md:order-2" : "")}
                    >
                      <div
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-6 py-3 text-sm font-semibold text-white",
                          section.badgeColor
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                        <span>{section.title}</span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        {section.description}
                      </h2>

                      <Link
                        to="#"
                        className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        Commander pour ce secteur
                      </Link>

                      <div className="grid gap-8 md:grid-cols-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Nos engagements
                          </h3>
                          <ul className="mt-4 space-y-3 text-sm text-gray-600">
                            {section.engagements.map((item) => (
                              <li key={item} className="flex items-start gap-3">
                                <CheckCircle2
                                  className={cn(
                                    "mt-1 h-5 w-5 flex-shrink-0",
                                    section.checkColor
                                  )}
                                  aria-hidden="true"
                                />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Cas d'usage concrets
                          </h3>
                          <ul className="mt-4 space-y-3 text-sm text-gray-600">
                            {section.useCases.map((item) => (
                              <li key={item} className="flex items-start gap-3">
                                <ArrowRight
                                  className={cn(
                                    "mt-1 h-5 w-5 flex-shrink-0",
                                    section.arrowColor
                                  )}
                                  aria-hidden="true"
                                />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <figure
                      className={cn(
                        "overflow-hidden rounded-2xl shadow-2xl",
                        index % 2 === 1 ? "md:order-1" : ""
                      )}
                    >
                      <img
                        src={section.image.src}
                        alt={section.image.alt}
                        className="h-72 w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </figure>
                  </article>
                );
              })}
            </div>

            <section className="mt-24 rounded-3xl bg-gradient-to-r from-indigo-100 to-purple-100 p-8 text-center shadow-xl sm:p-12">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Solutions sur-mesure pour entreprises
              </h2>
              <div className="mt-10 grid gap-10 text-left md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Nos engagements
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-indigo-500" />
                      <span>Service dédié avec coursier attitré possible</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-indigo-500" />
                      <span>Tarifs dégressifs pour volumes importants</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-indigo-500" />
                      <span>Facturation mensuelle simplifiée</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-indigo-500" />
                      <span>Enlèvements programmés réguliers</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-indigo-500" />
                      <span>Interface de gestion en ligne</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Cas d'usage concrets
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-3">
                      <ArrowRight className="mt-1 h-5 w-5 flex-shrink-0 text-indigo-500" />
                      <span>Navettes régulières entre sites</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ArrowRight className="mt-1 h-5 w-5 flex-shrink-0 text-indigo-500" />
                      <span>Distribution de pièces détachées urgentes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ArrowRight className="mt-1 h-5 w-5 flex-shrink-0 text-indigo-500" />
                      <span>Livraison de prototypes et échantillons</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ArrowRight className="mt-1 h-5 w-5 flex-shrink-0 text-indigo-500" />
                      <span>Transport de documents administratifs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </section>
        <section className="bg-primary-dark text-primary-foreground">
          <div className="container mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-16 text-center sm:gap-8">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Votre secteur n'est pas listé ?
            </h2>
            <p className="text-base text-primary-foreground/90 sm:text-lg">
              Contactez-nous pour discuter de vos besoins spécifiques. Nous adaptons nos services à votre activité.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground/80"
            >
              Nous contacter
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Expertises;
