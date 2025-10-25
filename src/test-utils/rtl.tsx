import { act } from "react-dom/test-utils";
import { createRoot, type Root } from "react-dom/client";
import type { ReactElement } from "react";

type TextMatcher = string | RegExp;

const toText = (value: TextMatcher) =>
  typeof value === "string"
    ? (content: string | null | undefined) => content?.toLowerCase().includes(value.toLowerCase()) ?? false
    : (content: string | null | undefined) => (content ? value.test(content) : false);

const matchesText = (node: Element | null, matcher: TextMatcher): boolean => {
  const matchFn = toText(matcher);
  return matchFn(node?.textContent ?? null);
};

const getAssociatedControl = (label: HTMLLabelElement): HTMLElement | null => {
  const htmlFor = label.getAttribute("for");
  if (htmlFor) {
    return document.getElementById(htmlFor);
  }
  return label.querySelector<HTMLElement>("input,select,textarea,button");
};

const queryAllByLabelText = (container: ParentNode, matcher: TextMatcher) => {
  const labels = Array.from(container.querySelectorAll<HTMLLabelElement>("label"));
  const matchFn = toText(matcher);
  return labels
    .filter((label) => matchFn(label.textContent))
    .map((label) => getAssociatedControl(label))
    .filter((element): element is HTMLElement => Boolean(element));
};

const queryAllByRole = (container: ParentNode, role: string, name?: TextMatcher) => {
  const candidates = Array.from(container.querySelectorAll<HTMLElement>("*")).filter((element) => {
    const elementRole = element.getAttribute("role");
    if (elementRole) {
      return elementRole.toLowerCase() === role.toLowerCase();
    }

    if (role === "button") {
      return element.tagName.toLowerCase() === "button";
    }

    if (role === "textbox") {
      const tag = element.tagName.toLowerCase();
      const type = (element as HTMLInputElement).type;
      return tag === "input" && (!type || type === "text");
    }

    return false;
  });

  if (!name) {
    return candidates;
  }

  return candidates.filter((element) => matchesText(element, name));
};

const queryAllByText = (container: ParentNode, matcher: TextMatcher) => {
  const elements = Array.from(container.querySelectorAll<HTMLElement>("*")).filter((element) =>
    matchesText(element, matcher),
  );
  return elements;
};

const createQueries = (container: ParentNode) => ({
  getByLabelText: (matcher: TextMatcher) => {
    const results = queryAllByLabelText(container, matcher);
    if (results.length === 0) {
      throw new Error(`Aucun champ associé au label ${String(matcher)}`);
    }
    return results[0];
  },
  getByRole: (role: string, options?: { name?: TextMatcher }) => {
    const results = queryAllByRole(container, role, options?.name);
    if (results.length === 0) {
      throw new Error(`Aucun élément avec le rôle ${role}`);
    }
    return results[0];
  },
  findByRole: async (role: string, options?: { name?: TextMatcher }, timeout = 1500) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const results = queryAllByRole(container, role, options?.name);
      if (results.length > 0) {
        return results[0];
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    throw new Error(`Élément avec le rôle ${role} introuvable`);
  },
  getByText: (matcher: TextMatcher) => {
    const results = queryAllByText(container, matcher);
    if (results.length === 0) {
      throw new Error(`Aucun texte correspondant à ${String(matcher)}`);
    }
    return results[0];
  },
  findByText: async (matcher: TextMatcher, timeout = 1500) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const results = queryAllByText(container, matcher);
      if (results.length > 0) {
        return results[0];
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    throw new Error(`Texte non trouvé : ${String(matcher)}`);
  },
});

let current: { container: HTMLElement; root: Root } | null = null;

export const cleanup = () => {
  if (current) {
    act(() => {
      current?.root.unmount();
    });
    current.container.remove();
    current = null;
  }
  document.body.innerHTML = "";
};

export const render = (ui: ReactElement) => {
  cleanup();
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(ui);
  });

  current = { container, root };

  const rerender = (nextUi: ReactElement) => {
    if (!current) {
      throw new Error("Aucune instance rendue");
    }
    act(() => {
      current?.root.render(nextUi);
    });
  };

  const unmount = () => cleanup();

  return {
    container,
    rerender,
    unmount,
  };
};

export const screen = new Proxy(
  {},
  {
    get: (_target, property) => {
      if (!current) {
        throw new Error("Aucun rendu actif");
      }
      const queries = createQueries(document.body);
      return (queries as Record<PropertyKey, unknown>)[property];
    },
  },
) as ReturnType<typeof createQueries>;

export const within = (element: ParentNode) => createQueries(element);
