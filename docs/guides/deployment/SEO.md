# SEO Optimization & Meta Tags

This document outlines the comprehensive SEO implementation in BoxCall, including meta tags, Open Graph, Twitter Cards, structured data, and search engine optimization.

## Overview

BoxCall implements extensive SEO features to ensure optimal search engine visibility, social media sharing, and discoverability.

## Features Implemented

### 1. Meta Tags Management

- **Dynamic Titles**: Page-specific title generation
- **Meta Descriptions**: Compelling, keyword-rich descriptions
- **Keywords**: Relevant keyword targeting
- **Robots**: Search engine indexing control
- **Canonical URLs**: Duplicate content prevention

```tsx
// Usage Example
import { PageSEO } from "../components/seo/PageSEO";

<PageSEO
  title="Team Dashboard"
  description="Manage your football team with comprehensive tools"
  keywords={["team management", "football", "coaching"]}
/>;
```

### 2. Open Graph Tags

- **Social Sharing**: Rich social media previews
- **Dynamic Images**: Page-specific share images
- **Article Metadata**: Author, publish date, tags
- **Site Information**: Consistent branding

### 3. Twitter Cards

- **Large Image Cards**: Engaging visual previews
- **Summary Cards**: Compact information display
- **Creator Attribution**: Author recognition
- **Site Attribution**: Brand consistency

### 4. Structured Data

- **Schema.org Markup**: Search engine understanding
- **Organization Data**: Company information
- **Website Data**: Site navigation
- **Breadcrumbs**: Page hierarchy
- **Article Data**: Content metadata

```tsx
// Structured Data Example
<PageSEO
  structuredData={{
    type: "ARTICLE",
    data: {
      "@type": "Article",
      headline: "Football Coaching Tips",
      author: { "@type": "Person", name: "Coach Smith" },
      datePublished: "2025-09-30",
    },
  }}
/>
```

### 5. Analytics Integration

- **Google Analytics**: Traffic and behavior tracking
- **Google Tag Manager**: Advanced tracking setup
- **Microsoft Clarity**: User experience insights
- **Facebook Pixel**: Social media attribution

## Components

### SEOProvider

Global SEO provider that manages site-wide SEO configuration and analytics.

**Features:**

- Basic meta tag setup
- Global structured data
- Analytics initialization
- Page view tracking

### PageSEO

Component for setting page-specific SEO metadata.

**Features:**

- Dynamic meta tags
- Open Graph optimization
- Twitter Card setup
- Structured data injection

### SEO Presets

Pre-configured SEO components for common page types:

```tsx
// Home Page SEO
<HomeSEO />

// Dashboard SEO (Private)
<DashboardSEO teamName="Warriors" />

// Playbook SEO (Private)
<PlaybookSEO playbookName="Offense 2025" teamName="Warriors" />

// Article SEO (Public)
<ArticleSEO
  title="Advanced Coaching Strategies"
  description="Learn professional football coaching techniques"
  author="Coach Johnson"
  publishedTime="2025-09-30T10:00:00Z"
  tags={['coaching', 'strategy', 'football']}
/>
```

## Configuration

### SEO Config

Centralized configuration for all SEO features:

```typescript
// src/config/seo.ts
export const seoConfig = {
  site: {
    name: "BoxCall",
    url: "https://boxcall.app",
    description: "Professional football coaching platform",
    logo: "/logo-512.png",
    language: "en",
    locale: "en_US",
  },
  defaultMeta: {
    title: "BoxCall - Professional Football Coaching Platform",
    description: "Streamline your football team management...",
    keywords: ["football coaching", "team management"],
    robots: "index, follow, max-image-preview:large",
  },
  openGraph: {
    type: "website",
    site_name: "BoxCall",
    defaultImage: "/og-image.png",
    imageWidth: 1200,
    imageHeight: 630,
  },
  // ... more configuration
};
```

## Hooks

### useSEO

Main hook for managing SEO metadata.

```tsx
const { updateMetaTags } = useSEO({
  title: "Custom Page Title",
  description: "Page description",
  keywords: ["keyword1", "keyword2"],
});
```

### usePageSEO

Hook for page-specific SEO with accessibility announcements.

```tsx
usePageSEO({
  title: "Dashboard",
  description: "Team management dashboard",
  noindex: true, // Private page
});
```

### useStructuredData

Hook for adding structured data to pages.

```tsx
useStructuredData({
  type: "ARTICLE",
  data: {
    "@type": "Article",
    headline: "Article Title",
    author: { "@type": "Person", name: "Author" },
  },
});
```

### useSitemap

Hook for generating XML sitemaps.

```tsx
const { generateSitemap } = useSitemap();

const sitemap = generateSitemap([
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/about", changefreq: "monthly", priority: 0.8 },
]);
```

### useAnalyticsIntegration

Hook for initializing analytics services.

```tsx
// Automatically initializes:
// - Google Analytics
// - Google Tag Manager
// - Microsoft Clarity
// - Facebook Pixel
useAnalyticsIntegration();
```

## Page Types & SEO Strategy

### Public Pages

**Strategy**: Optimize for search engines and social sharing

```tsx
// Home page
<HomeSEO />

// About page
<PageSEO
  title="About BoxCall"
  description="Learn about our football coaching platform"
  type="website"
/>

// Blog articles
<ArticleSEO
  title="Article Title"
  description="Article description"
  author="Author Name"
  publishedTime="2025-09-30T10:00:00Z"
/>
```

