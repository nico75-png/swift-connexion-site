import { FormEvent, UIEvent, useMemo, useState } from "react";
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
  const [hasScrolledConversation, setHasScrolledConversation] = useState(false);

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

  const handleMessagesScroll = (event: UIEvent<HTMLDivElement>) => {
    setHasScrolledConversation(event.currentTarget.scrollTop > 6);
  };

  return (
    <section className="relative h-full w-full bg-gray-50 py-4">
      <div className="mx-auto grid h-[calc(100vh-100px)] max-w-[1400px] grid-cols-[360px_1fr_320px] items-start gap-6">
        <aside className="flex h-full w-[360px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-400">Conversations</p>
              <p className="text-sm text-slate-600">{unreadTotal} message(s) non lu(s)</p>
            </div>
            <Button
              type="button"
              onClick={handleOpenComposer}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-500 hover:to-blue-600"
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

          <Separator className="bg-slate-100" />

          <div className="flex-1 overflow-y-auto px-2 pb-6">
            <div className="flex flex-col gap-3">
              {filteredConversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveConversationId(conversation.id)}
                    className={`flex flex-col gap-2 rounded-xl border px-3 py-3 text-left transition ${
                      isActive
                        ? "border-blue-200 bg-blue-50/80 shadow-sm"
                        : "border-transparent hover:border-blue-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tracking-[0.14em] text-slate-600">
                          {conversation.reference}
                        </span>
                        <span>{format(new Date(conversation.lastActivityAt), "dd MMM", { locale: fr })}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-1.5 border text-[11px] font-medium ${STATUS_STYLES[conversation.status].badge} ${STATUS_STYLES[conversation.status].border}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${STATUS_STYLES[conversation.status].dot}`} />
                        {STATUS_LABELS[conversation.status]}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">{conversation.subject}</h3>
                        <Badge variant="outline" className={`border text-xs font-medium ${CATEGORY_BADGES[conversation.category].className}`}>
                          {CATEGORY_BADGES[conversation.category].label}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">{conversation.lastMessagePreview}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
        <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">
                  <MessageSquareDashed className="h-3.5 w-3.5" />
                  <span>Support client</span>
                </div>
                <h1 className="text-3xl font-semibold text-slate-900">Messagerie &amp; assistance</h1>
                <p className="max-w-2xl text-sm text-slate-600">
                  Consultez vos échanges avec notre équipe support, suivez leurs statuts en temps réel et démarrez une nouvelle conversation sans quitter votre tableau de bord.
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
          </div>

          <div
            className="flex-1 overflow-y-auto px-6 py-4 text-[15px] leading-relaxed max-[800px]:px-4 max-[800px]:py-3"
            onScroll={handleMessagesScroll}
          >
            {activeConversation ? (
              <div className="mx-auto flex h-full max-w-3xl flex-col space-y-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <Badge variant="outline" className={`border text-xs font-medium ${CATEGORY_BADGES[activeConversation.category].className}`}>
                          {CATEGORY_BADGES[activeConversation.category].label}
                        </Badge>
                        <span className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
                          {activeConversation.reference}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatRelative(activeConversation.lastActivityAt)}
                        </span>
                      </div>
                      <h2 className="text-2xl font-semibold text-slate-900">{activeConversation.subject}</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-2 border ${STATUS_STYLES[activeConversation.status].badge} ${STATUS_STYLES[activeConversation.status].border}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${STATUS_STYLES[activeConversation.status].dot}`} />
                        {STATUS_LABELS[activeConversation.status]}
                      </Badge>
                      {activeConversation.status !== "resolu" && (
                        <Button
                          type="button"
                          variant="outline"
                          className="inline-flex items-center gap-2 rounded-full border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
                        >
                          <BadgeCheck className="h-4 w-4" />
                          Marquer comme résolu
                        </Button>
                      )}
                    </div>
                  </div>
                  <Separator className="my-4 bg-slate-200/70" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold text-slate-600">Chronologie détaillée</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {activeConversation.messages.length} message(s) échangé(s)
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                        <span className="font-semibold text-slate-600">Prochaine action</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {activeConversation.messages[activeConversation.messages.length - 1]?.statusNote ?? "En attente d'un retour de votre part"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-4">
                  {activeConversation.messages.map((message) => {
                    const isClient = message.author === "client";
                    return (
                      <div key={message.id} className={`flex ${isClient ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-xl rounded-3xl border px-5 py-4 shadow-sm transition ${
                            isClient
                              ? "border-blue-200/80 bg-blue-50 text-slate-800"
                              : "border-slate-200/80 bg-white text-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">{isClient ? "Vous" : "Équipe support"}</span>
                            <span>{formatDate(message.createdAt)}</span>
                          </div>
                          <p className="mt-3 text-[15px] leading-relaxed text-slate-700 max-[800px]:overflow-hidden max-[800px]:[display:-webkit-box] max-[800px]:[-webkit-line-clamp:5] max-[800px]:[-webkit-box-orient:vertical]">
                            {message.content}
                          </p>
                          {message.statusNote && (
                            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              {message.statusNote}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-slate-500">
                <ShieldQuestion className="h-12 w-12 text-slate-300" />
                <p className="max-w-sm text-[15px] leading-relaxed">
                  Sélectionnez une conversation pour visualiser l'échange avec notre équipe support.
                </p>
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

          <div
            className={`border-t border-slate-100 bg-white px-6 py-4 transition-shadow max-[800px]:px-4 max-[800px]:py-3 ${
              hasScrolledConversation ? "shadow-[0_-4px_8px_-2px_rgba(0,0,0,0.05)]" : ""
            }`}
          >
            {activeConversation ? (
              <div className="mx-auto flex max-w-3xl flex-col gap-4">
                <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <MessageCircleReply className="h-4 w-4 text-blue-500" />
                    <span>Rédigez votre réponse</span>
                  </div>
                  {replyError && <p className="text-xs font-medium text-rose-500">{replyError}</p>}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <Textarea
                    value={replyDraft}
                    onChange={(event) => setReplyDraft(event.target.value)}
                    placeholder="Ajoutez des précisions, des pièces jointes ou un complément d'information pour accélérer la prise en charge."
                    className="min-h-[140px] flex-1 rounded-2xl border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-200 max-[800px]:py-2"
                  />
                  <Button
                    type="button"
                    onClick={handleSendReply}
                    disabled={isReplying}
                    className="inline-flex w-[130px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition duration-200 hover:from-blue-500 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60 max-[800px]:py-2"
                  >
                    {isReplying ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircleReply className="h-4 w-4" />}
                    {isReplying ? "Envoi..." : "Envoyer"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <MessageCircleReply className="h-4 w-4 text-blue-500" />
                  <span>Sélectionnez une conversation pour répondre</span>
                </div>
                <Button
                  type="button"
                  onClick={handleOpenComposer}
                  className="inline-flex w-[130px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-500 hover:to-blue-600 max-[800px]:py-2"
                >
                  <CirclePlus className="h-4 w-4" />
                  Nouveau
                </Button>
              </div>
            )}
          </div>
        </div>
        <aside className="hidden h-full w-[320px] flex-col rounded-2xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] lg:flex">
          <div className="flex h-full flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-slate-100 shadow-2xl">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold">SC</div>
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.32em] text-blue-200/70">Support dédié</p>
                      <h3 className="text-lg font-semibold sm:text-xl">Swift Connexion</h3>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-100/80 sm:text-base">
                    Une équipe disponible pour vos demandes critiques, avec un suivi personnalisé et des réponses rapides.
                  </p>
                  <Separator className="bg-white/10" />
                  <div className="space-y-4 text-slate-100/90">
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.32em] text-blue-200/70">Email direct</p>
                      <p className="text-base font-semibold leading-relaxed text-white">support@swift-connexion.com</p>
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

              <Card className="max-w-[320px] rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                <CardHeader className="space-y-2 pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900 sm:text-xl">Conseil express</CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-slate-600 sm:text-base">
                    Ajoutez un maximum de détails (horaires, références, captures d'écran) pour accélérer la résolution et permettre une prise en charge sur-mesure.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6 text-sm leading-relaxed text-slate-600">
                  <div className="group flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-slate-700 transition-transform duration-200 hover:scale-[1.01]">
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
                  <div className="group flex items-start gap-3 rounded-xl bg-gray-50 p-4 text-slate-700 transition-transform duration-200 hover:scale-[1.01]">
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
                  <div className="group flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-slate-700 transition-transform duration-200 hover:scale-[1.01]">
                    <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                      <ShieldQuestion className="h-5 w-5" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-slate-900">Guides interactifs</p>
                      <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                        Explorez nos tutoriels pas-à-pas pour résoudre les demandes fréquentes en toute autonomie.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5 text-sm leading-relaxed text-slate-600 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <div className="flex items-start gap-3">
                <CirclePlus className="h-5 w-5 text-blue-500" />
                <div className="space-y-1">
                  <p className="text-base font-semibold text-slate-900">Besoin d'un accompagnement express ?</p>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Lancez une session d'assistance prioritaire en indiquant votre créneau idéal, nous vous rappelons sous 30 minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

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

