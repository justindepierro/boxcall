/**
 * SEO Provider
 *
 * Global SEO provider for meta tags, structured data, and optimization
 */

import React, { useEffect } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { seoConfig } from "../../config/seo";
import type { SEOMetaData } from "../../hooks/useSEO";
import { SEOContext, type SEOContextType } from "../../hooks/useSEOContext";

interface SEOProviderProps {
  children: ReactNode;
}

export const SEOProvider: React.FC<SEOProviderProps> = ({ children }) => {
  const location = useLocation();

  // Set up basic meta tags and structured data
  useEffect(() => {
    // Basic meta tags that should always be present
    const setBasicMetaTags = () => {
      // Viewport
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement("meta");
        viewportMeta.setAttribute("name", "viewport");
        document.head.appendChild(viewportMeta);
      }
      viewportMeta.setAttribute("content", seoConfig.defaultMeta.viewport);

      // Charset
      let charsetMeta = document.querySelector("meta[charset]");
      if (!charsetMeta) {
        charsetMeta = document.createElement("meta");
        charsetMeta.setAttribute("charset", "utf-8");
        document.head.insertBefore(charsetMeta, document.head.firstChild);
      }

      // Language
      document.documentElement.lang = seoConfig.site.language;

      // Favicon
      let faviconLink = document.querySelector(
        'link[rel="icon"]'
      ) as HTMLLinkElement;
      if (!faviconLink) {
        faviconLink = document.createElement("link");
        faviconLink.rel = "icon";
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = seoConfig.site.favicon;

      // Apple touch icon
      let appleTouchIcon = document.querySelector(
        'link[rel="apple-touch-icon"]'
      ) as HTMLLinkElement;
      if (!appleTouchIcon) {
        appleTouchIcon = document.createElement("link");
        appleTouchIcon.rel = "apple-touch-icon";
        document.head.appendChild(appleTouchIcon);
      }
      appleTouchIcon.href = seoConfig.site.logo;

      // Manifest
      let manifestLink = document.querySelector(
        'link[rel="manifest"]'
      ) as HTMLLinkElement;
      if (!manifestLink) {
        manifestLink = document.createElement("link");
        manifestLink.rel = "manifest";
        manifestLink.href = "/manifest.json";
        document.head.appendChild(manifestLink);
      }
    };

    setBasicMetaTags();
  }, []);

  // Set up global structured data
  useEffect(() => {
    const globalStructuredData = {
      "@context": "https://schema.org",
      "@graph": [
        seoConfig.structuredData.organization,
        seoConfig.structuredData.website,
      ],
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "global-structured-data";
    script.textContent = JSON.stringify(globalStructuredData);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById("global-structured-data");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Track page views for analytics
  useEffect(() => {
    // Google Analytics page view
    if (typeof gtag !== "undefined") {
      gtag("config", seoConfig.analytics.googleAnalyticsId!, {
        page_path: location.pathname + location.search,
      });
    }

    // Google Tag Manager page view
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "page_view",
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  const updateSEO = (_metadata: SEOMetaData) => {
    // This will be used by individual components to update SEO
    // The actual implementation is handled by the useSEO hook
  };

  const contextValue: SEOContextType = {
    updateSEO,
    siteConfig: seoConfig,
  };

  return (
    <SEOContext.Provider value={contextValue}>{children}</SEOContext.Provider>
  );
};

// Head component for managing document head
export const SEOHead: React.FC<{
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noindex?: boolean;
  children?: ReactNode;
}> = ({ title, description, keywords, image, noindex, children }) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title.includes("BoxCall") ? title : `${title} | BoxCall`;
    }

    // Update meta description
    if (description) {
      let descMeta = document.querySelector('meta[name="description"]');
      if (!descMeta) {
        descMeta = document.createElement("meta");
        descMeta.setAttribute("name", "description");
        document.head.appendChild(descMeta);
      }
      descMeta.setAttribute("content", description);
    }

    // Update keywords
    if (keywords && keywords.length > 0) {
      let keywordsMeta = document.querySelector('meta[name="keywords"]');
      if (!keywordsMeta) {
        keywordsMeta = document.createElement("meta");
        keywordsMeta.setAttribute("name", "keywords");
        document.head.appendChild(keywordsMeta);
      }
      keywordsMeta.setAttribute("content", keywords.join(", "));
    }

    // Update robots meta
    if (noindex) {
      let robotsMeta = document.querySelector('meta[name="robots"]');
      if (!robotsMeta) {
        robotsMeta = document.createElement("meta");
        robotsMeta.setAttribute("name", "robots");
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute("content", "noindex, nofollow");
    }
  }, [title, description, keywords, image, noindex]);

  return <>{children}</>;
};

// Breadcrumb component with structured data
export const SEOBreadcrumb: React.FC<{
  items: Array<{ name: string; url?: string }>;
}> = ({ items }) => {
  useEffect(() => {
    const breadcrumbStructuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        ...(item.url && { item: `${seoConfig.site.url}${item.url}` }),
      })),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "breadcrumb-structured-data";
    script.textContent = JSON.stringify(breadcrumbStructuredData);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById(
        "breadcrumb-structured-data"
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [items]);

  return null;
};
