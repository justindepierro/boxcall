/**
 * Analytics Service
 *
 * Unified analytics interface supporting multiple providers:
 * - Google Analytics 4
 * - Posthog (for product analytics)
 * - Custom performance tracking
 * - Sentry (for error tracking)
 */

import { debug, warn } from "../../utils/logger";

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  category?: string;
  value?: number;
}

interface UserProperties {
  userId?: string;
  email?: string;
  role?: string;
  team?: string;
  subscription?: string;
  [key: string]: any;
}

interface AnalyticsProvider {
  initialize(): Promise<void>;
  track(event: AnalyticsEvent): Promise<void>;
  identify(userId: string, properties: UserProperties): Promise<void>;
  page(path: string, properties?: Record<string, any>): Promise<void>;
  flush?(): Promise<void>;
}

class GoogleAnalyticsProvider implements AnalyticsProvider {
  private measurementId: string;
  private initialized = false;

  constructor(measurementId: string) {
    this.measurementId = measurementId;
  }

  async initialize(): Promise<void> {
    if (this.initialized || !this.measurementId) return;

    // Load Google Analytics
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag("js", new Date());
    window.gtag("config", this.measurementId, {
      send_page_view: false, // We'll handle page views manually
      anonymize_ip: true,
      cookie_flags: "SameSite=Strict;Secure",
    });

    this.initialized = true;
    debug("📊 Google Analytics initialized");
  }

  async track(event: AnalyticsEvent): Promise<void> {
    if (!this.initialized || !window.gtag) return;

    window.gtag("event", event.name, {
      event_category: event.category || "general",
      event_label: event.properties?.label,
      value: event.value,
      custom_parameters: event.properties,
    });
  }

  async identify(userId: string, properties: UserProperties): Promise<void> {
    if (!this.initialized || !window.gtag) return;

    window.gtag("config", this.measurementId, {
      user_id: userId,
      custom_map: properties,
    });
  }

  async page(path: string, properties?: Record<string, any>): Promise<void> {
    if (!this.initialized || !window.gtag) return;

    window.gtag("config", this.measurementId, {
      page_path: path,
      page_title: properties?.title || document.title,
    });
  }
}

class PosthogProvider implements AnalyticsProvider {
  private apiKey: string;
  private initialized = false;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async initialize(): Promise<void> {
    if (this.initialized || !this.apiKey) return;

    // Load PostHog via external script to avoid requiring CSP 'unsafe-inline'.
    // PostHog exposes a global `window.posthog` when loaded.
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-boxcall="posthog"]'
    );

    const finalizeInit = () => {
      const posthog = (window as any).posthog;
      if (!posthog?.init) return;
      posthog.init(this.apiKey, {
        api_host: "https://app.posthog.com",
        loaded: () => {
          this.initialized = true;
          debug("📊 PostHog initialized");
        },
      });
    };

    if (existing) {
      existing.addEventListener("load", finalizeInit, { once: true });
      finalizeInit();
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.dataset.boxcall = "posthog";
    script.src = "https://app.posthog.com/static/array.js";
    script.addEventListener("load", finalizeInit, { once: true });
    script.addEventListener(
      "error",
      () => {
        debug("📊 PostHog failed to load");
      },
      { once: true }
    );
    document.head.appendChild(script);
  }

  async track(event: AnalyticsEvent): Promise<void> {
    if (!this.initialized || !window.posthog) return;

    window.posthog.capture(event.name, event.properties);
  }

  async identify(userId: string, properties: UserProperties): Promise<void> {
    if (!this.initialized || !window.posthog) return;

    window.posthog.identify(userId, properties);
  }

  async page(path: string, properties?: Record<string, any>): Promise<void> {
    if (!this.initialized || !window.posthog) return;

    window.posthog.capture("$pageview", {
      $current_url: path,
      ...properties,
    });
  }
}

class CustomAnalyticsProvider implements AnalyticsProvider {
  private events: AnalyticsEvent[] = [];
  private user: UserProperties | null = null;

  async initialize(): Promise<void> {
    debug("📊 Custom Analytics initialized");
  }

