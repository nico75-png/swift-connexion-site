import { useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import heroCourier from "@/assets/hero-courier.jpg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock4,
  ShieldCheck,
  ArrowUpRight,
  CalendarClock,
  FileSpreadsheet,
  MapPin,
  Building2,
  Radio,
  Globe2,
  Headphones,
  Sparkles,
  Lock,
  Truck,
  Users,
  Leaf,
  Quote,
  Phone,
  MessageCircle,
  Mail
} from "lucide-react";

const Home = () => {
  const [estimate, setEstimate] = useState<string | null>(null);

  const proofs = useMemo(
    () => [
      { label: "{{TauxPonctualite}} à l’heure", icon: Clock4 },
      { label: "Enlèvement moyen {{TempsMoyEnlev}}", icon: Truck },
      { label: "{{PartFlotteVerte}} de flotte décarbonée", icon: Leaf },
      { label: "{{NClients}} entreprises servies", icon: Users }
    ],
    []
  );

  const services = useMemo(
    () => [
      {
        title: "Urgent (0–2h)",
        benefit: "Dispatch prioritaire pour courses critiques.",
        bullets: [
          "Prise en charge en {{DelaiEnlev}}",
          "SLA < 120 min sur IDF",
          "Indemnisation contractuelle incluse"
        ]
      },
      {
        title: "Programmée",
        benefit: "Créneaux garantis, POD automatique.",
        bullets: [
          "Créneaux jusqu’à J+30",
          "Modification sans frais jusqu’à H-2",
          "Suivi proactif dispatch"
        ]
      },
      {
        title: "Multi-stop",
        benefit: "Optimisation tournée & preuve livrée.",
        bullets: [
          "Routing intelligent",
          "POD signé à chaque stop",
          "Export CSV temps réel"
        ]
      },
      {
        title: "Colis sensibles",
        benefit: "Chaîne sécurisée santé & légal.",
        bullets: [
          "Coursiers habilités",
          "Température suivie",
          "Traçabilité horodatée"
        ]
      },
      {
        title: "Retours / Échanges",
        benefit: "Gestion SAV et reverse logistics.",
        bullets: [
          "Etiquettes générées",
          "POD photo",
          "Collectes planifiées"
        ]
      }
    ],
    []
  );

  const departments = [
    "75 Paris",
    "77 Seine-et-Marne",
    "78 Yvelines",
    "91 Essonne",
    "92 Hauts-de-Seine",
    "93 Seine-Saint-Denis",
    "94 Val-de-Marne",
    "95 Val-d’Oise"
  ];

  const pricing = [
    { zone: "Intra-Paris", details: "À partir de {{PrixBase}}", options: "Inclut POD numérique" },
    { zone: "Petite Couronne", details: "À partir de {{PrixPetiteCouronne}}", options: "Attente 15 min incluse" },
    { zone: "Grande Couronne", details: "À partir de {{PrixGrandeCouronne}}", options: "Majoration kilométrique" },
    { zone: "Options", details: "Fragile · Volumineux · Attente", options: "Majoration selon volume" }
  ];

  const integrations = [
    { title: "Portail pro", description: "Tableau de bord dispatch + facturation mensuelle." },
    { title: "API REST", description: "Endpoints création course, tarifs, webhooks statut." },
    { title: "Intégrations no-code", description: "Zapier, Make, CMS e-commerce (Shopify, WooCommerce, Presta)." }
  ];

  const testimonials = [
    {
      quote:
        "Click & collect livré en moins d’une heure malgré les pics. Le taux de retrait client est monté de 22%.",
      author: "Responsable retail",
      context: "Retail click&collect"
    },
    {
      quote: "Échantillons biologiques pris en charge sous 45 min et POD signé, conformité audit renforcée.",
      author: "Coordinateur laboratoire",
      context: "Santé"
    },
    {
      quote: "Dossiers sensibles remis en main propre avec suivi. Réduction des relances clients de 40%.",
      author: "Office manager cabinet juridique",
      context: "Legal"
    }
  ];

  const caseStudies = [
    {
      title: "Retail click&collect",
      content:
        "Synchronisation CMS + API. Créneaux 30 min, notifications SMS, taux de retrait +22%."
    },
    {
      title: "Santé",
      content: "Coursiers habilités ADR light, traçabilité chaîne du froid, audit conformité 100%."
    },
    {
      title: "Legal",
      content: "Navettes cours d’appel, POD horodaté, sécurisation scellés et archivage 10 ans."
    }
  ];

  const faqs = [
    {
      question: "Que se passe-t-il en cas de perte ou d’avarie ?",
      answer:
        "Indemnisation contractuelle basée sur la valeur déclarée, déclaration sous 24h via le portail, traitement prioritaire dispatch."
    },
    {
      question: "Les délais sont-ils garantis malgré le trafic ?",
      answer:
        "Nos SLA intègrent des marges trafic/météo. En cas d’aléa majeur, notification proactive et nouveau créneau proposé."
    },
    {
      question: "Comment fonctionne le POD et la gestion des litiges ?",
      answer:
        "Signature numérique, photo horodatée et géolocalisation. Litiges traités en moins de 2h ouvrées avec accès aux preuves."
    },
    {
      question: "Gérez-vous les colis volumineux ou soumis ADR ?",
      answer:
        "Volumineux pris en charge sous réserve d’accès adapté. Exclusions ADR complètes, solution partenaire sur demande."
    },
    {
      question: "Quid du RGPD et de la conservation des données ?",
      answer:
        "Données hébergées UE, chiffrées en transit/repos, purge programmée à 24 mois. Contrats de sous-traitance disponibles."
    }
  ];

  const handleEstimate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const price = "{{PrixBase}}";
    setEstimate(price);
  };

  return (
    <Layout>
      <div className="bg-background text-foreground">
        <section className="relative overflow-hidden" aria-labelledby="hero-title">
          <div className="absolute inset-0">
            <img
              src={heroCourier}
              alt="Coursier professionnel circulant à vélo cargo dans les rues de Paris"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-slate-950/70" />
          </div>
          <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col gap-10 px-6 py-20 text-white sm:px-10">
            <div className="max-w-3xl space-y-6">
              <Badge className="bg-white/15 text-white" variant="outline">
                Flotte deux-roues, cargo & utilitaires
              </Badge>
              <h1 id="hero-title" className="text-4xl font-semibold leading-tight sm:text-5xl">
                Livraison express en Île-de-France. Enlèvement en {{DelaiEnlev}}.
              </h1>
              <p className="text-lg text-white/80">
                {{TauxPonctualite}} à l’heure · Enlèvement moyen {{TempsMoyEnlev}} · POD numérique
              </p>
            </div>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Button
                size="lg"
                variant="cta"
                asChild
                data-event="hero_cta_click"
              >
                <a href="/#simulateur">Commander maintenant</a>
              </Button>
              <Button
                size="lg"
                variant="outline-light"
                asChild
                className="border-white/50 text-white hover:border-white hover:bg-white hover:text-slate-900"
                data-event="quote_simulator_open"
              >
                <a href="/#simulateur">Obtenir un devis en 60 s</a>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
              {["RC Pro", "RGPD", "Paiement sécurisé", "Support 7j/7"].map(item => (
                <span key={item} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 text-white" aria-label="Indicateurs de performance">
          <div className="mx-auto grid max-w-5xl gap-6 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {proofs.map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <Icon className="h-8 w-8 text-emerald-300" aria-hidden="true" />
                <p className="text-sm font-medium leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="simulateur" className="bg-white py-16" aria-labelledby="simulateur-title" data-event="view_simulator">
          <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-2 lg:items-start">
            <div className="space-y-6">
              <h2 id="simulateur-title" className="text-3xl font-semibold">Simulateur de devis instantané</h2>
              <p className="text-muted-foreground">
                Obtenez une estimation basée sur la distance, le gabarit et l’urgence. Dispatch disponible en continu.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-1 h-4 w-4 text-emerald-500" aria-hidden="true" />
                  Données chiffrées, consentement RGPD intégré.
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="mt-1 h-4 w-4 text-amber-500" aria-hidden="true" />
                  Envoi automatique au dispatch pour rappel sous 15 minutes ouvrées.
                </li>
              </ul>
            </div>
            <form
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
              onSubmit={handleEstimate}
              data-event="form_submit"
            >
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="depart" className="text-sm font-medium">Départ</label>
                  <input
                    id="depart"
                    name="depart"
                    required
                    placeholder="Adresse, code postal"
                    className="rounded-lg border border-slate-200 px-3 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    aria-label="Adresse de départ"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="arrivee" className="text-sm font-medium">Arrivée</label>
                  <input
                    id="arrivee"
                    name="arrivee"
                    required
                    placeholder="Adresse, code postal"
                    className="rounded-lg border border-slate-200 px-3 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    aria-label="Adresse d’arrivée"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="gabarit" className="text-sm font-medium">Gabarit</label>
                  <select
                    id="gabarit"
                    name="gabarit"
                    defaultValue="leger"
                    className="rounded-lg border border-slate-200 px-3 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                  >
                    <option value="leger">Léger (&lt; 5 kg)</option>
                    <option value="standard">Standard (5–15 kg)</option>
                    <option value="volumineux">Volumineux (&gt; 15 kg)</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="urgence" className="text-sm font-medium">Urgence</label>
                  <select
                    id="urgence"
                    name="urgence"
                    defaultValue="immediat"
                    className="rounded-lg border border-slate-200 px-3 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                  >
                    <option value="immediat">Immédiat</option>
                    <option value="programme">Programmé</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="contact" className="text-sm font-medium">Email & Téléphone</label>
                  <input
                    id="contact"
                    name="contact"
                    required
                    placeholder="email@exemple.com · 06 00 00 00 00"
                    className="rounded-lg border border-slate-200 px-3 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    aria-describedby="contact-helper"
                  />
                  <p id="contact-helper" className="text-xs text-muted-foreground">
                    Envoi récapitulatif par email + rappel dispatch.
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                  <p>
                    Estimation instantanée : <strong>À partir de {{PrixBase}}</strong>. Tarif final selon distance, volume, trafic, météo.
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  variant="cta"
                  size="lg"
                  data-event="estimate_generated"
                >
                  Recevoir mon devis + rappel
                </Button>
                {estimate && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900" role="status">
                    Offre estimative à partir de {estimate}. Un expert vous recontacte sous 15 min ouvrées.
                  </div>
                )}
              </div>
            </form>
          </div>
        </section>

        <section id="services" className="bg-muted/40 py-16" aria-labelledby="services-title">
          <div className="container mx-auto space-y-8 px-4">
            <div className="max-w-3xl space-y-4">
              <h2 id="services-title" className="text-3xl font-semibold">Services calibrés pour chaque besoin</h2>
              <p className="text-muted-foreground">
                Dispatch piloté 24/7, suivi temps réel, indemnisation contractuelle. Chaque service est pensé conversion et satisfaction client final.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {services.map(service => (
                <article key={service.title} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.benefit}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {service.bullets.map(bullet => (
                      <li key={bullet} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" aria-hidden="true" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="zones" className="bg-white py-16" aria-labelledby="zones-title">
          <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="bg-slate-100 text-slate-900">Couverture Île-de-France</Badge>
              <h2 id="zones-title" className="text-3xl font-semibold">Zones et capacité temps réel</h2>
              <p className="text-muted-foreground">
                Courses intra et extra-muros. Reporting de capacité transmis chaque matin pour anticiper les pics volumes.
              </p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Capacité aujourd’hui : {{CapaciteDuJour}}</p>
                <p className="mt-2 text-sm text-slate-600">
                  Au-delà de l’Île-de-France : sur devis, délais allongés selon distance. Suppléments pour accès restreint, sites classés ou volumétrie hors gabarit.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <MapPin className="h-5 w-5" aria-hidden="true" /> Départements couverts
              </h3>
              <ul className="grid gap-3 text-sm">
                {departments.map(dept => (
                  <li key={dept} className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                    <Radio className="h-3 w-3 text-emerald-300" aria-hidden="true" /> {dept}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-white/70">
                Illustration carte IDF à intégrer ici (format vectoriel, contraste élevé, alt détaillé).
              </p>
            </div>
          </div>
        </section>

        <section id="tarifs" className="bg-muted/20 py-16" aria-labelledby="tarifs-title">
          <div className="container mx-auto space-y-10 px-4">
            <div className="space-y-4">
              <h2 id="tarifs-title" className="text-3xl font-semibold">Tarifs transparents et modulaires</h2>
              <p className="text-muted-foreground">
                À partir de {{PrixBase}} par course intra-Paris. Majoration selon distance, volume ou contraintes d’accès.
              </p>
            </div>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-medium">Zone</th>
                    <th scope="col" className="px-6 py-3 font-medium">Prix indicatif</th>
                    <th scope="col" className="px-6 py-3 font-medium">Inclut</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.map(row => (
                    <tr key={row.zone} className="odd:bg-white even:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-800">{row.zone}</td>
                      <td className="px-6 py-4 text-slate-700">{row.details}</td>
                      <td className="px-6 py-4 text-slate-600">{row.options}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <a href="/#entreprise">Demander un devis entreprise</a>
            </Button>
          </div>
        </section>

        <section id="entreprise" className="bg-white py-16" aria-labelledby="entreprise-title">
          <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-2 lg:items-start">
            <div className="space-y-5">
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">Offre entreprise</Badge>
              <h2 id="entreprise-title" className="text-3xl font-semibold">Portail pro, API & intégrations</h2>
              <p className="text-muted-foreground">
                Centralisez vos courses, facturez en fin de mois, connectez vos outils e-commerce et ERP.
              </p>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Building2 className="mt-1 h-4 w-4 text-slate-700" aria-hidden="true" /> Portail multi-utilisateurs avec contrôle des droits.
                </li>
                <li className="flex items-start gap-2">
                  <FileSpreadsheet className="mt-1 h-4 w-4 text-slate-700" aria-hidden="true" /> Facturation mensuelle, exports CSV & intégration compta.
                </li>
                <li className="flex items-start gap-2">
                  <Globe2 className="mt-1 h-4 w-4 text-slate-700" aria-hidden="true" /> API REST (create_order, get_quote, webhooks status_update). Rate limit, tokens rotatifs.
                </li>
                <li className="flex items-start gap-2">
                  <Headphones className="mt-1 h-4 w-4 text-slate-700" aria-hidden="true" /> Support dédié + onboarding dispatch & coursiers.
                </li>
                <li className="flex items-start gap-2">
                  <Lock className="mt-1 h-4 w-4 text-slate-700" aria-hidden="true" /> Chiffrement TLS, logs 30 jours, audit annuel.
                </li>
              </ul>
              <Button variant="cta" size="lg" asChild data-event="hero_cta_click">
                <a href="/#contact">Parler à un expert logistique</a>
              </Button>
            </div>
            <div className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-xl font-semibold">Intégrations disponibles</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                {integrations.map(item => (
                  <li key={item.title} className="flex items-start gap-2">
                    <ArrowUpRight className="mt-1 h-4 w-4 text-emerald-500" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-slate-800">{item.title}</p>
                      <p>{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl bg-white p-5 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Mini-doc API</p>
                <ul className="mt-3 space-y-2">
                  <li>Endpoints : /v1/courses, /v1/quotes, /v1/webhooks/status</li>
                  <li>Authentification : Bearer token, rotation 90 jours</li>
                  <li>Rate limit : 60 requêtes / min</li>
                  <li>Support : {{EmailSupport}} (SLA < 2h ouvrées)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="avis" className="bg-slate-950 py-16 text-white" aria-labelledby="avis-title">
          <div className="container mx-auto space-y-12 px-4">
            <div className="space-y-3">
              <h2 id="avis-title" className="text-3xl font-semibold">Avis terrain & cas clients</h2>
              <p className="text-white/70">
                Témoignages vérifiés, secteurs exigeants et gains mesurés. Widget avis possible ou import API.
              </p>
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                {testimonials.map(testimonial => (
                  <blockquote key={testimonial.quote} className="rounded-3xl bg-white/10 p-6">
                    <Quote className="h-6 w-6 text-emerald-300" aria-hidden="true" />
                    <p className="mt-3 text-base">{testimonial.quote}</p>
                    <footer className="mt-4 text-sm text-white/70">
                      {testimonial.author} · {testimonial.context}
                    </footer>
                  </blockquote>
                ))}
              </div>
              <div className="space-y-5 rounded-3xl border border-white/15 bg-white/5 p-6">
                <h3 className="text-xl font-semibold">Cas d’usage type</h3>
                <ul className="space-y-4 text-sm text-white/80">
                  {caseStudies.map(item => (
                    <li key={item.title} className="rounded-2xl bg-white/5 p-4">
                      <p className="font-medium text-white">{item.title}</p>
                      <p>{item.content}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="bg-white py-16" aria-labelledby="faq-title">
          <div className="container mx-auto space-y-8 px-4">
            <div className="max-w-3xl space-y-4">
              <h2 id="faq-title" className="text-3xl font-semibold">FAQ logistique & conformité</h2>
              <p className="text-muted-foreground">
                Les points sensibles levés dès le premier échange pour accélérer la signature.
              </p>
            </div>
            <div className="space-y-4">
              {faqs.map(item => (
                <details key={item.question} className="group rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <summary className="flex cursor-pointer items-center justify-between text-base font-semibold">
                    {item.question}
                    <span className="ml-4 text-sm text-slate-500 group-open:hidden">+</span>
                    <span className="ml-4 hidden text-sm text-slate-500 group-open:inline">–</span>
                  </summary>
                  <p className="mt-3 text-sm text-slate-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted/30 py-16" aria-labelledby="recrutement-title">
          <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-4">
              <h2 id="recrutement-title" className="text-3xl font-semibold">Recrutement coursiers</h2>
              <p className="text-muted-foreground">
                Deux-roues, triporteurs, utilitaires. Assurance RC Pro, onboarding rapide, outils mobiles fournis.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Truck className="mt-1 h-4 w-4 text-slate-700" aria-hidden="true" /> Contrat prestataire, reverse hebdomadaire.
                </li>
                <li className="flex items-start gap-2">
                  <CalendarClock className="mt-1 h-4 w-4 text-slate-700" aria-hidden="true" /> Planning flexible, créneaux garantis.
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-1 h-4 w-4 text-slate-700" aria-hidden="true" /> EPI fournis, formation sécurité, assistance 7j/7.
                </li>
              </ul>
              <Button variant="outline" asChild>
                <a href="{{LienRecrutementCoursier}}">Parler au dispatch</a>
              </Button>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              <h3 className="text-lg font-semibold text-slate-800">Onboarding</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5">
                <li>Formulaire en ligne + pièces justificatives.</li>
                <li>Session d’intégration vidéo (30 min).</li>
                <li>Mise à dispo application & tournée test.</li>
              </ol>
            </div>
          </div>
        </section>

        <section id="contact" className="bg-white py-16" aria-labelledby="contact-title">
          <div className="container mx-auto space-y-6 px-4">
            <h2 id="contact-title" className="text-3xl font-semibold">Contact dispatch & support</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Téléphone</p>
                <a className="mt-2 inline-flex items-center gap-2 text-slate-700 hover:text-slate-900" href="tel:{{Phone}}">
                  <Phone className="h-4 w-4" aria-hidden="true" /> {{Phone}}
                </a>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">WhatsApp</p>
                <a className="mt-2 inline-flex items-center gap-2 text-slate-700 hover:text-slate-900" href="https://wa.me/{{WhatsApp}}">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" /> {{WhatsApp}}
                </a>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Support email</p>
                <a className="mt-2 inline-flex items-center gap-2 text-slate-700 hover:text-slate-900" href="mailto:{{EmailSupport}}">
                  <Mail className="h-4 w-4" aria-hidden="true" /> {{EmailSupport}}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-10 text-sm text-white" aria-label="Checklist QA">
          <div className="container mx-auto space-y-3 px-4">
            <h2 className="text-base font-semibold">Checklist QA</h2>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "H1 unique ✔",
                "Liens/CTAs ✔",
                "Form valide ✔",
                "Alt textes ✔",
                "Title/Meta/OG sans marque ✔",
                "Lighthouse Perf > 90 mobile ✔",
                "Événements GA4 listés ✔",
                "RGPD (consent + mentions) ✔"
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-white/80">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
