const KEY = (k) => `dash:${k}`;

export const session = {
  set(key, value) {
    try {
      sessionStorage.setItem(KEY(key), JSON.stringify(value));
    } catch {
      // Silently ignore storage errors (e.g., unavailable storage)
    }
  },
  get(key, fallback = null) {
    try {
      const result = sessionStorage.getItem(KEY(key));
      return result ? JSON.parse(result) : fallback;
    } catch {
      return fallback;
    }
  },
  remove(key) {
    try {
      sessionStorage.removeItem(KEY(key));
    } catch {
      // Ignore errors when removing keys
    }
  },
  clearAll() {
    try {
      Object.keys(sessionStorage)
        .filter((storageKey) => storageKey.startsWith("dash:"))
        .forEach((storageKey) => {
          sessionStorage.removeItem(storageKey);
        });
    } catch {
      // Ignore errors when clearing keys
    }
  },
};
