/**
 * Bullet-Proof Database Service
 *
 * Integrates connectivity, error handling, and health monitoring
 * for a resilient database layer with automatic recovery
 */

import { dbConnectivity } from './DatabaseConnectivityService';
import { databaseErrorHandler } from './DatabaseErrorHandler';
import type { DatabaseError } from './DatabaseErrorHandler';
import { databaseHealthMonitor } from './DatabaseHealthMonitor';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database';

interface DatabaseOperation<T = any> {
  id: string;
  operation: () => Promise<T>;
  description: string;
  critical?: boolean;
  timeout?: number;
}

interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: DatabaseError;
  metrics: {
    duration: number;
    retries: number;
    circuitBreakerState: string;
  };
}

export class BulletProofDatabaseService {
  private static instance: BulletProofDatabaseService;
  private operationQueue: DatabaseOperation[] = [];
  private isProcessing = false;

  static getInstance(): BulletProofDatabaseService {
    if (!BulletProofDatabaseService.instance) {
      BulletProofDatabaseService.instance = new BulletProofDatabaseService();
    }
    return BulletProofDatabaseService.instance;
  }

  constructor() {
    // Start health monitoring
    databaseHealthMonitor.startMonitoring();

    // Start processing queue
    this.startQueueProcessor();
  }

