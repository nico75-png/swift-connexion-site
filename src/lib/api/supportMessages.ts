export type SupportConversationStatus = "non_lu" | "en_cours" | "resolu";

export type SupportConversationCategory =
  | "commande"
  | "facturation"
  | "livraison"
  | "technique"
  | "remboursement"
  | "autre";

export type SupportConversationMessage = {
  id: string;
  conversationId: string;
  author: "client" | "support";
  content: string;
  createdAt: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
  }>;
};

export type SupportConversation = {
  id: string;
  subject: string;
  category: SupportConversationCategory;
  status: SupportConversationStatus;
  lastActivityAt: string;
  unreadCount: number;
  lastMessagePreview: string;
};

type CreateSupportMessagePayload = {
  subject: string;
  category: SupportConversationCategory;
  message: string;
  metadata?: Record<string, unknown>;
};

type ReplySupportMessagePayload = {
  message: string;
  attachments?: File[];
};

const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json",
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Support message request failed");
  }

  return response.json() as Promise<T>;
};

export const fetchSupportConversations = async () => {
  const response = await fetch("/api/support/messages", {
    method: "GET",
    headers: defaultHeaders,
  });

  return handleResponse<SupportConversation[]>(response);
};

export const fetchSupportConversationById = async (conversationId: string) => {
  const response = await fetch(`/api/support/messages/${conversationId}`, {
    method: "GET",
    headers: defaultHeaders,
  });

  return handleResponse<SupportConversationMessage[]>(response);
};

export const createSupportConversation = async (payload: CreateSupportMessagePayload) => {
  const response = await fetch("/api/support/messages", {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });

  return handleResponse<{ conversationId: string }>(response);
};

export const replyToSupportConversation = async (
  conversationId: string,
  payload: ReplySupportMessagePayload,
) => {
  const response = await fetch(`/api/support/messages/${conversationId}/reply`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({ message: payload.message }),
  });

  return handleResponse<{ success: boolean }>(response);
};

