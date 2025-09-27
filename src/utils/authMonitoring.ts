// Auth Monitoring and Observability
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
  static recordError(operation: string, error: string, userId?: string, metadata?: Record<string, any>) {
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

    console.error(`🚨 Auth Error [${operation}]:`, error, metadata);
  }

  // Event tracking
  static recordEvent(event: string, userId?: string, metadata?: Record<string, any>) {
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

    console.log(`📊 Auth Event [${event}]:`, metadata);
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
      signIn: this.metrics.signInAttempts > 0
        ? (this.metrics.signInSuccesses / this.metrics.signInAttempts) * 100
        : 0,
      signUp: this.metrics.signUpAttempts > 0
        ? (this.metrics.signUpSuccesses / this.metrics.signUpAttempts) * 100
        : 0,
      retry: this.metrics.retryAttempts > 0
        ? (this.metrics.retrySuccesses / this.metrics.retryAttempts) * 100
        : 0,
    };
  }

  // Get health status
  static getHealthStatus() {
    const rates = this.getSuccessRates();
    const recentErrors = this.getRecentErrors(5);

    return {
      overall: rates.signIn > 95 && rates.signUp > 95 ? 'healthy' : rates.signIn > 80 ? 'warning' : 'critical',
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
  }
}