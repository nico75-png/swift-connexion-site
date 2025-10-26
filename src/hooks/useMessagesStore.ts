import { useSyncExternalStore } from "react";

import { messagingService } from "@/lib/services/messaging.service";
import { getAuthState } from "@/lib/stores/auth.store";

type UserRole = "ADMIN" | "CLIENT" | "DRIVER";

type ConversationContextType = "SUPPORT" | "ORDER" | "INCIDENT" | "BILLING";

type Participant = {
  id: string;
  role: UserRole;
  displayName: string;
  avatarFallback: string;
  company?: string;
  email?: string;
  phone?: string;
  metadata?: {
    orders?: string[];
    incidents?: string[];
    activeOrderId?: string;
  };
};

type Message = {
  id: string;
  conversationId: string;
  subject: string;
  content: string;
  senderId: string;
  senderRole: UserRole;
  recipientId: string;
  recipientRole: UserRole;
  timestamp: string;
};

type ConversationContext = {
  type: ConversationContextType;
  reference?: string;
};

type Conversation = {
  id: string;
  participants: string[];
  context: ConversationContext;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
};

type MessagesState = {
  participants: Participant[];
  conversations: Conversation[];
};

type SendMessageInput = {
  conversationId?: string;
  subject: string;
  content: string;
  fromId: string;
  toId: string;
  contextType?: ConversationContextType;
  contextReference?: string;
};

type CreateThreadInput = {
  fromId: string;
  toId: string;
  toRole?: UserRole;
  subject: string;
  message: string;
  contextType: ConversationContextType;
  contextReference?: string;
};

type MessagesStore = MessagesState & {
  sendMessage: (input: SendMessageInput) => Promise<Conversation>;
  createThread: (input: CreateThreadInput) => Promise<Conversation>;
  getParticipant: (id: string) => Participant | undefined;
  getConversationsFor: (participantId: string) => Conversation[];
  getRecipientsFor: (participantId: string) => Participant[];
  listRecentDriversForClient: (clientId: string) => Promise<Participant[]>;
};

type Listener = () => void;

const listeners = new Set<Listener>();

const CLIENT_PARTICIPANT_ID = "client-1";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

const nowIso = () => new Date().toISOString();

const deriveClientIdentity = () => {
  const { currentUser } = getAuthState();
  const displayName = (currentUser?.name || currentUser?.email || "Compte client").trim();
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2) || "CC";

  return {
    displayName,
    initials,
    email: currentUser?.email,
  };
};

const buildParticipant = (
  id: string,
  role: UserRole,
  displayName: string,
  avatarFallback: string,
  extras: Partial<Participant> = {},
): Participant => ({
  id,
  role,
  displayName,
  avatarFallback,
  ...extras,
});

const createClientParticipant = (identity: ReturnType<typeof deriveClientIdentity>) =>
  buildParticipant(CLIENT_PARTICIPANT_ID, "CLIENT", identity.displayName, identity.initials, {
    email: identity.email,
    metadata: { orders: ["CMD-010", "CMD-011"], incidents: ["INC-204"], activeOrderId: "CMD-010" },
  });

const participants: Participant[] = [
  buildParticipant("admin-1", "ADMIN", "Support One Connexion", "OC", {
    email: "support@one-connexion.com",
    phone: "+33123456789",
  }),
  createClientParticipant(deriveClientIdentity()),
  buildParticipant("driver-1", "DRIVER", "Marc Bernard", "MB", {
    phone: "+33655554444",
    metadata: { orders: ["CMD-010"] },
  }),
  buildParticipant("driver-2", "DRIVER", "Sophie Renard", "SR", {
    phone: "+33655553333",
    metadata: { orders: ["CMD-011"] },
  }),
];

