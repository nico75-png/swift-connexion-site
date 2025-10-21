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
  Briefcase,
} from "lucide-react";
import Layout from "@/components/layout/Layout";

const Expertises = () => {
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
      <section className="bg-white">
        <img
          src="/images/expertises-banner.svg"
          alt="Nos expertises sectorielles"
          className="mx-auto w-full max-w-6xl"
        />
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
