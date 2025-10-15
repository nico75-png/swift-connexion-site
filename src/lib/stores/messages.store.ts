import { getClients } from "@/lib/clientStorage";
import { getDrivers, generateId } from "@/lib/stores/driversOrders.store";

export type ConversationEntityType = "CLIENT" | "DRIVER";

export type ConversationCategory = "INCIDENT" | "ORDER" | "SUPPORT";

export type ConversationSender = "ADMIN" | "CLIENT" | "DRIVER";

interface StoredConversationParticipant {
  type: ConversationEntityType;
  id: string;
  fallback: {
    displayName: string;
    company?: string;
    contactName?: string;
    email?: string;
    phone?: string;
  };
}

interface StoredConversationMessage {
  id: string;
  sender: ConversationSender;
  text: string;
  createdAt: string;
}

interface StoredConversation {
  id: string;
  category: ConversationCategory;
  subject: string;
  orderId?: string;
  incidentId?: string;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  participant: StoredConversationParticipant;
  messages: StoredConversationMessage[];
}

export interface ConversationParticipantDetails {
  type: ConversationEntityType;
  id: string;
  displayName: string;
  company?: string;
  contactName?: string;
  email?: string;
  phone?: string;
}

export interface ConversationMessage {
  id: string;
  sender: ConversationSender;
  text: string;
  createdAt: string;
}

export interface AdminConversation {
  id: string;
  category: ConversationCategory;
  subject: string;
  orderId?: string;
  incidentId?: string;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  participant: ConversationParticipantDetails;
  messages: ConversationMessage[];
}

const STORAGE_KEY = "oc_admin_conversations";

const isBrowser = typeof window !== "undefined";

const getStorage = (): Storage | null => {
  if (!isBrowser) {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    console.warn("localStorage is not accessible", error);
    return null;
  }
};

const cloneConversations = (items: StoredConversation[]): StoredConversation[] =>
  items.map((conversation) => ({
    ...conversation,
    participant: {
      ...conversation.participant,
      fallback: { ...conversation.participant.fallback },
    },
    messages: conversation.messages.map((message) => ({ ...message })),
  }));

const defaultConversations: StoredConversation[] = [
  {
    id: "CONV-1001",
    category: "INCIDENT",
    subject: "Colis endommagé sur la commande #010",
    orderId: "010",
    incidentId: "INC-4589",
    createdAt: "2025-01-15T08:52:00.000Z",
    updatedAt: "2025-01-15T09:32:00.000Z",
    unreadCount: 1,
    participant: {
      type: "CLIENT",
      id: "CLI-2001",
      fallback: {
        displayName: "Jean Dupont",
        company: "Cabinet Dupont",
        contactName: "Jean Dupont",
        email: "support@cabinet-dupont.fr",
        phone: "01 23 45 67 89",
      },
    },
    messages: [
      {
        id: "MSG-1001",
        sender: "CLIENT",
        text: "Bonjour, le colis livré ce matin est endommagé. C'est urgent pour notre client final.",
        createdAt: "2025-01-15T08:52:00.000Z",
      },
      {
        id: "MSG-1002",
        sender: "ADMIN",
        text: "Bonjour, nous allons vérifier cela immédiatement. Pouvez-vous m'envoyer des photos ?",
        createdAt: "2025-01-15T09:05:00.000Z",
      },
      {
        id: "MSG-1003",
        sender: "CLIENT",
        text: "Oui, je viens d'ajouter deux photos via l'espace client.",
        createdAt: "2025-01-15T09:32:00.000Z",
      },
    ],
  },
  {
    id: "CONV-1002",
    category: "ORDER",
    subject: "Retard au chargement - commande #009",
    orderId: "009",
    createdAt: "2025-01-15T07:45:00.000Z",
    updatedAt: "2025-01-15T10:15:00.000Z",
    unreadCount: 0,
    participant: {
      type: "DRIVER",
      id: "DRV-102",
      fallback: {
        displayName: "Julie Lambert",
        email: "julie.lambert@one-connexion.test",
        phone: "06 98 76 54 32",
      },
    },
    messages: [
      {
        id: "MSG-2001",
        sender: "DRIVER",
        text: "Arrivée sur place pour la commande #009 mais le colis n'est pas prêt. Ils me demandent d'attendre.",
        createdAt: "2025-01-15T07:45:00.000Z",
      },
      {
        id: "MSG-2002",
        sender: "ADMIN",
        text: "Merci pour l'info Julie, peux-tu patienter 10 minutes supplémentaires ?",
        createdAt: "2025-01-15T07:52:00.000Z",
      },
      {
        id: "MSG-2003",
        sender: "DRIVER",
        text: "Pas de souci, je reste sur place et je vous tiens au courant.",
        createdAt: "2025-01-15T07:55:00.000Z",
      },
      {
        id: "MSG-2004",
        sender: "DRIVER",
        text: "Colis chargé à l'instant, je repars pour la livraison.",
        createdAt: "2025-01-15T10:15:00.000Z",
      },
    ],
  },
  {
    id: "CONV-1003",
    category: "INCIDENT",
    subject: "Panne véhicule sur le trajet",
    orderId: "1002",
    incidentId: "INC-4591",
    createdAt: "2025-01-15T06:30:00.000Z",
    updatedAt: "2025-01-15T06:58:00.000Z",
    unreadCount: 0,
    participant: {
      type: "DRIVER",
      id: "DRV-103",
      fallback: {
        displayName: "Sophie Renard",
        email: "sophie.renard@one-connexion.test",
        phone: "07 11 22 33 44",
      },
    },
    messages: [
      {
        id: "MSG-3001",
        sender: "DRIVER",
        text: "Je suis en panne sur le périphérique, voyant moteur allumé. Assistance demandée.",
        createdAt: "2025-01-15T06:30:00.000Z",
      },
      {
        id: "MSG-3002",
        sender: "ADMIN",
        text: "Reçu Sophie, on dépêche un autre chauffeur et on prévient le client.",
        createdAt: "2025-01-15T06:38:00.000Z",
      },
      {
        id: "MSG-3003",
        sender: "ADMIN",
        text: "Merci de rester en sécurité et de nous envoyer ta localisation.",
        createdAt: "2025-01-15T06:45:00.000Z",
      },
      {
        id: "MSG-3004",
        sender: "DRIVER",
        text: "Dépanneuse en route, je vous partage ma position en pièce jointe.",
        createdAt: "2025-01-15T06:58:00.000Z",
      },
    ],
  },
];

