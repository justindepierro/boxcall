/**
 * Database Error Handling & Recovery Service
 *
 * Provides comprehensive error handling with:
 * - Error categorization and classification
 * - Recovery strategies for different error types
 * - User-friendly error messages
 * - Automatic retry logic for transient errors
 * - Error logging and monitoring
 */

import type { PostgrestError } from '@supabase/supabase-js';

export enum DatabaseErrorType {
  // Connection errors
  CONNECTION_LOST = 'CONNECTION_LOST',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',

  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Data validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  FOREIGN_KEY_VIOLATION = 'FOREIGN_KEY_VIOLATION',
  UNIQUE_VIOLATION = 'UNIQUE_VIOLATION',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',

  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',

  // Unknown errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum RecoveryStrategy {
  RETRY = 'RETRY',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
  REAUTHENTICATE = 'REAUTHENTICATE',
  USER_INPUT = 'USER_INPUT',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  NONE = 'NONE'
}

export interface DatabaseError {
  type: DatabaseErrorType;
  originalError: any;
  message: string;
  userMessage: string;
  recoveryStrategy: RecoveryStrategy;
  retryable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
  timestamp: Date;
}

export interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, error: DatabaseError) => void;
  onFailure?: (error: DatabaseError) => void;
}

export class DatabaseErrorHandler {
  private static instance: DatabaseErrorHandler;
  private errorHistory: DatabaseError[] = [];
  private maxHistorySize = 100;

  static getInstance(): DatabaseErrorHandler {
    if (!DatabaseErrorHandler.instance) {
      DatabaseErrorHandler.instance = new DatabaseErrorHandler();
    }
    return DatabaseErrorHandler.instance;
  }

  /**
   * Categorize and enhance database errors
   */
  categorizeError(error: any, context?: Record<string, any>): DatabaseError {
    const postgrestError = error as PostgrestError;
    const errorCode = postgrestError.code || error.status?.toString() || '';
    const errorMessage = postgrestError.message || error.message || 'Unknown error';

    let errorType: DatabaseErrorType;
    let userMessage: string;
    let recoveryStrategy: RecoveryStrategy;
    let retryable: boolean;
    let severity: 'low' | 'medium' | 'high' | 'critical';

    // Categorize based on error code and message
    if (this.isConnectionError(errorCode, errorMessage)) {
      errorType = this.getConnectionErrorType(errorCode);
      userMessage = 'Connection to database lost. Please check your internet connection.';
      recoveryStrategy = RecoveryStrategy.RETRY;
      retryable = true;
      severity = 'medium';
    } else if (this.isAuthError(errorCode, errorMessage)) {
      errorType = this.getAuthErrorType(errorCode);
      userMessage = this.getAuthErrorMessage(errorType);
      recoveryStrategy = this.getAuthRecoveryStrategy(errorType);
      retryable = false;
      severity = 'high';
    } else if (this.isValidationError(errorCode, errorMessage)) {
      errorType = this.getValidationErrorType(errorCode);
      userMessage = this.getValidationErrorMessage(errorType, errorMessage);
      recoveryStrategy = RecoveryStrategy.USER_INPUT;
      retryable = false;
      severity = 'low';
    } else if (this.isResourceError(errorCode, errorMessage)) {
      errorType = this.getResourceErrorType(errorCode);
      userMessage = this.getResourceErrorMessage(errorType);
      recoveryStrategy = this.getResourceRecoveryStrategy(errorType);
      retryable = errorType === DatabaseErrorType.RATE_LIMITED;
      severity = errorType === DatabaseErrorType.NOT_FOUND ? 'low' : 'medium';
    } else if (this.isSystemError(errorCode, errorMessage)) {
      errorType = DatabaseErrorType.INTERNAL_ERROR;
      userMessage = 'A system error occurred. Please try again later.';
      recoveryStrategy = RecoveryStrategy.RETRY;
      retryable = true;
      severity = 'high';
    } else {
      errorType = DatabaseErrorType.UNKNOWN_ERROR;
      userMessage = 'An unexpected error occurred. Please try again.';
      recoveryStrategy = RecoveryStrategy.RETRY;
      retryable = true;
      severity = 'medium';
    }

    const databaseError: DatabaseError = {
      type: errorType,
      originalError: error,
      message: errorMessage,
      userMessage,
      recoveryStrategy,
      retryable,
      severity,
      context,
      timestamp: new Date()
    };

    // Log error
    this.logError(databaseError);

    // Add to history
    this.addToHistory(databaseError);

    return databaseError;
  }

