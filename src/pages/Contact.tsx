import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

const Contact = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    toast.success("Message envoyé ! Nous vous répondrons dans les 24 heures.");
  };

  const responseHighlights = [
    { value: "15 min", label: "Temps de réponse moyen" },
    { value: "98%", label: "Clients satisfaits" },
    { value: "24/7", label: "Support urgent" },
  ];

  const contactChannels = [
    {
      icon: Phone,
      label: "Service client",
      value: "01 23 45 67 89",
      description: "Appels gratuits depuis la France · Priorité entreprises",
      href: "tel:+33123456789",
    },
    {
      icon: Mail,
      label: "Support email",
      value: "contact@oneconnexion.fr",
      description: "Réponse garantie en moins de 24h ouvrées",
      href: "mailto:contact@oneconnexion.fr",
    },
  ];

  const generalInfos = [
    {
      icon: MapPin,
      title: "Adresse siège",
      content: "123 Avenue de Paris, 75001 Paris",
      detail: "Île-de-France, France",
    },
    {
      icon: Clock,
      title: "Horaires",
      content: "Lun-Ven : 8h-20h",
      detail: "Astreinte week-end pour les urgences",
    },
    {
      icon: Mail,
      title: "Service commercial",
      content: "devis@oneconnexion.fr",
      detail: "Accompagnement dédié pour vos projets",
    },
  ];

  const inputClasses =
    "w-full h-12 rounded-xl border border-primary/20 bg-white/90 px-4 text-base text-foreground shadow-inner focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-smooth placeholder:text-muted-foreground/70";

  return (
    <Layout>
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[hsl(var(--primary-dark))] via-[hsl(var(--primary))] to-[#081a2d] py-24 text-primary-foreground">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          aria-hidden="true"
        >
          <div className="absolute -top-24 right-0 h-64 w-64 bg-[radial-gradient(circle_at_center,rgba(0,163,224,0.35)_0%,rgba(8,26,45,0)_70%)] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 bg-[radial-gradient(circle_at_center,rgba(255,184,0,0.22)_0%,rgba(8,26,45,0)_65%)] blur-3xl" />
        </div>

        <div className="container relative z-10 px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="outline"
              className="mx-auto w-fit border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-primary-foreground/80"
            >
              Support Swift Connexion
            </Badge>
            <h1 className="mt-6">Contactez notre équipe</h1>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Confiez-nous vos besoins de transport et de logistique urbaine : nous bâtissons des solutions sur-mesure pour votre
              entreprise.
            </p>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-[1.05fr_1fr]">
            <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-white/5 p-10 shadow-[0_28px_80px_rgba(8,26,45,0.35)] backdrop-blur-xl">
              <div className="absolute -right-24 top-0 h-64 w-64 bg-[radial-gradient(circle_at_center,rgba(0,163,224,0.2)_0%,rgba(8,26,45,0)_70%)]" aria-hidden="true" />
              <div className="relative space-y-10">
                <div className="space-y-6">
                  <h2 className="text-3xl font-semibold">Un accompagnement réactif et humain</h2>
                  <p className="text-base text-primary-foreground/80">
                    Nos spécialistes répondent à toutes vos questions : devis, intégration digitale, suivi en temps réel ou mise en place
                    d&apos;un service premium pour vos clients.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {responseHighlights.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left shadow-[0_10px_30px_rgba(8,26,45,0.18)]"
                      >
                        <p className="text-2xl font-semibold text-primary-foreground">{item.value}</p>
                        <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-primary-foreground/60">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {contactChannels.map((channel) => (
                    <a
                      key={channel.label}
                      href={channel.href}
                      className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition-smooth hover:-translate-y-1 hover:border-white/30 hover:bg-white/10"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/50 text-primary-foreground">
                        <channel.icon className="h-6 w-6" />
                      </span>
                      <div className="flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-foreground/60">
                          {channel.label}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-primary-foreground">{channel.value}</p>
                        <p className="text-sm text-primary-foreground/70">{channel.description}</p>
                      </div>
                      <ArrowUpRight className="mt-1 h-5 w-5 text-primary-foreground/40 transition-smooth group-hover:text-primary-foreground" />
                    </a>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold text-primary-foreground">Coordonnées générales</h3>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    {generalInfos.map((info) => (
                      <div key={info.title} className="flex gap-3">
                        <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/40 text-primary-foreground">
                          <info.icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-primary-foreground/80">{info.title}</p>
                          <p className="text-base font-medium text-primary-foreground">{info.content}</p>
                          <p className="text-sm text-primary-foreground/70">{info.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Button variant="outline-light" className="px-6 py-3 text-sm font-semibold">
                      Télécharger la plaquette
                    </Button>
                    <p className="text-sm text-primary-foreground/70">
                      Besoin d&apos;un audit logistique ? Contactez-nous pour une étude personnalisée.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="relative rounded-[32px] border border-white/40 bg-white/95 shadow-[0_32px_80px_rgba(8,26,45,0.25)] backdrop-blur-xl">
              <CardContent className="p-10">
                <div className="mb-8 space-y-2 text-center lg:text-left">
                  <h2 className="text-3xl font-semibold text-foreground">Planifiez votre projet</h2>
                  <p className="text-base text-muted-foreground">
                    Détaillez vos besoins : nous revenons vers vous avec une proposition précise et des recommandations opérationnelles.
                  </p>
                </div>

                {formSubmitted ? (
                  <div className="animate-scale-in rounded-2xl border border-primary/20 bg-gradient-to-br from-secondary/15 via-white to-cta/10 p-10 text-center shadow-[0_20px_60px_rgba(18,59,99,0.15)]">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <Mail className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground">Message envoyé !</h3>
                    <p className="mt-3 text-base text-muted-foreground">
                      Merci pour votre confiance. Un expert Swift Connexion vous répondra dans les prochaines heures ouvrées.
                    </p>
                    <Button
                      variant="outline"
                      size="lg"
                      className="mt-8"
                      onClick={() => setFormSubmitted(false)}
                    >
                      Envoyer un nouveau message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground">Nom *</label>
                        <input type="text" required className={inputClasses} placeholder="Votre nom" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground">Société</label>
                        <input type="text" className={inputClasses} placeholder="Nom de votre société" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-muted-foreground">Secteur d&apos;activité</label>
                      <select className={`${inputClasses} pr-10`} defaultValue="">
                        <option value="" disabled>
                          Sélectionnez un secteur
                        </option>
                        <option>Santé / Médical</option>
                        <option>Optique</option>
                        <option>Juridique</option>
                        <option>B2B / Industrie</option>
                        <option>Événementiel</option>
                        <option>Autre</option>
                      </select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground">Email *</label>
                        <input type="email" required className={inputClasses} placeholder="email@exemple.fr" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground">Téléphone</label>
                        <input type="tel" className={inputClasses} placeholder="01 23 45 67 89" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-muted-foreground">Message *</label>
                      <textarea
                        required
                        rows={5}
                        className="w-full rounded-xl border border-primary/20 bg-white/90 px-4 py-4 text-base text-foreground shadow-inner focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-smooth placeholder:text-muted-foreground/70"
                        placeholder="Décrivez votre besoin ou posez votre question..."
                      />
                    </div>

                    <Button type="submit" variant="cta" size="lg" className="w-full">
                      Envoyer mon projet
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      En envoyant ce formulaire, vous acceptez que vos données soient utilisées pour étudier votre demande. Consultez
                      notre politique de confidentialité.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
