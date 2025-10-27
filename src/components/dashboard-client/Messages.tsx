import { FormEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  CirclePlus,
  Clock3,
  Loader2,
  MessageCircleReply,
  MessageSquare,
  MessageSquareDashed,
  ShieldQuestion,
} from "lucide-react";
import { format, formatDistanceToNowStrict } from "date-fns";
import { fr } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  SupportConversationStatus,
  createSupportConversation,
  replyToSupportConversation,
} from "@/lib/api/supportMessages";

type SupportCategory =
  | "commande"
  | "facturation"
  | "livraison"
  | "technique"
  | "remboursement"
  | "autre";

type ConversationMessage = {
  id: string;
  author: "client" | "support";
  content: string;
  createdAt: string;
  statusNote?: string;
};

type Conversation = {
  id: string;
  reference: string;
  subject: string;
  category: SupportCategory;
  status: SupportConversationStatus;
  lastActivityAt: string;
  unreadCount: number;
  lastMessagePreview: string;
  messages: ConversationMessage[];
};

type StatusFilter = "all" | SupportConversationStatus;

const CATEGORY_OPTIONS: Array<{ value: SupportCategory; label: string; helper: string }> = [
  {
    value: "commande",
    label: "Commande",
    helper: "Questions liées à une commande ou à son suivi.",
  },
  {
    value: "livraison",
    label: "Livraison",
    helper: "Retards, créneaux ou réception de colis.",
  },
  {
    value: "facturation",
    label: "Facturation",
    helper: "Factures, avoirs et justificatifs comptables.",
  },
  {
    value: "remboursement",
    label: "Remboursement",
    helper: "Remboursements ou gestes commerciaux en cours.",
  },
  {
    value: "technique",
    label: "Technique",
    helper: "Incidents techniques sur la plateforme.",
  },
  {
    value: "autre",
    label: "Autre",
    helper: "Toute autre demande ou précision.",
  },
];

const STATUS_LABELS: Record<SupportConversationStatus, string> = {
  non_lu: "Non lu",
  en_cours: "En cours",
  resolu: "Résolu",
};

const STATUS_STYLES: Record<SupportConversationStatus, { badge: string; dot: string; border: string }> = {
  non_lu: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    border: "border-blue-200/80",
  },
  en_cours: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    border: "border-amber-200/80",
  },
  resolu: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    border: "border-emerald-200/80",
  },
};

