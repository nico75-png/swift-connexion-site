import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageCircle, Plus } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ThreadView from "@/components/messaging/ThreadView";
import MessageComposerFullScreen from "@/components/messaging/MessageComposerFullScreen";
import { useMessagesStore } from "@/hooks/useMessagesStore";
import type { Conversation, Participant } from "@/hooks/useMessagesStore";
import { cn } from "@/lib/utils";

const CLIENT_ID = "client-1";

const CONTEXT_LABELS: Record<string, string> = {
  SUPPORT: "Support",
  ORDER: "Commande",
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
  }, [clientConversations, selectedConversationId, params.threadId, isComposerOpen]);

  const selectedConversation: Conversation | null = useMemo(() => {
    if (!selectedConversationId) {
      return null;
    }

    return (
      clientConversations.find((item) => item.conversation.id === selectedConversationId)?.conversation ?? null
    );
  }, [clientConversations, selectedConversationId]);

  const handleSelectConversation = (conversationId: string) => {
    setIsComposerOpen(false);
    setSelectedConversationId(conversationId);
    navigate(`/espace-client/messages/${conversationId}`);
  };

  const handleStartNewConversation = () => {
    setSelectedConversationId(null);
    setIsComposerOpen(true);
    navigate(`/espace-client/messages`);
  };

  const handleThreadCreated = (conversation: Conversation) => {
    setIsComposerOpen(false);
    setSelectedConversationId(conversation.id);
    navigate(`/espace-client/messages/${conversation.id}`);
  };

  const handleComposerClose = () => {
    setIsComposerOpen(false);
    if (selectedConversationId) {
      navigate(`/espace-client/messages/${selectedConversationId}`);
    }
  };

  const handleMessageSent = (conversationId: string) => {
    setIsComposerOpen(false);
    setSelectedConversationId(conversationId);
    navigate(`/espace-client/messages/${conversationId}`);
  };

  const handleBackToList = () => {
    navigate(`/espace-client/messages`);
    setSelectedConversationId(null);
  };

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={<Topbar userName={participantsMap[CLIENT_ID]?.displayName ?? "Client"} />}
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

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card className="h-[720px] flex flex-col">
            <CardHeader className="space-y-1">
              <h2 className="text-lg font-semibold">Vos échanges</h2>
              <p className="text-sm text-muted-foreground">
                Support One Connexion et chauffeurs affectés à vos commandes
              </p>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <ScrollArea className="flex-1">
                <div className="space-y-2 p-2">
                  {clientConversations.map(({ conversation, otherParticipant, lastMessage }) => {
                    const isActive = conversation.id === selectedConversationId && !isComposerOpen;

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

                  {clientConversations.length === 0 && (
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
              <ThreadView
                conversation={selectedConversation}
                currentUserId={CLIENT_ID}
                participantsMap={participantsMap}
                onBack={handleBackToList}
                onMessageSent={handleMessageSent}
              />
            ) : (
              <Card className="flex h-[480px] items-center justify-center text-center text-sm text-muted-foreground">
                <CardContent className="space-y-3">
                  <MessageCircle className="mx-auto h-8 w-8" />
                  <p>
                    {isComposerOpen
                      ? "Renseignez les informations dans la fenêtre de composition pour démarrer une nouvelle discussion."
                      : "Sélectionnez une conversation pour afficher les messages."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
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
