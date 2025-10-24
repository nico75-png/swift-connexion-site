import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageCircle, Plus, Search } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import MessageComposer from "@/components/messaging/MessageComposer";
import MessageList from "@/components/messaging/MessageList";
import ConversationInfoPanel from "@/components/messaging/ConversationInfoPanel";
import { useMessagesStore } from "@/hooks/useMessagesStore";
import type { Conversation, Participant } from "@/hooks/useMessagesStore";
import { cn } from "@/lib/utils";

const ADMIN_ID = "admin-1";

const CONTEXT_LABELS: Record<string, string> = {
  SUPPORT: "Support",
  ORDER: "Commande",
  INCIDENT: "Incident",
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

const AdminMessages = () => {
  const { participants, getConversationsFor, getParticipant, getRecipientsFor } = useMessagesStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const focusedThreadId = searchParams.get("thread");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isStartingNewConversation, setIsStartingNewConversation] = useState(false);

  const participantsMap = useMemo(() => buildParticipantsMap(participants), [participants]);

  const adminConversations = useMemo(() => {
    return getConversationsFor(ADMIN_ID).map((conversation) => {
      const otherParticipantId = conversation.participants.find((id) => id !== ADMIN_ID) ?? "";
      const otherParticipant = otherParticipantId ? getParticipant(otherParticipantId) ?? null : null;
      const lastMessage = conversation.messages[conversation.messages.length - 1] ?? null;

      return { conversation, otherParticipant, lastMessage };
    });
  }, [getConversationsFor, getParticipant]);

  useEffect(() => {
    if (focusedThreadId) {
      const exists = adminConversations.some((item) => item.conversation.id === focusedThreadId);
      if (exists) {
        if (selectedConversationId !== focusedThreadId || isStartingNewConversation) {
          setIsStartingNewConversation(false);
          setSelectedConversationId(focusedThreadId);
        }
        return;
      }
      setSearchParams({}, { replace: true });
    }

    if (isStartingNewConversation) {
      return;
    }

    if (!selectedConversationId && adminConversations.length > 0) {
      const firstConversationId = adminConversations[0].conversation.id;
      setSelectedConversationId(firstConversationId);
      setSearchParams({ thread: firstConversationId }, { replace: true });
      return;
    }

    if (
      selectedConversationId &&
      !adminConversations.some((item) => item.conversation.id === selectedConversationId)
    ) {
      const fallbackId = adminConversations[0]?.conversation.id ?? null;
      setSelectedConversationId(fallbackId);
      if (fallbackId) {
        setSearchParams({ thread: fallbackId }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }
  }, [
    adminConversations,
    focusedThreadId,
    isStartingNewConversation,
    selectedConversationId,
    setSearchParams,
  ]);

  const selectedConversation: Conversation | null = useMemo(() => {
    if (isStartingNewConversation) {
      return null;
    }

    if (!selectedConversationId) {
      return null;
    }

    return (
      adminConversations.find((item) => item.conversation.id === selectedConversationId)?.conversation ?? null
    );
  }, [adminConversations, selectedConversationId, isStartingNewConversation]);

  const composerRecipients = useMemo(() => getRecipientsFor(ADMIN_ID), [getRecipientsFor]);

  const selectedParticipant: Participant | null = useMemo(() => {
    if (!selectedConversation) {
      return null;
    }

    const otherParticipantId = selectedConversation.participants.find((participantId) => participantId !== ADMIN_ID);
    return otherParticipantId ? participantsMap[otherParticipantId] ?? null : null;
  }, [participantsMap, selectedConversation]);

  const handleSelectConversation = (conversationId: string) => {
    setIsStartingNewConversation(false);
    setSelectedConversationId(conversationId);
    setSearchParams({ thread: conversationId }, { replace: true });
  };

  const handleStartNewConversation = () => {
    setSelectedConversationId(null);
    setIsStartingNewConversation(true);
    setSearchParams({}, { replace: true });
  };

  const handleMessageSent = (conversationId: string) => {
    setIsStartingNewConversation(false);
    setSelectedConversationId(conversationId);
    setSearchParams({ thread: conversationId }, { replace: true });
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />} topbar={<Topbar title="Messages" />}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Messagerie</h1>
            <p className="text-muted-foreground">
              Gérez les échanges clients et chauffeurs depuis une interface unifiée.
            </p>
          </div>
          <Button onClick={handleStartNewConversation} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Nouvelle conversation
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_320px]">
          <section
            className={cn(
              "flex min-h-[600px] flex-col rounded-2xl border bg-card shadow-soft",
              selectedConversation && !isStartingNewConversation ? "hidden md:flex" : "flex",
            )}
          >
            <div className="border-b px-6 py-4">
              <div className="space-y-2">
                <div>
                  <h2 className="text-lg font-semibold">Conversations</h2>
                  <p className="text-sm text-muted-foreground">
                    Vue chronologique des échanges clients et chauffeurs
                  </p>
                </div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher"
                    className="h-10 rounded-xl border-input bg-muted/40 pl-9 text-sm focus-visible:ring-2"
                    aria-label="Rechercher une conversation"
                  />
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1" role="list" aria-label="Liste des conversations">
              <div className="space-y-1 px-2 py-3">
                {adminConversations.map(({ conversation, otherParticipant, lastMessage }) => {
                  const isActive = conversation.id === selectedConversationId && !isStartingNewConversation;
                  const lastMessagePreview = lastMessage?.content ?? "Nouvelle conversation";
                  const hasUnread = Boolean(
                    lastMessage && lastMessage.recipientId === ADMIN_ID && lastMessage.senderId !== ADMIN_ID,
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

                {adminConversations.length === 0 && (
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
              "flex min-h-[600px] flex-col rounded-2xl border bg-card shadow-soft",
              selectedConversation || isStartingNewConversation ? "flex" : "hidden md:flex",
            )}
          >
            <div className="flex flex-1 flex-col">
              {selectedConversation ? (
                <MessageList
                  conversation={selectedConversation}
                  currentUserId={ADMIN_ID}
                  participantsMap={participantsMap}
                />
              ) : (
                <div className="flex h-full flex-1 flex-col justify-center gap-4 px-8 text-center text-sm text-muted-foreground">
                  <div className="space-y-3">
                    <MessageCircle className="mx-auto h-8 w-8" />
                    <p>
                      {isStartingNewConversation
                        ? "Renseignez les informations ci-dessous pour démarrer une nouvelle conversation."
                        : "Sélectionnez une conversation pour afficher les messages."}
                    </p>
                  </div>
                  <MessageComposer
                    actorId={ADMIN_ID}
                    actorRole="ADMIN"
                    conversation={isStartingNewConversation ? null : selectedConversation}
                    recipients={composerRecipients}
                    onMessageSent={handleMessageSent}
                  />
                </div>
              )}
            </div>

            {selectedConversation && (
              <div className="border-t px-6 py-4">
                <MessageComposer
                  actorId={ADMIN_ID}
                  actorRole="ADMIN"
                  conversation={selectedConversation}
                  recipients={composerRecipients}
                  onMessageSent={handleMessageSent}
                />
              </div>
            )}
          </section>

          <ConversationInfoPanel participant={selectedParticipant} conversation={selectedConversation} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminMessages;
