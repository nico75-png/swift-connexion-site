import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const faqItems = [
  {
    question: "Comment fonctionne la tarification par zone ?",
    answer:
      "Nos tarifs sont structurés par zones géographiques. Chaque course est automatiquement associée à une zone selon les adresses de départ et d'arrivée, ce qui vous garantit un prix clair et prévisible avant confirmation.",
  },
  {
    question: "Quel est le délai moyen pour une livraison express ?",
    answer:
      "Sur Paris et la proche couronne, la majorité de nos livraisons express arrivent entre 60 et 90 minutes. Pour les secteurs plus éloignés, nous adaptons les délais tout en vous tenant informé en temps réel.",
  },
  {
    question: "Puis-je programmer une livraison récurrente ?",
    answer:
      "Oui, vous pouvez planifier des tournées récurrentes directement depuis votre espace client. Notre équipe vous aide à configurer vos créneaux afin de gagner en simplicité au quotidien.",
  },
  {
    question: "Offrez-vous un service client en cas d'imprévu ?",
    answer:
      "Notre support dédié B2B est disponible de 7h à 22h pour intervenir immédiatement. Nous gérons les imprévus, proposons des alternatives et assurons un suivi proactif auprès de vos équipes.",
  },
  {
    question: "Est-ce que je peux suivre mon colis en temps réel ?",
    answer:
      "Chaque livraison dispose d'un tracking GPS en direct ainsi que de notifications email ou SMS. Vous savez précisément où se trouve votre colis, de l'enlèvement à la remise en main propre.",
  },
  {
    question: "Quels types de marchandises sont acceptés ?",
    answer:
      "Nous prenons en charge la majorité des marchandises professionnelles : documents confidentiels, matériel médical, pièces détachées, prototypes, et colis fragiles nécessitant une attention particulière.",
  },
  {
    question: "Quels sont vos horaires de livraison ?",
    answer:
      "Nos coursiers interviennent du lundi au samedi de 6h à 22h. Sur demande, nous activons une astreinte nocturne ou dimanche pour vos opérations critiques.",
  },
];

const advisors = ["AL", "MB", "CP"];

const FAQ = () => {
  return (
    <section className="relative isolate overflow-hidden bg-white py-24 text-foreground">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(15,53,86,0.12),_transparent_60%)]" />

      <div className="container px-4">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.1fr)]">
          <div className="flex flex-col justify-between gap-12">
            <div className="space-y-6">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
                FAQ
              </span>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight text-primary md:text-5xl">
                  Retrouvez les réponses à vos questions
                </h1>
                <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                  Retrouvez ici les réponses aux questions les plus fréquentes sur nos services de livraison express B2B.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {advisors.map((initials, index) => (
                    <Avatar
                      key={initials}
                      className={`h-12 w-12 border-2 border-primary/20 bg-primary/10 ${index > 0 ? "ring-2 ring-primary/10" : ""}`}
                    >
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Confiance client</p>
                  <p className="text-lg font-semibold text-primary">80+ clients assistés le mois dernier</p>
                </div>
              </div>

              <Button variant="cta" size="lg" className="w-full sm:w-auto">
                Parler à un conseiller
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-white p-6 shadow-soft sm:p-8">
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={item.question}
                  value={`faq-${index}`}
                  className="overflow-hidden rounded-2xl border border-border bg-muted"
                >
                  <AccordionTrigger className="px-6 py-5 text-left text-base font-semibold text-primary transition-smooth hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
