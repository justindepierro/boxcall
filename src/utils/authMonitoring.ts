// Auth Monitoring and Observability
import { debug, logError } from "./logger";

const AUTH_PHASES = [
  "bootstrap",
  "sessionFetch",
  "profileFetch",
  "dbHandshake",
] as const;
type AuthPhase = (typeof AUTH_PHASES)[number];
type PhaseStatus = "success" | "error" | "skipped";

interface AuthPhaseTiming {
  lastDurationMs: number | null;
  averageDurationMs: number | null;
  samples: number;
  status: "idle" | PhaseStatus;
  metadata?: Record<string, any>;
  completedAt?: Date;
}

const createPhaseTiming = (): AuthPhaseTiming => ({
  lastDurationMs: null,
  averageDurationMs: null,
  samples: 0,
  status: "idle",
});

export class AuthMonitoring {
  private static metrics = {
    signInAttempts: 0,
    signInSuccesses: 0,
    signUpAttempts: 0,
    signUpSuccesses: 0,
    signOutEvents: 0,
    sessionRefreshes: 0,
    networkErrors: 0,
    rateLimitHits: 0,
    securityViolations: 0,
    offlineQueuedOperations: 0,
    retryAttempts: 0,
    retrySuccesses: 0,
  };

  private static errors: Array<{
    timestamp: Date;
    operation: string;
    error: string;
    userId?: string;
    metadata?: Record<string, any>;
  }> = [];

  private static events: Array<{
    timestamp: Date;
    event: string;
    userId?: string;
    metadata?: Record<string, any>;
  }> = [];
  private static phaseTimings: Record<AuthPhase, AuthPhaseTiming> =
    AUTH_PHASES.reduce(
      (acc, phase) => {
        acc[phase] = createPhaseTiming();
        return acc;
      },
      {} as Record<AuthPhase, AuthPhaseTiming>
    );
  private static phaseStarts: Partial<Record<AuthPhase, number>> = {};

  private static now(): number {
    if (typeof performance !== "undefined" && performance.now) {
      return performance.now();
    }
    return Date.now();
  }

  static startPhase(phase: AuthPhase, metadata?: Record<string, any>) {
    this.phaseStarts[phase] = this.now();
    const current = this.phaseTimings[phase] ?? createPhaseTiming();
    this.phaseTimings[phase] = {
      ...current,
      status: "idle",
      metadata: metadata
        ? { ...current.metadata, ...metadata }
        : current.metadata,
    };
  }

  static endPhase(
    phase: AuthPhase,
    status: PhaseStatus = "success",
    metadata?: Record<string, any>
  ) {
    const start = this.phaseStarts[phase];
    const duration = start != null ? this.now() - start : 0;
    const current = this.phaseTimings[phase] ?? createPhaseTiming();
    const samples = current.samples + 1;
    const averageDurationMs =
      current.averageDurationMs != null
        ? (current.averageDurationMs * current.samples + duration) / samples
        : duration;

    this.phaseTimings[phase] = {
      lastDurationMs: duration,
      averageDurationMs,
      samples,
      status,
      metadata: metadata
        ? { ...current.metadata, ...metadata }
        : current.metadata,
      completedAt: new Date(),
    };
    delete this.phaseStarts[phase];
  }

  static getPhaseTimings(): Record<AuthPhase, AuthPhaseTiming> {
    return AUTH_PHASES.reduce(
      (acc, phase) => {
        acc[phase] = { ...this.phaseTimings[phase] };
        return acc;
      },
      {} as Record<AuthPhase, AuthPhaseTiming>
    );
  }

  // Metrics tracking
  static recordSignInAttempt() {
    this.metrics.signInAttempts++;
  }

  static recordSignInSuccess() {
    this.metrics.signInSuccesses++;
  }

  static recordSignUpAttempt() {
    this.metrics.signUpAttempts++;
  }

  static recordSignUpSuccess() {
    this.metrics.signUpSuccesses++;
  }

