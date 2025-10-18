const getLocalStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch (error) {
    console.warn("LocalStorage inaccessible", error);
    return null;
  }
};

export const getFromStorage = <T,>(key: string, fallback: T): T => {
  const storage = getLocalStorage();
  if (!storage) return fallback;
  try {
    const value = storage.getItem(key);
    if (value === null) return fallback;
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn(`Impossible de lire la clé "${key}"`, error);
    return fallback;
  }
};

export const saveToStorage = (key: string, value: unknown) => {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Impossible d'enregistrer la clé "${key}"`, error);
  }
};

export const KEY_SEQ_GLOBAL = "oc_order_seq_global";
export const KEY_LOCK = "oc_order_seq_lock";
export const MIN_PAD = 3;
export const ORDER_PREFIX = "ORD-";

const DIGITS_PATTERN = /^(\d+)$/;
const PREFIXED_PATTERN = /^ORD-(\d+)$/i;

const extractOrderNumericValue = (value: unknown): number | null => {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const prefixedMatch = raw.match(PREFIXED_PATTERN);
  if (prefixedMatch) {
    const parsed = Number.parseInt(prefixedMatch[1], 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  const digitsMatch = raw.match(DIGITS_PATTERN);
  if (digitsMatch) {
    const parsed = Number.parseInt(digitsMatch[1], 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export const ensureOrderNumberFormat = (value: string | null | undefined): string => {
  if (value == null) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  const numeric = extractOrderNumericValue(raw);
  if (numeric == null) {
    return raw;
  }
  return formatOrderNumber(numeric);
};

export function initGlobalOrderSeq() {
  const storage = getLocalStorage();
  if (!storage) return;
  const existing = storage.getItem(KEY_SEQ_GLOBAL);
  if (existing && /^\d+$/.test(existing)) {
    return;
  }

  const orders = getFromStorage<Array<{ id?: string }>>("oc_orders", []);
  let max = 0;
  for (const entry of orders) {
    const numeric = extractOrderNumericValue(entry?.id);
    if (numeric != null && numeric > max) {
      max = numeric;
    }
  }
  storage.setItem(KEY_SEQ_GLOBAL, String(max));
}

export function reconcileGlobalOrderSeq() {
  const storage = getLocalStorage();
  if (!storage) return;
  const orders = getFromStorage<Array<{ id?: string }>>("oc_orders", []);
  let max = Number.parseInt(storage.getItem(KEY_SEQ_GLOBAL) ?? "0", 10) || 0;
  let hasChange = false;
  const normalized = orders.map((entry) => {
    if (!entry || typeof entry !== "object") {
      return entry;
    }
    const formatted = ensureOrderNumberFormat(entry.id ?? "");
    const numeric = extractOrderNumericValue(formatted);
    if (numeric != null && numeric > max) {
      max = numeric;
    }
    if (formatted && formatted !== entry.id) {
      hasChange = true;
      return { ...entry, id: formatted };
    }
    return entry;
  });

  if (hasChange) {
    saveToStorage("oc_orders", normalized);
  }

  storage.setItem(KEY_SEQ_GLOBAL, String(max));
}

function withSeqLock<T>(fn: () => T): T {
  const storage = getLocalStorage();
  if (!storage) return fn();

  const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const EXPIRE_MS = 1500;
  const RETRY_MS = 12;
  const TIMEOUT_MS = 800;
  const started = Date.now();

  while (true) {
    let lock: { id?: string; ts?: number } | null = null;
    try {
      lock = JSON.parse(storage.getItem(KEY_LOCK) ?? "null");
    } catch {
      lock = null;
    }

    const now = Date.now();
    if (!lock || !lock.ts || now - lock.ts > EXPIRE_MS) {
      storage.setItem(KEY_LOCK, JSON.stringify({ id: token, ts: now }));
      try {
        const current = JSON.parse(storage.getItem(KEY_LOCK) ?? "null") as { id?: string } | null;
        if (current?.id === token) {
          try {
            return fn();
          } finally {
            try {
              const active = JSON.parse(storage.getItem(KEY_LOCK) ?? "null") as { id?: string } | null;
              if (active?.id === token) {
                storage.removeItem(KEY_LOCK);
              }
            } catch {
              storage.removeItem(KEY_LOCK);
            }
          }
        }
      } catch {
        storage.removeItem(KEY_LOCK);
      }
    }

    if (Date.now() - started > TIMEOUT_MS) {
      return fn();
    }

    const until = Date.now() + RETRY_MS;
    while (Date.now() < until) {
      // busy wait minimal delay
    }
  }
}

function formatOrderNumber(value: number): string {
  const base = String(value);
  const padded = base.length < MIN_PAD ? base.padStart(MIN_PAD, "0") : base;
  return `${ORDER_PREFIX}${padded}`;
}

export function generateNextOrderNumber(): string {
  return withSeqLock(() => {
    initGlobalOrderSeq();
    const storage = getLocalStorage();
    if (!storage) return formatOrderNumber(1);

    let current = Number.parseInt(storage.getItem(KEY_SEQ_GLOBAL) ?? "0", 10) || 0;
    const orders = getFromStorage<Array<{ id?: string }>>("oc_orders", []);
    let next = current + 1;

    while (true) {
      const exists = orders.some((order) => extractOrderNumericValue(order?.id) === next);
      if (!exists) {
        storage.setItem(KEY_SEQ_GLOBAL, String(next));
        return formatOrderNumber(next);
      }
      next += 1;
    }
  });
}

export function previewNextOrderNumber(): string | null {
  const storage = getLocalStorage();
  if (!storage) return null;

  return withSeqLock(() => {
    initGlobalOrderSeq();
    let current = Number.parseInt(storage.getItem(KEY_SEQ_GLOBAL) ?? "0", 10) || 0;
    const orders = getFromStorage<Array<{ id?: string }>>("oc_orders", []);
    let next = current + 1;

    while (true) {
      const exists = orders.some((order) => extractOrderNumericValue(order?.id) === next);
      if (!exists) {
        return formatOrderNumber(next);
      }
      next += 1;
    }
  });
}

export function assertUniqueOrderIdOrThrow(id: string) {
  const normalized = ensureOrderNumberFormat(id);
  if (!PREFIXED_PATTERN.test(normalized)) {
    throw new Error("Numéro de commande invalide");
  }

  const numeric = extractOrderNumericValue(normalized);
  if (numeric == null) {
    throw new Error("Numéro de commande invalide");
  }

  const orders = getFromStorage<Array<{ id?: string }>>("oc_orders", []);
  const duplicate = orders.some((order) => extractOrderNumericValue(order?.id) === numeric);
  if (duplicate) {
    throw new Error("Numéro de commande déjà utilisé");
  }
}

if (typeof document !== "undefined") {
  const init = () => {
    try {
      initGlobalOrderSeq();
      reconcileGlobalOrderSeq();
    } catch (error) {
      console.warn("Impossible d'initialiser la séquence globale", error);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
}

export { withSeqLock };
