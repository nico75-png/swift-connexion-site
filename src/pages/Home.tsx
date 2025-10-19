import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Shield,
  Activity,
  Heart,
  Glasses,
  Scale,
  Package2,
  PartyPopper,
  ArrowRight,
  Star,
  CheckCircle2,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import heroCourier from "@/assets/hero-courier.jpg";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Home = () => {
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  const handleQuickEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple front-end calculation
    const basePrice = 35;
    setEstimatedPrice(basePrice);
  };

  const advantages = [
    {
      icon: Zap,
      title: "Rapidité garantie",
      description: "Livraison express en moins de 2h en Île-de-France",
    },
    {
      icon: Shield,
      title: "Sécurité maximale",
      description: "Colis assuré et suivi GPS en temps réel",
    },
    {
      icon: Activity,
      title: "Suivi en temps réel",
      description: "Tracez votre commande de l'enlèvement à la livraison",
    },
  ];

  const expertises = [
    {
      icon: Heart,
      title: "Santé & Médical",
      description: "Transport sécurisé de dispositifs médicaux et échantillons",
      color: "text-red-500",
    },
    {
      icon: Glasses,
      title: "Optique",
      description: "Livraison rapide de montures et verres correcteurs",
      color: "text-blue-500",
    },
    {
      icon: Scale,
      title: "Juridique",
      description: "Coursier spécialisé pour documents confidentiels",
      color: "text-amber-600",
    },
    {
      icon: Package2,
      title: "B2B Express",
      description: "Solutions sur-mesure pour entreprises",
      color: "text-green-600",
    },
    {
      icon: PartyPopper,
      title: "Événementiel",
      description: "Logistique événementielle rapide et fiable",
      color: "text-purple-600",
    },
  ];

  const pricingPlans = [
    {
      title: "Intra-Paris",
      subtitle: "Idéal pour vos livraisons urgentes intramuros",
      price: "25",
      frequency: "par course",
      description: "Jusqu'à 10 km inclus, puis 1,20 €/km",
      features: [
        "Enlèvement et livraison en 1 à 2 heures",
        "Suivi GPS temps réel & preuve de dépôt",
        "Assurance professionnelle incluse",
      ],
      primaryCta: { label: "Commander maintenant", href: "/connexion" },
      secondaryCta: { label: "Voir le détail des tarifs", href: "/tarifs" },
    },
    {
      title: "Petite Couronne Pro",
      subtitle: "Notre formule la plus demandée pour l'Île-de-France",
      badge: "Populaire",
      price: "35",
      frequency: "par course",
      description: "Jusqu'à 15 km inclus, puis 1,40 €/km",
      features: [
        "Livraison prioritaire sous 2 heures",
        "Gestion multi-destinations et retours",
        "Facturation mensuelle et comptes multiples",
        "Support coursier dédié 7j/7",
      ],
      primaryCta: { label: "Créer un compte gratuit", href: "/inscription" },
      secondaryCta: { label: "Parler à un expert", href: "/contact" },
      popular: true,
    },
    {
      title: "Grande Couronne+",
      subtitle: "Couverture élargie pour vos tournées et navettes",
      price: "45",
      frequency: "par course",
      description: "Jusqu'à 25 km inclus, puis 1,70 €/km",
      features: [
        "Livraison express ou programmée",
        "Prise en charge de colis volumineux",
        "Reporting d'activité personnalisé",
        "Gestion de tournées récurrentes",
      ],
      primaryCta: { label: "Demander un devis", href: "/contact" },
      secondaryCta: { label: "Consulter les options", href: "/tarifs" },
    },
  ];

  const testimonials = [
    {
      name: "Marie L.",
      company: "Laboratoire Médical",
      text: "Service impeccable ! Nos échantillons arrivent toujours à temps.",
      rating: 5,
    },
    {
      name: "Thomas D.",
      company: "Cabinet d'Avocats",
      text: "Ponctualité et discrétion. Parfait pour nos documents sensibles.",
      rating: 5,
    },
    {
      name: "Sophie M.",
      company: "Opticien",
      text: "Des tarifs transparents et un suivi en temps réel. Je recommande !",
      rating: 5,
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="mb-6">
                Livraison urgente et programmée en Île-de-France
              </h1>
              <p className="text-lg md:text-xl mb-8 text-primary-foreground/90">
                Transport B2B express pour professionnels : médical, juridique, optique et plus encore. 
                Tarifs transparents, sans devis obligatoire.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="cta" size="lg" asChild>
                  <Link to="/commande-sans-compte">Commander maintenant</Link>
                </Button>
                <Button variant="outline-light" size="lg" asChild>
                  <Link to="/tarifs">Voir les tarifs</Link>
                </Button>
              </div>
            </div>
            <div className="animate-scale-in">
              <img
                src={heroCourier}
                alt="Coursier professionnel One Connexion"
                className="rounded-2xl shadow-large w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => (
              <Card key={index} className="border-none shadow-medium hover:shadow-large transition-smooth">
                <CardContent className="p-6">
                  <advantage.icon className="h-12 w-12 text-secondary mb-4" />
                  <h3 className="mb-2">{advantage.title}</h3>
                  <p className="text-muted-foreground">{advantage.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Expertises Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Nos expertises sectorielles</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Des solutions de transport adaptées à chaque secteur professionnel
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expertises.map((expertise, index) => (
              <Card key={index} className="border-none shadow-soft hover:shadow-medium transition-smooth group cursor-pointer">
                <CardContent className="p-6">
                  <expertise.icon className={`h-10 w-10 mb-4 ${expertise.color} group-hover:scale-110 transition-smooth`} />
                  <h3 className="text-xl mb-2">{expertise.title}</h3>
                  <p className="text-muted-foreground mb-4">{expertise.description}</p>
                  <Link to="/expertises" className="text-primary font-semibold inline-flex items-center gap-1 hover:gap-2 transition-smooth">
                    En savoir plus <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="default" size="lg" asChild>
              <Link to="/expertises">Découvrir toutes nos expertises</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Des tarifs clairs, sans devis obligatoire</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tarification transparente basée sur la zone de livraison
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {pricingPlans.map((plan) => {
              const isPopular = plan.popular;
              return (
                <Card
                  key={plan.title}
                  className={cn(
                    "relative h-full overflow-hidden border-2 transition-smooth",
                    isPopular
                      ? "border-primary bg-primary text-primary-foreground shadow-large scale-[1.02]"
                      : "border-border bg-background hover:border-primary/70 hover:shadow-medium",
                  )}
                >
                  {plan.badge && (
                    <div className="absolute left-1/2 top-6 -translate-x-1/2">
                      <Badge
                        variant={isPopular ? "secondary" : "default"}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                          isPopular ? "bg-secondary text-secondary-foreground" : "bg-primary/10 text-primary",
                        )}
                      >
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  <CardContent className="flex h-full flex-col gap-6 p-8 text-left">
                    <div className="space-y-3 text-center">
                      <h3 className="text-2xl font-semibold">{plan.title}</h3>
                      <p
                        className={cn(
                          "text-sm",
                          isPopular ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {plan.subtitle}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-5xl font-bold">{plan.price}€</span>
                        <span className={cn("text-sm", isPopular ? "text-primary-foreground/80" : "text-muted-foreground")}>{plan.frequency}</span>
                      </div>
                      <p
                        className={cn(
                          "mt-2 text-sm",
                          isPopular ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {plan.description}
                      </p>
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className={cn(
                            "flex items-start gap-3 text-sm",
                            isPopular ? "text-primary-foreground" : "text-muted-foreground",
                          )}
                        >
                          <CheckCircle2
                            className={cn(
                              "mt-0.5 h-5 w-5",
                              isPopular ? "text-secondary" : "text-primary",
                            )}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto space-y-3">
                      <Button
                        variant={isPopular ? "secondary" : "default"}
                        size="lg"
                        className="w-full"
                        asChild
                      >
                        <Link to={plan.primaryCta.href}>{plan.primaryCta.label}</Link>
                      </Button>
                      <Button
                        variant={isPopular ? "outline-light" : "ghost"}
                        size="lg"
                        className={cn("w-full", isPopular ? "text-primary-foreground" : "")}
                        asChild
                      >
                        <Link to={plan.secondaryCta.href}>{plan.secondaryCta.label}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="text-center">
            <Button variant="secondary" size="lg" asChild>
              <Link to="/tarifs">Voir tous les tarifs et options</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Estimator */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-none shadow-large">
              <CardContent className="p-8">
                <h2 className="text-center mb-6">Estimez votre tarif en quelques clics</h2>
                <form onSubmit={handleQuickEstimate} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Type de transport</label>
                      <select className="w-full h-11 px-4 rounded-lg border border-input bg-background">
                        <option>Document</option>
                        <option>Colis léger (&lt;5kg)</option>
                        <option>Colis moyen (5-20kg)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Zone</label>
                      <select className="w-full h-11 px-4 rounded-lg border border-input bg-background">
                        <option>Intra-Paris</option>
                        <option>Petite Couronne</option>
                        <option>Grande Couronne</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="express" className="h-4 w-4" />
                    <label htmlFor="express" className="text-sm">Livraison express (+30%)</label>
                  </div>
                  <Button type="submit" variant="cta" size="lg" className="w-full">
                    Calculer le tarif
                  </Button>
                  {estimatedPrice && (
                    <div className="text-center p-4 bg-primary/10 rounded-lg animate-scale-in">
                      <p className="text-sm text-muted-foreground mb-1">Tarif estimé</p>
                      <p className="text-3xl font-bold text-primary">{estimatedPrice}€</p>
                      <p className="text-xs text-muted-foreground mt-2">Tarif indicatif, hors options</p>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center mb-12">Ils nous font confiance</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-none shadow-soft">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-cta text-cta" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6">Prêt à commander ?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Commencez dès maintenant ou créez un compte pour gérer toutes vos livraisons
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="cta" size="lg" asChild>
              <Link to="/commande-sans-compte">Commander une course</Link>
            </Button>
            <Button variant="outline-light" size="lg" asChild>
              <Link to="/inscription">Créer mon compte</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
