import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageCircle, Plus } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageComposer from "@/components/messaging/MessageComposer";
import MessageList from "@/components/messaging/MessageList";
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

        <div className="grid gap-6 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_2fr]">
          <Card className="h-[720px] flex flex-col">
            <CardHeader className="space-y-1">
              <h2 className="text-lg font-semibold">Conversations</h2>
              <p className="text-sm text-muted-foreground">
                Vue chronologique des threads clients et chauffeurs
              </p>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <ScrollArea className="flex-1">
                <div className="space-y-2 p-2">
                  {adminConversations.map(({ conversation, otherParticipant, lastMessage }) => {
                    const isActive = conversation.id === selectedConversationId && !isStartingNewConversation;

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => handleSelectConversation(conversation.id)}
                        className={cn(
                          "w-full rounded-lg border p-4 text-left transition",
                          isActive
                            ? "border-primary bg-primary/5"
                            : "border-transparent hover:border-border hover:bg-muted/40",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-sm">
                                {otherParticipant?.displayName ?? "Participant inconnu"}
                              </span>
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
                            <p className="text-xs text-muted-foreground truncate">
                              {lastMessage ? lastMessage.subject : "Nouvelle conversation"}
                            </p>
                            {lastMessage && (
                              <p className="text-xs text-muted-foreground truncate">
                                {lastMessage.content}
                              </p>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
                            {safeRelative(conversation.updatedAt)}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {adminConversations.length === 0 && (
                    <div className="py-10 text-center text-sm text-muted-foreground space-y-3">
                      <MessageCircle className="mx-auto h-6 w-6" />
                      <p>Aucune conversation pour le moment.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            {selectedConversation ? (
              <MessageList
                conversation={selectedConversation}
                currentUserId={ADMIN_ID}
                participantsMap={participantsMap}
              />
            ) : (
              <Card className="flex h-[480px] items-center justify-center text-center text-sm text-muted-foreground">
                <CardContent className="space-y-3">
                  <MessageCircle className="mx-auto h-8 w-8" />
                  <p>
                    {isStartingNewConversation
                      ? "Renseignez les informations ci-dessous pour démarrer une nouvelle conversation."
                      : "Sélectionnez une conversation pour afficher les messages."}
                  </p>
                </CardContent>
              </Card>
            )}

            <MessageComposer
              actorId={ADMIN_ID}
              actorRole="ADMIN"
              conversation={isStartingNewConversation ? null : selectedConversation}
              recipients={composerRecipients}
              onMessageSent={handleMessageSent}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminMessages;