const initialConversations: Conversation[] = [
  {
    id: "conv-admin-client-1",
    participants: ["admin-1", "client-1"],
    context: { type: "SUPPORT" },
    createdAt: "2025-01-15T08:52:00.000Z",
    updatedAt: "2025-01-15T09:32:00.000Z",
    messages: [
      {
        id: "msg-1",
        conversationId: "conv-admin-client-1",
        subject: "Question sur la facturation",
        content:
          "Bonjour, pourriez-vous me confirmer la date d'échéance de la facture #2025-01 ?",
        senderId: "client-1",
        senderRole: "CLIENT",
        recipientId: "admin-1",
        recipientRole: "ADMIN",
        timestamp: "2025-01-15T08:52:00.000Z",
      },
      {
        id: "msg-2",
        conversationId: "conv-admin-client-1",
        subject: "RE: Question sur la facturation",
        content:
          "Bonjour, la facture #2025-01 est exigible le 31 janvier. Souhaitez-vous un rappel automatique ?",
        senderId: "admin-1",
        senderRole: "ADMIN",
        recipientId: "client-1",
        recipientRole: "CLIENT",
        timestamp: "2025-01-15T09:05:00.000Z",
      },
      {
        id: "msg-3",
        conversationId: "conv-admin-client-1",
        subject: "RE: Question sur la facturation",
        content: "Oui merci, un rappel 48h avant serait parfait.",
        senderId: "client-1",
        senderRole: "CLIENT",
        recipientId: "admin-1",
        recipientRole: "ADMIN",
        timestamp: "2025-01-15T09:32:00.000Z",
      },
    ],
  },
  {
    id: "conv-admin-driver-1",
    participants: ["admin-1", "driver-1"],
    context: { type: "ORDER", reference: "CMD-010" },
    createdAt: "2025-01-15T07:45:00.000Z",
    updatedAt: "2025-01-15T10:15:00.000Z",
    messages: [
      {
        id: "msg-4",
        conversationId: "conv-admin-driver-1",
        subject: "Commande CMD-010 - retard au chargement",
        content: "Arrivée sur place mais le colis n'est pas prêt. Ils demandent d'attendre.",
        senderId: "driver-1",
        senderRole: "DRIVER",
        recipientId: "admin-1",
        recipientRole: "ADMIN",
        timestamp: "2025-01-15T07:45:00.000Z",
      },
      {
        id: "msg-5",
        conversationId: "conv-admin-driver-1",
        subject: "RE: Commande CMD-010 - retard au chargement",
        content: "Merci Marc, peux-tu patienter 10 minutes supplémentaires ?",
        senderId: "admin-1",
        senderRole: "ADMIN",
        recipientId: "driver-1",
        recipientRole: "DRIVER",
        timestamp: "2025-01-15T07:52:00.000Z",
      },
      {
        id: "msg-6",
        conversationId: "conv-admin-driver-1",
        subject: "RE: Commande CMD-010 - retard au chargement",
        content: "Colis chargé à l'instant, je repars pour la livraison.",
        senderId: "driver-1",
        senderRole: "DRIVER",
        recipientId: "admin-1",
        recipientRole: "ADMIN",
        timestamp: "2025-01-15T10:15:00.000Z",
      },
    ],
  },
  {
    id: "conv-client-driver-1",
    participants: ["client-1", "driver-1"],
    context: { type: "ORDER", reference: "CMD-010" },
    createdAt: "2025-01-15T11:20:00.000Z",
    updatedAt: "2025-01-15T11:25:00.000Z",
    messages: [
      {
        id: "msg-7",
        conversationId: "conv-client-driver-1",
        subject: "Suivi livraison CMD-010",
        content: "Bonjour Marc, pouvez-vous me confirmer l'heure estimée d'arrivée ?",
        senderId: "client-1",
        senderRole: "CLIENT",
        recipientId: "driver-1",
        recipientRole: "DRIVER",
        timestamp: "2025-01-15T11:20:00.000Z",
      },
      {
        id: "msg-8",
        conversationId: "conv-client-driver-1",
        subject: "RE: Suivi livraison CMD-010",
        content: "Bonjour, j'arrive dans 10 minutes.",
        senderId: "driver-1",
        senderRole: "DRIVER",
        recipientId: "client-1",
        recipientRole: "CLIENT",
        timestamp: "2025-01-15T11:25:00.000Z",
      },
    ],
  },
];

