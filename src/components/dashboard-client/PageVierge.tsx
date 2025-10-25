import { useEffect } from "react";

/**
 * Section interne du dashboard client offrant un canevas totalement vierge.
 * Aucun élément n'est rendu afin de disposer d'une page blanche prête à être designée.
 */
const PageVierge = () => {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const { body, documentElement } = document;

    const previousBodyBackground = body.style.backgroundColor;
    const previousBodyMinHeight = body.style.minHeight;
    const previousBodyMargin = body.style.margin;
    const previousBodyPadding = body.style.padding;
    const previousHtmlBackground = documentElement.style.backgroundColor;
    const previousHtmlMinHeight = documentElement.style.minHeight;

    documentElement.style.backgroundColor = "#FFFFFF";
    documentElement.style.minHeight = "100%";
    body.style.backgroundColor = "#FFFFFF";
    body.style.minHeight = "100vh";
    body.style.margin = "0";
    body.style.padding = "0";

    return () => {
      documentElement.style.backgroundColor = previousHtmlBackground;
      documentElement.style.minHeight = previousHtmlMinHeight;
      body.style.backgroundColor = previousBodyBackground;
      body.style.minHeight = previousBodyMinHeight;
      body.style.margin = previousBodyMargin;
      body.style.padding = previousBodyPadding;
    };
  }, []);

  return (
    <div
      className="h-screen w-screen bg-white"
      role="presentation"
      aria-hidden="true"
    />
  );
};

export default PageVierge;
