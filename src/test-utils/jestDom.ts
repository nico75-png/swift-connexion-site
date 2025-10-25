import { expect } from "vitest";

const isVisible = (element: Element) => {
  if (!(element instanceof HTMLElement)) {
    return false;
  }
  const style = window.getComputedStyle(element);
  return style.visibility !== "hidden" && style.display !== "none" && !!element.offsetParent;
};

expect.extend({
  toBeInTheDocument(received: Element) {
    const pass = document.body.contains(received);
    return {
      pass,
      message: () => (pass ? "L'élément est présent dans le document." : "L'élément est absent du document."),
    };
  },
  toBeVisible(received: Element) {
    const pass = isVisible(received);
    return {
      pass,
      message: () => (pass ? "L'élément est visible." : "L'élément est masqué."),
    };
  },
  toBeFocused(received: Element) {
    const pass = document.activeElement === received;
    return {
      pass,
      message: () => (pass ? "L'élément a le focus." : "L'élément n'a pas le focus."),
    };
  },
  toHaveTextContent(received: Element, expected: string | RegExp) {
    const text = received.textContent ?? "";
    const pass = typeof expected === "string" ? text.includes(expected) : expected.test(text);
    return {
      pass,
      message: () => (pass ? "Le texte correspond." : `Le texte "${text}" ne correspond pas.`),
    };
  },
});

export {};
