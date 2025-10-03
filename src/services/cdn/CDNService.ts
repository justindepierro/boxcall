/**
 * CDN and Asset Optimization Service
 * 
 * Handles CDN integration, image optimization, lazy loading, and asset caching
 */

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  background?: string;
}

interface CDNConfig {
  baseUrl: string;
  imageOptimization: boolean;
  cacheControl: string;
  regions?: string[];
}

export class CDNService {
  private config: CDNConfig;
  private imageCache = new Map<string, string>();
  private loadedAssets = new Set<string>();

  constructor(config?: Partial<CDNConfig>) {
    this.config = {
      baseUrl: import.meta.env.VITE_CDN_URL || '',
      imageOptimization: import.meta.env.VITE_ENABLE_IMAGE_OPTIMIZATION === 'true',
      cacheControl: 'public, max-age=31536000, immutable',
      ...config
    };
  }

  /**
   * Generate optimized image URL with CDN support
   */
  getOptimizedImageUrl(src: string, options?: ImageOptimizationOptions): string {
    // If no CDN configured, return original source
    if (!this.config.baseUrl) {
      return src;
    }

    // Create cache key
    const cacheKey = `${src}${JSON.stringify(options || {})}`;
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }

    let optimizedUrl = this.config.baseUrl + src;

    // Add optimization parameters if enabled
    if (this.config.imageOptimization && options) {
      const params = new URLSearchParams();
      
      if (options.width) params.set('w', options.width.toString());
      if (options.height) params.set('h', options.height.toString());
      if (options.quality) params.set('q', options.quality.toString());
      if (options.format) params.set('f', options.format);
      if (options.fit) params.set('fit', options.fit);
      if (options.background) params.set('bg', options.background);

      if (params.toString()) {
        optimizedUrl += `?${params.toString()}`;
      }
    }

    this.imageCache.set(cacheKey, optimizedUrl);
    return optimizedUrl;
  }

  /**
   * Preload critical assets
   */
  preloadAsset(src: string, type: 'image' | 'script' | 'style' | 'font' = 'image'): Promise<void> {
    return new Promise((resolve, reject) => {
      const assetUrl = this.config.baseUrl ? this.config.baseUrl + src : src;
      
      if (this.loadedAssets.has(assetUrl)) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = assetUrl;
      
      switch (type) {
        case 'image':
          link.as = 'image';
          break;
        case 'script':
          link.as = 'script';
          break;
        case 'style':
          link.as = 'style';
          break;
        case 'font':
          link.as = 'font';
          link.crossOrigin = 'anonymous';
          break;
      }

      link.onload = () => {
        this.loadedAssets.add(assetUrl);
        resolve();
      };
      link.onerror = reject;

      document.head.appendChild(link);
    });
  }

  /**
   * Prefetch non-critical assets
   */
  prefetchAsset(src: string): void {
    const assetUrl = this.config.baseUrl ? this.config.baseUrl + src : src;
    
    if (this.loadedAssets.has(assetUrl)) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = assetUrl;
    document.head.appendChild(link);
  }

  /**
   * Get responsive image srcset
   */
  getResponsiveImageSrcSet(src: string, sizes: number[], options?: Omit<ImageOptimizationOptions, 'width'>): string {
    return sizes
      .map(size => {
        const url = this.getOptimizedImageUrl(src, { ...options, width: size });
        return `${url} ${size}w`;
      })
      .join(', ');
  }

  /**
   * Generate WebP fallback sources
   */
  getWebPFallback(src: string, options?: ImageOptimizationOptions) {
    const webpUrl = this.getOptimizedImageUrl(src, { ...options, format: 'webp' });
    const fallbackUrl = this.getOptimizedImageUrl(src, options);
    
    return {
      webp: webpUrl,
      fallback: fallbackUrl
    };
  }

  /**
   * Clear asset cache
   */
  clearCache(): void {
    this.imageCache.clear();
    this.loadedAssets.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      imagesCached: this.imageCache.size,
      assetsLoaded: this.loadedAssets.size,
      cacheHitRate: this.imageCache.size > 0 ? (this.loadedAssets.size / this.imageCache.size) : 0
    };
  }
}

// Singleton instance
export const cdnService = new CDNService();

// Asset loading utilities
export class AssetLoader {
  private static loadingPromises = new Map<string, Promise<any>>();

  /**
   * Load script dynamically
   */
  static loadScript(src: string, attributes?: Record<string, string>): Promise<void> {
    const fullSrc = cdnService.getOptimizedImageUrl(src);
    
    if (this.loadingPromises.has(fullSrc)) {
      return this.loadingPromises.get(fullSrc)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = fullSrc;
      script.async = true;
      
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          script.setAttribute(key, value);
        });
      }

      script.onload = () => resolve();
      script.onerror = reject;
      
      document.head.appendChild(script);
    });

    this.loadingPromises.set(fullSrc, promise);
    return promise;
  }

  /**
   * Load CSS dynamically
   */
  static loadStylesheet(href: string, attributes?: Record<string, string>): Promise<void> {
    const fullHref = cdnService.getOptimizedImageUrl(href);
    
    if (this.loadingPromises.has(fullHref)) {
      return this.loadingPromises.get(fullHref)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fullHref;
      
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          link.setAttribute(key, value);
        });
      }

      link.onload = () => resolve();
      link.onerror = reject;
      
      document.head.appendChild(link);
    });

    this.loadingPromises.set(fullHref, promise);
    return promise;
  }

  /**
   * Preload critical assets for a route
   */
  static async preloadRouteAssets(routeName: string): Promise<void> {
    const routeAssets = getRouteAssets(routeName);
    
    await Promise.all([
      // Preload critical images
      ...routeAssets.images.critical.map(src => 
        cdnService.preloadAsset(src, 'image')
      ),
      // Preload critical scripts
      ...routeAssets.scripts.critical.map(src => 
        this.loadScript(src)
      ),
      // Preload critical styles
      ...routeAssets.styles.critical.map(href => 
        this.loadStylesheet(href)
      )
    ]);

    // Prefetch non-critical assets
    routeAssets.images.prefetch.forEach(src => 
      cdnService.prefetchAsset(src)
    );
  }
}

// Route-specific asset definitions
function getRouteAssets(routeName: string) {
  const assetManifest: Record<string, {
    images: { critical: string[]; prefetch: string[] };
    scripts: { critical: string[]; prefetch: string[] };
    styles: { critical: string[]; prefetch: string[] };
  }> = {
    dashboard: {
      images: {
        critical: ['/assets/dashboard-bg.webp', '/assets/logo.svg'],
        prefetch: ['/assets/charts-bg.webp']
      },
      scripts: {
        critical: [],
        prefetch: ['/assets/charts.js']
      },
      styles: {
        critical: ['/assets/dashboard.css'],
        prefetch: []
      }
    },
    playbook: {
      images: {
        critical: ['/assets/field-bg.webp'],
        prefetch: ['/assets/formations/*.webp']
      },
      scripts: {
        critical: ['/assets/drawing.js'],
        prefetch: []
      },
      styles: {
        critical: ['/assets/playbook.css'],
        prefetch: []
      }
    },
    roster: {
      images: {
        critical: ['/assets/default-avatar.webp'],
        prefetch: []
      },
      scripts: {
        critical: [],
        prefetch: []
      },
      styles: {
        critical: ['/assets/roster.css'],
        prefetch: []
      }
    }
  };

  return assetManifest[routeName] || {
    images: { critical: [], prefetch: [] },
    scripts: { critical: [], prefetch: [] },
    styles: { critical: [], prefetch: [] }
  };
}