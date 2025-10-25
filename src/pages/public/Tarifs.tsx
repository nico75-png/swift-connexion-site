import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Layout from "@/components/layout/Layout";
import { PricingPlans } from "@/components/pricing/PricingPlans";
import { PricingRateTable } from "@/components/pricing/PricingRateTable";
const Tarifs = () => {
  const faqs = [{
    question: "Comment sont calculés les tarifs ?",
    answer: "Les tarifs sont calculés en fonction de la distance, du poids du colis, et de l’urgence de la livraison."
  }, {
    question: "Y a-t-il des frais supplémentaires cachés ?",
    answer: "Non, tous les frais sont détaillés avant validation de la commande. Aucune surprise."
  }, {
    question: "Proposez-vous des tarifs dégressifs ?",
    answer: "Oui, des remises sont proposées en fonction du volume mensuel ou d’un contrat régulier."
  }, {
    question: "Comment puis-je payer mes courses ?",
    answer: "Le paiement peut s’effectuer par carte bancaire, virement ou facturation mensuelle selon votre profil."
  }, {
    question: "Les tarifs incluent-ils l’assurance ?",
    answer: "Oui, une assurance de base est incluse. Des options complémentaires sont disponibles selon la valeur déclarée."
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
            <h2 className="text-center mb-4">Foire aux questions – Tarifs</h2>
            <p className="text-center text-muted-foreground mb-12">
              Retrouvez ici toutes les réponses liées à notre système de tarification pour la livraison express B2B
            </p>
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
