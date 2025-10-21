import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Glasses,
  Scale,
  Package2,
  PartyPopper,
  CheckCircle2,
  Stethoscope,
  Building2,
  Truck,
  Award,
  Sparkles,
  Briefcase,
} from "lucide-react";
import Layout from "@/components/layout/Layout";

const Expertises = () => {
  const heroBadges = [
    { icon: Stethoscope, label: "Santé & médical", emoji: "🩺" },
    { icon: Glasses, label: "Optique", emoji: "👓" },
    { icon: Scale, label: "Juridique", emoji: "⚖️" },
    { icon: Briefcase, label: "B2B & corporate", emoji: "🤝" },
    { icon: PartyPopper, label: "Événementiel", emoji: "🎉" },
  ];

  const expertises = [
    {
      icon: Heart,
      title: "Santé & Médical",
      color: "text-red-500",
      bg: "bg-red-50",
      description: "Transport sécurisé et rapide pour le secteur médical",
      engagements: [
        "Respect de la chaîne du froid pour échantillons biologiques",
        "Coursiers formés aux normes sanitaires",
        "Emballage sécurisé adapté aux dispositifs médicaux",
        "Livraison prioritaire pour urgences médicales",
        "Traçabilité complète conforme aux réglementations",
      ],
      examples: [
        "Livraison d'analyses médicales entre laboratoires",
        "Transport de prothèses et dispositifs médicaux",
        "Acheminement urgent de médicaments",
        "Distribution d'échantillons biologiques",
      ],
    },
    {
      icon: Glasses,
      title: "Optique",
      color: "text-blue-500",
      bg: "bg-blue-50",
      description: "Solutions dédiées aux professionnels de l'optique",
      engagements: [
        "Emballage anti-choc pour montures et verres",
        "Livraison express pour satisfaction client",
        "Gestion des retours atelier",
        "Service de coursier dédié entre magasins",
        "Suivi précis pour articles de valeur",
      ],
      examples: [
        "Transport montures entre fournisseurs et magasins",
        "Livraison de verres correcteurs chez le client final",
        "Acheminement de commandes spéciales",
        "Retours SAV vers ateliers de montage",
      ],
    },
    {
      icon: Scale,
      title: "Juridique",
      color: "text-amber-600",
      bg: "bg-amber-50",
      description: "Coursier spécialisé pour documents confidentiels",
      engagements: [
        "Confidentialité absolue garantie",
        "Remise en main propre avec émargement",
        "Respect strict des délais légaux",
        "Coursiers formés au secret professionnel",
        "Preuve de livraison horodatée",
      ],
      examples: [
        "Dépôt de dossiers aux tribunaux",
        "Signification d'actes juridiques",
        "Transport de documents entre cabinets",
        "Remise de contrats signés",
      ],
    },
    {
      icon: Package2,
      title: "B2B Express",
      color: "text-green-600",
      bg: "bg-green-50",
      description: "Solutions sur-mesure pour entreprises",
      engagements: [
        "Service dédié avec coursier attitré possible",
        "Tarifs dégressifs pour volumes importants",
        "Facturation mensuelle simplifiée",
        "Enlèvements programmés réguliers",
        "Interface de gestion en ligne",
      ],
      examples: [
        "Navettes régulières entre sites",
        "Distribution de pièces détachées urgentes",
        "Livraison de prototypes et échantillons",
        "Transport de documents administratifs",
      ],
    },
    {
      icon: PartyPopper,
      title: "Événementiel",
      color: "text-purple-600",
      bg: "bg-purple-50",
      description: "Logistique événementielle rapide et fiable",
      engagements: [
        "Disponibilité 7j/7 y compris jours fériés",
        "Coordination multi-points de livraison",
        "Équipes renforcées pour grands événements",
        "Gestion des imprévus en temps réel",
        "Service premium pour VIP",
      ],
      examples: [
        "Livraison de matériel événementiel",
        "Transport d'objets de valeur (œuvres d'art, bijoux)",
        "Acheminement urgent de cadeaux VIP",
        "Logistique soirées et conférences",
      ],
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#0f2f63] py-20 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2f63] via-[#132c73] to-[#081a45]" />
        <div className="absolute inset-0 opacity-20">
          <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-center px-6">
            <div className="grid w-full max-w-3xl grid-cols-3 gap-6 text-6xl md:text-7xl">
              {heroBadges.map((badge, index) => (
                <span
                  key={index}
                  className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/5 shadow-lg shadow-black/10 backdrop-blur"
                >
                  {badge.emoji}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute inset-0">
          <div className="pointer-events-none absolute -left-10 top-10 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-10 h-56 w-56 rounded-full bg-[#4b8bff]/20 blur-3xl" />
        </div>
        <div className="relative">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid w-full max-w-md gap-4">
              {heroBadges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-soft backdrop-blur"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 text-3xl">
                    {badge.emoji}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm uppercase tracking-widest text-white/70">{badge.label}</span>
                    <badge.icon className="mt-1 h-6 w-6 text-white" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="mb-5 flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                <Sparkles className="h-4 w-4" />
                Expertises sectorielles
              </div>
              <h1 className="mb-4 text-3xl font-semibold md:text-5xl">Nos expertises sectorielles</h1>
              <p className="max-w-2xl text-lg text-white/80 md:text-xl">
                Des solutions de transport adaptées à chaque métier, avec des engagements spécifiques et un savoir-faire reconnu.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <Button asChild size="lg" variant="secondary" className="bg-white text-[#0f2f63] hover:bg-white/90">
                  <Link to="/contact">Demander un devis</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/60 text-white hover:bg-white/10">
                  <Link to="/commander">Commander une course</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertises Sections */}
      <div className="py-16">
        {expertises.map((expertise, index) => (
          <section
            key={index}
            className={index % 2 === 0 ? "py-12" : "py-12 bg-muted/30"}
          >
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`p-4 rounded-2xl ${expertise.bg}`}>
                    <expertise.icon className={`h-12 w-12 ${expertise.color}`} />
                  </div>
                  <div>
                    <h2 className="mb-2">{expertise.title}</h2>
                    <p className="text-lg text-muted-foreground">{expertise.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <Card className="border-none shadow-soft">
                    <CardContent className="p-6">
                      <h3 className="text-xl mb-4">Nos engagements</h3>
                      <ul className="space-y-3">
                        {expertise.engagements.map((engagement, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{engagement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-soft">
                    <CardContent className="p-6">
                      <h3 className="text-xl mb-4">Cas d'usage concrets</h3>
                      <ul className="space-y-3">
                        {expertise.examples.map((example, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <div className={`h-2 w-2 rounded-full ${expertise.bg} ${expertise.color} flex-shrink-0 mt-2`} />
                            <span className="text-sm text-muted-foreground">{example}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="cta" size="lg" asChild>
                    <Link to="/commande-sans-compte">Commander pour ce secteur</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/tarifs">Estimer un tarif</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Final CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6">Votre secteur n'est pas listé ?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Contactez-nous pour discuter de vos besoins spécifiques. Nous adaptons nos services à votre activité.
          </p>
          <Button variant="cta" size="lg" asChild>
            <Link to="/contact">Nous contacter</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Expertises;
