import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

const Contact = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    toast.success("Message envoyé ! Nous vous répondrons dans les 24 heures.");
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Téléphone",
      content: "01 23 45 67 89",
      link: "tel:+33123456789",
    },
    {
      icon: Mail,
      title: "Email",
      content: "contact@oneconnexion.fr",
      link: "mailto:contact@oneconnexion.fr",
    },
    {
      icon: MapPin,
      title: "Adresse",
      content: "123 Avenue de Paris, 75001 Paris, France",
      link: null,
    },
    {
      icon: Clock,
      title: "Horaires",
      content: "Lun-Ven : 8h-20h, Sam-Dim : 9h-18h",
      link: null,
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6">Contactez-nous</h1>
          <p className="text-xl max-w-3xl mx-auto text-primary-foreground/90">
            Une question ? Un projet spécifique ? Notre équipe est à votre écoute
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="mb-8">Nos coordonnées</h2>
              <div className="grid gap-6">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="border-none shadow-soft hover:shadow-medium transition-smooth">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <info.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{info.title}</h3>
                          {info.link ? (
                            <a
                              href={info.link}
                              className="text-muted-foreground hover:text-primary transition-smooth"
                            >
                              {info.content}
                            </a>
                          ) : (
                            <p className="text-muted-foreground">{info.content}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Map Placeholder */}
              <Card className="border-none shadow-medium overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Carte interactive</p>
                      <p className="text-xs text-muted-foreground">Paris, Île-de-France</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="border-none shadow-large">
                <CardContent className="p-8">
                  <h2 className="mb-6">Envoyez-nous un message</h2>
                  {formSubmitted ? (
                    <div className="text-center py-12 animate-scale-in">
                      <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                        <Mail className="h-8 w-8 text-success" />
                      </div>
                      <h3 className="text-2xl font-semibold mb-2">Message envoyé !</h3>
                      <p className="text-muted-foreground mb-6">
                        Merci pour votre message. Nous vous répondrons dans les 24 heures.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setFormSubmitted(false)}
                      >
                        Envoyer un autre message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Nom *</label>
                          <input
                            type="text"
                            required
                            className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                            placeholder="Votre nom"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Société</label>
                          <input
                            type="text"
                            className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                            placeholder="Nom de votre société"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Secteur d'activité</label>
                        <select className="w-full h-11 px-4 rounded-lg border border-input bg-background">
                          <option value="">Sélectionnez un secteur</option>
                          <option>Santé / Médical</option>
                          <option>Optique</option>
                          <option>Juridique</option>
                          <option>B2B / Industrie</option>
                          <option>Événementiel</option>
                          <option>Autre</option>
                        </select>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Email *</label>
                          <input
                            type="email"
                            required
                            className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                            placeholder="email@exemple.fr"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Téléphone</label>
                          <input
                            type="tel"
                            className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                            placeholder="01 23 45 67 89"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Message *</label>
                        <textarea
                          required
                          rows={5}
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background resize-none"
                          placeholder="Décrivez votre besoin ou posez votre question..."
                        />
                      </div>

                      <Button type="submit" variant="cta" size="lg" className="w-full">
                        Envoyer le message
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        En envoyant ce formulaire, vous acceptez que vos données soient utilisées pour vous répondre.
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