const CATEGORY_BADGES: Record<SupportCategory, { label: string; className: string }> = {
  commande: { label: "Commande", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  livraison: { label: "Livraison", className: "bg-sky-50 text-sky-700 border-sky-200" },
  facturation: { label: "Facturation", className: "bg-violet-50 text-violet-700 border-violet-200" },
  remboursement: { label: "Remboursement", className: "bg-rose-50 text-rose-700 border-rose-200" },
  technique: { label: "Technique", className: "bg-slate-100 text-slate-700 border-slate-200" },
  autre: { label: "Autre", className: "bg-slate-50 text-slate-600 border-slate-200" },
};

const generateId = () => {
  if (typeof globalThis !== "undefined" && "crypto" in globalThis) {
    const cryptoObject = globalThis.crypto as Crypto;
    if (typeof cryptoObject.randomUUID === "function") {
      return cryptoObject.randomUUID();
    }
  }

  return Math.random().toString(36).slice(2, 10);
};

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-001",
    reference: "SUP-2025-003",
    subject: "Facture janvier 2025 non reçue",
    category: "facturation",
    status: "non_lu",
    unreadCount: 2,
    lastActivityAt: new Date("2025-02-15T09:15:00").toISOString(),
    lastMessagePreview: "Bonjour Clara, nous avons régénéré la facture et vous la recevrez d'ici quelques minutes...",
    messages: [
      {
        id: "conv-001-msg-001",
        author: "client",
        content:
          "Bonjour, je n'ai pas reçu la facture du mois de janvier pour la commande #SCX-8547. Pourriez-vous me la renvoyer ?",
        createdAt: new Date("2025-02-14T16:02:00").toISOString(),
      },
      {
        id: "conv-001-msg-002",
        author: "support",
        content:
          "Bonjour Clara, merci pour votre message. Je vérifie immédiatement et je reviens vers vous avec la facture au format PDF.",
        createdAt: new Date("2025-02-15T08:55:00").toISOString(),
      },
      {
        id: "conv-001-msg-003",
        author: "support",
        content:
          "Je viens de relancer l'envoi automatique. Vous devriez recevoir la facture dans les prochaines minutes par e-mail.",
        createdAt: new Date("2025-02-15T09:15:00").toISOString(),
        statusNote: "En attente de confirmation du client",
      },
    ],
  },
  {
    id: "conv-002",
    reference: "SUP-2025-002",
    subject: "Commande SCX-4587 - enlèvement non effectué",
    category: "commande",
    status: "en_cours",
    unreadCount: 0,
    lastActivityAt: new Date("2025-02-12T11:40:00").toISOString(),
    lastMessagePreview: "Merci Clara, nous avons contacté le transporteur pour reprogrammer la collecte cet après-midi.",
    messages: [
      {
        id: "conv-002-msg-001",
        author: "client",
        content:
          "Bonjour, l'enlèvement prévu hier à 15h pour la commande SCX-4587 n'a pas été réalisé. Pouvez-vous reprogrammer au plus vite ?",
        createdAt: new Date("2025-02-11T18:17:00").toISOString(),
      },
      {
        id: "conv-002-msg-002",
        author: "support",
        content:
          "Bonjour Clara, je viens d'ouvrir une investigation auprès du transporteur. Dès que j'ai un retour, je vous informe ici même.",
        createdAt: new Date("2025-02-12T09:02:00").toISOString(),
      },
      {
        id: "conv-002-msg-003",
        author: "support",
        content:
          "Merci pour votre patience. Le transporteur nous propose un passage aujourd'hui entre 16h et 17h. Pouvez-vous confirmer la disponibilité ?",
        createdAt: new Date("2025-02-12T11:40:00").toISOString(),
        statusNote: "Action requise",
      },
    ],
  },
  {
    id: "conv-003",
    reference: "SUP-2025-001",
    subject: "Accès bloqué à l'espace analytique",
    category: "technique",
    status: "resolu",
    unreadCount: 0,
    lastActivityAt: new Date("2025-02-08T14:30:00").toISOString(),
    lastMessagePreview: "Parfait, je constate que l'accès est à nouveau opérationnel. Merci pour votre réactivité !",
    messages: [
      {
        id: "conv-003-msg-001",
        author: "client",
        content:
          "Bonjour, depuis ce matin je ne peux plus accéder aux tableaux analytiques, j'obtiens une erreur 403.",
        createdAt: new Date("2025-02-08T10:10:00").toISOString(),
      },
      {
        id: "conv-003-msg-002",
        author: "support",
        content:
          "Bonjour Clara, nous venons de corriger les droits d'accès. Pouvez-vous tester à nouveau l'accès aux rapports ?",
        createdAt: new Date("2025-02-08T13:12:00").toISOString(),
      },
      {
        id: "conv-003-msg-003",
        author: "client",
        content: "Parfait, je constate que l'accès est à nouveau opérationnel. Merci pour votre réactivité !",
        createdAt: new Date("2025-02-08T14:30:00").toISOString(),
        statusNote: "Conversation close",
      },
    ],
  },
];

const formatDate = (isoDate: string) =>
  format(new Date(isoDate), "dd MMM yyyy 'à' HH:mm", { locale: fr });

const formatRelative = (isoDate: string) =>
  formatDistanceToNowStrict(new Date(isoDate), { addSuffix: true, locale: fr });

