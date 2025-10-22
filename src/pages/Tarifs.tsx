import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Check, X } from "lucide-react";
import Layout from "@/components/layout/Layout";
import FareEstimatorSection from "@/components/pricing/FareEstimatorSection";
import { cn } from "@/lib/utils";

type PricingFeature = {
  label: string;
  included: boolean;
};

type PricingPlan = {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: PricingFeature[];
  buttonLabel: string;
  badge?: string;
  highlighted?: boolean;
};

const pricingPlans: PricingPlan[] = [
  {
    name: "Standard",
    price: "20€",
    cadence: "forfait 0 à 10 km",
    description: "Pour vos livraisons programmées du quotidien.",
    features: [
      { label: "20 € pour la tranche 0 à 10 km", included: true },
      { label: "1,50 € par kilomètre supplémentaire", included: true },
      { label: "Délai maximum de 3 heures", included: true },
      { label: "Assurance colis et suivi en temps réel", included: true },
    ],
    buttonLabel: "Commander en Standard",
  },
  {
    name: "Express",
    price: "26€",
    cadence: "forfait 0 à 10 km",
    description: "La solution rapide pour vos urgences professionnelles.",
    features: [
      { label: "26 € pour la tranche 0 à 10 km", included: true },
      { label: "1,70 € par kilomètre supplémentaire", included: true },
      { label: "Délai garanti sous 2 heures", included: true },
      { label: "Support prioritaire dédié", included: true },
    ],
    buttonLabel: "Choisir Express",
    badge: "Le plus populaire",
    highlighted: true,
  },
  {
    name: "Flash Express",
    price: "32€",
    cadence: "forfait 0 à 10 km",
    description: "Notre service le plus rapide pour les livraisons critiques.",
    features: [
      { label: "32 € pour la tranche 0 à 10 km", included: true },
      { label: "2,00 € par kilomètre supplémentaire", included: true },
      { label: "Délai record de 45 minutes", included: true },
      { label: "Coursier dédié et suivi premium", included: true },
    ],
    buttonLabel: "Opter pour Flash Express",
  },
];

