import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Conversation, Message, Participant } from "@/hooks/useMessagesStore";

const CONTEXT_LABELS: Record<string, string> = {
  SUPPORT: "Support",
  ORDER: "Commande",
  INCIDENT: "Incident",
  BILLING: "Facturation",
};

interface MessageListProps {
  conversation: Conversation;
  currentUserId: string;
  participantsMap: Record<string, Participant>;
}

const safeFormat = (value: string) => {
  try {
    return format(parseISO(value), "dd MMM yyyy · HH:mm", { locale: fr });
  } catch (error) {
    return value;
  }
};

const resolveParticipant = (
  participantId: string,
  participantsMap: Record<string, Participant>,
): Participant | undefined => participantsMap[participantId];

const MessageList = ({ conversation, currentUserId, participantsMap }: MessageListProps) => {
  return (
    <Card className="flex flex-col h-full">
      <div className="border-b p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold">Fil de discussion</h3>
          <Badge variant="secondary">
            {CONTEXT_LABELS[conversation.context.type] ?? conversation.context.type}
          </Badge>
          {conversation.context.reference && (
            <Badge variant="outline">{conversation.context.reference}</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {conversation.messages.length} message{conversation.messages.length > 1 ? "s" : ""}
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {conversation.messages.map((message: Message) => {
            const sender = resolveParticipant(message.senderId, participantsMap);
            const recipient = resolveParticipant(message.recipientId, participantsMap);
            const isCurrentUser = message.senderId === currentUserId;

            return (
              <div key={message.id} className={cn("flex gap-3", isCurrentUser ? "justify-end" : "justify-start")}>
                {!isCurrentUser && sender && (
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{sender.avatarFallback}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-xl border p-4 shadow-sm transition",
                    isCurrentUser
                      ? "ml-auto border-primary/40 bg-primary/5"
                      : "bg-muted/60 border-border",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{message.subject}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {sender && (
                          <span className="inline-flex items-center gap-1">
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                              {sender.role}
                            </Badge>
                            <span>{sender.displayName}</span>
                          </span>
                        )}
                        {recipient && (
                          <span className="inline-flex items-center gap-1">
                            <span className="text-muted-foreground/70">→</span>
                            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                              {recipient.role}
                            </Badge>
                            <span>{recipient.displayName}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
                      {safeFormat(message.timestamp)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/90">{message.content}</p>
                </div>
                {isCurrentUser && sender && (
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{sender.avatarFallback}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default MessageList;
