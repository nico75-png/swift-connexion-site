import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, AlertCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";

const Tarifs = () => {
  const [estimatedPrice, setEstimatedPrice] = useState<{
    base: number;
    distance: number;
    options: number;
    total: number;
  } | null>(null);

  const handleFullEstimate = (e: React.FormEvent) => {
    e.preventDefault();

    const simulatedDistance = 15;
    const service = services[0];
    const basePrice = service.base;
    const distancePrice = calculatePrice(simulatedDistance, service.base, service.pricePerKm) - basePrice;
    const optionsPrice = 0;
    const total = basePrice + distancePrice + optionsPrice;

    setEstimatedPrice({
      base: basePrice,
      distance: distancePrice,
      options: optionsPrice,
      total: Math.round(total * 100) / 100,
    });
  };

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

      {/* Simulateur complet */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center mb-12">Simulateur de tarif complet</h2>
            <Card className="border-none shadow-large">
              <CardContent className="p-8">
                <form onSubmit={handleFullEstimate} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Type de transport</label>
                      <select className="w-full h-11 px-4 rounded-lg border border-input bg-background">
                        <option>Document (enveloppe)</option>
                        <option>Colis léger (&lt;5kg)</option>
                        <option>Colis moyen (5-20kg)</option>
                        <option>Colis volumineux (&gt;20kg)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Secteur d'activité</label>
                      <select className="w-full h-11 px-4 rounded-lg border border-input bg-background">
                        <option>Général</option>
                        <option>Médical / Santé</option>
                        <option>Optique</option>
                        <option>Juridique</option>
                        <option>Événementiel</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Départ (ville ou CP)</label>
                      <input
                        type="text"
                        placeholder="ex: Paris 75001"
                        className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Arrivée (ville ou CP)</label>
                      <input
                        type="text"
                        placeholder="ex: Boulogne 92100"
                        className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Poids estimé (kg)</label>
                      <input
                        type="number"
                        placeholder="5"
                        className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Volume (cm³)</label>
                      <input
                        type="text"
                        placeholder="30x30x30"
                        className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Créneau</label>
                      <select className="w-full h-11 px-4 rounded-lg border border-input bg-background">
                        <option>Aujourd'hui</option>
                        <option>Demain</option>
                        <option>Date ultérieure</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium block">Options</label>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="express" className="h-4 w-4" />
                      <label htmlFor="express" className="text-sm">Livraison express (+30%)</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="fragile" className="h-4 w-4" />
                      <label htmlFor="fragile" className="text-sm">Colis fragile (+15%)</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="attente" className="h-4 w-4" />
                      <label htmlFor="attente" className="text-sm">Attente sur place (+10 €/15 min)</label>
                    </div>
                  </div>

                  <Button type="submit" variant="cta" size="lg" className="w-full">
                    Calculer le tarif détaillé
                  </Button>

                  {estimatedPrice && (
                    <div className="mt-6 p-6 bg-primary/5 rounded-xl border-2 border-primary/20 animate-scale-in">
                      <h3 className="text-xl font-semibold mb-4">Détail du tarif</h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tarif de base (service Standard)</span>
                          <span className="font-medium">{formatPrice(estimatedPrice.base)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Distance (15 km)</span>
                          <span className="font-medium">{formatPrice(estimatedPrice.distance)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Options</span>
                          <span className="font-medium">{formatPrice(estimatedPrice.options)}</span>
                        </div>
                        <div className="h-px bg-border my-2" />
                        <div className="flex justify-between">
                          <span className="font-semibold text-lg">Total estimé</span>
                          <span className="font-bold text-2xl text-primary">{formatPrice(estimatedPrice.total)}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 bg-info/10 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                          Tarif indicatif basé sur une estimation de distance. Le tarif définitif sera calculé lors de la commande.
                        </p>
                      </div>
                      <Button variant="cta" size="lg" className="w-full mt-4" asChild>
                        <Link to="/commande-sans-compte">Commander maintenant</Link>
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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