### Private Pages

**Strategy**: Prevent indexing but maintain good UX

```tsx
// Dashboard
<DashboardSEO teamName="Team Name" />

// Playbooks (private)
<PlaybookSEO
  playbookName="Playbook Name"
  teamName="Team Name"
/>

// User profiles (private)
<ProfileSEO
  playerName="Player Name"
  isPublic={false}
/>
```

### Dynamic Content

**Strategy**: Generate SEO based on content

```tsx
// Team pages
<PageSEO
  title={`${team.name} - BoxCall`}
  description={`${team.name} football team on BoxCall platform`}
  image={team.logo}
  noindex={!team.isPublic}
/>
```

## Meta Tags Reference

### Essential Meta Tags

```html
<!-- Basic -->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Page Title | BoxCall</title>
<meta name="description" content="Page description" />
<meta name="keywords" content="keyword1, keyword2" />

<!-- SEO -->
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://boxcall.app/page" />
<meta name="author" content="BoxCall Team" />

<!-- Open Graph -->
<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Page description" />
<meta property="og:image" content="https://boxcall.app/og-image.png" />
<meta property="og:url" content="https://boxcall.app/page" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="BoxCall" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@BoxCallApp" />
<meta name="twitter:title" content="Page Title" />
<meta name="twitter:description" content="Page description" />
<meta name="twitter:image" content="https://boxcall.app/og-image.png" />
```

## Structured Data Examples

### Organization

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "BoxCall",
  "url": "https://boxcall.app",
  "logo": "https://boxcall.app/logo-512.png",
  "sameAs": [
    "https://twitter.com/BoxCallApp",
    "https://facebook.com/BoxCallApp"
  ]
}
```

### Website

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "BoxCall",
  "url": "https://boxcall.app",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://boxcall.app/search?q={search_term_string}"
  }
}
```

### Article

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "description": "Article description",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "datePublished": "2025-09-30T10:00:00Z",
  "dateModified": "2025-09-30T10:00:00Z",
  "image": "https://boxcall.app/article-image.png"
}
```

### Breadcrumbs

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://boxcall.app"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Dashboard",
      "item": "https://boxcall.app/dashboard"
    }
  ]
}
```

## Analytics Setup

### Google Analytics 4

```typescript
// Environment variable
VITE_GA_MEASUREMENT_ID = G - XXXXXXXXXX;

// Automatic initialization in SEOProvider
```

### Google Tag Manager

```typescript
// Environment variable
VITE_GTM_ID = GTM - XXXXXXX;

// Automatic initialization in SEOProvider
```

### Microsoft Clarity

```typescript
// Environment variable
VITE_CLARITY_ID = xxxxxxxxx;

// Automatic initialization in SEOProvider
```

## Image Optimization for SEO

### Open Graph Images

- **Size**: 1200x630 pixels
- **Format**: PNG or JPG
- **File Size**: < 1MB
- **Content**: Branded, high contrast text

### Twitter Card Images

- **Size**: 1200x600 pixels (summary_large_image)
- **Format**: PNG or JPG
- **File Size**: < 5MB

### Favicon

- **Format**: SVG (preferred) or ICO
- **Sizes**: 16x16, 32x32, 48x48
- **Location**: `/favicon.svg`

## Performance Considerations

### Meta Tag Optimization

- Minimize DOM manipulation
- Cache meta tag updates
- Batch updates when possible
- Remove unused meta tags

### Analytics Performance

- Load analytics asynchronously
- Use environment-specific configurations
- Implement consent management
- Monitor Core Web Vitals impact

## SEO Best Practices

### 1. Title Tags

- Keep under 60 characters
- Include primary keyword
- Make unique for each page
- Use brand name consistently

```tsx
// Good
generatePageTitle("Team Dashboard"); // "Team Dashboard | BoxCall"

// Avoid
("Dashboard"); // Too generic
("Team Dashboard - BoxCall - Football Coaching Platform..."); // Too long
```

### 2. Meta Descriptions

- Keep 150-160 characters
- Include call-to-action
- Unique for each page
- Compelling and descriptive

### 3. URL Structure

- Use clean, descriptive URLs
- Include keywords naturally
- Implement proper redirects
- Maintain consistency

### 4. Content Strategy

- Target relevant keywords
- Create valuable content
- Update content regularly
- Optimize for user intent

## Testing Tools

### SEO Testing

- [Google Search Console](https://search.google.com/search-console)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

### Performance Testing

- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)

## Monitoring & Analytics

### Key Metrics

- Organic search traffic
- Click-through rates (CTR)
- Social media engagement
- Page load performance
- Core Web Vitals

### Regular Audits

- Monthly SEO performance review
- Quarterly content optimization
- Annual technical SEO audit
- Continuous monitoring setup

## Troubleshooting

### Common Issues

1. **Missing meta tags**: Check SEOProvider integration
2. **Duplicate content**: Verify canonical URLs
3. **Poor social previews**: Validate Open Graph tags
4. **Analytics not tracking**: Check environment variables

### Debug Mode

```tsx
// Enable SEO debugging in development
<SEOProvider enableTesting={true}>
  <App />
</SEOProvider>
```

This will show SEO violations and missing optimizations in development mode.
