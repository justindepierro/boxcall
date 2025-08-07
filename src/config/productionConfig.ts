/**
 * Production Hardening Configuration
 * Part of Phase 3D: Final Mobile Polish & Performance Optimization
 */

// Security headers configuration
export const securityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https: blob:",
    "connect-src 'self' https://api.boxcall.com https://www.google-analytics.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

// Performance optimization configuration
export const performanceConfig = {
  // Critical resource hints
  resourceHints: {
    preload: [
      {
        href: "/assets/fonts/inter-var.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: true,
      },
      { href: "/assets/critical.css", as: "style" },
    ],
    prefetch: ["/api/user/profile", "/api/teams/recent"],
    preconnect: [
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com",
      "https://api.boxcall.com",
    ],
  },

  // Bundle splitting strategy
  chunkSplitting: {
    vendor: ["react", "react-dom", "react-router-dom"],
    ui: ["lucide-react", "@headlessui/react"],
    utils: ["date-fns", "clsx", "tailwind-merge"],
  },

  // Image optimization
  imageOptimization: {
    formats: ["avif", "webp", "jpg"],
    sizes: [320, 640, 960, 1280, 1920],
    quality: {
      avif: 50,
      webp: 60,
      jpg: 80,
    },
  },

  // Service Worker configuration
  serviceWorker: {
    enabled: true,
    cachingStrategy: {
      static: "CacheFirst",
      api: "NetworkFirst",
      images: "CacheFirst",
    },
    offlinePages: ["/", "/offline"],
  },
};

// Error handling configuration
export const errorConfig = {
  // Sentry configuration
  sentry: {
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    sampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.01 : 1.0,
    beforeSend: (event: { exception?: { values?: { value?: string }[] } }) => {
      // Filter out known non-critical errors
      if (
        event.exception?.values?.[0]?.value?.includes("Network request failed")
      ) {
        return null;
      }
      return event;
    },
  },

  // Error boundaries configuration
  errorBoundaries: {
    maxRetries: 3,
    enableAutoRetry: false,
    enableReporting: true,
    fallbackComponent: "DefaultErrorFallback",
  },

  // Console log filtering for production
  logFilters: {
    allowedLevels:
      process.env.NODE_ENV === "production"
        ? ["error"]
        : ["log", "warn", "error"],
    blockedPatterns: [/React DevTools/, /Download the React DevTools/],
  },
};

// Accessibility configuration
export const a11yConfig = {
  // ARIA live regions
  liveRegions: {
    status: { id: "status-messages", "aria-live": "polite" },
    alert: { id: "alert-messages", "aria-live": "assertive" },
  },

  // Focus management
  focusManagement: {
    trapFocus: true,
    returnFocus: true,
    skipLinks: [
      { href: "#main-content", text: "Skip to main content" },
      { href: "#navigation", text: "Skip to navigation" },
    ],
  },

  // Color contrast requirements
  colorContrast: {
    minimumRatio: 4.5, // WCAG AA standard
    largeTextRatio: 3.0,
    nonTextRatio: 3.0,
  },
};

// Mobile optimization configuration
export const mobileConfig = {
  // Touch targets
  touchTargets: {
    minimumSize: 44, // pixels
    spacing: 8, // pixels between targets
  },

  // Viewport configuration
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: "yes",
    viewportFit: "cover", // For iPhone X+ notch
  },

  // PWA configuration
  pwa: {
    displayMode: "standalone",
    orientation: "portrait-primary",
    themeColor: "#1f2937", // team-primary color
    backgroundColor: "#ffffff",
    categories: ["sports", "productivity"],
    shortcuts: [
      {
        name: "New Practice",
        url: "/practice/new",
        description: "Create a new practice session",
      },
      {
        name: "Team Stats",
        url: "/stats",
        description: "View team statistics",
      },
    ],
  },

  // Native features
  nativeFeatures: {
    webShare: true,
    webShareTarget: {
      action: "/share-target",
      method: "POST",
      params: {
        title: "title",
        text: "text",
        url: "url",
      },
    },
    notifications: {
      badge: "/assets/badge-icon.png",
      icon: "/assets/notification-icon.png",
    },
  },
};

// Development tools configuration
export const devConfig = {
  // Performance monitoring
  performanceMonitoring: {
    enabled: true,
    thresholds: {
      fcp: 1800, // First Contentful Paint
      lcp: 2500, // Largest Contentful Paint
      fid: 100, // First Input Delay
      cls: 0.1, // Cumulative Layout Shift
    },
  },

  // Bundle analysis
  bundleAnalysis: {
    enabled: process.env.NODE_ENV === "development",
    maxBundleSize: 250000, // 250KB
    maxChunkSize: 100000, // 100KB
  },

  // Hot reload configuration
  hotReload: {
    enabled: process.env.NODE_ENV === "development",
    preserveState: true,
    errorOverlay: true,
  },
};

// Environment-specific configuration
export const getEnvironmentConfig = () => {
  const isProd = process.env.NODE_ENV === "production";
  const isDev = process.env.NODE_ENV === "development";

  return {
    apiBaseUrl:
      process.env.REACT_APP_API_BASE_URL ||
      (isProd ? "https://api.boxcall.com" : "http://localhost:3001"),
    enableAnalytics: isProd,
    enableErrorReporting: isProd,
    enablePerformanceMonitoring: true,
    debugMode: isDev,
    logLevel: isProd ? "error" : "debug",
    cacheStrategy: isProd ? "aggressive" : "minimal",
    compressionEnabled: isProd,
    minificationEnabled: isProd,
    sourceMapEnabled: isDev,
  };
};

// Production readiness checklist
export const productionChecklist = {
  security: [
    "Security headers configured",
    "CSP policy implemented",
    "HTTPS enforced",
    "Input validation implemented",
    "XSS protection enabled",
  ],
  performance: [
    "Bundle size optimized",
    "Images optimized",
    "Lazy loading implemented",
    "Service worker configured",
    "CDN configured",
  ],
  accessibility: [
    "WCAG AA compliance",
    "Keyboard navigation",
    "Screen reader support",
    "Color contrast validated",
    "Focus management",
  ],
  seo: [
    "Meta tags configured",
    "Structured data implemented",
    "Sitemap generated",
    "Open Graph tags",
    "Twitter Card tags",
  ],
  monitoring: [
    "Error tracking configured",
    "Performance monitoring",
    "User analytics",
    "Uptime monitoring",
    "Log aggregation",
  ],
};

export default {
  securityHeaders,
  performanceConfig,
  errorConfig,
  a11yConfig,
  mobileConfig,
  devConfig,
  getEnvironmentConfig,
  productionChecklist,
};
