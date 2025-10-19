import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import heroCourier from "@/assets/hero-courier.jpg";
import {
  ArrowRight,
  Building2,
  Check,
  Clock4,
  FileBarChart,
  MapPinned,
  PackageSearch,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
  Users,
  Workflow,
} from "lucide-react";

const stats = [
  {
    label: "Courses livrées / mois",
    value: "12 000+",
    detail: "à travers l'Île-de-France",
  },
  {
    label: "Taux de satisfaction",
    value: "98%",
    detail: "clients professionnels fidélisés",
  },
  {
    label: "Temps moyen de prise en charge",
    value: "11 min",
    detail: "depuis votre validation",
  },
];

const partners = [
  "Laboratoires Luma",
  "Optivue",
  "Cabinet Axiom",
  "Urban Events",
  "PharmaLink",
  "TechSupply",
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Fiabilité 7j/7",
    description: "Coursiers salariés et contrôlés, traçabilité complète jusqu'à la signature.",
  },
  {
    icon: MapPinned,
    title: "Pilotage centralisé",
    description: "Dashboard unifié, suivi GPS en temps réel, notifications à chaque étape.",
  },
  {
    icon: Clock4,
    title: "Express & programmé",
    description: "Livraisons urgentes sous 2h ou tournées planifiées à l'avance, selon vos enjeux.",
  },
];

const platformHighlights = [
  {
    icon: Workflow,
    title: "Flux automatisés",
    description: "Planification intelligente, attribution automatique des missions et alerte en cas d'imprévu.",
  },
  {
    icon: PackageSearch,
    title: "Traçabilité avancée",
    description: "Numéro de tracking unique, preuve de dépôt numérisée, historique complet accessible en un clic.",
  },
  {
    icon: FileBarChart,
    title: "Reporting détaillé",
    description: "Tableaux de bord exportables, indicateurs SLA, analyse des coûts par service ou site.",
  },
  {
    icon: Users,
    title: "Accès collaborateurs",
    description: "Gestion des droits par équipe, commandes multi-sites et validation en deux étapes.",
  },
];

const workflows = [
  {
    step: "01",
    title: "Planifiez votre course",
    description: "Sélectionnez le type d'envoi, la fenêtre de temps et ajoutez vos instructions particulières.",
  },
  {
    step: "02",
    title: "Suivez chaque étape",
    description: "Notification instantanée à l'enlèvement, suivi GPS live et confirmation de livraison signée.",
  },
  {
    step: "03",
    title: "Analysez vos performances",
    description: "Visualisez vos volumes, comparez vos coûts et optimisez vos tournées récurrentes.",
  },
];

const solutions = [
  {
    title: "Santé & Laboratoires",
    description:
      "Transport réglementé de prélèvements, dispositifs médicaux et matériels sensibles, avec protocole HACCP.",
    items: [
      "Glacières certifiées et chaîne du froid maîtrisée",
      "Coursiers formés aux exigences médicales",
      "Reporting qualité pour vos audits",
    ],
    icon: Sparkles,
  },
  {
    title: "Juridique & Finance",
    description:
      "Acheminement sécurisé de dossiers confidentiels, plis d'huissier et contrats à signer sous délai court.",
    items: [
      "Remise contre signature et preuve horodatée",
      "Casiers scellés pour documents sensibles",
      "Courses programmées avant audiences",
    ],
    icon: Building2,
  },
  {
    title: "Retail & Optique",
    description:
      "Distribution omnicanale de commandes boutiques, réassort express et gestion des retours clients.",
    items: [
      "Livraison express entre magasins",
      "Gestion des pick-up points et lockers",
      "Analyse des ventes & des retours",
    ],
    icon: Truck,
  },
];

