import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { PricingPlans } from "@/components/pricing/PricingPlans";
const Tarifs = () => {
  const zones = [{
    name: "Intra-Paris",
    base: "À partir de 25 €",
    description: "Livraison dans Paris intra-muros",
    details: ["Délai : 1–2 h", "Suivi GPS inclus", "Assurance incluse"]
  }, {
    name: "Petite Couronne",
    base: "À partir de 35 €",
    description: "92, 93, 94 (Hauts-de-Seine, Seine-Saint-Denis, Val-de-Marne)",
    details: ["Délai : 2–3 h", "Suivi GPS inclus", "Assurance incluse"]
  }, {
    name: "Grande Couronne",
    base: "À partir de 45 €",
    description: "77, 78, 91, 95 (Seine-et-Marne, Yvelines, Essonne, Val-d'Oise)",
    details: ["Délai : 3–4 h", "Suivi GPS inclus", "Assurance incluse"]
  }];
  const services = [{
    name: "Standard",
    base: 20,
    pricePerKm: 1.5,
    delay: "≤ 3 h"
  }, {
    name: "Express",
    base: 26,
    pricePerKm: 1.7,
    delay: "≤ 1 h"
  }, {
    name: "Flash Express",
    base: 32,
    pricePerKm: 2,
    delay: "≤ 45 min"
  }];
  const formatPrice = (amount: number) => `${amount.toFixed(2).replace(".", ",")} €`;
  const calculatePrice = (distance: number, base: number, pricePerKm: number) => {
    if (distance <= 10) {
      return base;
    }
    return base + (distance - 10) * pricePerKm;
  };
  const faqs = [{
    question: "Comment sont calculés les tarifs ?",
    answer: "Nos tarifs reposent sur la zone de prise en charge, la formule choisie (Standard, Express, Flash Express) et la distance réelle parcourue : base pour 0–10 km, puis prix au kilomètre au-delà. Aucun frais caché."
  }, {
    question: "Y a-t-il des frais supplémentaires cachés ?",
    answer: "Non, nos tarifs sont totalement transparents. Le prix affiché dans le simulateur est le prix final, sauf si vous ajoutez des options complémentaires."
  }, {
    question: "Proposez-vous des tarifs dégressifs ?",
    answer: "Oui, pour les entreprises avec volume régulier (> 20 courses/mois), nous proposons des tarifs préférentiels sur devis. Contactez notre équipe commerciale."
  }, {
    question: "Comment puis-je payer mes courses ?",
    answer: "Paiement par carte bancaire à la commande pour les courses ponctuelles. Facturation mensuelle disponible pour les comptes professionnels."
  }, {
    question: "Les tarifs incluent-ils l'assurance ?",
    answer: "Oui, une assurance de base jusqu'à 500 € est incluse. Pour les colis de valeur supérieure, une assurance renforcée est disponible à 2 % de la valeur déclarée."
  }];
  return <Layout>
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6">Des tarifs clairs, sans devis obligatoire</h1>
          <p className="text-xl max-w-3xl mx-auto text-primary-foreground/90">
            Des formules simples, calculées au kilomètre avec suivi GPS et assurance inclus.
          </p>
        </div>
      </section>

      <PricingPlans />

      {/* Grille tarifaire */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center mb-12">Grille tarifaire par zones</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {zones.map((zone, index) => <Card key={index} className="border-2 hover:border-primary transition-smooth">
                
              </Card>)}
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
                    {services.map(service => <tr key={service.name} className="align-top">
                        <td className="py-3 pr-4 font-semibold">{service.name}</td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          0–10 km = {formatPrice(service.base)} puis + {service.pricePerKm.toFixed(2).replace(".", ",")} €/km
                        </td>
                        <td className="py-3 pr-4">{service.delay}</td>
                        <td className="py-3 pr-4">{formatPrice(calculatePrice(5, service.base, service.pricePerKm))}</td>
                        <td className="py-3 pr-4">{formatPrice(calculatePrice(15, service.base, service.pricePerKm))}</td>
                        <td className="py-3">{formatPrice(calculatePrice(27, service.base, service.pricePerKm))}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">Suivi GPS et assurance inclus.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Tarifs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center mb-12">Questions fréquentes sur les tarifs</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>)}
            </Accordion>
          </div>
        </div>
      </section>
    </Layout>;
};
export default Tarifs;