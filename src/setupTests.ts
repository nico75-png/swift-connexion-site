import { afterEach } from "vitest";

import "@/test-utils/jestDom";
import { cleanup } from "@/test-utils/rtl";

afterEach(() => {
  cleanup();
});

const storage = new Map<string, string>();

if (typeof globalThis.window === "undefined") {
  Object.defineProperty(globalThis, "window", {
    value: {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        removeItem: (key: string) => {
          storage.delete(key);
        },
        clear: () => {
          storage.clear();
        },
      },
    },
    configurable: true,
  });
}

if (typeof globalThis.localStorage === "undefined") {
  Object.defineProperty(globalThis, "localStorage", {
    value: globalThis.window.localStorage,
    configurable: true,
  });
}

export {};
