import Layout from "@/components/layout/Layout";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Heart,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

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
    id: "optique",
    badgeColor: "from-purple-500 to-pink-600",
    icon: Eye,
    title: "Optique",
    description: "Solutions dédiées aux professionnels de l'optique",
    engagements: [
      "Emballage anti-choc pour montures et verres",
      "Livraison express pour satisfaction client",
      "Gestion des retours atelier",
      "Service de coursier dédié entre magasins",
      "Suivi précis pour articles de valeur",
    ],
    useCases: [
      "Transport montures entre fournisseurs et magasins",
      "Livraison de verres correcteurs chez le client final",
      "Acheminement de commandes spéciales",
      "Retours SAV vers ateliers de montage",
    ],
    image: {
      src: "http://static.photos/workspace/640x360/2",
      alt: "Transport optique",
    },
    checkColor: "text-green-500",
    arrowColor: "text-purple-500",
  },
  {
    id: "juridique",
    badgeColor: "from-gray-700 to-gray-900",
    icon: FileText,
    title: "Juridique",
    description: "Coursier spécialisé pour documents confidentiels",
    engagements: [
      "Confidentialité absolue garantie",
      "Remise en main propre avec émargement",
      "Respect strict des délais légaux",
      "Coursiers formés au secret professionnel",
      "Preuve de livraison horodatée",
    ],
    useCases: [
      "Dépôt de dossiers aux tribunaux",
      "Signification d'actes juridiques",
      "Transport de documents entre cabinets",
      "Remise de contrats signés",
    ],
    image: {
      src: "http://static.photos/legal/640x360/3",
      alt: "Transport juridique",
    },
    checkColor: "text-green-500",
    arrowColor: "text-gray-600",
  },
  {
    id: "evenementiel",
    badgeColor: "from-yellow-500 to-orange-600",
    icon: Calendar,
    title: "Événementiel",
    description: "Logistique événementielle rapide et fiable",
    engagements: [
      "Disponibilité 7j/7 y compris jours fériés",
      "Coordination multi-points de livraison",
      "Équipes renforcées pour grands événements",
      "Gestion des imprévus en temps réel",
      "Service premium pour VIP",
    ],
    useCases: [
      "Livraison de matériel événementiel",
      "Transport d'objets de valeur (œuvres d'art, bijoux)",
      "Acheminement urgent de cadeaux VIP",
      "Logistique soirées et conférences",
    ],
    image: {
      src: "http://static.photos/event/640x360/4",
      alt: "Transport événementiel",
    },
    checkColor: "text-green-500",
    arrowColor: "text-orange-500",
  },
];

const Expertises = () => {
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