  /**
   * Execute database operation with full bullet-proof protection
   */
  async execute<T>(
    operation: () => Promise<T>,
    options: {
      description?: string;
      critical?: boolean;
      timeout?: number;
      maxRetries?: number;
      queueIfUnavailable?: boolean;
    } = {}
  ): Promise<OperationResult<T>> {
    const {
      description = 'Database operation',
      critical = false,
      timeout = 30000,
      maxRetries = 3,
      queueIfUnavailable = false
    } = options;

    const operationId = `${description}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = performance.now();

    // Check if service is healthy
    if (!dbConnectivity.isHealthy() && queueIfUnavailable) {
      return this.queueOperation<T>({
        id: operationId,
        operation,
        description,
        critical,
        timeout
      });
    }

    let retries = 0;
    let lastError: DatabaseError | null = null;

    // Execute with error handling and retry
    while (retries <= maxRetries) {
      try {
        // Check timeout
        if (performance.now() - startTime > timeout) {
          throw new Error(`Operation timeout after ${timeout}ms`);
        }

        // Execute operation
        const result = await dbConnectivity.executeWithRetry(operation, description);

        const duration = performance.now() - startTime;

        return {
          success: true,
          data: result,
          metrics: {
            duration,
            retries,
            circuitBreakerState: dbConnectivity.getMetrics().circuitBreakerState
          }
        };

      } catch (error) {
        lastError = databaseErrorHandler.categorizeError(error, {
          operationId,
          description,
          attempt: retries + 1,
          maxRetries
        });

        retries++;

        // Don't retry if not retryable or exceeded max retries
        if (!lastError.retryable || retries > maxRetries) {
          break;
        }

        console.warn(`🔄 Retrying ${description} (attempt ${retries}/${maxRetries})`);
      }
    }

    // Operation failed
    const duration = performance.now() - startTime;

    // If critical and service is unhealthy, queue for later
    if (critical && !dbConnectivity.isHealthy() && queueIfUnavailable) {
      console.warn(`📋 Queuing critical operation: ${description}`);
      return this.queueOperation<T>({
        id: operationId,
        operation,
        description,
        critical: true,
        timeout
      });
    }

    return {
      success: false,
      error: lastError!,
      metrics: {
        duration,
        retries: retries - 1,
        circuitBreakerState: dbConnectivity.getMetrics().circuitBreakerState
      }
    };
  }

  /**
   * Queue operation for later execution when service recovers
   */
  private queueOperation<T>(dbOperation: DatabaseOperation<T>): Promise<OperationResult<T>> {
    return new Promise((resolve) => {
      const queuedOperation = {
        ...dbOperation,
        resolve,
        queuedAt: new Date()
      };

      this.operationQueue.push(queuedOperation as any);
      console.log(`📋 Operation queued: ${dbOperation.description} (${this.operationQueue.length} in queue)`);
    });
  }

  /**
   * Start queue processor for failed operations
   */
  private startQueueProcessor(): void {
    setInterval(async () => {
      if (this.isProcessing || this.operationQueue.length === 0) {
        return;
      }

      // Only process if service is healthy
      if (!dbConnectivity.isHealthy()) {
        return;
      }

      this.isProcessing = true;

      try {
        const operation = this.operationQueue.shift();
        if (!operation) return;

        console.log(`🔄 Processing queued operation: ${operation.description}`);

        const result = await this.execute(
          operation.operation,
          {
            description: operation.description,
            critical: operation.critical,
            timeout: operation.timeout,
            queueIfUnavailable: false // Don't re-queue
          }
        );

        (operation as any).resolve(result);

      } catch (error) {
        console.error('Queue processing error:', error);
      } finally {
        this.isProcessing = false;
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Get database client with health checks
   */
  async getClient(): Promise<SupabaseClient<Database>> {
    return dbConnectivity.getClient();
  }

  /**
   * Get comprehensive health status
   */
  getHealthStatus(): {
    connectivity: ReturnType<typeof dbConnectivity.getMetrics>;
    health: ReturnType<typeof databaseHealthMonitor.getHealthStatus>;
    errors: ReturnType<typeof databaseErrorHandler.getErrorStats>;
    queueLength: number;
  } {
    return {
      connectivity: dbConnectivity.getMetrics(),
      health: databaseHealthMonitor.getHealthStatus(),
      errors: databaseErrorHandler.getErrorStats(),
      queueLength: this.operationQueue.length
    };
  }

  /**
   * Run comprehensive diagnostics
   */
  async runDiagnostics(): Promise<{
    overallHealth: boolean;
    connectivity: boolean;
    performance: boolean;
    errors: string[];
    recommendations: string[];
    metrics: {
      queueLength: number;
      errorRate: number;
      averageResponseTime: number;
      uptime: number;
    };
  }> {
    const healthStatus = this.getHealthStatus();
    const diagnostics = await databaseHealthMonitor.runDiagnostics();

    const overallHealth = healthStatus.connectivity.circuitBreakerState !== 'OPEN' &&
                         diagnostics.connectivity &&
                         diagnostics.performance;

    const allErrors = [
      ...diagnostics.errors,
      ...(healthStatus.queueLength > 10 ? [`${healthStatus.queueLength} operations queued`] : [])
    ];

    const allRecommendations = [
      ...diagnostics.recommendations,
      ...(healthStatus.queueLength > 10 ? ['Review queued operations and service capacity'] : [])
    ];

    // Calculate metrics
    const errorRate = Object.values(healthStatus.errors)
      .reduce((sum, count) => sum + count, 0) / Math.max(Object.values(healthStatus.errors).length, 1);

    return {
      overallHealth,
      connectivity: diagnostics.connectivity,
      performance: diagnostics.performance,
      errors: allErrors,
      recommendations: allRecommendations,
      metrics: {
        queueLength: healthStatus.queueLength,
        errorRate,
        averageResponseTime: healthStatus.connectivity.averageResponseTime,
        uptime: healthStatus.health.uptime
      }
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down bullet-proof database service...');

    databaseHealthMonitor.stopMonitoring();

    // Process remaining queue items
    if (this.operationQueue.length > 0) {
      console.log(`📋 Processing ${this.operationQueue.length} remaining queued operations...`);

      for (const operation of this.operationQueue) {
        try {
          const result = await this.execute(
            operation.operation,
            {
              description: operation.description,
              critical: operation.critical,
              timeout: operation.timeout,
              queueIfUnavailable: false
            }
          );
          (operation as any).resolve(result);
        } catch (error) {
          console.error(`Failed to process queued operation ${operation.description}:`, error);
        }
      }
    }

    await dbConnectivity.shutdown();
    console.log('✅ Bullet-proof database service shut down');
  }
}

// Export singleton instance
export const bulletProofDatabase = BulletProofDatabaseService.getInstance();

// Convenience functions for common operations
export async function executeQuery<T>(
  operation: () => Promise<T>,
  description: string,
  critical = false
): Promise<OperationResult<T>> {
  return bulletProofDatabase.execute(operation, { description, critical });
}

export async function getHealthyClient(): Promise<SupabaseClient<Database>> {
  return bulletProofDatabase.getClient();
}