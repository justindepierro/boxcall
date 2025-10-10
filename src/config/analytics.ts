/**
 * Analytics Configuration and Environment Variables
 *
 * Centralized configuration for analytics and error tracking services
 */

// Environment variable validation and defaults
export const analyticsConfig = {
  // Google Analytics 4
  googleAnalytics: {
    measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || "",
    enabled: Boolean(import.meta.env.VITE_GA_MEASUREMENT_ID),
    debugMode: import.meta.env.VITE_GA_DEBUG === "true",
  },

  // PostHog
  posthog: {
    apiKey: import.meta.env.VITE_POSTHOG_API_KEY || "",
    apiHost: import.meta.env.VITE_POSTHOG_API_HOST || "https://app.posthog.com",
    enabled: Boolean(import.meta.env.VITE_POSTHOG_API_KEY),
    debugMode: import.meta.env.VITE_POSTHOG_DEBUG === "true",
  },

  // Sentry Error Tracking
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN || "",
    enabled:
      Boolean(import.meta.env.VITE_SENTRY_DSN) ||
      import.meta.env.VITE_ENABLE_SENTRY === "true",
    environment:
      import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE || "development",
    tracesSampleRate:
      Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE) ||
      (import.meta.env.PROD ? 0.1 : 1.0),
    replaysSessionSampleRate:
      Number(import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE) || 0.1,
    replaysOnErrorSampleRate:
      Number(import.meta.env.VITE_SENTRY_REPLAYS_ERROR_SAMPLE_RATE) || 1.0,
  },

  // Custom Analytics
  custom: {
    endpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT || "",
    apiKey: import.meta.env.VITE_ANALYTICS_API_KEY || "",
    enabled: Boolean(import.meta.env.VITE_ANALYTICS_ENDPOINT),
  },

  // General settings
  general: {
    enableInDevelopment: import.meta.env.VITE_ANALYTICS_DEV === "true",
    enableDebugMode:
      import.meta.env.VITE_ANALYTICS_DEBUG === "true" || import.meta.env.DEV,
    batchSize: Number(import.meta.env.VITE_ANALYTICS_BATCH_SIZE) || 10,
    flushInterval:
      Number(import.meta.env.VITE_ANALYTICS_FLUSH_INTERVAL) || 5000,
  },
};

// Validation function to check configuration
export function validateAnalyticsConfig(): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check if we're in production without any analytics configured
  if (import.meta.env.PROD) {
    const hasAnyProvider =
      analyticsConfig.googleAnalytics.enabled ||
      analyticsConfig.posthog.enabled ||
      analyticsConfig.custom.enabled;

    if (!hasAnyProvider) {
      warnings.push("No analytics providers configured for production");
    }

    // Check Sentry configuration for production
    if (!analyticsConfig.sentry.enabled) {
      warnings.push("Error tracking (Sentry) not configured for production");
    }
  }

  // Validate Google Analytics configuration
  if (analyticsConfig.googleAnalytics.enabled) {
    if (!analyticsConfig.googleAnalytics.measurementId.startsWith("G-")) {
      errors.push(
        "Invalid Google Analytics Measurement ID format (should start with G-)"
      );
    }
  }

  // Validate PostHog configuration
  if (analyticsConfig.posthog.enabled) {
    if (!analyticsConfig.posthog.apiHost.startsWith("http")) {
      errors.push(
        "Invalid PostHog API host (should be a valid HTTP/HTTPS URL)"
      );
    }
  }

  // Validate Sentry configuration
  if (analyticsConfig.sentry.enabled && analyticsConfig.sentry.dsn) {
    if (!analyticsConfig.sentry.dsn.startsWith("https://")) {
      errors.push("Invalid Sentry DSN format");
    }
  }

  // Validate custom analytics configuration
  if (analyticsConfig.custom.enabled) {
    if (!analyticsConfig.custom.endpoint.startsWith("http")) {
      errors.push(
        "Invalid custom analytics endpoint (should be a valid HTTP/HTTPS URL)"
      );
    }
    if (!analyticsConfig.custom.apiKey) {
      warnings.push("Custom analytics API key not provided");
    }
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}

// Helper function to get environment-specific settings
export function getEnvironmentConfig() {
  const environment = analyticsConfig.sentry.environment;

  return {
    environment,
    isDevelopment: environment === "development",
    isProduction: environment === "production",
    isStaging: environment === "staging",
    enabledProviders: [
      analyticsConfig.googleAnalytics.enabled && "Google Analytics",
      analyticsConfig.posthog.enabled && "PostHog",
      analyticsConfig.sentry.enabled && "Sentry",
      analyticsConfig.custom.enabled && "Custom Analytics",
    ].filter(Boolean) as string[],
  };
}

// Development helper to log configuration
export function logAnalyticsConfig() {
  if (!import.meta.env.DEV && !analyticsConfig.general.enableDebugMode) return;

  const config = getEnvironmentConfig();
  const validation = validateAnalyticsConfig();

  console.group("📊 Analytics Configuration");
  console.log("Environment:", config.environment);
  console.log("Enabled Providers:", config.enabledProviders);

  if (validation.warnings.length > 0) {
    console.group("⚠️ Warnings");
    validation.warnings.forEach((warning) => console.warn(warning));
    console.groupEnd();
  }

  if (validation.errors.length > 0) {
    console.group("❌ Errors");
    validation.errors.forEach((error) => console.error(error));
    console.groupEnd();
  }

  if (analyticsConfig.general.enableDebugMode) {
    console.group("🔧 Debug Configuration");
    console.log("Google Analytics:", {
      enabled: analyticsConfig.googleAnalytics.enabled,
      measurementId: analyticsConfig.googleAnalytics.measurementId
        ? "***configured***"
        : "not set",
      debugMode: analyticsConfig.googleAnalytics.debugMode,
    });
    console.log("PostHog:", {
      enabled: analyticsConfig.posthog.enabled,
      apiKey: analyticsConfig.posthog.apiKey ? "***configured***" : "not set",
      apiHost: analyticsConfig.posthog.apiHost,
      debugMode: analyticsConfig.posthog.debugMode,
    });
    console.log("Sentry:", {
      enabled: analyticsConfig.sentry.enabled,
      dsn: analyticsConfig.sentry.dsn ? "***configured***" : "not set",
      environment: analyticsConfig.sentry.environment,
      tracesSampleRate: analyticsConfig.sentry.tracesSampleRate,
    });
    console.log("Custom Analytics:", {
      enabled: analyticsConfig.custom.enabled,
      endpoint: analyticsConfig.custom.endpoint || "not set",
      apiKey: analyticsConfig.custom.apiKey ? "***configured***" : "not set",
    });
    console.groupEnd();
  }

  console.groupEnd();
}

// Export configuration as default
export default analyticsConfig;
