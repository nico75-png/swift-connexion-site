const isBrowser = typeof window !== "undefined";

// === Storage helpers (si pas déjà présents) ===
export const getFromStorage = <T,>(key: string, fallback: T = [] as T): T => {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Failed to read storage key "${key}"`, error);
    return fallback;
  }
};

export const saveToStorage = (key: string, value: unknown) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to write storage key "${key}"`, error);
  }
};

// === Constantes ID séquentiel ===
export const HORDE_PREFIX = "HORDE";
export const HORDE_PAD = 5; // HORDE + 5 chiffres -> "HORDE25001"

const SEQ_KEY = "oc_order_seq";
const LOCK_KEY = "oc_order_seq_lock";
const ORDERS_KEY = "oc_orders";

// === Parse un ID "HORDE#####", retourne le numéro ou null ===
export function parseHordeId(id: unknown): number | null {
  if (typeof id !== "string") return null;
  const match = id.match(/^HORDE(\d+)$/);
  if (!match) return null;
  const parsed = Number.parseInt(match[1], 10);
  return Number.isNaN(parsed) ? null : parsed;
}

// === Scanne les commandes existantes pour trouver le max actuel ===
export function scanMaxHordeNumber(orders: Array<{ id?: string | null }> | undefined | null): number {
  if (!Array.isArray(orders)) return 0;
  let max = 0;
  for (const order of orders) {
    const value = parseHordeId(order?.id ?? null);
    if (typeof value === "number" && value > max) {
      max = value;
    }
  }
  return max;
}

// === Init séquence au chargement de l'app (idempotent) ===
// - Si aucune séquence sauvegardée, on la calcule depuis oc_orders.
// - Option: si tu veux forcer un départ (ex: 25001), mets localStorage.setItem('oc_order_seq', '25001') avant l'init.
export function initOrderSequence() {
  if (!isBrowser) return;

  const existing = window.localStorage.getItem(SEQ_KEY);
  if (existing && /^\d+$/.test(existing)) {
    return;
  }

  const orders = getFromStorage<Array<{ id?: string | null }>>(ORDERS_KEY, []);
  const maxFromOrders = scanMaxHordeNumber(orders);

  window.localStorage.setItem(SEQ_KEY, String(maxFromOrders));
}

// === Petit verrou localStorage (best effort multi-onglet) ===
function withSeqLock<T>(fn: () => T): T {
  if (!isBrowser) {
    return fn();
  }

  const lockId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const TRY_MS = 12;
  const TIMEOUT_MS = 800;
  const EXPIRE_MS = 1500;

  const start = Date.now();

  while (true) {
    const now = Date.now();

    try {
      const raw = window.localStorage.getItem(LOCK_KEY);
      const lock = raw ? (JSON.parse(raw) as { id?: string; ts?: number }) : null;

      if (!lock || typeof lock.ts !== "number" || now - lock.ts > EXPIRE_MS) {
        const payload = JSON.stringify({ id: lockId, ts: now });
        window.localStorage.setItem(LOCK_KEY, payload);

        const checkRaw = window.localStorage.getItem(LOCK_KEY);
        const check = checkRaw ? (JSON.parse(checkRaw) as { id?: string }) : null;
        if (check?.id === lockId) {
          try {
            return fn();
          } finally {
            try {
              const currentRaw = window.localStorage.getItem(LOCK_KEY);
              const current = currentRaw ? (JSON.parse(currentRaw) as { id?: string }) : null;
              if (current?.id === lockId) {
                window.localStorage.removeItem(LOCK_KEY);
              }
            } catch {
              window.localStorage.removeItem(LOCK_KEY);
            }
          }
        }
      }
    } catch (error) {
      console.warn("Sequence lock error", error);
      return fn();
    }

    if (Date.now() - start > TIMEOUT_MS) {
      return fn();
    }

    const until = Date.now() + TRY_MS;
    while (Date.now() < until) {
      // Busy wait - suffisant pour SPA
    }
  }
}

// === Génère le prochain ID séquentiel "HORDE#####", unique globalement ===
export function generateNextHordeId(): string {
  return withSeqLock(() => {
    if (!isBrowser) {
      const fallback = String(Date.now() % 10 ** HORDE_PAD).padStart(HORDE_PAD, "0");
      return `${HORDE_PREFIX}${fallback}`;
    }

    initOrderSequence();

    const currentRaw = window.localStorage.getItem(SEQ_KEY) || "0";
    let current = Number.parseInt(currentRaw, 10);
    if (!Number.isInteger(current) || current < 0) {
      current = 0;
    }

    const orders = getFromStorage<Array<{ id?: string | null }>>(ORDERS_KEY, []);
    const maxFromOrders = scanMaxHordeNumber(orders);
    if (maxFromOrders > current) {
      current = maxFromOrders;
    }

    const next = current + 1;
    window.localStorage.setItem(SEQ_KEY, String(next));

    const numStr = String(next).padStart(HORDE_PAD, "0");
    return `${HORDE_PREFIX}${numStr}`;
  });
}

// === Utilitaire: forcer la cohérence si import de commandes externes ===
export function reconcileOrderSequence() {
  if (!isBrowser) return;

  const orders = getFromStorage<Array<{ id?: string | null }>>(ORDERS_KEY, []);
  const maxFromOrders = scanMaxHordeNumber(orders);

  const seqRaw = window.localStorage.getItem(SEQ_KEY) || "0";
  const seq = Number.parseInt(seqRaw, 10);
  if (!Number.isInteger(seq) || seq < 0 || maxFromOrders > seq) {
    window.localStorage.setItem(SEQ_KEY, String(Math.max(0, maxFromOrders)));
  }
}