const testimonials = [
  {
    name: "Léa Martin",
    role: "Responsable logistique, Optivue",
    quote:
      "La plateforme One Connexion a transformé notre façon de piloter les courses inter-boutiques. Nous maîtrisons enfin nos délais.",
    rating: 5,
  },
  {
    name: "Thomas Durand",
    role: "Office manager, Cabinet Axiom",
    quote:
      "Notifications en temps réel, preuve de livraison instantanée : nos avocats gagnent un temps précieux.",
    rating: 5,
  },
  {
    name: "Sofia Nguyen",
    role: "Coordinatrice logistique, Urban Events",
    quote:
      "Les tournées planifiées et la réactivité des équipes nous permettent de réussir chaque événement sans stress.",
    rating: 5,
  },
];

const heroHighlights = [
  "Support premium dédié à votre entreprise",
  "Assurance incluse et conformité réglementaire",
  "Intégration API & connecteurs e-commerce",
];

const Home = () => {
  return (
    <Layout>
      <section className="relative overflow-hidden bg-slate-950 text-primary-foreground">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-primary/80 opacity-95" />
          <div className="absolute -right-32 top-24 h-80 w-80 rounded-full bg-cta/20 blur-3xl" />
          <div className="absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_420px] lg:items-center">
            <div>
              <Badge className="mb-6 bg-white/10 text-white backdrop-blur">Plateforme One Connexion</Badge>
              <h1 className="mb-6 max-w-2xl text-balance text-foreground">
                La logistique urbaine pilotée pour vos livraisons critiques
              </h1>
              <p className="mb-8 max-w-2xl text-lg text-primary-foreground/80">
                One Connexion orchestre vos transports express et programmés en Île-de-France : suivi en temps réel,
                coursiers salariés, reporting avancé. Une plateforme unique pour vos équipes opérationnelles et métiers.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button variant="cta" size="lg" asChild>
                  <Link to="/inscription">
                    Demarrer gratuitement
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline-light" size="lg" asChild>
                  <Link to="/contact">Planifier une démo</Link>
                </Button>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <Card key={stat.label} className="border-white/10 bg-white/5 text-left backdrop-blur">
                    <CardContent className="p-6">
                      <p className="text-2xl font-semibold text-white">{stat.value}</p>
                      <p className="mt-2 text-sm text-white/80">{stat.label}</p>
                      <p className="text-xs text-white/60">{stat.detail}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
              <img
                src={heroCourier}
                alt="Coursier professionnel One Connexion"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-6">
                <p className="text-sm font-semibold text-white">Suivi en temps réel et preuve de livraison instantanée</p>
                <p className="text-xs text-white/70">Coursiers salariés, assurance incluse et assistance 24/7</p>
              </div>
            </div>
          </div>
          <div className="mt-16 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur">
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">Pourquoi One Connexion</p>
            <div className="grid gap-3 md:grid-cols-3">
              {heroHighlights.map((highlight) => (
                <div key={highlight} className="flex items-center gap-3 text-sm text-white/80">
                  <Check className="h-4 w-4 text-cta" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Ils pilotent leurs transports avec One Connexion
          </p>
          <div className="mt-6 grid gap-6 text-sm text-muted-foreground sm:grid-cols-3 md:grid-cols-6">
            {partners.map((partner) => (
              <div key={partner} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-center">
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <Badge className="mb-4 bg-secondary/10 text-secondary">Solutions opérationnelles</Badge>
            <h2 className="max-w-3xl text-balance">Tout ce dont vos équipes ont besoin pour orchestrer leurs livraisons</h2>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Centralisez la commande, le suivi et l'analyse de vos transports urgents ou programmés sur une plateforme
              unique pensée pour les organisations multi-sites.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="h-full border border-slate-100 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-medium">
                <CardContent className="p-8 text-left">
                  <benefit.icon className="mb-6 h-10 w-10 text-primary" />
                  <h3 className="mb-3 text-2xl">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-[440px_minmax(0,1fr)] lg:items-center">
            <div className="text-left">
              <Badge className="mb-4 bg-primary/10 text-primary">Tour de contrôle</Badge>
              <h2 className="text-balance">Pilotez l'intégralité de vos transports en un seul endroit</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Notre plateforme accompagne vos équipes au quotidien : création de courses, communication avec les
                coursiers, reporting automatisé et intégrations API pour vos outils existants.
              </p>
              <div className="mt-8 space-y-3">
                <div className="flex items-start gap-3">
                  <TrendingUp className="mt-1 h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Temps de traitement réduit de 32% grâce à l'automatisation des flux de commande.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Conformité assurée : protocole de signature, audit trail complet et stockage sécurisé en France.
                  </p>
                </div>
              </div>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/expertises">Découvrir la plateforme</Link>
                </Button>
                <Button variant="ghost" size="lg" asChild>
                  <Link to="/contact">Consulter un conseiller</Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {platformHighlights.map((highlight) => (
                <Card key={highlight.title} className="h-full border border-slate-100 shadow-soft">
                  <CardContent className="p-6 text-left">
                    <highlight.icon className="mb-4 h-9 w-9 text-primary" />
                    <h3 className="text-xl">{highlight.title}</h3>
                    <p className="mt-3 text-sm text-muted-foreground">{highlight.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-20 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <Badge className="mb-4 bg-white/10 text-white backdrop-blur">Processus</Badge>
            <h2 className="max-w-3xl text-balance text-white">Un parcours simple pour vos équipes et vos destinataires</h2>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              Depuis la commande jusqu'à la preuve de livraison, tout est pensé pour réduire les frictions internes et
              offrir la meilleure expérience à vos clients finaux.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {workflows.map((workflow) => (
              <Card key={workflow.title} className="h-full border border-white/10 bg-white/5 text-left backdrop-blur">
                <CardContent className="p-8">
                  <p className="text-sm font-semibold text-white/70">{workflow.step}</p>
                  <h3 className="mt-2 text-2xl text-white">{workflow.title}</h3>
                  <p className="mt-4 text-sm text-white/70">{workflow.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <Badge className="mb-4 bg-primary/10 text-primary">Secteurs clés</Badge>
            <h2 className="text-balance">Des expertises dédiées à vos contraintes métiers</h2>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Nos équipes conçoivent des protocoles adaptés aux environnements les plus exigeants pour assurer la continuité
              de vos opérations.
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {solutions.map((solution) => (
              <Card key={solution.title} className="h-full border border-slate-100 shadow-soft">
                <CardContent className="p-8 text-left">
                  <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-primary/5 px-4 py-2 text-primary">
                    <solution.icon className="h-5 w-5" />
                    <span className="text-sm font-semibold">{solution.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{solution.description}</p>
                  <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                    {solution.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check className="mt-1 h-4 w-4 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <Badge className="mb-4 bg-secondary/10 text-secondary">Témoignages</Badge>
            <h2 className="max-w-3xl text-balance">Ils font confiance à One Connexion pour leurs transports stratégiques</h2>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Des PME en croissance aux grands comptes, nous accompagnons les équipes logistiques, opérations et office
              management dans la transformation de leurs process.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="h-full border border-slate-100 shadow-soft">
                <CardContent className="flex h-full flex-col p-8 text-left">
                  <div className="mb-4 flex items-center gap-1 text-cta">
                    {Array.from({ length: testimonial.rating }).map((_, index) => (
                      <Star key={index} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm italic text-muted-foreground">“{testimonial.quote}”</p>
                  <div className="mt-auto pt-6">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary via-primary-dark to-slate-950" />
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <Badge className="mb-6 bg-white/10 text-white">Prêt à commencer ?</Badge>
          <h2 className="mx-auto max-w-3xl text-balance text-white">Rejoignez les entreprises qui fluidifient leurs livraisons avec One Connexion</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            Nos équipes vous accompagnent dès l'onboarding pour configurer vos circuits, former vos collaborateurs et
            assurer la continuité de service.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="cta" size="lg" asChild>
              <Link to="/commande-sans-compte">Commander une course</Link>
            </Button>
            <Button variant="outline-light" size="lg" asChild>
              <Link to="/tarifs">Consulter nos tarifs</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
