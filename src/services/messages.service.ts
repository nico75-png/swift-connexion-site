import type { Conversation, ConversationContextType, Participant, UserRole } from "@/hooks/useMessagesStore";
import { messagesStoreActions } from "@/hooks/useMessagesStore";

type CreateThreadPayload = {
  fromId: string;
  toId: string;
  toType?: UserRole;
  context: {
    type: ConversationContextType;
    referenceId?: string;
  };
  subject: string;
  firstMessage: string;
};

export const createThread = async (payload: CreateThreadPayload): Promise<Conversation> => {
  return messagesStoreActions.createThread({
    fromId: payload.fromId,
    toId: payload.toId,
    toRole: payload.toType,
    subject: payload.subject,
    message: payload.firstMessage,
    contextType: payload.context.type,
    contextReference: payload.context.referenceId,
  });
};

export const listRecentDriversForClient = async (clientId: string): Promise<Participant[]> => {
  return messagesStoreActions.listRecentDriversForClient(clientId);
};
