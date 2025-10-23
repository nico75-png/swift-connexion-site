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
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
          <header className="text-center">
            <h2 className="text-3xl font-semibold text-gray-900 sm:text-4xl">Foire aux questions – Tarifs</h2>
            <p className="mt-4 text-base text-gray-600 sm:text-lg">
              Retrouvez ici toutes les réponses liées à notre système de tarification pour la livraison express B2B
            </p>
          </header>

          <div className="space-y-4">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow data-[state=open]:border-blue-200 data-[state=open]:shadow-md"
                >
                  <AccordionTrigger className="px-6 py-5 text-left text-lg font-semibold text-gray-900 hover:no-underline data-[state=open]:text-blue-600">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 text-base leading-relaxed text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </Layout>;
};
export default Tarifs;