let state: MessagesState = {
  participants,
  conversations: initialConversations,
};

const notify = () => {
  listeners.forEach((listener) => listener());
};

const getState = () => state;

const subscribe = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const syncClientParticipantIdentity = () => {
  const identity = deriveClientIdentity();
  let found = false;

  const nextParticipants = state.participants.map((participant) => {
    if (participant.id !== CLIENT_PARTICIPANT_ID || participant.role !== "CLIENT") {
      return participant;
    }

    found = true;
    return {
      ...participant,
      displayName: identity.displayName,
      avatarFallback: identity.initials,
      email: identity.email ?? participant.email,
    };
  });

  if (!found) {
    nextParticipants.push(createClientParticipant(identity));
  }

  state = { ...state, participants: nextParticipants };
  notify();
};

const sortConversations = (items: Conversation[]) =>
  [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

const findConversation = (
  conversations: Conversation[],
  fromId: string,
  toId: string,
  reference?: string,
): Conversation | undefined => {
  const participantSet = new Set([fromId, toId]);

  return conversations.find((conversation) => {
    if (conversation.participants.length !== participantSet.size) {
      return false;
    }

    const sameParticipants = conversation.participants.every((participantId) =>
      participantSet.has(participantId),
    );

    if (!sameParticipants) {
      return false;
    }

    if (!reference) {
      return true;
    }

    return conversation.context.reference === reference;
  });
};

const sendMessage = async (input: SendMessageInput): Promise<Conversation> => {
  const snapshot = getState();
  const sender = snapshot.participants.find((participant) => participant.id === input.fromId);
  const recipient = snapshot.participants.find((participant) => participant.id === input.toId);

  if (!sender || !recipient) {
    throw new Error("Sender or recipient not found");
  }

  const serviceResponse = await messagingService.sendMessage({
    subject: input.subject,
    content: input.content,
    fromId: sender.id,
    toId: recipient.id,
    contextType: input.contextType,
    contextReference: input.contextReference,
  });

  const timestamp = serviceResponse.timestamp ?? nowIso();
  const messageId = serviceResponse.id ?? createId();

  const reference = input.contextReference || undefined;

  let conversation = snapshot.conversations.find((item) => item.id === input.conversationId);

  if (!conversation) {
    conversation = findConversation(snapshot.conversations, sender.id, recipient.id, reference);
  }

  let conversations = snapshot.conversations;

  if (!conversation) {
    const newConversation: Conversation = {
      id: createId(),
      participants: [sender.id, recipient.id],
      context: {
        type: input.contextType ?? "SUPPORT",
        reference,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
      messages: [],
    };

    conversations = [...conversations, newConversation];
    conversation = newConversation;
  }

  const newMessage: Message = {
    id: messageId,
    conversationId: conversation.id,
    subject: input.subject,
    content: input.content,
    senderId: sender.id,
    senderRole: sender.role,
    recipientId: recipient.id,
    recipientRole: recipient.role,
    timestamp,
  };

  const updatedConversation: Conversation = {
    ...conversation,
    context: {
      type: input.contextType ?? conversation.context.type,
      reference: reference ?? conversation.context.reference,
    },
    updatedAt: timestamp,
    messages: [...conversation.messages, newMessage],
  };

  const nextState: MessagesState = {
    participants: snapshot.participants,
    conversations: sortConversations(
      conversations.map((item) => (item.id === updatedConversation.id ? updatedConversation : item)),
    ),
  };

state = nextState;
cachedSnapshot = buildSnapshot();
notify();

  return updatedConversation;
};

const createThread = async (input: CreateThreadInput): Promise<Conversation> => {
  const snapshot = getState();
  const sender = snapshot.participants.find((participant) => participant.id === input.fromId);
  const recipient = snapshot.participants.find((participant) => participant.id === input.toId);

  if (!sender || !recipient) {
    throw new Error("Participant introuvable pour créer la conversation");
  }

  if (input.toRole && recipient.role !== input.toRole) {
    throw new Error("Le destinataire sélectionné n'est plus disponible");
  }

  const serviceResponse = await messagingService.sendMessage({
    subject: input.subject,
    content: input.message,
    fromId: sender.id,
    toId: recipient.id,
    contextType: input.contextType,
    contextReference: input.contextReference,
  });

  const timestamp = serviceResponse.timestamp ?? nowIso();
  const messageId = serviceResponse.id ?? createId();
  const conversationId = createId();

  const reference = input.contextReference?.trim() ? input.contextReference.trim() : undefined;

  const newMessage: Message = {
    id: messageId,
    conversationId,
    subject: input.subject,
    content: input.message,
    senderId: sender.id,
    senderRole: sender.role,
    recipientId: recipient.id,
    recipientRole: recipient.role,
    timestamp,
  };

  const newConversation: Conversation = {
    id: conversationId,
    participants: [sender.id, recipient.id],
    context: { type: input.contextType, reference },
    createdAt: timestamp,
    updatedAt: timestamp,
    messages: [newMessage],
  };

  const nextState: MessagesState = {
    participants: snapshot.participants,
    conversations: sortConversations([...snapshot.conversations, newConversation]),
  };

  state = nextState;
  cachedSnapshot = buildSnapshot();
  notify();

  return newConversation;
};

const getParticipant = (id: string) => getState().participants.find((participant) => participant.id === id);

const getConversationsFor = (participantId: string) =>
  sortConversations(
    getState().conversations.filter((conversation) => conversation.participants.includes(participantId)),
  );

const getRecipientsFor = (participantId: string) => {
  const participant = getParticipant(participantId);
  if (!participant) {
    return [];
  }

  const all = getState().participants.filter((item) => item.id !== participantId);

  if (participant.role === "ADMIN") {
    return all;
  }

  if (participant.role === "CLIENT") {
    return all.filter((item) => item.role !== "CLIENT");
  }

  return all.filter((item) => item.role !== "DRIVER");
};

const listRecentDriversForClient = async (clientId: string): Promise<Participant[]> => {
  const snapshot = getState();
  const client = snapshot.participants.find((participant) => participant.id === clientId);
  const clientOrders = client?.metadata?.orders ?? [];
  const activeOrderId = client?.metadata?.activeOrderId;

  const drivers = snapshot.participants.filter((participant) => {
    if (participant.role !== "DRIVER") {
      return false;
    }

    if (clientOrders.length === 0) {
      return true;
    }

    const driverOrders = participant.metadata?.orders ?? [];
    return driverOrders.some((order) => clientOrders.includes(order));
  });

  const scoreDriver = (participant: Participant) => {
    const driverOrders = participant.metadata?.orders ?? [];
    if (activeOrderId && driverOrders.includes(activeOrderId)) {
      return 0;
    }
    if (driverOrders.some((order) => clientOrders.includes(order))) {
      return 1;
    }
    return 2;
  };

  return [...drivers].sort((a, b) => {
    const scoreDiff = scoreDriver(a) - scoreDriver(b);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return a.displayName.localeCompare(b.displayName);
  });
};

const buildSnapshot = (): MessagesStore => ({
  ...state,
  sendMessage,
  createThread,
  getParticipant,
  getConversationsFor,
  getRecipientsFor,
  listRecentDriversForClient,
});

let cachedSnapshot: MessagesStore = buildSnapshot();

const getSnapshot = (): MessagesStore => cachedSnapshot;

export const useMessagesStore = () => useSyncExternalStore<MessagesStore>(subscribe, getSnapshot, getSnapshot);

export type { Conversation, ConversationContextType, Message, Participant, UserRole };

export const messagesStoreActions = {
  sendMessage,
  createThread,
  getParticipant,
  getConversationsFor,
  getRecipientsFor,
  listRecentDriversForClient,
};
