import Layout from "@/components/layout/Layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const faqItems = [
  {
    question: "Comment fonctionne la tarification selon la distance ?",
    answer:
      "Nous calculons nos tarifs en fonction du kilométrage réel entre le point d’enlèvement et le point de livraison. Chaque demande reçoit un devis instantané incluant la prise en charge, la distance parcourue et, le cas échéant, les options complémentaires choisies.",
  },
  {
    question: "Quels sont vos délais moyens de livraison ?",
    answer:
      "En Île-de-France, une livraison express est généralement effectuée en 60 à 90 minutes. Pour les trajets plus longs ou les tournées multi-points, nous ajustons le délai tout en vous communiquant une estimation précise lors de la commande.",
  },
  {
    question: "Proposez-vous un service en soirée ou le week-end ?",
    answer:
      "Oui, notre réseau de chauffeurs dédiés couvre les besoins en soirée, le week-end et les jours fériés sur simple demande. Il vous suffit de préciser le créneau souhaité lors de la réservation pour que nous mobilisions une équipe adaptée.",
  },
  {
    question: "Puis-je suivre mon colis en temps réel ?",
    answer:
      "Chaque mission bénéficie d’un suivi GPS accessible depuis votre espace client. Vous visualisez en direct la position du coursier, recevez les notifications d’étapes clés et obtenez la preuve de livraison dès la remise au destinataire.",
  },
  {
    question: "Est-ce que je peux planifier une livraison à l’avance ?",
    answer:
      "Absolument. Vous pouvez planifier une course ponctuelle ou récurrente plusieurs jours, voire semaines, à l’avance. Nous bloquons alors le créneau et affectons le chauffeur idéal pour respecter vos engagements auprès de vos clients.",
  },
  {
    question: "Quels types de marchandises transportez-vous ?",
    answer:
      "Nous prenons en charge la majorité des marchandises professionnelles : documents confidentiels, pièces détachées, matériel médical, prototypes, produits high-tech ou colis fragiles nécessitant un soin particulier.",
  },
  {
    question: "Que se passe-t-il si un colis est perdu ou endommagé ?",
    answer:
      "Nos livraisons sont couvertes par une assurance professionnelle. En cas d’incident, nous ouvrons immédiatement un dossier de prise en charge, coordonnons les démarches avec vous et organisons si besoin une nouvelle expédition prioritaire.",
  },
];

const FAQ = () => {
  return (
    <Layout>
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
          <header className="text-center">
            <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">Foire aux questions</h1>
            <p className="mt-4 text-base text-gray-600 sm:text-lg">
              Toutes les réponses à vos questions sur notre service de livraison express B2B
            </p>
          </header>

          <div className="space-y-4">
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={item.question}
                  value={`faq-${index}`}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow data-[state=open]:border-blue-200 data-[state=open]:shadow-md"
                >
                  <AccordionTrigger className="px-6 py-5 text-left text-lg font-semibold text-gray-900 hover:no-underline data-[state=open]:text-blue-600">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 text-base leading-relaxed text-gray-600">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Besoin d’un accompagnement personnalisé ?</h2>
            <p className="mt-3 text-base text-gray-600">
              Notre équipe commerciale est disponible pour vous aider à construire une solution de livraison sur mesure.
            </p>
            <Button asChild className="mt-6">
              <Link to="/contact">Contactez un conseiller</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;
