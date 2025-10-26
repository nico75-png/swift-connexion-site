import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  CreditCard,
  Headset,
  MessageCircle,
  Search,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";

type HelpCategory = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  keywords: string[];
  cta?: string;
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
};

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "commandes",
    title: "Commandes & livraisons",
    description: "Suivi, retards, enlèvements, réception.",
    icon: Truck,
    keywords: ["colis", "livraison", "commande", "retard", "suivre"],
    cta: "Suivre une commande",
  },
  {
    id: "facturation",
    title: "Facturation & paiements",
    description: "Téléchargement, règlement, remboursements.",
    icon: CreditCard,
    keywords: ["facture", "paiement", "remboursement", "iban", "telecharger"],
    cta: "Consulter mes factures",
  },
  {
    id: "compte",
    title: "Compte & société",
    description: "Coordonnées, SIRET, contacts autorisés.",
    icon: Building2,
    keywords: ["profil", "societe", "siret", "coordonnees", "contact"],
  },
  {
    id: "securite",
    title: "Sécurité & accès",
    description: "Connexion, mot de passe, confidentialité.",
    icon: ShieldCheck,
    keywords: ["mot de passe", "2fa", "securite", "connexion", "confidentialite"],
  },
  {
    id: "support",
    title: "Messagerie & support",
    description: "Contacter un conseiller, assistance directe.",
    icon: MessageCircle,
    keywords: ["contact", "support", "messagerie", "conseiller", "aide"],
  },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    question: "Comment suivre l'acheminement d'une commande ?",
    answer:
      "Rendez-vous dans Commandes > Suivi en temps réel, puis entrez votre numéro d'expédition pour consulter la progression.",
    keywords: ["suivre", "commande", "tracking", "colis"],
  },
  {
    id: "faq-2",
    question: "Où télécharger ma dernière facture ?",
    answer:
      "Depuis Facturation, sélectionnez la période souhaitée puis cliquez sur Télécharger en PDF ou CSV selon votre besoin.",
    keywords: ["facture", "telecharger", "paiement"],
  },
  {
    id: "faq-3",
    question: "Puis-je ajouter un nouvel utilisateur à mon compte ?",
    answer:
      "Oui, dans Compte & société > Gestion des accès, invitez votre collaborateur et définissez ses autorisations en un clic.",
    keywords: ["utilisateur", "inviter", "acces", "autorisation"],
  },
  {
    id: "faq-4",
    question: "Que faire en cas d'échec de paiement ?",
    answer:
      "Vérifiez l'état de votre carte ou procédez à un nouveau paiement via Facturation. Notre support peut également régulariser la situation.",
    keywords: ["paiement", "echec", "erreur", "carte"],
  },
  {
    id: "faq-5",
    question: "Comment réinitialiser mon mot de passe ?",
    answer:
      "Sur la page de connexion, cliquez sur Mot de passe oublié. Vous recevrez un lien sécurisé valable 30 minutes.",
    keywords: ["mot de passe", "reinitialiser", "connexion"],
  },
];

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const Aide = () => {
  const [query, setQuery] = useState("");

  const normalizedQuery = useMemo(() => normalize(query.trim()), [query]);

  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) {
      return HELP_CATEGORIES;
    }

    return HELP_CATEGORIES.filter((category) => {
      const haystack = [
        category.title,
        category.description,
        ...(category.keywords ?? []),
      ]
        .map(normalize)
        .join(" ");

      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  const filteredFaqs = useMemo(() => {
    if (!normalizedQuery) {
      return FAQ_ITEMS;
    }

    return FAQ_ITEMS.filter((faq) => {
      const haystack = [faq.question, faq.answer, ...faq.keywords]
        .map(normalize)
        .join(" ");

      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  return (
    <motion.section
      className="flex flex-col gap-8 rounded-3xl bg-[#F9FAFB] px-6 py-10 text-[15px] leading-relaxed text-slate-700 md:px-12"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <header className="max-w-2xl space-y-3">
          <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1 text-xs font-semibold text-blue-700">
            Support client
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Centre d’aide One Connexion</h1>
            <p className="mt-2 text-[15px] text-slate-600">
              Recherchez une solution ou contactez notre équipe support.
            </p>
          </div>
        </header>
      </div>

      <div className="space-y-3">
        <div className="relative w-full max-w-2xl">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une question, un mot-clé, une commande..."
            className="w-full rounded-2xl border border-gray-200 bg-white p-3 pl-12 text-[15px] shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
            aria-label="Rechercher dans le centre d'aide"
          />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <p className="text-sm text-slate-500">
          Exemples : suivre une commande, payer une facture, modifier mes informations…
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {filteredCategories.length} catégorie{filteredCategories.length > 1 ? "s" : ""} affichée{filteredCategories.length > 1 ? "s" : ""}
        </p>
        {normalizedQuery && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
          >
            Effacer la recherche
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 md:gap-6">
        {filteredCategories.map((category) => {
          const Icon = category.icon;

          return (
            <motion.button
              key={category.id}
              type="button"
              className="group flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white hover:-translate-y-1 hover:shadow-md"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-base font-semibold text-gray-800">{category.title}</h3>
              </div>
              <p className="text-sm text-gray-500">{category.description}</p>
              {category.cta ? (
                <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 transition group-hover:translate-x-1 group-hover:text-blue-700">
                  {category.cta}
                  <span aria-hidden="true" className="ml-1">→</span>
                </span>
              ) : null}
            </motion.button>
          );
        })}

        {filteredCategories.length === 0 && (
          <motion.div
            className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Aucune catégorie ne correspond à votre recherche. Essayez un autre mot-clé ou contactez notre équipe.
          </motion.div>
        )}
      </div>

      <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="rounded-2xl bg-white p-3 text-blue-600 shadow-sm">
              <Headset className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-slate-900">
                Besoin d'aide ? Contactez un conseiller One Connexion
              </h2>
              <p className="text-sm text-slate-600">
                Notre équipe est disponible du lundi au vendredi de 8h à 18h.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-50"
            >
              💬 Ouvrir la messagerie
            </button>
            <button
              type="button"
              className="rounded-xl border border-blue-600 px-5 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-50"
            >
              📞 Appeler un conseiller
            </button>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <span>support@one-connexion.com</span>
          <span className="hidden h-1 w-1 rounded-full bg-slate-400 md:inline-block" aria-hidden="true" />
          <span>+33 1 86 76 45 90</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Questions les plus consultées</h2>
          <span className="text-xs uppercase tracking-wide text-blue-600">Mise à jour quotidienne</span>
        </div>

        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          {filteredFaqs.map((faq) => (
            <details
              key={faq.id}
              className="group [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 text-left text-[15px] font-medium text-slate-800 transition hover:bg-slate-50">
                {faq.question}
                <span className="text-sm text-slate-400 transition group-open:rotate-180">⌄</span>
              </summary>
              <p className="px-6 pb-5 text-sm text-slate-600">
                {faq.answer}
              </p>
            </details>
          ))}

          {filteredFaqs.length === 0 && (
            <p className="px-6 py-5 text-sm text-slate-500">
              Aucune question ne correspond à votre recherche. N'hésitez pas à ouvrir la messagerie pour nous contacter directement.
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default Aide;
