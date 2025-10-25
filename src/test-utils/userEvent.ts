import { act } from "react-dom/test-utils";

type TypeableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const sleep = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration));

const dispatchPointer = (element: Element, type: string) => {
  element.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
};

const click = async (element: HTMLElement) => {
  await act(async () => {
    element.focus?.();
    dispatchPointer(element, "pointerdown");
    dispatchPointer(element, "mousedown");
    dispatchPointer(element, "mouseup");
    element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    await sleep(0);
  });
};

const type = async (element: HTMLElement, text: string) => {
  if (!("value" in element)) {
    throw new Error("L'élément ne supporte pas la saisie");
  }
  const control = element as TypeableElement;
  await act(async () => {
    control.focus();
    for (const character of text) {
      control.value += character;
      control.dispatchEvent(new Event("input", { bubbles: true }));
      await sleep(0);
    }
    control.dispatchEvent(new Event("change", { bubbles: true }));
  });
};

const setup = () => ({
  click,
  type,
});

export default Object.assign({ setup }, { click, type });
export { click, setup, type };
