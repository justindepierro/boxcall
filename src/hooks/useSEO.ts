/**
 * SEO Hooks
 * 
 * React hooks for managing SEO meta tags, structured data, and optimization
 */

import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  seoConfig, 
  generatePageTitle, 
  generatePageDescription, 
  generateCanonicalUrl,
  generateImageUrl,
  PAGE_TYPES,
} from '../config/seo';

export interface SEOMetaData {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
}

export interface StructuredDataProps {
  type: keyof typeof PAGE_TYPES;
  data: Record<string, any>;
}

// Main SEO hook
export function useSEO(metadata: SEOMetaData = {}) {
  const location = useLocation();

  const updateMetaTags = useCallback((meta: SEOMetaData) => {
    const title = generatePageTitle(meta.title);
    const description = generatePageDescription(meta.description);
    const canonicalUrl = generateCanonicalUrl(meta.url || location.pathname);
    const imageUrl = generateImageUrl(meta.image);
    const keywords = meta.keywords?.join(', ') || seoConfig.defaultMeta.keywords.join(', ');

    // Update document title
    document.title = title;

    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: string) => {
      const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
      let metaTag = document.querySelector(selector);
      
      if (!metaTag) {
        metaTag = document.createElement('meta');
        if (property) {
          metaTag.setAttribute('property', property);
        } else {
          metaTag.setAttribute('name', name);
        }
        document.head.appendChild(metaTag);
      }
      
      metaTag.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', meta.author || seoConfig.defaultMeta.author);
    
    // Robots meta tag
    const robotsContent = [];
    if (meta.noindex) robotsContent.push('noindex');
    if (meta.nofollow) robotsContent.push('nofollow');
    if (robotsContent.length === 0) {
      updateMetaTag('robots', seoConfig.defaultMeta.robots);
    } else {
      updateMetaTag('robots', robotsContent.join(', '));
    }

    // Open Graph tags
    updateMetaTag('', title, 'og:title');
    updateMetaTag('', description, 'og:description');
    updateMetaTag('', imageUrl, 'og:image');
    updateMetaTag('', canonicalUrl, 'og:url');
    updateMetaTag('', meta.type || seoConfig.openGraph.type, 'og:type');
    updateMetaTag('', seoConfig.openGraph.site_name, 'og:site_name');
    updateMetaTag('', seoConfig.openGraph.locale, 'og:locale');
    updateMetaTag('', seoConfig.openGraph.imageWidth.toString(), 'og:image:width');
    updateMetaTag('', seoConfig.openGraph.imageHeight.toString(), 'og:image:height');

    // Article-specific Open Graph tags
    if (meta.type === 'article') {
      if (meta.author) updateMetaTag('', meta.author, 'article:author');
      if (meta.publishedTime) updateMetaTag('', meta.publishedTime, 'article:published_time');
      if (meta.modifiedTime) updateMetaTag('', meta.modifiedTime, 'article:modified_time');
      if (meta.section) updateMetaTag('', meta.section, 'article:section');
      if (meta.tags) {
        meta.tags.forEach(tag => {
          const tagMeta = document.createElement('meta');
          tagMeta.setAttribute('property', 'article:tag');
          tagMeta.setAttribute('content', tag);
          document.head.appendChild(tagMeta);
        });
      }
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', seoConfig.twitter.card);
    updateMetaTag('twitter:site', seoConfig.twitter.site);
    updateMetaTag('twitter:creator', seoConfig.twitter.creator);
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', imageUrl);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

    // Theme color
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute('content', seoConfig.site.themeColor);

  }, [location.pathname]);

  useEffect(() => {
    updateMetaTags(metadata);
  }, [metadata, updateMetaTags]);

  return { updateMetaTags };
}

// Structured Data hook
export function useStructuredData(props: StructuredDataProps) {
  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': PAGE_TYPES[props.type],
      ...props.data,
    };

    // Remove existing structured data script
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [props.type, props.data]);
}

// Page-specific SEO hooks
export function usePageSEO(metadata: SEOMetaData = {}) {
  const { updateMetaTags } = useSEO(metadata);
  
  // Announce page change to screen readers for accessibility
  useEffect(() => {
    const pageTitle = generatePageTitle(metadata.title);
    
    // Create announcement for screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Page loaded: ${pageTitle}`;
    
    document.body.appendChild(announcement);
    
    // Remove announcement after screen readers have processed it
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [metadata.title]);

  return { updateMetaTags };
}

// Sitemap generation hook (for static site generation)
export function useSitemap() {
  const generateSitemap = useCallback((pages: Array<{
    url: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
  }>) => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${seoConfig.site.url}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
    ${page.changefreq ? `<changefreq>${page.changefreq}</changefreq>` : ''}
    ${page.priority ? `<priority>${page.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

    return sitemap;
  }, []);

  return { generateSitemap };
}

// Analytics integration hook
export function useAnalyticsIntegration() {
  useEffect(() => {
    // Google Analytics
    if (seoConfig.analytics.googleAnalyticsId) {
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${seoConfig.analytics.googleAnalyticsId}`;
      document.head.appendChild(gaScript);

      const gaConfigScript = document.createElement('script');
      gaConfigScript.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${seoConfig.analytics.googleAnalyticsId}');
      `;
      document.head.appendChild(gaConfigScript);
    }

    // Google Tag Manager
    if (seoConfig.analytics.googleTagManagerId) {
      const gtmScript = document.createElement('script');
      gtmScript.textContent = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${seoConfig.analytics.googleTagManagerId}');
      `;
      document.head.appendChild(gtmScript);
    }

    // Microsoft Clarity
    if (seoConfig.analytics.microsoftClarityId) {
      const clarityScript = document.createElement('script');
      clarityScript.textContent = `
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${seoConfig.analytics.microsoftClarityId}");
      `;
      document.head.appendChild(clarityScript);
    }
  }, []);
}