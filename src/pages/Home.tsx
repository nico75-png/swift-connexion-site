import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Heart,
  Glasses,
  Scale,
  Package2,
  PartyPopper,
  ArrowRight,
  Star,
  CheckCircle2,
  Clock4,
  MapPinned,
  Sparkle,
  PhoneCall,
  ClipboardCheck,
  Truck,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import heroCourier from "@/assets/hero-courier.jpg";
import { cn } from "@/lib/utils";

const Home = () => {
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  const handleQuickEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    const basePrice = 20;
    setEstimatedPrice(basePrice);
  };

  const metrics = [
    { value: "250+", label: "Livraisons quotidiennes" },
    { value: "98%", label: "Satisfaction clients" },
    { value: "45 min", label: "Temps d'intervention moyen" },
    { value: "24/7", label: "Opérations en continu" },
  ];

  const servicePillars = [
    {
      icon: ShieldCheck,
      title: "Fiabilité certifiée",
      description: "Coursiers salariés, procédures qualité et assurance systématique pour chaque course.",
      bullets: ["Suivi GPS temps réel", "Contrôle qualité multi-niveaux"],
    },
    {
      icon: Clock4,
      title: "Réactivité immédiate",
      description: "Un coordinateur dédié répond en moins de 2 minutes et lance votre mission express.",
      bullets: ["Dispatch intelligent", "Hotline premium 24/7"],
    },
    {
      icon: MapPinned,
      title: "Couverture étendue",
      description: "Île-de-France, France et Europe : réseau sécurisé pour vos flux urgents ou programmés.",
      bullets: ["Partenaires contrôlés", "Douanes et formalités gérées"],
    },
  ];

  const expertises = [
    {
      icon: Heart,
      title: "Santé & Médical",
      description: "Transport d'échantillons, dispositifs et produits sensibles",
      color: "text-red-500",
    },
    {
      icon: Glasses,
      title: "Optique & Luxe",
      description: "Livraison premium pour maisons et enseignes haut de gamme",
      color: "text-blue-500",
    },
    {
      icon: Scale,
      title: "Juridique",
      description: "Acheminement sécurisé de dossiers et actes confidentiels",
      color: "text-amber-600",
    },
    {
      icon: Package2,
      title: "B2B Express",
      description: "Solutions sur-mesure pour chaînes d'approvisionnement et retail",
      color: "text-green-600",
    },
    {
      icon: PartyPopper,
      title: "Événementiel",
      description: "Logistique événementielle et opérations de dernière minute",
      color: "text-purple-600",
    },
  ];

  const pricingPlans = [
    {
      title: "Standard",
      description: "Idéal pour vos livraisons planifiées du quotidien.",
      price: "20",
      currency: "€",
      frequency: "0 à 10 km",
      featuresLabel: "Inclus",
      featuresIntro: "Pour des flux réguliers maîtrisés :",
      features: [
        "20 € la première tranche",
        "1,50 € / km au-delà",
        "Délai garanti sous 3 h",
        "Assurance colis + suivi temps réel",
      ],
      primaryCta: { label: "Commander", href: "/inscription" },
      secondaryCta: { label: "Parler à un expert", href: "/contact" },
    },
    {
      title: "Express",
      description: "La solution prioritaire pour vos urgences critiques.",
      badge: "Populaire",
      price: "26",
      currency: "€",
      frequency: "0 à 10 km",
      featuresLabel: "Inclus",
      featuresIntro: "Quand chaque minute compte :",
      features: [
        "26 € la première tranche",
        "1,70 € / km au-delà",
        "Sous 2 h garanties",
        "Support dédié 24/7",
      ],
      primaryCta: { label: "Commander", href: "/inscription" },
      secondaryCta: { label: "Planifier un call", href: "/contact" },
      popular: true,
    },
    {
      title: "Flash Express",
      description: "Notre équipe d'intervention ultra-rapide pour livraisons critiques.",
      price: "32",
      currency: "€",
      frequency: "0 à 10 km",
      featuresLabel: "Inclus",
      featuresIntro: "Performance maximale :",
      features: [
        "32 € la première tranche",
        "2,00 € / km au-delà",
        "Coursier dédié en 45 min",
        "Livraison directe et sécurisée",
      ],
      primaryCta: { label: "Commander", href: "/inscription" },
      secondaryCta: { label: "Découvrir les options", href: "/contact" },
    },
  ];

  const testimonials = [
    {
      name: "Marie L.",
      company: "Laboratoire médical parisien",
      text: "Service impeccable ! Nos échantillons arrivent toujours à temps, même la nuit.",
      rating: 5,
    },
    {
      name: "Thomas D.",
      company: "Cabinet d'avocats",
      text: "Ponctualité et discrétion. Nos actes sont remis en mains propres en quelques heures.",
      rating: 5,
    },
    {
      name: "Sophie M.",
      company: "Maison d'optique",
      text: "Des tarifs transparents, un suivi précis et une équipe proactive : un partenaire fiable !",
      rating: 5,
    },
  ];

  const processSteps = [
    {
      icon: PhoneCall,
      title: "Brief & lancement",
      description: "Nous analysons votre besoin, valider les contraintes et engageons immédiatement la mission.",
    },
    {
      icon: ClipboardCheck,
      title: "Préparation & sécurisation",
      description: "Assignation du coursier, contrôle des documents et préparation des bordereaux.",
    },
    {
      icon: Truck,
      title: "Enlèvement & suivi",
      description: "Notification en temps réel, tracking GPS et hotline pro-active sur chaque étape.",
    },
    {
      icon: Sparkle,
      title: "Preuve & reporting",
      description: "Preuves de livraison immédiates, reporting et analyse de performance mensuelle.",
    },
  ];

  return (
    <Layout>
      <section className="relative overflow-hidden">
        <div className="gradient-hero">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative container mx-auto px-4 pb-20 pt-24 md:pb-28">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr,0.95fr]">
              <div className="space-y-8 text-primary-foreground">
                <Badge className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/90">
                  Votre coursier partenaire Île-de-France & Europe
                </Badge>
                <h1 className="text-4xl leading-tight md:text-5xl lg:text-6xl">
                  Livraison express haut de gamme pour professionnels exigeants
                </h1>
                <p className="max-w-xl text-lg text-white/80 md:text-xl">
                  Solutions de transport sur-mesure, suivi en temps réel et accompagnement humain dédié pour vos flux urgents et sensibles.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button variant="cta" size="lg" className="rounded-full px-10" asChild>
                    <Link to="/commande-sans-compte">Commander une course</Link>
                  </Button>
                  <Button
                    variant="outline-light"
                    size="lg"
                    className="rounded-full border-white/40 bg-white/10 px-10"
                    asChild
                  >
                    <Link to="/tarifs">Consulter nos offres</Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -right-10 -top-10 hidden h-32 w-32 rounded-full border border-white/30 md:block" />
                <Card className="relative overflow-hidden border-white/20 bg-white/90 shadow-large">
                  <CardContent className="grid gap-6 p-6">
                    <img
                      src={heroCourier}
                      alt="Coursier professionnel One Connexion"
                      className="h-48 w-full rounded-2xl object-cover"
                    />
                    <div className="grid gap-4">
                      {metrics.slice(0, 3).map((metric) => (
                        <div key={metric.label} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-600">{metric.label}</span>
                          <span className="text-xl font-semibold text-slate-900">{metric.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl bg-slate-900 px-6 py-4 text-white">
                      <p className="text-sm text-white/70">Coordination dédiée</p>
                      <p className="text-lg font-semibold">Un dispatch manager suit votre mission en direct</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-4">
            {metrics.map((metric) => (
              <Card
                key={metric.label}
                className="border-none bg-white/80 p-6 text-center shadow-soft backdrop-blur-lg"
              >
                <CardContent className="space-y-2 p-0">
                  <p className="text-3xl font-semibold text-primary">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl space-y-4">
              <h2 className="leading-tight">Des engagements de transport premium pour vos flux critiques</h2>
              <p className="text-lg text-muted-foreground">
                Nos équipes de coursiers, coordinateurs et experts métiers orchestrent vos opérations avec un niveau d'exigence digne des standards les plus élevés.
              </p>
            </div>
            <Link to="/expertises" className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-smooth hover:gap-3">
              Explorer nos expertises <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {servicePillars.map((pillar) => (
              <Card key={pillar.title} className="relative overflow-hidden border-none bg-white/80 shadow-soft backdrop-blur">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10" />
                <CardContent className="relative space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <pillar.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold">{pillar.title}</h3>
                  <p className="text-muted-foreground">{pillar.description}</p>
                  <ul className="space-y-2 text-sm text-foreground/80">
                    {pillar.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" /> {bullet}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4">Secteurs que nous accompagnons</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Une expertise éprouvée dans les domaines où la précision, la sécurité et la ponctualité sont non négociables.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {expertises.map((expertise) => (
              <Card
                key={expertise.title}
                className="group border-none bg-white/80 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-medium"
              >
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <expertise.icon className={cn("h-6 w-6", expertise.color)} />
                  </div>
                  <h3 className="text-xl font-semibold">{expertise.title}</h3>
                  <p className="text-muted-foreground">{expertise.description}</p>
                  <Link to="/expertises" className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-smooth group-hover:gap-3">
                    En savoir plus <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 grid gap-6 lg:grid-cols-[0.6fr,1.4fr] lg:items-end">
            <div className="space-y-4">
              <h2>Des grilles tarifaires transparentes</h2>
              <p className="text-lg text-muted-foreground">
                Des forfaits clairs pour démarrer immédiatement, des offres sur-mesure pour vos volumes ou contraintes spécifiques.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-full bg-muted px-4 py-3 text-sm text-muted-foreground">
              <Sparkle className="h-4 w-4 text-primary" />
              Tarifs indicatifs – contactez-nous pour des besoins multi-colis ou hors Île-de-France.
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {pricingPlans.map((plan) => {
              const isPopular = plan.popular;
              return (
                <Card
                  key={plan.title}
                  className={cn(
                    "relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-soft transition-all hover:shadow-large",
                    isPopular && "border-transparent bg-primary text-primary-foreground shadow-2xl",
                  )}
                >
                  {plan.badge && (
                    <div className="absolute left-1/2 top-6 -translate-x-1/2">
                      <Badge
                        className={cn(
                          "rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide",
                          isPopular ? "bg-white/20 text-white" : "bg-primary/10 text-primary",
                        )}
                      >
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  <CardContent
                    className={cn(
                      "flex h-full flex-col gap-8 rounded-[26px] bg-white/90 p-10 pt-16 text-left",
                      isPopular && "bg-transparent text-primary-foreground",
                    )}
                  >
                    <div className="space-y-4 text-center">
                      <h3 className="text-2xl font-semibold tracking-tight">{plan.title}</h3>
                      <p
                        className={cn(
                          "text-sm text-muted-foreground",
                          isPopular && "text-white/80",
                        )}
                      >
                        {plan.description}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-5xl font-bold">
                          {plan.currency}
                          {plan.price}
                        </span>
                        <span
                          className={cn(
                            "text-sm text-muted-foreground",
                            isPopular && "text-white/80",
                          )}
                        >
                          {plan.frequency}
                        </span>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl bg-slate-100/70 p-6 text-left",
                        isPopular && "bg-white/10",
                      )}
                    >
                      <p
                        className={cn(
                          "text-xs font-semibold uppercase tracking-[0.3em] text-slate-500",
                          isPopular && "text-white/60",
                        )}
                      >
                        {plan.featuresLabel}
                      </p>
                      <p
                        className={cn(
                          "mt-3 text-sm font-medium text-slate-700",
                          isPopular && "text-white",
                        )}
                      >
                        {plan.featuresIntro}
                      </p>
                      <ul className="mt-4 space-y-3">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className={cn(
                              "flex items-start gap-3 text-sm text-slate-600",
                              isPopular && "text-white/80",
                            )}
                          >
                            <CheckCircle2
                              className={cn(
                                "mt-0.5 h-5 w-5 flex-shrink-0",
                                isPopular ? "text-white" : "text-primary",
                              )}
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-auto space-y-3">
                      <Button
                        size="lg"
                        className={cn(
                          "w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90",
                          isPopular && "bg-white text-primary hover:bg-white/90",
                        )}
                        asChild
                      >
                        <Link to={plan.primaryCta.href}>{plan.primaryCta.label}</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="lg"
                        className={cn(
                          "w-full rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                          isPopular && "border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white",
                        )}
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
        </div>
      </section>

      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
            <div className="space-y-6">
              <h2>Un process opérationnel maîtrisé de bout en bout</h2>
              <p className="text-lg text-muted-foreground">
                Chaque livraison suit un protocole précis, piloté par notre cellule de coordination qui assure transparence et reporting.
              </p>
              <div className="grid gap-4">
                {processSteps.map((step) => (
                  <Card key={step.title} className="border-none bg-white/80 shadow-soft backdrop-blur">
                    <CardContent className="flex gap-4 p-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <step.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <Card className="border-none bg-white/90 shadow-large">
                <CardContent className="space-y-6 p-8">
                  <h3 className="text-2xl font-semibold">Estimez votre tarif en quelques clics</h3>
                  <p className="text-sm text-muted-foreground">
                    Renseignez votre besoin. Nous vous recontactons pour affiner les options et planifier la prise en charge.
                  </p>
                  <form onSubmit={handleQuickEstimate} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Type de transport</label>
                        <select className="h-12 w-full rounded-xl border border-input bg-background px-4">
                          <option>Document urgent</option>
                          <option>Colis léger (&lt;5kg)</option>
                          <option>Colis moyen (5-20kg)</option>
                          <option>Transport sensible</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Zone</label>
                        <select className="h-12 w-full rounded-xl border border-input bg-background px-4">
                          <option>Intra-Paris</option>
                          <option>Petite Couronne</option>
                          <option>Grande Couronne</option>
                          <option>Province / Europe</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm">
                      <input type="checkbox" id="express" className="h-4 w-4 rounded border-primary/40 text-primary" />
                      <label htmlFor="express">Option express (départ immédiat +30%)</label>
                    </div>
                    <Button type="submit" variant="cta" size="lg" className="w-full rounded-xl">
                      Calculer une estimation
                    </Button>
                    {estimatedPrice && (
                      <div className="animate-scale-in rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
                        <p className="text-sm text-muted-foreground">Tarif estimé</p>
                        <p className="text-3xl font-semibold text-primary">{estimatedPrice}€</p>
                        <p className="text-xs text-muted-foreground">Tarif indicatif hors options et péages</p>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2>Ils nous confient leurs opérations sensibles</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Une relation de confiance construite sur la ponctualité, la proactivité et la qualité de suivi.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="border-none bg-white/90 shadow-soft">
                <CardContent className="space-y-4 p-6">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, index) => (
                      <Star key={index} className="h-5 w-5 fill-cta text-cta" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">“{testimonial.text}”</p>
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

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-8 rounded-3xl border border-primary/20 bg-white/90 p-10 shadow-large md:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-4">
              <Badge className="rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Démarrage en 24h
              </Badge>
              <h2 className="text-3xl font-semibold md:text-4xl">Prêts à propulser vos flux logistiques</h2>
              <p className="text-muted-foreground">
                Nos équipes coordonnent vos opérations sur toute l'Île-de-France et accompagnent vos projets nationaux ou européens.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="cta" size="lg" className="rounded-full px-8" asChild>
                  <Link to="/commande-sans-compte">Commander une course</Link>
                </Button>
                <Button variant="ghost" size="lg" className="rounded-full border border-primary/40 px-8" asChild>
                  <Link to="/contact">Planifier un rendez-vous</Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 text-sm text-muted-foreground">
              <div className="rounded-xl bg-white/80 p-5 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">Clients accompagnés</p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-primary">
                  <span className="rounded-full bg-primary/5 px-4 py-2">Laboratoires</span>
                  <span className="rounded-full bg-primary/5 px-4 py-2">Groupes juridiques</span>
                  <span className="rounded-full bg-primary/5 px-4 py-2">Retail & optique</span>
                  <span className="rounded-full bg-primary/5 px-4 py-2">Agences événementielles</span>
                </div>
              </div>
              <div className="rounded-xl border border-primary/20 bg-white/70 p-5 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">Services associés</p>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Emballages sécurisés</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Gestion des formalités douanières</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Reporting personnalisé</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
