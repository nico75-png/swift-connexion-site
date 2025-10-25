import { useEffect } from "react";

/**
 * Page totalement vierge servant de canevas pour de futurs designs.
 * Aucun élément visuel n'est rendu et le fond est volontairement blanc pur.
 */
const PageVierge = () => {
  useEffect(() => {
    const previousBackgroundColor = document.body.style.backgroundColor;
    const previousMinHeight = document.body.style.minHeight;

    document.body.style.backgroundColor = "#FFFFFF";
    document.body.style.minHeight = "100vh";

    return () => {
      document.body.style.backgroundColor = previousBackgroundColor;
      document.body.style.minHeight = previousMinHeight;
    };
  }, []);

  return <div className="min-h-screen w-full bg-white" role="presentation" aria-hidden="true" />;
};

export default PageVierge;
