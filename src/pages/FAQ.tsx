import Layout from "@/components/layout/Layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const faqItems = [
  {
    question: "Comment fonctionne la tarification selon la distance ?",
    answer:
      "Nous appliquons un tarif de base incluant l’enlèvement, auquel s’ajoute un coût par kilomètre réellement parcouru. Le devis tient aussi compte du trafic estimé et des contraintes d’accès pour garantir un prix juste avant validation.",
  },
  {
    question: "Quels sont vos délais moyens de livraison ?",
    answer:
      "Sur Paris et sa région, une course express est livrée en 60 à 90 minutes, ce qui maintient le tarif standard. Pour les trajets inter-régions, nous proposons des créneaux dédiés dont le prix reflète la distance et les temps de conduite réglementaires.",
  },
  {
    question: "Proposez-vous un service en soirée ou le week-end ?",
    answer:
      "Oui, des équipes d’astreinte assurent les livraisons tardives, le week-end et les jours fériés. Une majoration transparente est appliquée au devis pour couvrir la mobilisation spécifique des chauffeurs et garantir la continuité du service.",
  },
  {
    question: "Puis-je suivre mon colis en temps réel ?",
    answer:
      "Un lien de suivi GPS est inclus dans chaque commande sans surcoût pour que vous visualisiez l’avancée du coursier. Les statuts de prise en charge, d’acheminement et de remise sont horodatés pour faciliter vos reporting internes.",
  },
  {
    question: "Est-ce que je peux planifier une livraison à l’avance ?",
    answer:
      "Bien sûr, vous pouvez réserver une course plusieurs jours ou semaines en avance directement depuis l’espace client. Le tarif est verrouillé dès la validation et nous confirmons la disponibilité du chauffeur choisi pour le créneau.",
  },
  {
    question: "Quels types de marchandises transportez-vous ?",
    answer:
      "Nous transportons dossiers confidentiels, pièces industrielles, matériel médical ou high-tech avec emballage adapté. Certaines matières dangereuses sont exclues mais nous proposons des options de manutention spécifique facturées sur devis.",
  },
  {
    question: "Que se passe-t-il si un colis est perdu ou endommagé ?",
    answer:
      "Toutes nos courses sont couvertes par une assurance professionnelle intégrée dans le prix. En cas d’incident, nous déclenchons une indemnisation selon la valeur déclarée et, si besoin, réexpédions la marchandise en priorité.",
  },
];

const FAQ = () => {
  return (
    <Layout>
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
          <header className="text-center">
            <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">Foire aux questions – Tarifs</h1>
            <p className="mt-4 text-base text-gray-600 sm:text-lg">
              Retrouvez ici toutes les réponses liées à notre système de tarification pour la livraison express B2B
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