const Messages = () => {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    INITIAL_CONVERSATIONS[0]?.id ?? null,
  );
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerState, setComposerState] = useState<{
    category: SupportCategory | "";
    subject: string;
    message: string;
    isSubmitting: boolean;
    errors: Partial<Record<"category" | "subject" | "message", string>>;
    status: "idle" | "success" | "error";
  }>({ category: "", subject: "", message: "", isSubmitting: false, errors: {}, status: "idle" });
  const [replyDraft, setReplyDraft] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const filters: Array<{ id: StatusFilter; label: string; indicator?: string }> = [
    { id: "all", label: "Toutes" },
    { id: "non_lu", label: "Non lues", indicator: "🔵" },
    { id: "en_cours", label: "En cours", indicator: "🟠" },
    { id: "resolu", label: "Résolues", indicator: "🟢" },
  ];

  const filteredConversations = useMemo(() => {
    const list = filter === "all" ? conversations : conversations.filter((item) => item.status === filter);

    return [...list].sort((a, b) =>
      new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime(),
    );
  }, [conversations, filter]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  );

  const unreadTotal = useMemo(
    () => conversations.reduce((total, conversation) => total + conversation.unreadCount, 0),
    [conversations],
  );

  const handleOpenComposer = () => {
    setComposerState({ category: "", subject: "", message: "", isSubmitting: false, errors: {}, status: "idle" });
    setIsComposerOpen(true);
  };

  const handleComposerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors: Partial<Record<"category" | "subject" | "message", string>> = {};
    if (!composerState.category) {
      errors.category = "Sélectionnez une catégorie.";
    }
    if (!composerState.subject.trim()) {
      errors.subject = "Ajoutez un objet à votre message.";
    }
    if (!composerState.message.trim()) {
      errors.message = "Expliquez votre demande pour faciliter sa prise en charge.";
    }

    if (Object.keys(errors).length > 0) {
      setComposerState((previous) => ({ ...previous, errors }));
      return;
    }

    setComposerState((previous) => ({ ...previous, isSubmitting: true, errors: {}, status: "idle" }));

    try {
      const category = composerState.category as SupportCategory;
      const payload = {
        subject: composerState.subject.trim(),
        category,
        message: composerState.message.trim(),
      } as const;

      try {
        await createSupportConversation(payload);
      } catch (error) {
        console.error("createSupportConversation not yet connected", error);
      }

      const newConversation: Conversation = {
        id: `conv-${generateId()}`,
        reference: `SUP-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
        subject: payload.subject,
        category: payload.category,
        status: "non_lu",
        unreadCount: 0,
        lastActivityAt: new Date().toISOString(),
        lastMessagePreview: payload.message.slice(0, 140),
        messages: [
          {
            id: `msg-${generateId()}`,
            author: "client",
            content: payload.message,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      setConversations((previous) => [newConversation, ...previous]);
      setActiveConversationId(newConversation.id);
      setComposerState({
        category: "",
        subject: "",
        message: "",
        isSubmitting: false,
        errors: {},
        status: "success",
      });
      setIsComposerOpen(false);
    } catch (error) {
      console.error("Support message submission failed", error);
      setComposerState((previous) => ({ ...previous, isSubmitting: false, status: "error" }));
    }
  };

  const handleSendReply = async () => {
    if (!activeConversation || !replyDraft.trim()) {
      setReplyError("Ajoutez un message avant d'envoyer votre réponse.");
      return;
    }

    setReplyError(null);
    setIsReplying(true);

    try {
      try {
        await replyToSupportConversation(activeConversation.id, { message: replyDraft.trim() });
      } catch (error) {
        console.error("replyToSupportConversation not yet connected", error);
      }

      setConversations((previous) =>
        previous.map((conversation) => {
          if (conversation.id !== activeConversation.id) {
            return conversation;
          }

          const updatedMessages: ConversationMessage[] = [
            ...conversation.messages,
            {
              id: `msg-${generateId()}`,
              author: "client",
              content: replyDraft.trim(),
              createdAt: new Date().toISOString(),
            },
          ];

          return {
            ...conversation,
            messages: updatedMessages,
            lastActivityAt: new Date().toISOString(),
            lastMessagePreview: replyDraft.trim().slice(0, 140),
            status: conversation.status === "resolu" ? "en_cours" : conversation.status,
          };
        }),
      );

      setReplyDraft("");
    } catch (error) {
      console.error("Reply submission failed", error);
      setReplyError("Nous n'avons pas pu envoyer votre réponse. Veuillez réessayer dans un instant.");
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <section className="flex h-full flex-col gap-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">
            <MessageSquareDashed className="h-3.5 w-3.5" />
            <span>Support client</span>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">Messagerie &amp; assistance</h1>
          <p className="max-w-2xl text-sm text-slate-600">
            Consultez vos échanges avec notre équipe support, suivez leurs statuts en temps réel et démarrez une nouvelle
            conversation sans quitter votre tableau de bord.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
            Temps moyen de réponse : <span className="text-slate-900">1 h 45</span>
          </div>
          <Separator orientation="vertical" className="hidden h-6 lg:block" />
          <div className="hidden items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm lg:flex">
            <Clock3 className="h-4 w-4 text-blue-500" />
            <span>Dernière activité : {formatRelative(conversations[0]?.lastActivityAt ?? new Date().toISOString())}</span>
          </div>
        </div>
      </header>

      <Card className="flex min-h-[620px] flex-1 overflow-hidden border-slate-200/80 shadow-xl shadow-slate-900/5">
        <div className="flex w-full flex-col gap-0 overflow-hidden lg:flex-row">
          {/* Conversations list */}
          <aside className="w-full border-b border-slate-200/80 bg-white/70 backdrop-blur lg:w-[320px] lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-400">Conversations</p>
                <p className="text-sm text-slate-600">{unreadTotal} message(s) non lu(s)</p>
              </div>
              <Button
                type="button"
                onClick={handleOpenComposer}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700 px-3 py-2 text-xs font-semibold shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-blue-600"
              >
                <CirclePlus className="h-4 w-4" />
                Nouveau
              </Button>
            </div>

            <div className="flex gap-2 overflow-x-auto px-4 pb-3 text-xs">
              {filters.map((item) => {
                const isActive = filter === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
                      isActive
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
                    }`}
                  >
                    {item.indicator && <span>{item.indicator}</span>}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <Separator className="bg-slate-200" />

            <ScrollArea className="h-[420px]">
              <div className="flex flex-col">
                {filteredConversations.map((conversation) => {
                  const isActive = conversation.id === activeConversationId;
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setActiveConversationId(conversation.id)}
                      className={`flex flex-col gap-2 border-l-4 px-4 py-4 text-left transition hover:bg-slate-50 ${
                        isActive
                          ? "border-l-blue-500 bg-blue-50/50"
                          : "border-l-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{conversation.reference}</span>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-2 text-sm font-medium text-slate-900">{conversation.subject}</p>
                          <span className={`mt-1 h-2.5 w-2.5 rounded-full ${STATUS_STYLES[conversation.status].dot}`} />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <Badge
                            variant="outline"
                            className={`rounded-full border ${CATEGORY_BADGES[conversation.category].className}`}
                          >
                            {CATEGORY_BADGES[conversation.category].label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`rounded-full border ${STATUS_STYLES[conversation.status].badge}`}
                          >
                            {STATUS_LABELS[conversation.status]}
                          </Badge>
                          <span className="text-slate-500">
                            {formatRelative(conversation.lastActivityAt)}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-xs text-slate-500">{conversation.lastMessagePreview}</p>
                      </div>
                    </button>
                  );
                })}

                {filteredConversations.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center text-sm text-slate-500">
                    <ShieldQuestion className="h-10 w-10 text-slate-300" />
                    <p>Aucune conversation pour ce filtre pour le moment.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </aside>

          {/* Conversation detail */}
          <div className="flex min-h-[420px] flex-1 flex-col bg-slate-50">
            {activeConversation ? (
              <>
                <div className="flex flex-col gap-4 border-b border-slate-200 bg-white/80 px-6 py-5 backdrop-blur">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                        <span>{activeConversation.reference}</span>
                        <ArrowUpRight className="h-4 w-4 text-blue-500" />
                      </div>
                      <h2 className="text-xl font-semibold text-slate-900">{activeConversation.subject}</h2>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge
                          variant="outline"
                          className={`rounded-full border ${CATEGORY_BADGES[activeConversation.category].className}`}
                        >
                          {CATEGORY_BADGES[activeConversation.category].label}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`rounded-full border ${STATUS_STYLES[activeConversation.status].badge}`}
                        >
                          {STATUS_LABELS[activeConversation.status]}
                        </Badge>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatRelative(activeConversation.lastActivityAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 text-xs text-slate-500">
                      <span>Dernière mise à jour</span>
                      <span className="font-medium text-slate-900">{formatDate(activeConversation.lastActivityAt)}</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 text-xs text-slate-500 shadow-inner">
                    <div className="flex items-center gap-2 text-slate-700">
                      <BadgeCheck className="h-4 w-4 text-emerald-500" />
                      <span>
                        {activeConversation.status === "resolu"
                          ? "Cette conversation est marquée comme résolue. Vous pouvez rouvrir le fil en répondant ci-dessous."
                          : "Notre équipe suit actuellement votre demande. Vous serez notifié(e) dès qu'une mise à jour sera disponible."}
                      </span>
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="flex flex-col gap-6 px-6 py-6">
                    {activeConversation.messages.map((message) => {
                      const isClient = message.author === "client";
                      return (
                        <div key={message.id} className={`flex ${isClient ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-xl rounded-3xl border px-4 py-3 text-sm shadow-sm transition ${
                              isClient
                                ? "rounded-br-md border-blue-200/80 bg-blue-50 text-slate-800"
                                : "rounded-bl-md border-white bg-white text-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                              <span className="font-medium text-slate-600">
                                {isClient ? "Vous" : "Support One connexion"}
                              </span>
                              <span>{formatDate(message.createdAt)}</span>
                            </div>
                            <p className="mt-2 whitespace-pre-line leading-relaxed">{message.content}</p>
                            {message.statusNote && (
                              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                                <MessageCircleReply className="h-3.5 w-3.5 text-blue-500" />
                                <span>{message.statusNote}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                <div className="border-t border-slate-200 bg-white/80 px-6 py-5 backdrop-blur">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        {activeConversation.status === "resolu"
                          ? "Besoin de rouvrir la conversation ? Ajoutez un message ci-dessous."
                          : "Vous avez une précision à apporter ? Répondez directement dans le fil."}
                      </span>
                      <span className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1 lg:inline-flex">
                        <Clock3 className="h-3.5 w-3.5" />
                        Temps estimé de réponse : 1 h
                      </span>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                      <Textarea
                        value={replyDraft}
                        onChange={(event) => setReplyDraft(event.target.value)}
                        placeholder="Rédigez votre réponse ici..."
                        className="min-h-[120px] border-none bg-transparent p-0 text-sm focus-visible:ring-0"
                      />
                      {replyError && <p className="mt-2 text-xs font-medium text-rose-600">{replyError}</p>}
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>Envoi sécurisé et tracé</span>
                          <span className="hidden h-1.5 w-1.5 rounded-full bg-slate-300 md:block" />
                          <span className="hidden md:block">Support actif de 8h à 19h</span>
                        </div>
                        <Button
                          type="button"
                          onClick={handleSendReply}
                          disabled={isReplying}
                          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700 px-4 py-2 text-sm font-semibold shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-blue-600"
                        >
                          {isReplying ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircleReply className="h-4 w-4" />}
                          {isReplying ? "Envoi..." : "Envoyer"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center text-sm text-slate-500">
                <ShieldQuestion className="h-12 w-12 text-slate-300" />
                <p>Sélectionnez une conversation pour visualiser l'échange avec notre équipe support.</p>
                <Button
                  type="button"
                  onClick={handleOpenComposer}
                  className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/20"
                >
                  <CirclePlus className="h-4 w-4" />
                  Démarrer un nouveau message
                </Button>
              </div>
            )}
          </div>

          {/* Support info panel */}
          <aside className="hidden w-full max-w-lg border-l border-slate-200/80 bg-white/70 p-6 text-sm text-slate-600 lg:block">
            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-slate-100 shadow-2xl">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold">
                      OC
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.32em] text-blue-200/70">Support dédié</p>
                      <h3 className="text-lg font-semibold sm:text-xl">One connexion</h3>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-100/80 sm:text-base">
                    Une équipe disponible pour vos demandes critiques, avec un suivi personnalisé et des réponses rapides.
                  </p>
                  <Separator className="bg-white/10" />
                  <div className="space-y-4 text-slate-100/90">
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.32em] text-blue-200/70">Email direct</p>
                      <p className="text-base font-semibold leading-relaxed text-white">support@one-connexion.com</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.32em] text-blue-200/70">Téléphone</p>
                      <p className="text-base font-semibold leading-relaxed text-white">+33 1 86 76 45 90</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.32em] text-blue-200/70">Disponibilité</p>
                      <p className="text-base font-semibold leading-relaxed text-white">Lun - Ven · 8h - 19h</p>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="rounded-3xl border border-slate-200/80 bg-white/95 shadow-lg">
                <CardHeader className="space-y-2 pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900 sm:text-xl">Conseil express</CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-slate-600 sm:text-base">
                    Ajoutez un maximum de détails (horaires, références, captures d'écran) pour accélérer la résolution et permettre une prise en charge sur-mesure.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed text-slate-600">
                  <div className="group flex items-start gap-3 rounded-xl bg-blue-50 p-3 text-slate-700 transition-transform duration-200 hover:scale-[1.01]">
                    <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                      <Bell className="h-5 w-5" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-slate-900">Suivi dynamique</p>
                      <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                        Chaque réponse déclenche une notification instantanée par email et dans votre tableau de bord pour ne rien manquer.
                      </p>
                    </div>
                  </div>
                  <div className="group flex items-start gap-3 rounded-xl bg-gray-50 p-3 text-slate-700 transition-transform duration-200 hover:scale-[1.01]">
                    <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                      <AlertTriangle className="h-5 w-5" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-slate-900">Escalade prioritaire</p>
                      <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                        Les conversations « Non lues » sont automatiquement escaladées après 4 heures pour assurer une résolution rapide.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </Card>

      <Dialog open={isComposerOpen} onOpenChange={setIsComposerOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border border-slate-200 bg-white/95 p-0 shadow-2xl">
          <form onSubmit={handleComposerSubmit} className="flex flex-col" noValidate>
            <DialogHeader className="space-y-2 border-b border-slate-200 px-6 py-5">
              <DialogTitle className="text-2xl font-semibold text-slate-900">Nouveau message</DialogTitle>
              <DialogDescription className="text-sm text-slate-600">
                Décrivez votre demande et choisissez la catégorie afin que nous la dirigions vers l'expert adéquat.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 px-6 py-6">
              <div className="grid gap-3">
                <Label htmlFor="support-category" className="text-sm font-medium text-slate-700">
                  Catégorie de votre demande
                </Label>
                <Select
                  value={composerState.category}
                  onValueChange={(value: SupportCategory) =>
                    setComposerState((previous) => ({ ...previous, category: value, errors: { ...previous.errors, category: undefined } }))
                  }
                >
                  <SelectTrigger id="support-category" className="h-11 rounded-xl border-slate-200 bg-white shadow-sm">
                    <SelectValue placeholder="Sélectionnez un motif" />
                  </SelectTrigger>
                  <SelectContent align="start" className="rounded-xl border border-slate-200 bg-white shadow-xl">
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="rounded-lg text-sm">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-slate-800">{option.label}</span>
                          <span className="text-xs text-slate-500">{option.helper}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {composerState.errors.category ? (
                  <p className="text-xs font-medium text-rose-600">{composerState.errors.category}</p>
                ) : (
                  <p className="text-xs text-slate-500">
                    {CATEGORY_OPTIONS.find((item) => item.value === composerState.category)?.helper ??
                      "Choisissez la catégorie qui correspond le mieux à votre demande."}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="support-subject" className="text-sm font-medium text-slate-700">
                  Objet du message
                </Label>
                <Input
                  id="support-subject"
                  value={composerState.subject}
                  onChange={(event) =>
                    setComposerState((previous) => ({
                      ...previous,
                      subject: event.target.value,
                      errors: { ...previous.errors, subject: undefined },
                    }))
                  }
                  placeholder="Exemple : Facture janvier 2025 non reçue"
                  className="h-11 rounded-xl border-slate-200 bg-white shadow-sm placeholder:text-slate-400"
                />
                {composerState.errors.subject && (
                  <p className="text-xs font-medium text-rose-600">{composerState.errors.subject}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="support-message" className="text-sm font-medium text-slate-700">
                  Message détaillé
                </Label>
                <Textarea
                  id="support-message"
                  value={composerState.message}
                  onChange={(event) =>
                    setComposerState((previous) => ({
                      ...previous,
                      message: event.target.value,
                      errors: { ...previous.errors, message: undefined },
                    }))
                  }
                  placeholder="Bonjour, je rencontre actuellement..."
                  className="min-h-[160px] rounded-2xl border-slate-200 bg-white shadow-sm placeholder:text-slate-400"
                />
                {composerState.errors.message && (
                  <p className="text-xs font-medium text-rose-600">{composerState.errors.message}</p>
                )}
              </div>
            </div>

            <DialogFooter className="border-t border-slate-200 bg-slate-50/80 px-6 py-5">
              <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldQuestion className="h-4 w-4 text-blue-500" />
                  <span>Envoi sécurisé. Notre équipe répond sous 2 heures en moyenne.</span>
                </div>
                <Button
                  type="submit"
                  disabled={composerState.isSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-blue-600"
                >
                  {composerState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageCircleReply className="h-4 w-4" />
                  )}
                  {composerState.isSubmitting ? "Envoi..." : "Envoyer"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Messages;

