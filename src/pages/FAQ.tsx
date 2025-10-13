import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Clock, Shield, CreditCard, MapPin, Search } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

const FAQ = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", label: "Toutes", icon: null },
    { id: "delais", label: "Délais", icon: Clock },
    { id: "securite", label: "Sécurité", icon: Shield },
    { id: "facturation", label: "Facturation", icon: CreditCard },
    { id: "zones", label: "Zones", icon: MapPin },
  ];

  const faqs = [
    {
      category: "delais",
      question: "Quels sont vos délais de livraison ?",
      answer: "Nos délais varient selon la zone : 1-2h pour Paris intra-muros, 2-3h pour la petite couronne, 3-4h pour la grande couronne. La livraison express (sous 1h) est disponible moyennant un supplément de 30%.",
    },
    {
      category: "delais",
      question: "Livrez-vous le week-end et les jours fériés ?",
      answer: "Oui, nous assurons des livraisons 7j/7, y compris les week-ends et jours fériés. Des suppléments peuvent s'appliquer pour les jours fériés.",
    },
    {
      category: "delais",
      question: "Puis-je programmer une livraison à une date ultérieure ?",
      answer: "Absolument ! Lors de la commande, vous pouvez choisir une date et un créneau horaire spécifiques jusqu'à 30 jours à l'avance.",
    },
    {
      category: "securite",
      question: "Comment garantissez-vous la sécurité de mes colis ?",
      answer: "Tous nos colis sont suivis en temps réel par GPS, assurés jusqu'à 500€, et manipulés par des coursiers formés. Pour les secteurs sensibles (médical, juridique), nos coursiers sont spécialement formés aux normes spécifiques.",
    },
    {
      category: "securite",
      question: "Que se passe-t-il en cas de perte ou de dommage ?",
      answer: "Notre assurance de base couvre jusqu'à 500€. En cas de dommage ou perte, vous devez déclarer le sinistre sous 48h. Une assurance renforcée est disponible pour les colis de grande valeur.",
    },
    {
      category: "securite",
      question: "Les documents confidentiels sont-ils sécurisés ?",
      answer: "Oui, nos coursiers sont tenus au secret professionnel. Pour les documents juridiques ou médicaux, nous assurons une remise en main propre avec émargement et preuve de livraison horodatée.",
    },
    {
      category: "facturation",
      question: "Comment puis-je payer mes courses ?",
      answer: "Paiement par carte bancaire à la commande pour les courses ponctuelles. Les comptes professionnels bénéficient d'une facturation mensuelle avec règlement par virement ou prélèvement.",
    },
    {
      category: "facturation",
      question: "Proposez-vous des tarifs dégressifs ?",
      answer: "Oui, pour les entreprises avec un volume régulier (>20 courses/mois), nous proposons des tarifs préférentiels. Contactez-nous pour un devis personnalisé.",
    },
    {
      category: "facturation",
      question: "Y a-t-il des frais cachés ?",
      answer: "Non, nos tarifs sont totalement transparents. Le prix affiché dans le simulateur est le prix final, sauf ajout d'options complémentaires (express, fragile, etc.).",
    },
    {
      category: "zones",
      question: "Couvrez-vous toute l'Île-de-France ?",
      answer: "Oui, nous livrons dans toute l'Île-de-France : Paris intra-muros et les 8 départements de la région (75, 77, 78, 91, 92, 93, 94, 95).",
    },
    {
      category: "zones",
      question: "Livrez-vous en dehors de l'Île-de-France ?",
      answer: "Actuellement, nos services sont limités à l'Île-de-France. Pour des livraisons nationales, contactez-nous pour étudier votre demande.",
    },
    {
      category: "zones",
      question: "Comment connaître ma zone tarifaire ?",
      answer: "Notre simulateur de tarifs détermine automatiquement votre zone en fonction des codes postaux de départ et d'arrivée. Vous pouvez aussi nous contacter pour confirmation.",
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Votre question a été envoyée ! Nous vous répondrons dans les 24h.");
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6">Questions fréquentes</h1>
          <p className="text-xl max-w-3xl mx-auto text-primary-foreground/90">
            Trouvez rapidement les réponses à vos questions
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Search */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher une question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-xl border border-input bg-background shadow-soft"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-smooth ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground shadow-medium"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  {category.icon && <category.icon className="h-4 w-4" />}
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {filteredFaqs.length === 0 ? (
              <Card className="border-none shadow-soft">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Aucune question ne correspond à votre recherche.</p>
                  <Button variant="outline" className="mt-4" onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}>
                    Réinitialiser les filtres
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border border-border rounded-xl px-6 bg-card shadow-soft hover:shadow-medium transition-smooth"
                  >
                    <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </section>

      {/* Ask Question Form */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-none shadow-large">
              <CardContent className="p-8">
                <h2 className="text-center mb-6">Vous ne trouvez pas votre réponse ?</h2>
                <p className="text-center text-muted-foreground mb-8">
                  Posez-nous votre question, nous vous répondrons dans les 24 heures
                </p>
                <form onSubmit={handleQuestionSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nom</label>
                      <input
                        type="text"
                        required
                        className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <input
                        type="email"
                        required
                        className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                        placeholder="email@exemple.fr"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Votre question</label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background resize-none"
                      placeholder="Posez votre question..."
                    />
                  </div>
                  <Button type="submit" variant="cta" size="lg" className="w-full">
                    Envoyer ma question
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;
