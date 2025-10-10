/**
 * Database Configuration
 *
 * Centralized configuration for database optimization features
 * including caching, performance monitoring, and connection settings
 */

interface DatabaseConfig {
  // Cache Configuration
  cache: {
    defaultTTL: number;
    maxSize: number;
    enableQueryCache: boolean;
    enableServiceCache: boolean;
    cleanupInterval: number;
  };

  // Performance Configuration
  performance: {
    slowQueryThreshold: number;
    enableMetrics: boolean;
    enableQueryLogging: boolean;
    metricsRetention: number;
    performanceMonitoringInterval: number;
  };

  // Connection Configuration
  connection: {
    poolSize: number;
    maxRetries: number;
    retryDelay: number;
    timeout: number;
  };

  // Optimization Configuration
  optimization: {
    enableBatching: boolean;
    defaultBatchSize: number;
    enableQueryOptimization: boolean;
    enableConnectionPooling: boolean;
  };

  // Development Configuration
  development: {
    enableDebugMode: boolean;
    logLevel: "debug" | "info" | "warn" | "error";
    enableQueryExplain: boolean;
    enablePerformanceTracing: boolean;
  };
}

/**
 * Parse environment variable as number with fallback
 */
function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Parse environment variable as boolean with fallback
 */
function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

/**
 * Get database configuration from environment variables
 */
export const databaseConfig: DatabaseConfig = {
  cache: {
    defaultTTL: parseNumber(import.meta.env.VITE_DB_CACHE_TTL, 300000), // 5 minutes
    maxSize: parseNumber(import.meta.env.VITE_DB_MAX_CACHE_SIZE, 1000),
    enableQueryCache: parseBoolean(
      import.meta.env.VITE_DB_ENABLE_QUERY_CACHE,
      true
    ),
    enableServiceCache: parseBoolean(
      import.meta.env.VITE_DB_ENABLE_SERVICE_CACHE,
      true
    ),
    cleanupInterval: parseNumber(
      import.meta.env.VITE_DB_CACHE_CLEANUP_INTERVAL,
      60000
    ), // 1 minute
  },

  performance: {
    slowQueryThreshold: parseNumber(
      import.meta.env.VITE_SLOW_QUERY_THRESHOLD,
      1000
    ), // 1 second
    enableMetrics: parseBoolean(import.meta.env.VITE_DB_ENABLE_METRICS, true),
    enableQueryLogging: parseBoolean(
      import.meta.env.VITE_DB_ENABLE_QUERY_LOGGING,
      import.meta.env.DEV
    ),
    metricsRetention: parseNumber(
      import.meta.env.VITE_DB_METRICS_RETENTION,
      1000
    ), // Keep last 1000 metrics
    performanceMonitoringInterval: parseNumber(
      import.meta.env.VITE_DB_PERF_MONITOR_INTERVAL,
      5000
    ), // 5 seconds
  },

  connection: {
    poolSize: parseNumber(import.meta.env.VITE_DB_CONNECTION_POOL_SIZE, 5),
    maxRetries: parseNumber(import.meta.env.VITE_DB_MAX_RETRIES, 3),
    retryDelay: parseNumber(import.meta.env.VITE_DB_RETRY_DELAY, 1000), // 1 second
    timeout: parseNumber(import.meta.env.VITE_DB_TIMEOUT, 30000), // 30 seconds
  },

  optimization: {
    enableBatching: parseBoolean(import.meta.env.VITE_DB_ENABLE_BATCHING, true),
    defaultBatchSize: parseNumber(
      import.meta.env.VITE_DB_DEFAULT_BATCH_SIZE,
      100
    ),
    enableQueryOptimization: parseBoolean(
      import.meta.env.VITE_DB_ENABLE_OPTIMIZATION,
      true
    ),
    enableConnectionPooling: parseBoolean(
      import.meta.env.VITE_DB_ENABLE_CONNECTION_POOLING,
      true
    ),
  },

  development: {
    enableDebugMode: parseBoolean(
      import.meta.env.VITE_DB_DEBUG_MODE,
      import.meta.env.DEV
    ),
    logLevel:
      (import.meta.env.VITE_DB_LOG_LEVEL as
        | "debug"
        | "info"
        | "warn"
        | "error") || "info",
    enableQueryExplain: parseBoolean(
      import.meta.env.VITE_DB_ENABLE_QUERY_EXPLAIN,
      false
    ),
    enablePerformanceTracing: parseBoolean(
      import.meta.env.VITE_DB_ENABLE_PERF_TRACING,
      import.meta.env.DEV
    ),
  },
};