  async track(event: AnalyticsEvent): Promise<void> {
    this.events.push({
      ...event,
      timestamp: Date.now(),
      user: this.user,
    } as any);

    // Send to custom endpoint (if configured)
    const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
    if (endpoint) {
      try {
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event, user: this.user }),
        });
      } catch (error) {
        warn("Failed to send custom analytics", error);
      }
    }
  }

  async identify(userId: string, properties: UserProperties): Promise<void> {
    this.user = { userId, ...properties };
  }

  async page(path: string, properties?: Record<string, any>): Promise<void> {
    await this.track({
      name: "page_view",
      properties: { path, ...properties },
    });
  }

  getEvents(): AnalyticsEvent[] {
    return this.events;
  }
}

export class AnalyticsService {
  private providers: AnalyticsProvider[] = [];
  private initialized = false;

  constructor() {
    this.setupProviders();
  }

  private setupProviders() {
    // Google Analytics
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId) {
      this.providers.push(new GoogleAnalyticsProvider(gaId));
    }

    // PostHog
    const posthogKey = import.meta.env.VITE_POSTHOG_API_KEY;
    if (posthogKey) {
      this.providers.push(new PosthogProvider(posthogKey));
    }

    // Custom analytics (always enabled)
    this.providers.push(new CustomAnalyticsProvider());
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Only initialize in production or when explicitly enabled
    if (
      !import.meta.env.PROD &&
      import.meta.env.VITE_ENABLE_ANALYTICS !== "true"
    ) {
      debug("📊 Analytics disabled in development");
      return;
    }

    await Promise.all(
      this.providers.map((provider) =>
        provider
          .initialize()
          .catch((error) =>
            warn("Analytics provider failed to initialize", error)
          )
      )
    );

    this.initialized = true;
    debug(`📊 Analytics initialized with ${this.providers.length} providers`);
  }

  async track(event: AnalyticsEvent): Promise<void> {
    if (!this.initialized) await this.initialize();

    await Promise.all(
      this.providers.map((provider) =>
        provider
          .track(event)
          .catch((error) => warn("Analytics tracking failed", error))
      )
    );
  }

  async identify(
    userId: string,
    properties: UserProperties = {}
  ): Promise<void> {
    if (!this.initialized) await this.initialize();

    await Promise.all(
      this.providers.map((provider) =>
        provider
          .identify(userId, properties)
          .catch((error) => warn("Analytics identify failed:", error))
      )
    );
  }

  async page(path: string, properties?: Record<string, any>): Promise<void> {
    if (!this.initialized) await this.initialize();

    await Promise.all(
      this.providers.map((provider) =>
        provider
          .page(path, properties)
          .catch((error) => warn("Analytics page tracking failed:", error))
      )
    );
  }

  // Convenience methods for common events
  async trackUserAction(action: string, properties?: Record<string, any>) {
    await this.track({
      name: "user_action",
      category: "engagement",
      properties: { action, ...properties },
    });
  }

  async trackFeatureUsage(feature: string, properties?: Record<string, any>) {
    await this.track({
      name: "feature_used",
      category: "product",
      properties: { feature, ...properties },
    });
  }

  async trackPerformance(
    metric: string,
    value: number,
    properties?: Record<string, any>
  ) {
    await this.track({
      name: "performance_metric",
      category: "performance",
      value,
      properties: { metric, ...properties },
    });
  }

  // Method aliases for common use cases
  async trackEvent(eventName: string, properties?: Record<string, any>) {
    await this.track({
      name: eventName,
      properties,
    });
  }

  async trackPageView(path: string, properties?: Record<string, any>) {
    await this.page(path, properties);
  }

  async identifyUser(userId: string, properties?: UserProperties) {
    await this.identify(userId, properties);
  }

  async setUserProperties(properties: UserProperties) {
    // For now, we'll use identify with the current user
    // In a full implementation, you'd track the current user ID
    debug("Setting user properties:", properties);
  }

  async reset() {
    // Reset analytics tracking (useful for logout)
    debug("📊 Analytics reset");

    // Reset PostHog if available
    if (window.posthog) {
      window.posthog.reset();
    }

    // For Google Analytics, we can't truly reset but we can clear user data
    if (window.gtag) {
      window.gtag("config", import.meta.env.VITE_GA_MEASUREMENT_ID, {
        user_id: null,
      });
    }
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();

// Type declarations for global objects
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    posthog: any;
  }
}
