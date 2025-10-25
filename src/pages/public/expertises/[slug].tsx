import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const expertiseContent: Record<string, { title: string; description: string }> = {
  express: {
    title: "Transport express",
    description:
      "Solutions de transport express pour vos envois urgents, avec un suivi en temps réel et des délais garantis.",
  },
  premium: {
    title: "Service premium",
    description:
      "Accompagnement personnalisé pour les flux logistiques sensibles nécessitant une attention dédiée.",
  },
  international: {
    title: "Logistique internationale",
    description:
      "Gestion intégrale de vos importations et exportations, avec un réseau de partenaires certifiés.",
  },
};

const DefaultContent = {
  title: "Expertise sur mesure",
  description:
    "Découvrez nos solutions de transport adaptées à vos besoins. Contactez-nous pour créer un parcours personnalisé.",
};

const ExpertiseDetail = () => {
  const { slug } = useParams();

  const content = useMemo(() => {
    if (!slug) {
      return DefaultContent;
    }

    const normalizedSlug = slug.toLowerCase();
    return expertiseContent[normalizedSlug] ?? DefaultContent;
  }, [slug]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink to="/">Accueil</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink to="/expertises">Expertises</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-sm font-medium text-muted-foreground">{content.title}</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid gap-12 lg:grid-cols-[2fr,1fr]">
          <article className="space-y-6">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{content.title}</h1>
            <p className="text-lg leading-relaxed text-muted-foreground">{content.description}</p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Chaque partenariat commence par une écoute attentive de vos enjeux logistiques. Nos équipes analysent vos contraintes,
              modélisent des scénarios d&apos;acheminement et orchestrent les ressources nécessaires pour atteindre vos objectifs.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Grâce à nos outils propriétaires, vous bénéficiez d&apos;une visibilité complète sur vos flux, d&apos;alertes intelligentes et
              d&apos;un accompagnement proactif pour anticiper chaque étape clé.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <a href="/contact">Échanger avec un expert</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="/commande-sans-compte">Commander sans compte</a>
              </Button>
            </div>
          </article>

          <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Ce que vous obtenez</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>• Un interlocuteur dédié pour piloter vos opérations</li>
                <li>• Un suivi temps réel et des rapports personnalisés</li>
                <li>• Des engagements de performance contractualisés</li>
              </ul>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Besoin d&apos;aller plus loin ?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Nos consultants évaluent vos flux actuels et identifient les axes d&apos;optimisation adaptés à votre activité.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default ExpertiseDetail;