const Tarifs = () => {

  const zones = [
    {
      name: "Intra-Paris",
      base: "À partir de 25 €",
      description: "Livraison dans Paris intra-muros",
      details: ["Délai : 1–2 h", "Suivi GPS inclus", "Assurance incluse"],
    },
    {
      name: "Petite Couronne",
      base: "À partir de 35 €",
      description: "92, 93, 94 (Hauts-de-Seine, Seine-Saint-Denis, Val-de-Marne)",
      details: ["Délai : 2–3 h", "Suivi GPS inclus", "Assurance incluse"],
    },
    {
      name: "Grande Couronne",
      base: "À partir de 45 €",
      description: "77, 78, 91, 95 (Seine-et-Marne, Yvelines, Essonne, Val-d'Oise)",
      details: ["Délai : 3–4 h", "Suivi GPS inclus", "Assurance incluse"],
    },
  ];

  const services = [
    { name: "Standard", base: 20, pricePerKm: 1.5, delay: "≤ 3 h" },
    { name: "Express", base: 26, pricePerKm: 1.7, delay: "≤ 1 h" },
    { name: "Flash Express", base: 32, pricePerKm: 2, delay: "≤ 45 min" },
  ];

  const formatPrice = (amount: number) => `${amount.toFixed(2).replace(".", ",")} €`;

  const calculatePrice = (distance: number, base: number, pricePerKm: number) => {
    if (distance <= 10) {
      return base;
    }
    return base + (distance - 10) * pricePerKm;
  };

  const faqs = [
    {
      question: "Comment sont calculés les tarifs ?",
      answer:
        "Nos tarifs reposent sur la zone de prise en charge, la formule choisie (Standard, Express, Flash Express) et la distance réelle parcourue : base pour 0–10 km, puis prix au kilomètre au-delà. Aucun frais caché.",
    },
    {
      question: "Y a-t-il des frais supplémentaires cachés ?",
      answer: "Non, nos tarifs sont totalement transparents. Le prix affiché dans le simulateur est le prix final, sauf si vous ajoutez des options complémentaires.",
    },
    {
      question: "Proposez-vous des tarifs dégressifs ?",
      answer:
        "Oui, pour les entreprises avec volume régulier (> 20 courses/mois), nous proposons des tarifs préférentiels sur devis. Contactez notre équipe commerciale.",
    },
    {
      question: "Comment puis-je payer mes courses ?",
      answer:
        "Paiement par carte bancaire à la commande pour les courses ponctuelles. Facturation mensuelle disponible pour les comptes professionnels.",
    },
    {
      question: "Les tarifs incluent-ils l'assurance ?",
      answer:
        "Oui, une assurance de base jusqu'à 500 € est incluse. Pour les colis de valeur supérieure, une assurance renforcée est disponible à 2 % de la valeur déclarée.",
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6">Des tarifs clairs, sans devis obligatoire</h1>
          <p className="text-xl max-w-3xl mx-auto text-primary-foreground/90">
            Des formules simples, calculées au kilomètre avec suivi GPS et assurance inclus.
          </p>
        </div>
      </section>

      {/* Pricing plans */}
      <section className="relative overflow-hidden bg-[#090f23] py-20 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">Des formules adaptées à chaque étape</h2>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              Choisissez le plan qui correspond à vos besoins et bénéficiez d’un accompagnement premium sur vos livraisons.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "relative flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-[1px] shadow-[0_25px_50px_-12px_rgba(15,23,42,0.65)] backdrop-blur",
                  plan.highlighted
                    ? "bg-gradient-to-br from-emerald-500 via-emerald-400 to-emerald-600 shadow-[0_40px_80px_-24px_rgba(16,185,129,0.55)]"
                    : ""
                )}
              >
                <div
                  className={cn(
                    "flex h-full flex-col rounded-[calc(1.5rem-2px)] bg-[#0d152f]/95 p-8",
                    plan.highlighted ? "ring-2 ring-emerald-400" : ""
                  )}
                >
                  {plan.badge && (
                    <Badge className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-400 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-950 shadow-lg">
                      {plan.badge}
                    </Badge>
                  )}
                  <div>
                    <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
                    <p className="mt-2 text-sm text-slate-300">{plan.description}</p>
                  </div>
                  <div className="mt-8 flex items-baseline gap-2 text-white">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-sm text-slate-400">{plan.cadence}</span>
                  </div>
                  <ul className="mt-8 space-y-4 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature.label} className="flex items-start gap-3">
                        <span
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-full border",
                            feature.included
                              ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                              : "border-white/10 bg-white/5 text-slate-500"
                          )}
                        >
                          {feature.included ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </span>
                        <span className={feature.included ? "text-slate-200" : "text-slate-500"}>{feature.label}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-10">
                    <Button
                      className={cn(
                        "w-full rounded-full py-6 text-base font-semibold",
                        plan.highlighted
                          ? "bg-white text-emerald-600 hover:bg-slate-100"
                          : "bg-white/10 text-white hover:bg-white/20"
                      )}
                    >
                      {plan.buttonLabel}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grille tarifaire */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center mb-12">Grille tarifaire par zones</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {zones.map((zone, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-smooth">
                <CardContent className="p-6">
                  <h3 className="text-2xl mb-2">{zone.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-primary">{zone.base}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{zone.description}</p>
                  <ul className="space-y-2">
                    {zone.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Services */}
          <Card className="border-none shadow-soft">
            <CardContent className="p-6">
              <h3 className="text-xl mb-4">Formules par service</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="pb-3 pr-4 font-semibold">Service</th>
                      <th className="pb-3 pr-4 font-semibold">Formule</th>
                      <th className="pb-3 pr-4 font-semibold">Délai</th>
                      <th className="pb-3 pr-4 font-semibold">5 km</th>
                      <th className="pb-3 pr-4 font-semibold">15 km</th>
                      <th className="pb-3 font-semibold">27 km</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {services.map((service) => (
                      <tr key={service.name} className="align-top">
                        <td className="py-3 pr-4 font-semibold">{service.name}</td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          0–10 km = {formatPrice(service.base)} puis + {service.pricePerKm.toFixed(2).replace(".", ",")} €/km
                        </td>
                        <td className="py-3 pr-4">{service.delay}</td>
                        <td className="py-3 pr-4">{formatPrice(calculatePrice(5, service.base, service.pricePerKm))}</td>
                        <td className="py-3 pr-4">{formatPrice(calculatePrice(15, service.base, service.pricePerKm))}</td>
                        <td className="py-3">{formatPrice(calculatePrice(27, service.base, service.pricePerKm))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">Suivi GPS et assurance inclus.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Estimation express */}
      <FareEstimatorSection />

      {/* FAQ Tarifs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center mb-12">Questions fréquentes sur les tarifs</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Tarifs;
