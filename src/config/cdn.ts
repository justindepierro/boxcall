/**
 * CDN and Asset Optimization Configuration
 * 
 * Centralized configuration for CDN, image optimization, and asset caching
 */

// CDN Configuration
export const cdnConfig = {
  // CDN Base URL
  baseUrl: import.meta.env.VITE_CDN_URL || '',
  
  // Image Optimization Settings
  imageOptimization: {
    enabled: import.meta.env.VITE_ENABLE_IMAGE_OPTIMIZATION === 'true',
    defaultQuality: Number(import.meta.env.VITE_IMAGE_QUALITY) || 85,
    formats: {
      webp: import.meta.env.VITE_ENABLE_WEBP !== 'false',
      avif: import.meta.env.VITE_ENABLE_AVIF === 'true',
    },
    responsiveSizes: [640, 768, 1024, 1280, 1536],
    placeholderQuality: 20,
  },

  // Cache Control Headers
  cacheControl: {
    images: import.meta.env.VITE_IMAGE_CACHE_CONTROL || 'public, max-age=31536000, immutable',
    scripts: import.meta.env.VITE_SCRIPT_CACHE_CONTROL || 'public, max-age=31536000, immutable',
    styles: import.meta.env.VITE_STYLE_CACHE_CONTROL || 'public, max-age=31536000, immutable',
    fonts: import.meta.env.VITE_FONT_CACHE_CONTROL || 'public, max-age=31536000, immutable',
  },

  // Preloading Configuration
  preload: {
    criticalImages: import.meta.env.VITE_PRELOAD_CRITICAL_IMAGES !== 'false',
    maxConcurrentPreloads: Number(import.meta.env.VITE_MAX_CONCURRENT_PRELOADS) || 3,
    prefetchOnIdle: import.meta.env.VITE_PREFETCH_ON_IDLE !== 'false',
    routePreloading: import.meta.env.VITE_ROUTE_PRELOADING !== 'false',
  },

  // Performance Thresholds
  performance: {
    maxImageSize: Number(import.meta.env.VITE_MAX_IMAGE_SIZE) || 2 * 1024 * 1024, // 2MB
    lazyLoadingThreshold: Number(import.meta.env.VITE_LAZY_LOADING_THRESHOLD) || 0.1,
    lazyLoadingRootMargin: import.meta.env.VITE_LAZY_LOADING_ROOT_MARGIN || '50px',
    criticalImageTimeout: Number(import.meta.env.VITE_CRITICAL_IMAGE_TIMEOUT) || 3000,
  },

  // Development Settings
  development: {
    enableOptimization: import.meta.env.VITE_DEV_ENABLE_OPTIMIZATION === 'true',
    mockCDN: import.meta.env.VITE_DEV_MOCK_CDN === 'true',
    showPerformanceMetrics: import.meta.env.VITE_DEV_SHOW_PERFORMANCE === 'true',
  },
};

// Asset Categories and Priorities
export const assetCategories = {
  critical: {
    // Assets needed for initial render
    images: ['logo', 'hero', 'above-fold'],
    scripts: ['polyfills', 'critical-js'],
    styles: ['critical-css', 'base-styles'],
  },
  important: {
    // Assets needed for primary functionality
    images: ['avatars', 'icons', 'navigation'],
    scripts: ['main-bundle', 'vendor'],
    styles: ['component-styles', 'theme'],
  },
  prefetch: {
    // Assets for likely next interactions
    images: ['thumbnails', 'previews', 'backgrounds'],
    scripts: ['route-chunks', 'analytics'],
    styles: ['route-styles', 'print-styles'],
  },
  lazy: {
    // Assets loaded on demand
    images: ['full-size', 'galleries', 'modal-content'],
    scripts: ['widgets', 'third-party'],
    styles: ['animations', 'effects'],
  },
};

// Route-specific asset manifest
export const routeAssets = {
  dashboard: {
    critical: {
      images: ['/assets/dashboard-bg.webp', '/assets/logo.svg'],
      scripts: [],
      styles: ['/assets/dashboard.css'],
    },
    prefetch: {
      images: ['/assets/chart-icons/*.svg'],
      scripts: ['/assets/charts.js'],
      styles: [],
    },
  },
  playbook: {
    critical: {
      images: ['/assets/field-bg.webp', '/assets/formation-icons/*.svg'],
      scripts: ['/assets/drawing-engine.js'],
      styles: ['/assets/playbook.css'],
    },
    prefetch: {
      images: ['/assets/player-photos/*.webp'],
      scripts: ['/assets/animation.js'],
      styles: ['/assets/animations.css'],
    },
  },
  roster: {
    critical: {
      images: ['/assets/default-avatar.webp'],
      scripts: [],
      styles: ['/assets/roster.css'],
    },
    prefetch: {
      images: ['/assets/player-photos/*.webp'],
      scripts: ['/assets/roster-management.js'],
      styles: [],
    },
  },
  games: {
    critical: {
      images: ['/assets/field-overview.webp'],
      scripts: [],
      styles: ['/assets/games.css'],
    },
    prefetch: {
      images: ['/assets/opponent-logos/*.webp'],
      scripts: ['/assets/game-stats.js'],
      styles: ['/assets/statistics.css'],
    },
  },
  settings: {
    critical: {
      images: [],
      scripts: [],
      styles: ['/assets/settings.css'],
    },
    prefetch: {
      images: [],
      scripts: ['/assets/preferences.js'],
      styles: ['/assets/forms.css'],
    },
  },
};

