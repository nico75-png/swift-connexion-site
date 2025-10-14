/**
 * Mock client storage layer backed by localStorage.
 * API:
 * - getClients(): ClientRecord[]
 * - saveClients(list): void
 * - indexClients(list): ClientIndexes
 * - checkDuplicate(payload): DuplicateCheckResult
 * - createClient(payload): ClientRecord
 * Extension points: swap storage backend, extend record shape, augment indexes.
 */
export interface ClientRecord {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  sector: string;
  address: string;
  siret: string;
  createdAt: string;
  orders: number;
  status: string;
  lastOrder?: string | null;
}

export type CreateClientPayload = {
  company: string;
  contact: string;
  email: string;
  phone: string;
  sector: string;
  address: string;
  siret: string;
  orders?: number;
  status?: string;
  lastOrder?: string | null;
  createdAt?: string;
};

const STORAGE_KEY = "oc_clients";

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

const readClients = (): ClientRecord[] => {
  const storage = getStorage();
  if (!storage) {
    return [];
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

    return parsed as ClientRecord[];
  } catch (error) {
    console.warn("Failed to parse clients from storage", error);
    return [];
  }
};

const writeClients = (clients: ClientRecord[]) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(clients));
  } catch (error) {
    console.warn("Failed to persist clients", error);
  }
};

export const getClients = (): ClientRecord[] => {
  return readClients();
};

export const saveClients = (clients: ClientRecord[]) => {
  writeClients(clients);
};

export const stripAccents = (value: string): string => {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
};

export const normEmail = (value: string): string => value.trim().toLowerCase();

export const normPhone = (value: string): string => value.replace(/\D/g, "");

export const normSiret = (value: string): string => value.replace(/\D/g, "");

export const normTextKey = (value: string): string =>
  stripAccents(value).trim().toLowerCase().replace(/\s+/g, " ");

export interface ClientIndexes {
  bySiret: Map<string, ClientRecord>;
  byEmail: Map<string, ClientRecord>;
  byCompanyAddr: Map<string, ClientRecord>;
  byCompanyPhone: Map<string, ClientRecord>;
}

export const indexClients = (clients: ClientRecord[]): ClientIndexes => {
  const bySiret = new Map<string, ClientRecord>();
  const byEmail = new Map<string, ClientRecord>();
  const byCompanyAddr = new Map<string, ClientRecord>();
  const byCompanyPhone = new Map<string, ClientRecord>();

  clients.forEach((client) => {
    const siretKey = normSiret(client.siret);
    if (siretKey && !bySiret.has(siretKey)) {
      bySiret.set(siretKey, client);
    }

    const emailKey = normEmail(client.email);
    if (emailKey && !byEmail.has(emailKey)) {
      byEmail.set(emailKey, client);
    }

    const companyKey = normTextKey(client.company);
    const addressKey = normTextKey(client.address);
    if (companyKey && addressKey) {
      const combinedKey = `${companyKey}::${addressKey}`;
      if (!byCompanyAddr.has(combinedKey)) {
        byCompanyAddr.set(combinedKey, client);
      }
    }

    const phoneKey = normPhone(client.phone);
    if (companyKey && phoneKey) {
      const companyPhoneKey = `${companyKey}::${phoneKey}`;
      if (!byCompanyPhone.has(companyPhoneKey)) {
        byCompanyPhone.set(companyPhoneKey, client);
      }
    }
  });

  return { bySiret, byEmail, byCompanyAddr, byCompanyPhone };
};

export type DuplicateReason = "siret" | "email" | "companyAddress" | "companyPhone";

export interface DuplicateCheckResult {
  duplicate: boolean;
  reason?: DuplicateReason;
  existingId?: string;
  existing?: ClientRecord;
}

const normalizePayload = (payload: CreateClientPayload) => ({
  company: payload.company.trim(),
  contact: payload.contact.trim(),
  email: payload.email.trim(),
  phone: payload.phone.trim(),
  sector: payload.sector,
  address: payload.address.trim(),
  siret: normSiret(payload.siret),
  orders: payload.orders,
  status: payload.status,
  lastOrder: payload.lastOrder,
  createdAt: payload.createdAt,
});

export const checkDuplicate = (
  payload: CreateClientPayload,
  existingIndexes?: ClientIndexes,
): DuplicateCheckResult => {
  const normalized = normalizePayload(payload);
  const clients = getClients();
  const indexes = existingIndexes ?? indexClients(clients);

  const siretKey = normSiret(normalized.siret);
  if (siretKey) {
    const match = indexes.bySiret.get(siretKey);
    if (match) {
      return { duplicate: true, reason: "siret", existingId: match.id, existing: match };
    }
  }

  const emailKey = normEmail(normalized.email);
  if (emailKey) {
    const match = indexes.byEmail.get(emailKey);
    if (match) {
      return { duplicate: true, reason: "email", existingId: match.id, existing: match };
    }
  }

  const companyKey = normTextKey(normalized.company);
  const addressKey = normTextKey(normalized.address);
  if (companyKey && addressKey) {
    const combinedKey = `${companyKey}::${addressKey}`;
    const match = indexes.byCompanyAddr.get(combinedKey);
    if (match) {
      return {
        duplicate: true,
        reason: "companyAddress",
        existingId: match.id,
        existing: match,
      };
    }
  }

  const phoneKey = normPhone(normalized.phone);
  if (companyKey && phoneKey) {
    const companyPhoneKey = `${companyKey}::${phoneKey}`;
    const match = indexes.byCompanyPhone.get(companyPhoneKey);
    if (match) {
      return {
        duplicate: true,
        reason: "companyPhone",
        existingId: match.id,
        existing: match,
      };
    }
  }

  return { duplicate: false };
};

export class DuplicateClientError extends Error {
  result: DuplicateCheckResult;

  constructor(result: DuplicateCheckResult) {
    super("Duplicate client detected");
    this.name = "DuplicateClientError";
    this.result = result;
  }
}

export const createClient = (payload: CreateClientPayload): ClientRecord => {
  const clients = readClients();
  const indexes = indexClients(clients);
  const duplicateResult = checkDuplicate(payload, indexes);
  if (duplicateResult.duplicate) {
    throw new DuplicateClientError(duplicateResult);
  }

  const normalized = normalizePayload(payload);
  const now = normalized.createdAt ?? new Date().toISOString();
  const id = (typeof crypto !== "undefined" && "randomUUID" in crypto)
    ? crypto.randomUUID()
    : Date.now().toString(36);

  const newClient: ClientRecord = {
    id,
    createdAt: now,
    company: normalized.company,
    contact: normalized.contact,
    email: normalized.email,
    phone: normalized.phone,
    sector: normalized.sector,
    address: normalized.address,
    siret: normalized.siret,
    orders: normalized.orders ?? 0,
    status: normalized.status ?? "Actif",
    lastOrder: normalized.lastOrder ?? null,
  };

  const updatedClients = [newClient, ...clients];
  writeClients(updatedClients);

  return newClient;
};