  /**
   * Execute operation with error handling and recovery
   */
  async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    options: ErrorRecoveryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      onRetry,
      onFailure
    } = options;

    let lastError: DatabaseError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = this.categorizeError(error);

        // Don't retry if not retryable or on last attempt
        if (!lastError.retryable || attempt === maxRetries) {
          onFailure?.(lastError);
          throw lastError;
        }

        // Execute recovery strategy
        await this.executeRecoveryStrategy(lastError);

        // Notify about retry
        onRetry?.(attempt, lastError);

        // Wait before retry
        await this.delay(retryDelay * attempt);
      }
    }

    throw lastError!;
  }

  /**
   * Execute recovery strategy for an error
   */
  private async executeRecoveryStrategy(error: DatabaseError): Promise<void> {
    switch (error.recoveryStrategy) {
      case RecoveryStrategy.RETRY:
        // Just wait for retry logic
        break;

      case RecoveryStrategy.REFRESH_TOKEN:
        // Trigger token refresh
        console.log('🔄 Attempting to refresh authentication token...');
        // This would integrate with your auth service
        break;

      case RecoveryStrategy.REAUTHENTICATE:
        // Trigger re-authentication
        console.log('🔐 Re-authentication required');
        // This would redirect to login
        break;

      case RecoveryStrategy.USER_INPUT:
        // Error requires user action
        console.log('👤 User input required to resolve error');
        break;

      case RecoveryStrategy.SYSTEM_ADMIN:
        // System administrator intervention required
        console.error('🚨 System administrator intervention required');
        break;

      default:
        break;
    }
  }

  /**
   * Check if error is a connection error
   */
  private isConnectionError(code: string, message: string): boolean {
    const connectionCodes = ['08006', '08003', '08000', '53300', 'PGRST301', 'PGRST302'];
    const connectionMessages = ['connection', 'timeout', 'refused', 'unreachable'];

    return connectionCodes.includes(code) ||
           connectionMessages.some(msg => message.toLowerCase().includes(msg));
  }

  /**
   * Get specific connection error type
   */
  private getConnectionErrorType(code: string): DatabaseErrorType {
    switch (code) {
      case '08006':
      case '08003':
        return DatabaseErrorType.CONNECTION_LOST;
      case 'PGRST301':
        return DatabaseErrorType.CONNECTION_TIMEOUT;
      default:
        return DatabaseErrorType.CONNECTION_REFUSED;
    }
  }

  /**
   * Check if error is an authentication error
   */
  private isAuthError(code: string, message: string): boolean {
    const authCodes = ['PGRST401', '401'];
    const authMessages = ['unauthorized', 'forbidden', 'token expired', 'invalid token'];

    return authCodes.includes(code) ||
           authMessages.some(msg => message.toLowerCase().includes(msg));
  }

  /**
   * Get specific auth error type
   */
  private getAuthErrorType(code: string): DatabaseErrorType {
    if (code === 'PGRST401' || code === '401') {
      return DatabaseErrorType.UNAUTHORIZED;
    }
    return DatabaseErrorType.UNAUTHORIZED; // Default
  }

  /**
   * Get user-friendly auth error message
   */
  private getAuthErrorMessage(type: DatabaseErrorType): string {
    switch (type) {
      case DatabaseErrorType.UNAUTHORIZED:
        return 'You are not authorized to perform this action.';
      case DatabaseErrorType.FORBIDDEN:
        return 'Access to this resource is forbidden.';
      case DatabaseErrorType.TOKEN_EXPIRED:
        return 'Your session has expired. Please sign in again.';
      default:
        return 'Authentication error occurred.';
    }
  }

  /**
   * Get auth recovery strategy
   */
  private getAuthRecoveryStrategy(type: DatabaseErrorType): RecoveryStrategy {
    switch (type) {
      case DatabaseErrorType.TOKEN_EXPIRED:
        return RecoveryStrategy.REFRESH_TOKEN;
      case DatabaseErrorType.UNAUTHORIZED:
        return RecoveryStrategy.REAUTHENTICATE;
      default:
        return RecoveryStrategy.NONE;
    }
  }

  /**
   * Check if error is a validation error
   */
  private isValidationError(code: string, message: string): boolean {
    const validationCodes = ['23505', '23503', '23502', '23514'];
    const validationMessages = ['violates', 'constraint', 'null value', 'invalid'];

    return validationCodes.includes(code) ||
           validationMessages.some(msg => message.toLowerCase().includes(msg));
  }

  /**
   * Get specific validation error type
   */
  private getValidationErrorType(code: string): DatabaseErrorType {
    switch (code) {
      case '23505':
        return DatabaseErrorType.UNIQUE_VIOLATION;
      case '23503':
        return DatabaseErrorType.FOREIGN_KEY_VIOLATION;
      case '23502':
        return DatabaseErrorType.CONSTRAINT_VIOLATION;
      default:
        return DatabaseErrorType.VALIDATION_ERROR;
    }
  }

  /**
   * Get user-friendly validation error message
   */
  private getValidationErrorMessage(type: DatabaseErrorType, _originalMessage: string): string {
    switch (type) {
      case DatabaseErrorType.UNIQUE_VIOLATION:
        return 'This value already exists. Please choose a different value.';
      case DatabaseErrorType.FOREIGN_KEY_VIOLATION:
        return 'This action would break data relationships. Please check your data.';
      case DatabaseErrorType.CONSTRAINT_VIOLATION:
        return 'The provided data violates system rules. Please check your input.';
      default:
        return 'Please check your input data and try again.';
    }
  }

  /**
   * Check if error is a resource error
   */
  private isResourceError(code: string, message: string): boolean {
    const resourceCodes = ['PGRST116', '409', '429'];
    const resourceMessages = ['not found', 'conflict', 'rate limit'];

    return resourceCodes.includes(code) ||
           resourceMessages.some(msg => message.toLowerCase().includes(msg));
  }

  /**
   * Get specific resource error type
   */
  private getResourceErrorType(code: string): DatabaseErrorType {
    switch (code) {
      case 'PGRST116':
        return DatabaseErrorType.NOT_FOUND;
      case '409':
        return DatabaseErrorType.CONFLICT;
      case '429':
        return DatabaseErrorType.RATE_LIMITED;
      default:
        return DatabaseErrorType.NOT_FOUND;
    }
  }

  /**
   * Get user-friendly resource error message
   */
  private getResourceErrorMessage(type: DatabaseErrorType): string {
    switch (type) {
      case DatabaseErrorType.NOT_FOUND:
        return 'The requested item was not found.';
      case DatabaseErrorType.CONFLICT:
        return 'This action conflicts with existing data.';
      case DatabaseErrorType.RATE_LIMITED:
        return 'Too many requests. Please wait and try again.';
      default:
        return 'Resource error occurred.';
    }
  }

  /**
   * Get resource recovery strategy
   */
  private getResourceRecoveryStrategy(type: DatabaseErrorType): RecoveryStrategy {
    switch (type) {
      case DatabaseErrorType.RATE_LIMITED:
        return RecoveryStrategy.RETRY;
      default:
        return RecoveryStrategy.NONE;
    }
  }

  /**
   * Check if error is a system error
   */
  private isSystemError(code: string, message: string): boolean {
    const systemCodes = ['500', '503', 'PGRST500'];
    const systemMessages = ['internal', 'service unavailable', 'maintenance'];

    return systemCodes.includes(code) ||
           systemMessages.some(msg => message.toLowerCase().includes(msg));
  }

  /**
   * Log error with appropriate level
   */
  private logError(error: DatabaseError): void {
    const logData = {
      type: error.type,
      message: error.message,
      severity: error.severity,
      context: error.context,
      timestamp: error.timestamp
    };

    switch (error.severity) {
      case 'critical':
        console.error('🚨 CRITICAL DATABASE ERROR:', logData);
        break;
      case 'high':
        console.error('❌ HIGH DATABASE ERROR:', logData);
        break;
      case 'medium':
        console.warn('⚠️ MEDIUM DATABASE ERROR:', logData);
        break;
      case 'low':
        console.info('ℹ️ LOW DATABASE ERROR:', logData);
        break;
    }
  }

  /**
   * Add error to history
   */
  private addToHistory(error: DatabaseError): void {
    this.errorHistory.push(error);

    // Keep only recent errors
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get error history
   */
  getErrorHistory(): DatabaseError[] {
    return [...this.errorHistory];
  }

  /**
   * Get error statistics
   */
  getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};

    this.errorHistory.forEach(error => {
      stats[error.type] = (stats[error.type] || 0) + 1;
      stats[`severity_${error.severity}`] = (stats[`severity_${error.severity}`] || 0) + 1;
    });

    return stats;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const databaseErrorHandler = DatabaseErrorHandler.getInstance();