/**
 * Validate database configuration
 */
export function validateDatabaseConfig(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate cache configuration
  if (databaseConfig.cache.defaultTTL < 0) {
    errors.push("Cache TTL must be non-negative");
  }

  if (databaseConfig.cache.maxSize < 1) {
    errors.push("Cache max size must be at least 1");
  }

  if (databaseConfig.cache.cleanupInterval < 1000) {
    errors.push("Cache cleanup interval must be at least 1000ms");
  }

  // Validate performance configuration
  if (databaseConfig.performance.slowQueryThreshold < 0) {
    errors.push("Slow query threshold must be non-negative");
  }

  if (databaseConfig.performance.metricsRetention < 1) {
    errors.push("Metrics retention must be at least 1");
  }

  if (databaseConfig.performance.performanceMonitoringInterval < 1000) {
    errors.push("Performance monitoring interval must be at least 1000ms");
  }

  // Validate connection configuration
  if (databaseConfig.connection.poolSize < 1) {
    errors.push("Connection pool size must be at least 1");
  }

  if (databaseConfig.connection.maxRetries < 0) {
    errors.push("Max retries must be non-negative");
  }

  if (databaseConfig.connection.retryDelay < 0) {
    errors.push("Retry delay must be non-negative");
  }

  if (databaseConfig.connection.timeout < 1000) {
    errors.push("Connection timeout must be at least 1000ms");
  }

  // Validate optimization configuration
  if (databaseConfig.optimization.defaultBatchSize < 1) {
    errors.push("Default batch size must be at least 1");
  }

  // Validate development configuration
  const validLogLevels = ["debug", "info", "warn", "error"];
  if (!validLogLevels.includes(databaseConfig.development.logLevel)) {
    errors.push(`Log level must be one of: ${validLogLevels.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get configuration summary for debugging
 */
export function getDatabaseConfigSummary(): Record<string, any> {
  return {
    cache: {
      enabled:
        databaseConfig.cache.enableQueryCache ||
        databaseConfig.cache.enableServiceCache,
      ttl: `${databaseConfig.cache.defaultTTL / 1000}s`,
      maxSize: databaseConfig.cache.maxSize,
    },
    performance: {
      monitoring: databaseConfig.performance.enableMetrics,
      slowQueryThreshold: `${databaseConfig.performance.slowQueryThreshold}ms`,
      logging: databaseConfig.performance.enableQueryLogging,
    },
    optimization: {
      enabled: databaseConfig.optimization.enableQueryOptimization,
      batching: databaseConfig.optimization.enableBatching,
      batchSize: databaseConfig.optimization.defaultBatchSize,
    },
    development: {
      debug: databaseConfig.development.enableDebugMode,
      logLevel: databaseConfig.development.logLevel,
      tracing: databaseConfig.development.enablePerformanceTracing,
    },
  };
}

/**
 * Initialize database configuration with validation
 */
export function initializeDatabaseConfig(): void {
  const validation = validateDatabaseConfig();

  if (!validation.isValid) {
    console.error("❌ Database configuration validation failed:");
    validation.errors.forEach((error) => console.error(`  - ${error}`));
    throw new Error("Invalid database configuration");
  }

  if (databaseConfig.development.enableDebugMode) {
    console.log("🔧 Database Configuration Summary:");
    console.table(getDatabaseConfigSummary());
  }

  console.log("✅ Database configuration initialized successfully");
}

// Export the configuration object and utility functions
export default databaseConfig;

// Type exports for external use
export type { DatabaseConfig };
