import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
    <Card className="flex h-full flex-col rounded-2xl border bg-card shadow-soft">
      <div className="sticky top-0 z-10 border-b bg-card/95 px-6 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold">Fil de discussion</h3>
          <Badge variant="secondary" className="uppercase tracking-wide">
            {CONTEXT_LABELS[conversation.context.type] ?? conversation.context.type}
          </Badge>
          {conversation.context.reference && (
            <Badge variant="outline" className="uppercase tracking-wide">
              {conversation.context.reference}
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {conversation.messages.length} message{conversation.messages.length > 1 ? "s" : ""}
        </p>
      </div>
      <ScrollArea className="flex-1" role="list" aria-label="Messages de la conversation">
        <div className="space-y-6 px-6 py-6">
          {conversation.messages.map((message: Message, index: number) => {
            const sender = resolveParticipant(message.senderId, participantsMap);
            const recipient = resolveParticipant(message.recipientId, participantsMap);
            const isCurrentUser = message.senderId === currentUserId;
            const showSeparator = index < conversation.messages.length - 1;

            return (
              <div key={message.id} className="space-y-3" role="listitem">
                <div
                  className={cn(
                    "flex items-start gap-3",
                    isCurrentUser ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {sender?.avatarFallback ?? message.senderId.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn("flex max-w-[70%] flex-col gap-2", isCurrentUser ? "items-end" : "items-start")}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {sender && (
                        <span className="font-semibold text-foreground">{sender.displayName}</span>
                      )}
                      <span aria-hidden="true">•</span>
                      <span>{safeFormat(message.timestamp)}</span>
                    </div>
                    <div
                      className={cn(
                        "w-full rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                        isCurrentUser
                          ? "bg-primary/15 text-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <p className="text-sm font-semibold text-foreground">{message.subject}</p>
                      <p className="mt-2 text-sm text-foreground/90">{message.content}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                        {sender && (
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                            {sender.role}
                          </Badge>
                        )}
                        {recipient && (
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                            {recipient.role}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {showSeparator && <Separator className="mx-10" />}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default MessageList;
