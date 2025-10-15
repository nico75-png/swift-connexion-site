import { generateId } from "@/lib/stores/driversOrders.store";

export type MessageThreadStatus = "OPEN" | "LOCKED";

export type MessageAuthor = "CLIENT" | "DRIVER" | "SYSTEM";

export interface MessageThread {
  id: string;
  orderId: string;
  driverId: string;
  clientId: string;
  status: MessageThreadStatus;
  lastMessageAt: string;
  unreadForClient: number;
  unreadForDriver: number;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadMessage {
  id: string;
  threadId: string;
  author: MessageAuthor;
  body: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  threads: "oc_messages_threads",
  messages: "oc_messages_entries",
} as const;

const defaultThreads: MessageThread[] = [];
const defaultMessages: ThreadMessage[] = [];

const isBrowser = typeof window !== "undefined";

const safeParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback;
  }
  try {
    const parsed = JSON.parse(value) as T;
    return parsed;
  } catch (error) {
    console.warn("Unable to parse message store value", error);
    return fallback;
  }
};

const initStore = <T,>(key: string, defaultValue: T) => {
  if (!isBrowser) {
    return defaultValue;
  }
  const existing = window.localStorage.getItem(key);
  if (existing) {
    return safeParse<T>(existing, defaultValue);
  }
  window.localStorage.setItem(key, JSON.stringify(defaultValue));
  return defaultValue;
};

const ensureInitialized = () => {
  initStore(STORAGE_KEYS.threads, defaultThreads);
  initStore(STORAGE_KEYS.messages, defaultMessages);
};

const readStore = <T,>(key: string, fallback: T): T => {
  if (!isBrowser) {
    return fallback;
  }
  ensureInitialized();
  return safeParse<T>(window.localStorage.getItem(key), fallback);
};

const writeStore = <T,>(key: string, value: T) => {
  if (!isBrowser) {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
};

const nowIso = () => new Date().toISOString();

export const getMessageThreads = (): MessageThread[] => readStore(STORAGE_KEYS.threads, defaultThreads);

export const saveMessageThreads = (threads: MessageThread[]) => {
  writeStore(STORAGE_KEYS.threads, threads);
};

export const getThreadMessages = (): ThreadMessage[] => readStore(STORAGE_KEYS.messages, defaultMessages);

export const saveThreadMessages = (messages: ThreadMessage[]) => {
  writeStore(STORAGE_KEYS.messages, messages);
};

const sortMessages = (messages: ThreadMessage[]) =>
  [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

export const getMessagesByThread = (threadId: string): ThreadMessage[] =>
  sortMessages(getThreadMessages().filter((message) => message.threadId === threadId));

export const findThread = (orderId: string, driverId: string, clientId: string): MessageThread | null => {
  const threads = getMessageThreads();
  const candidates = threads
    .filter(
      (thread) =>
        thread.orderId === orderId &&
        thread.driverId === driverId &&
        thread.clientId === clientId,
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return candidates[0] ?? null;
};

export const ensureThread = (params: {
  orderId: string;
  driverId: string;
  clientId: string;
}): MessageThread => {
  const existing = findThread(params.orderId, params.driverId, params.clientId);
  if (existing) {
    return existing;
  }
  const createdAt = nowIso();
  const newThread: MessageThread = {
    id: `THR-${Date.now()}`,
    orderId: params.orderId,
    driverId: params.driverId,
    clientId: params.clientId,
    status: "OPEN",
    lastMessageAt: createdAt,
    unreadForClient: 0,
    unreadForDriver: 0,
    createdAt,
    updatedAt: createdAt,
  };
  const threads = getMessageThreads();
  saveMessageThreads([newThread, ...threads]);
  return newThread;
};

export const setThreadStatus = (threadId: string, status: MessageThreadStatus): MessageThread | null => {
  const threads = getMessageThreads();
  const index = threads.findIndex((thread) => thread.id === threadId);
  if (index === -1) {
    return null;
  }
  const current = threads[index];
  if (current.status === status) {
    return current;
  }
  const updated: MessageThread = {
    ...current,
    status,
    updatedAt: nowIso(),
  };
  const next = [...threads];
  next[index] = updated;
  saveMessageThreads(next);
  return updated;
};

export const markThreadAsRead = (threadId: string, actor: MessageAuthor): MessageThread | null => {
  const threads = getMessageThreads();
  const index = threads.findIndex((thread) => thread.id === threadId);
  if (index === -1) {
    return null;
  }
  const current = threads[index];
  const updated: MessageThread = {
    ...current,
    unreadForClient: actor === "CLIENT" ? 0 : current.unreadForClient,
    unreadForDriver: actor === "DRIVER" ? 0 : current.unreadForDriver,
  };
  if (updated.unreadForClient === current.unreadForClient && updated.unreadForDriver === current.unreadForDriver) {
    return current;
  }
  const next = [...threads];
  next[index] = updated;
  saveMessageThreads(next);
  return updated;
};

interface AppendMessageResult {
  message: ThreadMessage;
  thread: MessageThread;
}

export const appendMessageToThread = (
  threadId: string,
  author: MessageAuthor,
  body: string,
): AppendMessageResult | null => {
  const threads = getMessageThreads();
  const threadIndex = threads.findIndex((thread) => thread.id === threadId);
  if (threadIndex === -1) {
    return null;
  }
  const trimmedBody = body.trim();
  if (!trimmedBody) {
    return null;
  }
  const currentThread = threads[threadIndex];
  const createdAt = nowIso();
  const message: ThreadMessage = {
    id: generateId(),
    threadId,
    author,
    body: trimmedBody,
    createdAt,
  };

  const allMessages = getThreadMessages();
  saveThreadMessages([...allMessages, message]);

  const updatedThread: MessageThread = {
    ...currentThread,
    lastMessageAt: createdAt,
    updatedAt: createdAt,
    unreadForClient: author === "DRIVER" ? currentThread.unreadForClient + 1 : currentThread.unreadForClient,
    unreadForDriver: author === "CLIENT" ? currentThread.unreadForDriver + 1 : currentThread.unreadForDriver,
  };

  if (author === "CLIENT") {
    updatedThread.unreadForClient = 0;
  }

  const nextThreads = [...threads];
  nextThreads[threadIndex] = updatedThread;
  saveMessageThreads(nextThreads);

  return { message, thread: updatedThread };
};

export const resetUnreadForClient = (threadId: string) => markThreadAsRead(threadId, "CLIENT");

export const resetUnreadForDriver = (threadId: string) => markThreadAsRead(threadId, "DRIVER");
