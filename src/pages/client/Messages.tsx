import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageCircle, Plus, Search } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ThreadView from "@/components/messaging/ThreadView";
import MessageComposerFullScreen from "@/components/messaging/MessageComposerFullScreen";
import ConversationInfoPanel from "@/components/messaging/ConversationInfoPanel";
import { useMessagesStore } from "@/hooks/useMessagesStore";
import type { Conversation, Participant } from "@/hooks/useMessagesStore";
import { cn } from "@/lib/utils";

const CLIENT_ID = "client-1";

const CONTEXT_LABELS: Record<string, string> = {
  SUPPORT: "Support",
  ORDER: "Suivi de commande",
  INCIDENT: "Incident",
  BILLING: "Facturation",
};

const safeRelative = (value: string) => {
  try {
    return formatDistanceToNow(parseISO(value), { addSuffix: true, locale: fr });
  } catch (error) {
    return "il y a peu";
  }
};

const buildParticipantsMap = (participants: Participant[]) =>
  participants.reduce<Record<string, Participant>>((acc, participant) => {
    acc[participant.id] = participant;
    return acc;
  }, {});

const ClientMessages = () => {
  const { participants, getConversationsFor, getParticipant } = useMessagesStore();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ threadId?: string }>();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const participantsMap = useMemo(() => buildParticipantsMap(participants), [participants]);

  const clientConversations = useMemo(() => {
    return getConversationsFor(CLIENT_ID).map((conversation) => {
      const otherParticipantId = conversation.participants.find((id) => id !== CLIENT_ID) ?? "";
      const otherParticipant = otherParticipantId ? getParticipant(otherParticipantId) ?? null : null;
      const lastMessage = conversation.messages[conversation.messages.length - 1] ?? null;

      return { conversation, otherParticipant, lastMessage };
    });
  }, [getConversationsFor, getParticipant]);

  useEffect(() => {
    const isNewMessageRoute = location.pathname.endsWith("/nouveau");

    if (isNewMessageRoute) {
      setIsComposerOpen(true);
      setSelectedConversationId(null);
      return;
    }

    if (isComposerOpen) {
      return;
    }

    const routeThreadId = params.threadId;

    if (routeThreadId) {
      const exists = clientConversations.some((item) => item.conversation.id === routeThreadId);
      if (exists) {
        setSelectedConversationId(routeThreadId);
        return;
      }
    }

    if (!selectedConversationId && clientConversations.length > 0) {
      setSelectedConversationId(clientConversations[0].conversation.id);
      return;
    }

    if (
      selectedConversationId &&
      !clientConversations.some((item) => item.conversation.id === selectedConversationId)
    ) {
      setSelectedConversationId(clientConversations[0]?.conversation.id ?? null);
    }
  }, [
    clientConversations,
    selectedConversationId,
    params.threadId,
    isComposerOpen,
    location.pathname,
  ]);

  const selectedConversation: Conversation | null = useMemo(() => {
    if (!selectedConversationId) {
      return null;
    }

    return (
      clientConversations.find((item) => item.conversation.id === selectedConversationId)?.conversation ?? null
    );
  }, [clientConversations, selectedConversationId]);

  const selectedParticipant: Participant | null = useMemo(() => {
    if (!selectedConversation) {
      return null;
    }

    const otherParticipantId = selectedConversation.participants.find((participantId) => participantId !== CLIENT_ID);
    return otherParticipantId ? participantsMap[otherParticipantId] ?? null : null;
  }, [participantsMap, selectedConversation]);

  const handleSelectConversation = (conversationId: string) => {
    setIsComposerOpen(false);
    setSelectedConversationId(conversationId);
    navigate(`/messages/${conversationId}`);
  };

  const handleStartNewConversation = () => {
    setSelectedConversationId(null);
    setIsComposerOpen(true);
    navigate(`/messages/nouveau`);
  };

  const handleThreadCreated = (conversation: Conversation) => {
    setIsComposerOpen(false);
    setSelectedConversationId(conversation.id);
    navigate(`/messages/${conversation.id}`);
  };

  const handleComposerClose = () => {
    setIsComposerOpen(false);
    if (selectedConversationId) {
      navigate(`/messages/${selectedConversationId}`);
    } else {
      navigate(`/messages`);
    }
  };

  const handleMessageSent = (conversationId: string) => {
    setIsComposerOpen(false);
    setSelectedConversationId(conversationId);
    navigate(`/messages/${conversationId}`);
  };

  const handleBackToList = () => {
    navigate(`/messages`);
    setSelectedConversationId(null);
  };

  return (
      <DashboardLayout
        sidebar={<ClientSidebar />}
        topbar={<Topbar userName={participantsMap[CLIENT_ID]?.displayName} />}
        showProfileReminder
      >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Messagerie</h1>
            <p className="text-muted-foreground">
              Contactez l'administrateur ou votre chauffeur pour suivre vos commandes.
            </p>
          </div>
          <Button onClick={handleStartNewConversation} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Nouvelle conversation
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <section
            className={cn(
              "flex min-h-[560px] flex-col rounded-2xl border bg-card shadow-soft",
              selectedConversation && !isComposerOpen ? "hidden md:flex" : "flex",
            )}
          >
            <div className="border-b px-6 py-4">
              <div className="space-y-2">
                <div>
                  <h2 className="text-lg font-semibold">Vos échanges</h2>
                  <p className="text-sm text-muted-foreground">
                    Support One Connexion et chauffeurs affectés à vos commandes
                  </p>
                </div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher une conversation"
                    className="h-10 rounded-xl border-input bg-muted/40 pl-9 text-sm focus-visible:ring-2"
                    aria-label="Rechercher une conversation"
                  />
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1" role="list" aria-label="Liste des conversations">
              <div className="space-y-1 px-2 py-3">
                {clientConversations.map(({ conversation, otherParticipant, lastMessage }) => {
                  const isActive = conversation.id === selectedConversationId && !isComposerOpen;
                  const lastMessagePreview = lastMessage?.content ?? "Nouvelle conversation";
                  const hasUnread = Boolean(
                    lastMessage && lastMessage.recipientId === CLIENT_ID && lastMessage.senderId !== CLIENT_ID,
                  );
                  const initials =
                    otherParticipant?.avatarFallback ?? conversation.id.slice(0, 2).toUpperCase();

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      role="listitem"
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={cn(
                        "group relative flex w-full items-center gap-3 rounded-xl border border-transparent bg-transparent px-4 py-3 text-left transition",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2",
                        isActive
                          ? "border-border bg-card shadow-soft"
                          : "hover:border-border hover:bg-muted/70",
                      )}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <span
                          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-success"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {otherParticipant?.displayName ?? "Participant inconnu"}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">{lastMessagePreview}</p>
                          </div>
                          <span className="shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground">
                            {safeRelative(conversation.updatedAt)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {otherParticipant && (
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                              {otherParticipant.role}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                            {CONTEXT_LABELS[conversation.context.type] ?? conversation.context.type}
                          </Badge>
                          {conversation.context.reference && (
                            <Badge variant="outline" className="text-[10px]">
                              {conversation.context.reference}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {hasUnread && (
                        <span className="ml-2 inline-flex min-w-[1.75rem] items-center justify-center rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">
                          Nouveau
                        </span>
                      )}
                    </button>
                  );
                })}

                {clientConversations.length === 0 && (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    <MessageCircle className="mx-auto h-6 w-6" />
                    <p className="mt-3">Aucune conversation pour le moment.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </section>

          <section
            className={cn(
              "flex min-h-[560px] flex-col rounded-2xl border bg-card shadow-soft",
              selectedConversation || isComposerOpen ? "flex" : "hidden md:flex",
            )}
          >
            {selectedConversation ? (
              <ThreadView
                conversation={selectedConversation}
                currentUserId={CLIENT_ID}
                participantsMap={participantsMap}
                onBack={handleBackToList}
                onMessageSent={handleMessageSent}
              />
            ) : (
              <div className="flex h-full flex-1 items-center justify-center px-8 text-center text-sm text-muted-foreground">
                <div className="space-y-3">
                  <MessageCircle className="mx-auto h-8 w-8" />
                  <p>
                    {isComposerOpen
                      ? "Renseignez les informations dans la fenêtre de composition pour démarrer une nouvelle discussion."
                      : "Sélectionnez une conversation pour afficher les messages."}
                  </p>
                </div>
              </div>
            )}
          </section>

          <ConversationInfoPanel participant={selectedParticipant} conversation={selectedConversation} />
        </div>
      </div>
      <MessageComposerFullScreen
        open={isComposerOpen}
        actorId={CLIENT_ID}
        onClose={handleComposerClose}
        onCreated={handleThreadCreated}
      />
    </DashboardLayout>
  );
};

export default ClientMessages;
