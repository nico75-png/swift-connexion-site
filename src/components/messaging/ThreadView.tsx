import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, EllipsisVertical, Paperclip, Phone, Send, Smile } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMessagesStore } from "@/hooks/useMessagesStore";
import type { Conversation, Message, Participant, UserRole } from "@/hooks/useMessagesStore";
import { cn } from "@/lib/utils";

const CONTEXT_LABELS: Record<string, string> = {
  SUPPORT: "Support",
  ORDER: "Suivi de commande",
  INCIDENT: "Incident",
  BILLING: "Facturation",
};

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  CLIENT: "Client",
  DRIVER: "Chauffeur",
};

interface ThreadViewProps {
  conversation: Conversation;
  currentUserId: string;
  participantsMap: Record<string, Participant>;
  onBack?: () => void;
  onMessageSent?: (conversationId: string) => void;
}

const ThreadView = ({
  conversation,
  currentUserId,
  participantsMap,
  onBack,
  onMessageSent,
}: ThreadViewProps) => {
  const { sendMessage } = useMessagesStore();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const otherParticipantId = useMemo(() => {
    const others = conversation.participants.filter((participantId) => participantId !== currentUserId);
    return others[0] ?? null;
  }, [conversation.participants, currentUserId]);

  const otherParticipant = otherParticipantId ? participantsMap[otherParticipantId] ?? null : null;

  const contextLabel = CONTEXT_LABELS[conversation.context.type] ?? conversation.context.type;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [conversation.messages.length, conversation.id]);

  useEffect(() => {
    setMessage("");
    setError(null);
  }, [conversation.id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) {
      setError("Saisissez un message avant d'envoyer");
      return;
    }

    if (!otherParticipantId) {
      toast({
        variant: "destructive",
        title: "Destinataire introuvable",
        description: "Impossible d'identifier le destinataire de ce thread.",
      });
      return;
    }

    setIsSending(true);
    setError(null);
    try {
      const lastSubject = conversation.messages[conversation.messages.length - 1]?.subject ?? "Nouveau message";
      const subject = lastSubject.toLowerCase().startsWith("re:") ? lastSubject : `RE: ${lastSubject}`;

      const updatedConversation = await sendMessage({
        conversationId: conversation.id,
        subject,
        content: message.trim(),
        fromId: currentUserId,
        toId: otherParticipantId,
      });

      setMessage("");
      onMessageSent?.(updatedConversation.id);
    } catch (sendError) {
      const description =
        sendError instanceof Error
          ? sendError.message
          : "Impossible d'envoyer votre message pour le moment.";
      toast({
        variant: "destructive",
        title: "Envoi impossible",
        description,
      });
      setError(description);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="flex h-full flex-col rounded-2xl border bg-card shadow-soft">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b bg-card/95 px-4 py-4 backdrop-blur sm:px-6">
        <div className="flex flex-1 items-center gap-4">
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-9 w-9 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Retour aux conversations</span>
            </Button>
          )}
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {otherParticipant?.avatarFallback ?? conversation.id.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span
              className="absolute -bottom-0.5 -right-0.5 inline-flex h-3 w-3 items-center justify-center rounded-full border-2 border-card bg-success"
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold leading-tight">
                {otherParticipant?.displayName ?? "Destinataire inconnu"}
              </h3>
              {otherParticipant && (
                <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                  {ROLE_LABELS[otherParticipant.role] ?? otherParticipant.role}
                </Badge>
              )}
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                {contextLabel}
              </Badge>
              {conversation.context.reference && (
                <Badge variant="outline" className="text-[10px] font-medium">
                  {conversation.context.reference}
                </Badge>
              )}
            </div>
            {otherParticipant?.role === "DRIVER" && otherParticipant.phone && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span>{otherParticipant.phone}</span>
              </p>
            )}
          </div>
        </div>
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
          <EllipsisVertical className="h-4 w-4" />
          <span className="sr-only">Options de la conversation</span>
        </Button>
      </div>

      <ScrollArea className="flex-1" role="list" aria-label="Messages de la conversation">
        <div className="space-y-6 px-4 py-6 sm:px-6">
          {conversation.messages.map((threadMessage: Message) => {
            const sender = participantsMap[threadMessage.senderId];
            const recipient = participantsMap[threadMessage.recipientId];
            const isCurrentUser = threadMessage.senderId === currentUserId;

            return (
              <div key={threadMessage.id} className="space-y-3" role="listitem">
                <div
                  className={cn(
                    "flex items-start gap-3",
                    isCurrentUser ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {sender?.avatarFallback ?? threadMessage.senderId.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "flex max-w-[70%] flex-col gap-2",
                      isCurrentUser ? "items-end" : "items-start",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {sender && (
                        <span className="font-semibold text-foreground">
                          {sender.displayName}
                        </span>
                      )}
                      <span aria-hidden="true">•</span>
                      <span>
                        {new Date(threadMessage.timestamp).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "w-full rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                        isCurrentUser
                          ? "bg-primary/15 text-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <p className="text-sm font-semibold text-foreground">{threadMessage.subject}</p>
                      <p className="mt-2 text-sm text-foreground/90">{threadMessage.content}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                        {sender && (
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                            {ROLE_LABELS[sender.role] ?? sender.role}
                          </Badge>
                        )}
                        {recipient && (
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                            {ROLE_LABELS[recipient.role] ?? recipient.role}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="border-t bg-card/95 px-4 py-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-end gap-3 rounded-2xl border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary/60 focus-within:ring-offset-0">
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Écrire un message"
              rows={3}
              disabled={isSending}
              className="min-h-[48px] flex-1 resize-none border-0 bg-transparent px-0 py-2 text-sm shadow-none focus-visible:outline-none focus-visible:ring-0"
            />
            <div className="flex items-center gap-1.5 pb-2">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted"
                aria-label="Insérer un emoji"
              >
                <Smile className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted"
                aria-label="Joindre un fichier"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <Button
                type="submit"
                size="icon"
                disabled={isSending}
                className="h-9 w-9 rounded-full bg-primary text-primary-foreground shadow-soft"
              >
                {isSending ? (
                  <Send className="h-4 w-4 animate-pulse" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Envoyer le message</span>
              </Button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
      </div>
    </Card>
  );
};

export default ThreadView;
