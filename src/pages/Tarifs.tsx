import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Layout from "@/components/layout/Layout";
import { PricingPlans } from "@/components/pricing/PricingPlans";
import { PricingRateTable } from "@/components/pricing/PricingRateTable";
const Tarifs = () => {
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

      <PricingRateTable />

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
