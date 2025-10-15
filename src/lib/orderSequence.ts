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
    const raw = String(entry?.id ?? "").trim();
    const match = raw.match(/^(\d+)$/) || raw.match(/^ORD-(\d+)$/);
    if (!match) continue;
    const value = Number.parseInt(match[1], 10);
    if (Number.isFinite(value) && value > max) {
      max = value;
    }
  }
  storage.setItem(KEY_SEQ_GLOBAL, String(max));
}

export function reconcileGlobalOrderSeq() {
  const storage = getLocalStorage();
  if (!storage) return;
  const orders = getFromStorage<Array<{ id?: string }>>("oc_orders", []);
  let max = Number.parseInt(storage.getItem(KEY_SEQ_GLOBAL) ?? "0", 10) || 0;
  for (const entry of orders) {
    const raw = String(entry?.id ?? "").trim();
    const match = raw.match(/^(\d+)$/) || raw.match(/^ORD-(\d+)$/);
    if (!match) continue;
    const value = Number.parseInt(match[1], 10);
    if (value > max) {
      max = value;
    }
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
  if (base.length < MIN_PAD) {
    return base.padStart(MIN_PAD, "0");
  }
  return base;
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
      const candidate = formatOrderNumber(next);
      const exists = orders.some((order) => String(order?.id ?? "") === candidate);
      if (!exists) {
        storage.setItem(KEY_SEQ_GLOBAL, String(next));
        return candidate;
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
      const candidate = formatOrderNumber(next);
      const exists = orders.some((order) => String(order?.id ?? "") === candidate);
      if (!exists) {
        return candidate;
      }
      next += 1;
    }
  });
}

export function assertUniqueOrderIdOrThrow(id: string) {
  const orders = getFromStorage<Array<{ id?: string }>>("oc_orders", []);
  const duplicate = orders.some((order) => String(order?.id ?? "") === String(id));
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
