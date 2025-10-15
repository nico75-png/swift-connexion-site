import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Building2, Mail, MessageCircle, Package, Phone, User } from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import Chat from "@/components/dashboard/Chat";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  appendAdminConversationMessage,
  getAdminConversations,
  markAdminConversationAsRead,
  type AdminConversation,
  type ConversationCategory,
  type ConversationEntityType,
} from "@/lib/stores/messages.store";

const CATEGORY_LABELS: Record<ConversationCategory, string> = {
  INCIDENT: "Incident",
  ORDER: "Commande",
  SUPPORT: "Support",
};

const PARTICIPANT_LABELS: Record<ConversationEntityType, string> = {
  CLIENT: "Client",
  DRIVER: "Chauffeur",
};

const toTelHref = (value: string) => `tel:${value.replace(/[^+\d]/g, "")}`;

const safeFormatTime = (value: string, pattern: string) => {
  try {
    return format(parseISO(value), pattern, { locale: fr });
  } catch (error) {
    return "";
  }
};

const safeFormatRelativeTime = (value: string) => {
  try {
    return formatDistanceToNow(parseISO(value), { addSuffix: true, locale: fr });
  } catch (error) {
    return "-";
  }
};

const AdminMessages = () => {
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const refreshConversations = useCallback(() => {
    const next = getAdminConversations();
    setConversations(next);
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    if (!conversations.length) {
      setSelectedConversationId(null);
      return;
    }

    if (!selectedConversationId) {
      const firstId = conversations[0].id;
      setSelectedConversationId(firstId);
      markAdminConversationAsRead(firstId);
      refreshConversations();
    }
  }, [conversations, selectedConversationId, refreshConversations]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  );

  const handleSelectConversation = useCallback(
    (id: string) => {
      setSelectedConversationId(id);
      markAdminConversationAsRead(id);
      refreshConversations();
    },
    [refreshConversations],
  );

  const handleSendMessage = useCallback(
    (message: string) => {
      if (!selectedConversationId) {
        return;
      }

      const updated = appendAdminConversationMessage(selectedConversationId, message, "ADMIN");
      if (updated) {
        refreshConversations();
      }
    },
    [selectedConversationId, refreshConversations],
  );

  const chatMessages = useMemo(() => {
    if (!selectedConversation) {
      return [];
    }

    return selectedConversation.messages.map((message) => ({
      id: message.id,
      sender: message.sender === "ADMIN" ? "me" : "other",
      text: message.text,
      time: safeFormatTime(message.createdAt, "HH:mm"),
    }));
  }, [selectedConversation]);

  return (
    <DashboardLayout sidebar={<AdminSidebar />} topbar={<Topbar title="Messages" />}>
      <h1 className="text-3xl font-bold mb-6">Messagerie</h1>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-[700px] flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg">Conversations</h2>
              <p className="text-sm text-muted-foreground">Incidents clients et messages chauffeurs</p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-2">
                {conversations.map((conversation) => {
                  const lastMessage = conversation.messages[conversation.messages.length - 1];
                  const isActive = conversation.id === selectedConversationId;

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition",
                        isActive
                          ? "border-primary bg-primary/5"
                          : "border-transparent hover:border-border hover:bg-muted/40",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-sm text-foreground">
                              {conversation.participant.displayName}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {PARTICIPANT_LABELS[conversation.participant.type]}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {CATEGORY_LABELS[conversation.category]}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {conversation.subject}
                          </p>
                          {lastMessage ? (
                            <p className="text-xs text-muted-foreground truncate">
                              {(lastMessage.sender === "ADMIN" ? "Vous" : "Dernier message") + ": "}
                              {lastMessage.text}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">Aucun message pour le moment</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-[11px] text-muted-foreground">
                            {safeFormatRelativeTime(conversation.updatedAt)}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {conversations.length === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground space-y-2">
                    <MessageCircle className="h-6 w-6 mx-auto text-muted-foreground" />
                    <p>Aucune conversation pour le moment.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {selectedConversation ? (
            <>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-semibold text-foreground">
                          {selectedConversation.participant.displayName}
                        </h2>
                        <Badge variant="outline">
                          {PARTICIPANT_LABELS[selectedConversation.participant.type]}
                        </Badge>
                        <Badge variant="secondary">
                          {CATEGORY_LABELS[selectedConversation.category]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground max-w-2xl">
                        {selectedConversation.subject}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        {selectedConversation.orderId && (
                          <span className="inline-flex items-center gap-1">
                            <Package className="h-4 w-4 text-primary" />
                            Commande #{selectedConversation.orderId}
                          </span>
                        )}
                        {selectedConversation.incidentId && (
                          <span className="inline-flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-warning" />
                            Incident {selectedConversation.incidentId}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground space-y-1">
                      <span>Dernière activité</span>
                      <span className="block font-medium text-foreground">
                        {safeFormatRelativeTime(selectedConversation.updatedAt)}
                      </span>
                      <span className="block text-muted-foreground/80">
                        {safeFormatTime(selectedConversation.updatedAt, "dd MMM yyyy · HH:mm")}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {selectedConversation.participant.company && (
                      <div className="inline-flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span>{selectedConversation.participant.company}</span>
                      </div>
                    )}
                    {selectedConversation.participant.contactName && selectedConversation.participant.type === "CLIENT" && (
                      <div className="inline-flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span>{selectedConversation.participant.contactName}</span>
                      </div>
                    )}
                    {selectedConversation.participant.email && (
                      <a
                        href={`mailto:${selectedConversation.participant.email}`}
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        <Mail className="h-4 w-4" />
                        {selectedConversation.participant.email}
                      </a>
                    )}
                    {selectedConversation.participant.phone && (
                      <a
                        href={toTelHref(selectedConversation.participant.phone)}
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {selectedConversation.participant.phone}
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Chat messages={chatMessages} recipientName={selectedConversation.participant.displayName} onSendMessage={handleSendMessage} />
            </>
          ) : (
            <Card className="h-[700px] flex items-center justify-center text-center text-sm text-muted-foreground">
              <CardContent className="flex flex-col items-center justify-center gap-3">
                <MessageCircle className="h-8 w-8" />
                <p>Sélectionnez une conversation pour afficher les messages.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminMessages;
