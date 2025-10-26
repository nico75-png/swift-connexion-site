import { FormEvent, useMemo, useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const SUPPORT_CATEGORIES = [
  {
    value: "commande" as const,
    label: "Suivi ou problème de commande",
    helper: "Signalez un incident sur une commande ou demandez un suivi détaillé.",
  },
  {
    value: "retard" as const,
    label: "Retard de livraison",
    helper: "Informez-nous d'un retard constaté afin que nous débloquions la situation rapidement.",
  },
  {
    value: "facturation" as const,
    label: "Questions de facturation",
    helper: "Précisez votre question sur une facture, un avoir ou un paiement.",
  },
  {
    value: "remboursement" as const,
    label: "Réclamation ou demande de remboursement",
    helper: "Expliquez la situation pour que nous puissions étudier votre dossier.",
  },
  {
    value: "autre" as const,
    label: "Autre",
    helper: "Posez-nous toute autre question relative à votre compte ou à nos services.",
  },
];

type SupportCategory = (typeof SUPPORT_CATEGORIES)[number]["value"];

type SubmissionState = "idle" | "success" | "error";

type HistoricMessage = {
  id: string;
  subject: string;
  category: SupportCategory;
  messagePreview: string;
  createdAt: string;
  status: "Répondu" | "En cours" | "Clôturé";
};

const STATIC_HISTORY: HistoricMessage[] = [
  {
    id: "SUP-2025-003",
    subject: "Confirmation de paiement non reçue",
    category: "facturation",
    messagePreview:
      "Bonjour, je n'ai pas reçu l'accusé de réception du paiement de ma dernière facture...",
    createdAt: "12 février 2025",
    status: "Répondu",
  },
  {
    id: "SUP-2025-002",
    subject: "Commande #SCX-4587 en attente de collecte",
    category: "commande",
    messagePreview:
      "La collecte annoncée pour hier n'a pas eu lieu, pouvez-vous vérifier auprès du transporteur ?",
    createdAt: "3 février 2025",
    status: "En cours",
  },
];

const Messages = () => {
  const [category, setCategory] = useState<SupportCategory | "">("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ category?: string; subject?: string; message?: string }>({});

  const selectedCategoryHelper = useMemo(
    () => SUPPORT_CATEGORIES.find((item) => item.value === category)?.helper,
    [category],
  );

  const resetForm = () => {
    setCategory("");
    setSubject("");
    setMessage("");
    setErrors({});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: { category?: string; subject?: string; message?: string } = {};

    if (!category) {
      nextErrors.category = "Sélectionnez la nature de votre demande.";
    }

    if (!subject.trim()) {
      nextErrors.subject = "Ajoutez un objet pour faciliter le traitement de votre message.";
    }

    if (!message.trim()) {
      nextErrors.message = "Décrivez votre demande afin que notre équipe puisse vous répondre.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmissionState("idle");
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setSubmissionState("idle");

    try {
      const payload = {
        category,
        subject: subject.trim(),
        message: message.trim(),
        source: "dashboard-client",
      };

      // Préparation de l'intégration API : POST /api/support
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("La requête n'a pas abouti");
      }

      setSubmissionState("success");
      resetForm();
    } catch (error) {
      console.error("Support form submission failed", error);
      setSubmissionState("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusBadge = (status: HistoricMessage["status"]) => {
    switch (status) {
      case "Répondu":
        return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Répondu</span>;
      case "En cours":
        return <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">En cours</span>;
      default:
        return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Clôturé</span>;
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Support client</p>
            <h1 className="mt-1 text-3xl font-semibold text-[#0B2D55]">Messages / Support client</h1>
          </div>
          <div className="hidden md:block rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
            Temps moyen de réponse : <span className="font-medium text-slate-700">sous 2 h</span>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          Contactez directement notre équipe administrative pour toute question : suivi de commande, livraison, facturation,
          réclamation ou autre demande spécifique.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[2fr_1.2fr]">
        <Card className="border-slate-200/80 shadow-lg shadow-slate-900/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-slate-900">Envoyer un message</CardTitle>
            <CardDescription>
              Nous reviendrons vers vous par e-mail. Vous recevrez également une notification dans votre tableau de bord.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="support-category" className="text-sm font-medium text-slate-700">
                  Catégorie de votre demande
                </Label>
                <Select value={category} onValueChange={(value: SupportCategory) => setCategory(value)}>
                  <SelectTrigger id="support-category" className="h-11 rounded-xl border-slate-200 bg-white shadow-sm">
                    <SelectValue placeholder="Sélectionnez un motif" />
                  </SelectTrigger>
                  <SelectContent align="start" className="rounded-xl border border-slate-200 bg-white shadow-xl">
                    {SUPPORT_CATEGORIES.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="rounded-lg text-sm">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-slate-800">{option.label}</span>
                          <span className="text-xs text-slate-500">{option.helper}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category ? (
                  <p className="text-xs font-medium text-rose-600">{errors.category}</p>
                ) : (
                  <p className="text-xs text-slate-500 transition-opacity duration-200">
                    {selectedCategoryHelper ?? "Choisissez la catégorie qui correspond le mieux à votre demande."}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="support-subject" className="text-sm font-medium text-slate-700">
                  Objet du message
                </Label>
                <Input
                  id="support-subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Exemple : Facture janvier 2025 non reçue"
                  className="h-11 rounded-xl border-slate-200 bg-white shadow-sm placeholder:text-slate-400"
                />
                {errors.subject && <p className="text-xs font-medium text-rose-600">{errors.subject}</p>}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="support-message" className="text-sm font-medium text-slate-700">
                  Message détaillé
                </Label>
                <Textarea
                  id="support-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Bonjour, je rencontre actuellement..."
                  className="min-h-[160px] rounded-2xl border-slate-200 bg-white shadow-sm placeholder:text-slate-400"
                />
                {errors.message && <p className="text-xs font-medium text-rose-600">{errors.message}</p>}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col items-start gap-4 border-t border-slate-100 bg-slate-50/60 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="text-xs text-slate-500">
                Vos informations sont transmises de manière sécurisée. Notre équipe vous contactera sur votre adresse e-mail
                enregistrée.
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-blue-600/30 transition hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Envoi..." : "Envoyer"}
              </Button>
            </CardFooter>
          </form>

          {submissionState === "success" && (
            <div className="mx-6 mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-inner">
              Message envoyé avec succès ! Notre équipe vous répondra très prochainement.
            </div>
          )}

          {submissionState === "error" && (
            <div className="mx-6 mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-inner">
              Une erreur est survenue lors de l'envoi. Veuillez réessayer dans quelques instants ou contacter le support par
              téléphone.
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Informations de contact</CardTitle>
              <CardDescription className="text-slate-300">
                Notre équipe support est disponible du lundi au vendredi de 8h à 19h.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm text-slate-200">
              <div className="rounded-2xl bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.35em] text-blue-200">Email direct</p>
                <p className="mt-1 text-lg font-medium text-white">support@swift-connexion.com</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.35em] text-blue-200">Téléphone</p>
                <p className="mt-1 text-lg font-medium text-white">+33 1 86 76 45 90</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-lg shadow-slate-900/5">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-slate-900">Mes messages précédents</CardTitle>
              <CardDescription>
                Historique indicatif des derniers échanges. Une connexion API permettra d'afficher vos conversations en temps
                réel.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {STATIC_HISTORY.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{item.id}</p>
                      <p className="mt-1 text-sm font-medium text-slate-800">{item.subject}</p>
                    </div>
                    {renderStatusBadge(item.status)}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {SUPPORT_CATEGORIES.find((option) => option.value === item.category)?.label ?? ""} · {item.createdAt}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.messagePreview}</p>
                </div>
              ))}
              {STATIC_HISTORY.length === 0 && (
                <p className="text-sm text-slate-500">Vous n'avez pas encore contacté le support depuis cet espace.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Messages;
