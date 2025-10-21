import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, Activity, Heart, Glasses, Scale, Package2, PartyPopper, ArrowRight, Star, CheckCircle2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import heroCourier from "@/assets/hero-courier.jpg";
import { useState } from "react";
import { cn } from "@/lib/utils";
const Home = () => {
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const handleQuickEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple front-end calculation
    const basePrice = 20;
    setEstimatedPrice(basePrice);
  };
  const heroHighlights = ["Service professionnel 24/7", "Coursiers dédiés et assurés", "Suivi en temps réel de vos colis"];
  const advantages = [{
    icon: Zap,
    title: "Rapidité garantie",
    description: "Livraison express en moins de 2h en Île-de-France"
  }, {
    icon: Shield,
    title: "Sécurité maximale",
    description: "Colis assuré et suivi GPS en temps réel"
  }, {
    icon: Activity,
    title: "Suivi en temps réel",
    description: "Tracez votre commande de l'enlèvement à la livraison"
  }];
  const expertises = [{
    icon: Heart,
    title: "Santé & Médical",
    description: "Transport sécurisé de dispositifs médicaux et échantillons",
    color: "text-red-500"
  }, {
    icon: Glasses,
    title: "Optique",
    description: "Livraison rapide de montures et verres correcteurs",
    color: "text-blue-500"
  }, {
    icon: Scale,
    title: "Juridique",
    description: "Coursier spécialisé pour documents confidentiels",
    color: "text-amber-600"
  }, {
    icon: Package2,
    title: "B2B Express",
    description: "Solutions sur-mesure pour entreprises",
    color: "text-green-600"
  }, {
    icon: PartyPopper,
    title: "Événementiel",
    description: "Logistique événementielle rapide et fiable",
    color: "text-purple-600"
  }];
  const pricingPlans = [{
    title: "Standard",
    description: "Pour vos livraisons programmées du quotidien.",
    price: "20",
    currency: "€",
    frequency: "forfait 0 à 10 km",
    featuresLabel: "INCLUS",
    featuresIntro: "Comprend notamment :",
    features: ["20 € pour la tranche 0 à 10 km", "1,50 € par kilomètre supplémentaire", "Délai maximum de 3 heures", "Assurance colis et suivi en temps réel"],
    primaryCta: {
      label: "Commander",
      href: "/inscription"
    },
    secondaryCta: {
      label: "Contacter un expert",
      href: "/contact"
    }
  }, {
    title: "Express",
    description: "La solution rapide pour vos urgences professionnelles.",
    badge: "Populaire",
    price: "26",
    currency: "€",
    frequency: "forfait 0 à 10 km",
    featuresLabel: "INCLUS",
    featuresIntro: "Idéal quand chaque minute compte :",
    features: ["26 € pour la tranche 0 à 10 km", "1,70 € par kilomètre supplémentaire", "Délai garanti sous 2 heures", "Support prioritaire dédié"],
    primaryCta: {
      label: "Commander",
      href: "/inscription"
    },
    secondaryCta: {
      label: "Contacter un expert",
      href: "/contact"
    },
    popular: true
  }, {
    title: "Flash Express",
    description: "Notre service le plus rapide pour les livraisons critiques.",
    price: "32",
    currency: "€",
    frequency: "forfait 0 à 10 km",
    featuresLabel: "INCLUS",
    featuresIntro: "Performance maximale :",
    features: ["32 € pour la tranche 0 à 10 km", "2,00 € par kilomètre supplémentaire", "Délai record de 45 minutes", "Coursier dédié et suivi premium"],
    primaryCta: {
      label: "Commander",
      href: "/inscription"
    },
    secondaryCta: {
      label: "Contacter un expert",
      href: "/contact"
    }
  }];
  const testimonials = [{
    name: "Marie L.",
    company: "Laboratoire Médical",
    text: "Service impeccable ! Nos échantillons arrivent toujours à temps.",
    rating: 5
  }, {
    name: "Thomas D.",
    company: "Cabinet d'Avocats",
    text: "Ponctualité et discrétion. Parfait pour nos documents sensibles.",
    rating: 5
  }, {
    name: "Sophie M.",
    company: "Opticien",
    text: "Des tarifs transparents et un suivi en temps réel. Je recommande !",
    rating: 5
  }];
  return <Layout>
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center overflow-hidden text-white md:h-screen">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=2400&q=80" alt="Vue aérienne de Paris au coucher du soleil" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-900/60" />
        </div>
        <div className="relative z-10 flex w-full flex-col gap-12 px-6 py-16 md:h-full md:flex-row md:items-center md:justify-between md:gap-16 md:px-12">
          <div className="max-w-3xl space-y-6 rounded-3xl bg-slate-950/40 p-8 backdrop-blur-sm md:max-w-xl lg:max-w-3xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium uppercase tracking-[0.35em]">
              <span className="h-2 w-2 rounded-full bg-cta shadow-[0_0_12px_theme(colors.amber.400/0.8)]" />
              One Connexion Express
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
                Livraison urgente et programmée en Île-de-France
              </h1>
              <p className="text-lg text-white/80 md:text-xl">
                Service professionnel 24/7 pour vos colis urgents. Tarifs transparents, suivi en temps réel et prise en charge immédiate par nos coursiers dédiés.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button variant="cta" size="lg" asChild>
                <Link to="/commande-sans-compte">Commander maintenant</Link>
              </Button>
              <Button variant="outline-light" size="lg" className="border-white/30 text-white hover:border-white hover:text-[#0b2d63]" asChild>
                <Link to="/tarifs">Voir les tarifs</Link>
              </Button>
            </div>
            <div className="space-y-3 text-base text-white/80">
              {heroHighlights.map(highlight => <div key={highlight} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-cta" />
                  <span>{highlight}</span>
                </div>)}
            </div>
          </div>
          <div className="relative w-full max-w-xl self-stretch md:max-w-md lg:max-w-lg">
            
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => <Card key={index} className="border-none shadow-medium hover:shadow-large transition-smooth">
                <CardContent className="p-6">
                  <advantage.icon className="h-12 w-12 text-secondary mb-4" />
                  <h3 className="mb-2">{advantage.title}</h3>
                  <p className="text-muted-foreground">{advantage.description}</p>
                </CardContent>
              </Card>)}
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
            {expertises.map((expertise, index) => <Card key={index} className="border-none shadow-soft hover:shadow-medium transition-smooth group cursor-pointer">
                <CardContent className="p-6">
                  <expertise.icon className={`h-10 w-10 mb-4 ${expertise.color} group-hover:scale-110 transition-smooth`} />
                  <h3 className="text-xl mb-2">{expertise.title}</h3>
                  <p className="text-muted-foreground mb-4">{expertise.description}</p>
                  <Link to="/expertises" className="text-primary font-semibold inline-flex items-center gap-1 hover:gap-2 transition-smooth">
                    En savoir plus <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>)}
          </div>
          <div className="text-center mt-8">
            <Button variant="default" size="lg" asChild>
              <Link to="/expertises">Découvrir toutes nos expertises</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Des tarifs clairs, sans devis obligatoire</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tarification transparente basée sur la zone de livraison
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {pricingPlans.map(plan => {
            const isPopular = plan.popular;
            return <Card key={plan.title} className={cn("relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-1 shadow-soft transition-all hover:shadow-large", isPopular && "border-transparent bg-slate-950 text-white shadow-2xl hover:shadow-2xl")}>
                  {plan.badge && <div className="absolute left-1/2 top-6 -translate-x-1/2">
                      <Badge className={cn("rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide", isPopular ? "bg-emerald-400 text-slate-950" : "bg-slate-900/5 text-slate-900")}>
                        {plan.badge}
                      </Badge>
                    </div>}
                  <CardContent className={cn("flex h-full flex-col gap-8 rounded-[22px] bg-white p-10 pt-14 text-left", isPopular && "bg-transparent")}>
                    <div className="space-y-4 text-center">
                      <h3 className="text-2xl font-semibold tracking-tight">{plan.title}</h3>
                      <p className={cn("text-sm text-muted-foreground", isPopular && "text-white/80")}>
                        {plan.description}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-5xl font-bold">
                          {plan.currency}
                          {plan.price}
                        </span>
                        <span className={cn("text-sm text-muted-foreground", isPopular && "text-white/80")}>
                          {plan.frequency}
                        </span>
                      </div>
                    </div>
                    <div className={cn("rounded-2xl bg-slate-100/60 p-6 text-left", isPopular && "bg-white/5")}>
                      <p className={cn("text-xs font-semibold tracking-[0.3em] text-slate-500", isPopular && "text-white/70")}>
                        {plan.featuresLabel}
                      </p>
                      <p className={cn("mt-3 text-sm font-medium text-slate-700", isPopular && "text-white")}>
                        {plan.featuresIntro}
                      </p>
                      <ul className="mt-4 space-y-3">
                        {plan.features.map(feature => <li key={feature} className={cn("flex items-start gap-3 text-sm text-slate-600", isPopular && "text-white/80")}>
                            <CheckCircle2 className={cn("mt-0.5 h-5 w-5 flex-shrink-0", isPopular ? "text-emerald-400" : "text-emerald-500")} />
                            <span>{feature}</span>
                          </li>)}
                      </ul>
                    </div>
                    <div className="mt-auto space-y-3">
                      <Button size="lg" className={cn("w-full rounded-xl bg-emerald-400 text-slate-950 shadow-md hover:bg-emerald-300", isPopular && "shadow-lg")} asChild>
                        <Link to={plan.primaryCta.href}>{plan.primaryCta.label}</Link>
                      </Button>
                      <Button variant="ghost" size="lg" className={cn("w-full rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900", isPopular && "border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white")} asChild>
                        <Link to={plan.secondaryCta.href}>{plan.secondaryCta.label}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>;
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
                  {estimatedPrice && <div className="text-center p-4 bg-primary/10 rounded-lg animate-scale-in">
                      <p className="text-sm text-muted-foreground mb-1">Tarif estimé</p>
                      <p className="text-3xl font-bold text-primary">{estimatedPrice}€</p>
                      <p className="text-xs text-muted-foreground mt-2">Tarif indicatif, hors options</p>
                    </div>}
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
            {testimonials.map((testimonial, index) => <Card key={index} className="border-none shadow-soft">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-5 w-5 fill-cta text-cta" />)}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>)}
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
    </Layout>;
};
export default Home;