const readConversations = (): StoredConversation[] => {
  const storage = getStorage();
  if (!storage) {
    return cloneConversations(defaultConversations);
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as StoredConversation[];
  } catch (error) {
    console.warn("Failed to parse admin conversations", error);
    return [];
  }
};

const writeConversations = (items: StoredConversation[]) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn("Failed to persist admin conversations", error);
  }
};

const ensureSeeded = (): StoredConversation[] => {
  const storage = getStorage();
  if (!storage) {
    return cloneConversations(defaultConversations);
  }

  const existing = readConversations();
  if (existing.length === 0) {
    const seeded = cloneConversations(defaultConversations);
    writeConversations(seeded);
    return seeded;
  }

  return existing;
};

const sortMessages = (messages: StoredConversationMessage[]): StoredConversationMessage[] =>
  [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

const sortConversations = (conversations: AdminConversation[]): AdminConversation[] =>
  [...conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

const buildParticipantDetails = (
  participant: StoredConversationParticipant,
): ConversationParticipantDetails => {
  const clients = participant.type === "CLIENT" ? getClients() : [];
  const drivers = participant.type === "DRIVER" ? getDrivers() : [];

  if (participant.type === "CLIENT") {
    const match = clients.find((client) => client.id === participant.id);
    if (match) {
      return {
        type: "CLIENT",
        id: participant.id,
        displayName: match.contact || match.company,
        company: match.company,
        contactName: match.contact,
        email: match.email,
        phone: match.phone,
      };
    }
  }

  if (participant.type === "DRIVER") {
    const match = drivers.find((driver) => driver.id === participant.id);
    if (match) {
      return {
        type: "DRIVER",
        id: participant.id,
        displayName: match.name || match.fullname || participant.fallback.displayName,
        company: participant.fallback.company,
        contactName: match.fullname,
        email: match.email || participant.fallback.email,
        phone: match.phone || participant.fallback.phone,
      };
    }
  }

  return {
    type: participant.type,
    id: participant.id,
    displayName: participant.fallback.displayName,
    company: participant.fallback.company,
    contactName: participant.fallback.contactName,
    email: participant.fallback.email,
    phone: participant.fallback.phone,
  };
};

const hydrateConversation = (conversation: StoredConversation): AdminConversation => {
  const participant = buildParticipantDetails(conversation.participant);
  const messages = sortMessages(conversation.messages).map((message) => ({ ...message }));

  return {
    id: conversation.id,
    category: conversation.category,
    subject: conversation.subject,
    orderId: conversation.orderId,
    incidentId: conversation.incidentId,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    unreadCount: conversation.unreadCount,
    participant,
    messages,
  };
};

export const getAdminConversations = (): AdminConversation[] => {
  const stored = ensureSeeded();
  const hydrated = stored.map((conversation) => hydrateConversation(conversation));
  return sortConversations(hydrated);
};

export const getAdminConversation = (id: string): AdminConversation | null => {
  const stored = ensureSeeded();
  const match = stored.find((conversation) => conversation.id === id);
  if (!match) {
    return null;
  }

  return hydrateConversation(match);
};

export const markAdminConversationAsRead = (id: string): AdminConversation | null => {
  const conversations = ensureSeeded();
  const index = conversations.findIndex((conversation) => conversation.id === id);
  if (index === -1) {
    return null;
  }

  const current = conversations[index];
  if (current.unreadCount === 0) {
    return hydrateConversation(current);
  }

  const updated: StoredConversation = {
    ...current,
    unreadCount: 0,
  };

  const next = [...conversations];
  next[index] = updated;
  writeConversations(next);
  return hydrateConversation(updated);
};

export const appendAdminConversationMessage = (
  id: string,
  text: string,
  sender: ConversationSender = "ADMIN",
): AdminConversation | null => {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const conversations = ensureSeeded();
  const index = conversations.findIndex((conversation) => conversation.id === id);
  if (index === -1) {
    return null;
  }

  const now = new Date().toISOString();
  const message: StoredConversationMessage = {
    id: generateId(),
    sender,
    text: trimmed,
    createdAt: now,
  };

  const current = conversations[index];
  const unreadCount = sender === "ADMIN" ? current.unreadCount : current.unreadCount + 1;

  const updated: StoredConversation = {
    ...current,
    messages: [...current.messages, message],
    updatedAt: now,
    unreadCount,
  };

  const next = [...conversations];
  next[index] = updated;
  writeConversations(next);
  return hydrateConversation(updated);
};

export const replaceAdminConversations = (items: StoredConversation[]) => {
  writeConversations(items);
};

export type { StoredConversation, StoredConversationMessage, StoredConversationParticipant };
