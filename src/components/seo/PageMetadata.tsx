import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface PageMetadataProps {
  title: string;
  description: string;
  canonicalPath: string;
}

const ensureNamedMeta = (name: string): HTMLMetaElement | null => {
  if (typeof document === "undefined") {
    return null;
  }

  let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }

  return element;
};

const ensurePropertyMeta = (property: string): HTMLMetaElement | null => {
  if (typeof document === "undefined") {
    return null;
  }

  let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }

  return element;
};

const ensureLink = (rel: string): HTMLLinkElement | null => {
  if (typeof document === "undefined") {
    return null;
  }

  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  return element;
};

const PageMetadata = ({ title, description, canonicalPath }: PageMetadataProps) => {
  const location = useLocation();

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    document.title = title;

    const absoluteUrl = canonicalPath.startsWith("http")
      ? canonicalPath
      : `${window.location.origin}${canonicalPath}`;

    const descriptionMeta = ensureNamedMeta("description");
    if (descriptionMeta) {
      descriptionMeta.setAttribute("content", description);
    }

    const ogTitle = ensurePropertyMeta("og:title");
    if (ogTitle) {
      ogTitle.setAttribute("content", title);
    }

    const ogDescription = ensurePropertyMeta("og:description");
    if (ogDescription) {
      ogDescription.setAttribute("content", description);
    }

    const ogUrl = ensurePropertyMeta("og:url");
    if (ogUrl) {
      ogUrl.setAttribute("content", absoluteUrl);
    }

    const ogType = ensurePropertyMeta("og:type");
    if (ogType) {
      ogType.setAttribute("content", "website");
    }

    const twitterCard = ensureNamedMeta("twitter:card");
    if (twitterCard) {
      twitterCard.setAttribute("content", "summary_large_image");
    }

    const twitterTitle = ensureNamedMeta("twitter:title");
    if (twitterTitle) {
      twitterTitle.setAttribute("content", title);
    }

    const twitterDescription = ensureNamedMeta("twitter:description");
    if (twitterDescription) {
      twitterDescription.setAttribute("content", description);
    }

    const canonicalLink = ensureLink("canonical");
    if (canonicalLink) {
      canonicalLink.setAttribute("href", absoluteUrl);
    }
  }, [canonicalPath, description, title, location.pathname]);

  return null;
};

export default PageMetadata;