  static recordSignOut() {
    this.metrics.signOutEvents++;
  }

  static recordSessionRefresh() {
    this.metrics.sessionRefreshes++;
  }

  static recordNetworkError() {
    this.metrics.networkErrors++;
  }

  static recordRateLimitHit() {
    this.metrics.rateLimitHits++;
  }

  static recordSecurityViolation() {
    this.metrics.securityViolations++;
  }

  static recordOfflineQueuedOperation() {
    this.metrics.offlineQueuedOperations++;
  }

  static recordRetryAttempt() {
    this.metrics.retryAttempts++;
  }

  static recordRetrySuccess() {
    this.metrics.retrySuccesses++;
  }

  // Error tracking
  static recordError(
    operation: string,
    error: string,
    userId?: string,
    metadata?: Record<string, any>
  ) {
    this.errors.push({
      timestamp: new Date(),
      operation,
      error,
      userId,
      metadata,
    });

    // Keep only last 100 errors
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }

    // Only log errors in development
    if (import.meta.env.DEV) {
      logError(`🚨 Auth Error [${operation}]:`, error, metadata);
    }
  }

  // Event tracking
  static recordEvent(
    event: string,
    userId?: string,
    metadata?: Record<string, any>
  ) {
    this.events.push({
      timestamp: new Date(),
      event,
      userId,
      metadata,
    });

    // Keep only last 200 events
    if (this.events.length > 200) {
      this.events = this.events.slice(-200);
    }

    // Only log events in development
    if (import.meta.env.DEV) {
      debug(`📊 Auth Event [${event}]:`, metadata);
    }
  }

  // Get metrics
  static getMetrics() {
    return { ...this.metrics };
  }

  // Get recent errors
  static getRecentErrors(limit: number = 10) {
    return this.errors.slice(-limit);
  }

  // Get recent events
  static getRecentEvents(limit: number = 20) {
    return this.events.slice(-limit);
  }

  // Calculate success rates
  static getSuccessRates() {
    return {
      signIn:
        this.metrics.signInAttempts > 0
          ? (this.metrics.signInSuccesses / this.metrics.signInAttempts) * 100
          : 0,
      signUp:
        this.metrics.signUpAttempts > 0
          ? (this.metrics.signUpSuccesses / this.metrics.signUpAttempts) * 100
          : 0,
      retry:
        this.metrics.retryAttempts > 0
          ? (this.metrics.retrySuccesses / this.metrics.retryAttempts) * 100
          : 0,
    };
  }

  // Get health status
  static getHealthStatus() {
    const rates = this.getSuccessRates();
    const recentErrors = this.getRecentErrors(5);

    return {
      overall: (() => {
        if (rates.signIn > 95 && rates.signUp > 95) return "healthy";
        if (rates.signIn > 80) return "warning";
        return "critical";
      })(),
      signInSuccessRate: rates.signIn,
      signUpSuccessRate: rates.signUp,
      retrySuccessRate: rates.retry,
      recentErrorCount: recentErrors.length,
      networkErrors: this.metrics.networkErrors,
      securityViolations: this.metrics.securityViolations,
      rateLimitHits: this.metrics.rateLimitHits,
    };
  }

  // Reset metrics (useful for testing)
  static reset() {
    this.metrics = {
      signInAttempts: 0,
      signInSuccesses: 0,
      signUpAttempts: 0,
      signUpSuccesses: 0,
      signOutEvents: 0,
      sessionRefreshes: 0,
      networkErrors: 0,
      rateLimitHits: 0,
      securityViolations: 0,
      offlineQueuedOperations: 0,
      retryAttempts: 0,
      retrySuccesses: 0,
    };
    this.errors = [];
    this.events = [];
    this.phaseTimings = AUTH_PHASES.reduce(
      (acc, phase) => {
        acc[phase] = createPhaseTiming();
        return acc;
      },
      {} as Record<AuthPhase, AuthPhaseTiming>
    );
    this.phaseStarts = {};
  }
}
