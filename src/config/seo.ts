/**
 * SEO Configuration
 * 
 * Configuration for comprehensive SEO optimization including meta tags,
 * Open Graph, Twitter Cards, and structured data
 */

export interface SEOConfig {
  // Site Information
  site: {
    name: string;
    url: string;
    description: string;
    logo: string;
    favicon: string;
    language: string;
    locale: string;
    themeColor: string;
  };

  // Default Meta Tags
  defaultMeta: {
    title: string;
    description: string;
    keywords: string[];
    author: string;
    robots: string;
    viewport: string;
  };

  // Open Graph Defaults
  openGraph: {
    type: string;
    site_name: string;
    locale: string;
    defaultImage: string;
    imageWidth: number;
    imageHeight: number;
  };

  // Twitter Card Defaults
  twitter: {
    card: string;
    site: string;
    creator: string;
  };

  // Structured Data
  structuredData: {
    organization: {
      '@type': string;
      name: string;
      url: string;
      logo: string;
      sameAs: string[];
    };
    website: {
      '@type': string;
      name: string;
      url: string;
      potentialAction: {
        '@type': string;
        target: string;
      };
    };
  };

  // Analytics
  analytics: {
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    facebookPixelId?: string;
    microsoftClarityId?: string;
  };
}

export const seoConfig: SEOConfig = {
  site: {
    name: 'BoxCall',
    url: import.meta.env.VITE_APP_URL || 'https://boxcall.app',
    description: 'Professional football coaching platform for teams, players, and coaches',
    logo: '/logo-512.png',
    favicon: '/favicon.svg',
    language: 'en',
    locale: 'en_US',
    themeColor: '#2563eb',
  },

  defaultMeta: {
    title: 'BoxCall - Professional Football Coaching Platform',
    description: 'Streamline your football team management with BoxCall. Create playbooks, manage rosters, track performance, and coordinate team activities all in one platform.',
    keywords: [
      'football coaching',
      'team management',
      'sports platform',
      'playbook creator',
      'roster management',
      'football app',
      'coaching software',
      'team coordination',
      'sports analytics',
      'player development'
    ],
    author: 'BoxCall Team',
    robots: 'index, follow, max-image-preview:large',
    viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  },

  openGraph: {
    type: 'website',
    site_name: 'BoxCall',
    locale: 'en_US',
    defaultImage: '/og-image.png',
    imageWidth: 1200,
    imageHeight: 630,
  },

  twitter: {
    card: 'summary_large_image',
    site: '@BoxCallApp',
    creator: '@BoxCallApp',
  },

  structuredData: {
    organization: {
      name: 'BoxCall',
      url: import.meta.env.VITE_APP_URL || 'https://boxcall.app',
      logo: `${import.meta.env.VITE_APP_URL || 'https://boxcall.app'}/logo-512.png`,
      description: 'Professional football coaching platform',
      contactPoint: {
        telephone: '+1-555-BOXCALL',
        contactType: 'customer service',
        email: 'support@boxcall.app',
      },
    },
    website: {
      url: import.meta.env.VITE_APP_URL || 'https://boxcall.app',
      name: 'BoxCall',
      potentialAction: {
        target: `${import.meta.env.VITE_APP_URL || 'https://boxcall.app'}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  },
  analytics: {
    googleAnalyticsId: import.meta.env.VITE_GA_MEASUREMENT_ID,
    googleTagManagerId: import.meta.env.VITE_GTM_ID,
    facebookPixelId: import.meta.env.VITE_FACEBOOK_PIXEL_ID,
    microsoftClarityId: import.meta.env.VITE_CLARITY_ID,
  },
};

// Common page types for structured data
export const PAGE_TYPES = {
  WEBSITE: 'WebSite',
  WEBPAGE: 'WebPage',
  ARTICLE: 'Article',
  PROFILE: 'ProfilePage',
  SEARCH: 'SearchResultsPage',
  ABOUT: 'AboutPage',
  CONTACT: 'ContactPage',
} as const;

// Social media platforms
export const SOCIAL_PLATFORMS = {
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  INSTAGRAM: 'instagram',
  YOUTUBE: 'youtube',
} as const;

// Meta tag utilities
export const generatePageTitle = (pageTitle?: string): string => {
  if (!pageTitle) return seoConfig.defaultMeta.title;
  return `${pageTitle} | ${seoConfig.site.name}`;
};

export const generatePageDescription = (description?: string): string => {
  return description || seoConfig.defaultMeta.description;
};

export const generateCanonicalUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${seoConfig.site.url}${cleanPath}`;
};

export const generateImageUrl = (imagePath?: string): string => {
  if (!imagePath) return `${seoConfig.site.url}${seoConfig.openGraph.defaultImage}`;
  if (imagePath.startsWith('http')) return imagePath;
  return `${seoConfig.site.url}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
};