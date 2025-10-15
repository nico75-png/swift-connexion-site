import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Phone } from "lucide-react";

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
  ORDER: "Commande",
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
    <Card className="flex h-[720px] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-6">
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
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {otherParticipant?.avatarFallback ?? conversation.id.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
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
                <Phone className="h-4 w-4" />
                <span>{otherParticipant.phone}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 px-4 py-6 sm:px-6">
          {conversation.messages.map((threadMessage: Message) => {
            const sender = participantsMap[threadMessage.senderId];
            const recipient = participantsMap[threadMessage.recipientId];
            const isCurrentUser = threadMessage.senderId === currentUserId;

            return (
              <div key={threadMessage.id} className={cn("flex gap-3", isCurrentUser ? "justify-end" : "justify-start")}>
                {!isCurrentUser && sender && (
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{sender.avatarFallback}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-xl border p-4 shadow-sm transition",
                    isCurrentUser ? "ml-auto border-primary/40 bg-primary/5" : "bg-muted/60 border-border",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{threadMessage.subject}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {sender && (
                          <span className="inline-flex items-center gap-1">
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                              {ROLE_LABELS[sender.role] ?? sender.role}
                            </Badge>
                            <span>{sender.displayName}</span>
                          </span>
                        )}
                        {recipient && (
                          <span className="inline-flex items-center gap-1">
                            <span className="text-muted-foreground/70">→</span>
                            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                              {ROLE_LABELS[recipient.role] ?? recipient.role}
                            </Badge>
                            <span>{recipient.displayName}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
                      {new Date(threadMessage.timestamp).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/90">{threadMessage.content}</p>
                </div>
                {isCurrentUser && sender && (
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{sender.avatarFallback}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="border-t px-4 py-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Votre message"
            rows={3}
            disabled={isSending}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSending}>
              {isSending ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default ThreadView;