// Image optimization presets
export const imagePresets = {
  thumbnail: {
    width: 150,
    height: 150,
    quality: 80,
    format: 'webp' as const,
    fit: 'cover' as const,
  },
  avatar: {
    width: 100,
    height: 100,
    quality: 90,
    format: 'webp' as const,
    fit: 'cover' as const,
  },
  'avatar-small': {
    width: 40,
    height: 40,
    quality: 85,
    format: 'webp' as const,
    fit: 'cover' as const,
  },
  hero: {
    width: 1920,
    height: 1080,
    quality: 85,
    format: 'webp' as const,
    fit: 'cover' as const,
  },
  'hero-mobile': {
    width: 768,
    height: 432,
    quality: 80,
    format: 'webp' as const,
    fit: 'cover' as const,
  },
  card: {
    width: 400,
    height: 300,
    quality: 80,
    format: 'webp' as const,
    fit: 'cover' as const,
  },
  banner: {
    width: 1200,
    height: 300,
    quality: 85,
    format: 'webp' as const,
    fit: 'cover' as const,
  },
  icon: {
    width: 64,
    height: 64,
    quality: 95,
    format: 'webp' as const,
    fit: 'contain' as const,
  },
};

// Performance budgets
export const performanceBudgets = {
  // Total size limits per page type
  totalSize: {
    critical: 500 * 1024, // 500KB for critical resources
    important: 1 * 1024 * 1024, // 1MB for important resources
    total: 3 * 1024 * 1024, // 3MB total per page
  },
  
  // Individual asset size limits
  assetSize: {
    image: 500 * 1024, // 500KB per image
    script: 300 * 1024, // 300KB per script
    style: 100 * 1024, // 100KB per stylesheet
    font: 200 * 1024, // 200KB per font
  },
  
  // Performance timing targets
  timing: {
    firstContentfulPaint: 1500, // 1.5s
    largestContentfulPaint: 2500, // 2.5s
    firstInputDelay: 100, // 100ms
    cumulativeLayoutShift: 0.1, // 0.1 CLS score
  },
};

// Validation function
export function validateCDNConfig() {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check CDN configuration
  if (!cdnConfig.baseUrl && import.meta.env.PROD) {
    warnings.push('CDN URL not configured for production');
  }

  // Check image optimization
  if (!cdnConfig.imageOptimization.enabled && import.meta.env.PROD) {
    warnings.push('Image optimization disabled in production');
  }

  // Check cache control
  if (!cdnConfig.cacheControl.images.includes('max-age') && import.meta.env.PROD) {
    warnings.push('Image cache control headers may not be optimal');
  }

  // Check performance budgets
  const totalBudget = performanceBudgets.totalSize.total;
  if (totalBudget > 5 * 1024 * 1024) {
    warnings.push('Total page size budget exceeds 5MB');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}

// Development helper
export function logCDNConfig() {
  if (!import.meta.env.DEV && !cdnConfig.development.showPerformanceMetrics) return;

  const validation = validateCDNConfig();
  
  console.group('🚀 CDN & Asset Configuration');
  console.log('Base URL:', cdnConfig.baseUrl || 'Not configured');
  console.log('Image Optimization:', cdnConfig.imageOptimization.enabled ? 'Enabled' : 'Disabled');
  console.log('WebP Support:', cdnConfig.imageOptimization.formats.webp ? 'Enabled' : 'Disabled');
  console.log('Route Preloading:', cdnConfig.preload.routePreloading ? 'Enabled' : 'Disabled');
  
  if (validation.warnings.length > 0) {
    console.group('⚠️ Warnings');
    validation.warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }

  if (validation.errors.length > 0) {
    console.group('❌ Errors');
    validation.errors.forEach(error => console.error(error));
    console.groupEnd();
  }

  console.groupEnd();
}

export default cdnConfig;