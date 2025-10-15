export interface SendMessagePayload {
  subject: string;
  content: string;
  fromId: string;
  toId: string;
  contextType?: string;
  contextReference?: string;
}

export interface SendMessageResponse {
  id: string;
  timestamp: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

export const messagingService = {
  async sendMessage(payload: SendMessagePayload): Promise<SendMessageResponse> {
    await delay(300);
    return { id: createId(), timestamp: new Date().toISOString() };
  },
};


