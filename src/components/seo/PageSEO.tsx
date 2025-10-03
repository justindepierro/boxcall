/**
 * Page SEO Component
 *
 * Component for setting page-specific SEO metadata
 */

import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePageSEO, useStructuredData } from "../../hooks/useSEO";
import type { SEOMetaData } from "../../hooks/useSEO";
import { PAGE_TYPES } from "../../config/seo";

interface PageSEOProps extends SEOMetaData {
  structuredData?: {
    type: keyof typeof PAGE_TYPES;
    data: Record<string, any>;
  };
  breadcrumb?: Array<{ name: string; url?: string }>;
}

export const PageSEO: React.FC<PageSEOProps> = ({
  title,
  description,
  keywords,
  image,
  type = "website",
  author,
  publishedTime,
  modifiedTime,
  section,
  tags,
  noindex,
  nofollow,
  structuredData,
  breadcrumb,
}) => {
  const location = useLocation();

  // Update page SEO
  usePageSEO({
    title,
    description,
    keywords,
    image,
    url: location.pathname,
    type,
    author,
    publishedTime,
    modifiedTime,
    section,
    tags,
    noindex,
    nofollow,
  });

  // Add structured data if provided
  useStructuredData(
    structuredData || {
      type: "WEBPAGE",
      data: {
        name: title,
        description,
        url: `${window.location.origin}${location.pathname}`,
      },
    }
  );

  // Add breadcrumb structured data
  useEffect(() => {
    if (breadcrumb && breadcrumb.length > 0) {
      const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumb.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          ...(item.url && { item: `${window.location.origin}${item.url}` }),
        })),
      };

      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "page-breadcrumb-data";
      script.textContent = JSON.stringify(breadcrumbData);
      document.head.appendChild(script);

      return () => {
        const existingScript = document.getElementById("page-breadcrumb-data");
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, [breadcrumb]);

  return null;
};

// Common page SEO presets
export const HomeSEO: React.FC<{
  customTitle?: string;
  customDescription?: string;
}> = ({ customTitle, customDescription }) => (
  <PageSEO
    title={customTitle || "Professional Football Coaching Platform"}
    description={
      customDescription ||
      "Streamline your football team management with BoxCall. Create playbooks, manage rosters, track performance, and coordinate team activities all in one platform."
    }
    keywords={[
      "football coaching",
      "team management",
      "sports platform",
      "playbook creator",
      "roster management",
    ]}
    structuredData={{
      type: "WEBSITE",
      data: {
        "@type": "WebSite",
        name: "BoxCall",
        url: window.location.origin,
        description: "Professional football coaching platform",
        potentialAction: {
          "@type": "SearchAction",
          target: `${window.location.origin}/search?q={search_term_string}`,
        },
      },
    }}
  />
);

export const DashboardSEO: React.FC<{ teamName?: string }> = ({ teamName }) => (
  <PageSEO
    title={teamName ? `${teamName} Dashboard` : "Team Dashboard"}
    description="Manage your football team with comprehensive dashboard tools for playbooks, roster management, and performance tracking."
    keywords={["team dashboard", "football management", "coaching tools"]}
    noindex={true} // Private page
    structuredData={{
      type: "WEBPAGE",
      data: {
        "@type": "WebPage",
        name: "Team Dashboard",
        description: "Team management dashboard",
      },
    }}
  />
);

export const PlaybookSEO: React.FC<{
  playbookName?: string;
  teamName?: string;
}> = ({ playbookName, teamName }) => (
  <PageSEO
    title={playbookName ? `${playbookName} Playbook` : "Team Playbook"}
    description={`Football playbook for ${teamName || "your team"}. Create, manage, and share plays with your coaching staff and players.`}
    keywords={["football playbook", "plays", "coaching", "strategy"]}
    noindex={true} // Private content
    breadcrumb={[
      { name: "Dashboard", url: "/dashboard" },
      { name: "Playbooks", url: "/playbooks" },
      ...(playbookName ? [{ name: playbookName }] : []),
    ]}
  />
);

export const ProfileSEO: React.FC<{
  playerName?: string;
  isPublic?: boolean;
}> = ({ playerName, isPublic = false }) => (
  <PageSEO
    title={playerName ? `${playerName} - Player Profile` : "Player Profile"}
    description={`Player profile for ${playerName || "football player"}. View stats, achievements, and team information.`}
    keywords={["player profile", "football player", "stats", "achievements"]}
    noindex={!isPublic}
    type="profile"
    structuredData={
      isPublic && playerName
        ? {
            type: "WEBPAGE",
            data: {
              "@type": "ProfilePage",
              mainEntity: {
                "@type": "Person",
                name: playerName,
                description: "Football player",
              },
            },
          }
        : undefined
    }
  />
);

export const ArticleSEO: React.FC<{
  title: string;
  description: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  tags?: string[];
  image?: string;
}> = ({
  title,
  description,
  author,
  publishedTime,
  modifiedTime,
  tags,
  image,
}) => (
  <PageSEO
    title={title}
    description={description}
    author={author}
    publishedTime={publishedTime}
    modifiedTime={modifiedTime}
    tags={tags}
    image={image}
    type="article"
    structuredData={{
      type: "ARTICLE",
      data: {
        "@type": "Article",
        headline: title,
        description,
        author: {
          "@type": "Person",
          name: author,
        },
        datePublished: publishedTime,
        ...(modifiedTime && { dateModified: modifiedTime }),
        ...(image && { image }),
      },
    }}
  />
);
