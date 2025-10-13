import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Shield, Activity, Heart, Glasses, Scale, Package2, PartyPopper, ArrowRight, Star } from "lucide-react";
import Layout from "@/components/layout/Layout";
import heroCourier from "@/assets/hero-courier.jpg";
import { useState } from "react";

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

  const pricingCards = [
    {
      sector: "Intra-Paris",
      price: "25",
      features: ["Livraison en 1-2h", "Suivi GPS", "Assurance incluse"],
    },
    {
      sector: "Petite Couronne",
      price: "35",
      features: ["Livraison en 2-3h", "Suivi GPS", "Assurance incluse"],
    },
    {
      sector: "Grande Couronne",
      price: "45",
      features: ["Livraison en 3-4h", "Suivi GPS", "Assurance incluse"],
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
            {pricingCards.map((card, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-smooth">
                <CardContent className="p-6 text-center">
                  <h3 className="text-2xl mb-2">{card.sector}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-primary">À partir de {card.price}€</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {card.features.map((feature, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
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
