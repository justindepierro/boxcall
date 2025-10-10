/**
 * Network resilience utilities for handling offline scenarios and network failures
 */

export class NetworkResilience {
  private static online =
    typeof navigator !== "undefined" ? navigator.onLine : true;
  private static listeners: Array<(online: boolean) => void> = [];
  private static queuedOperations: Array<() => Promise<void>> = [];
  private static isProcessingQueue = false;

  static {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        this.online = true;
        this.notifyListeners(true);
        this.processQueuedOperations();
      });

      window.addEventListener("offline", () => {
        this.online = false;
        this.notifyListeners(false);
      });
    }
  }

  /**
   * Check if the device is currently online
   */
  static isOnline(): boolean {
    return this.online;
  }

  /**
   * Subscribe to online/offline status changes
   */
  static onStatusChange(callback: (online: boolean) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of status change
   */
  private static notifyListeners(online: boolean): void {
    this.listeners.forEach((callback) => {
      try {
        callback(online);
      } catch (error) {
        console.error("Error in network status listener:", error);
      }
    });
  }

  /**
   * Queue an operation to be executed when back online
   */
  static queueForOnline(operation: () => Promise<void>): void {
    this.queuedOperations.push(operation);
  }

  /**
   * Process queued operations when back online
   */
  private static async processQueuedOperations(): Promise<void> {
    if (
      this.isProcessingQueue ||
      !this.online ||
      this.queuedOperations.length === 0
    ) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.queuedOperations.length > 0 && this.online) {
      const operation = this.queuedOperations.shift();
      if (operation) {
        try {
          await operation();
        } catch (error) {
          console.error("Error processing queued operation:", error);
          // Re-queue failed operations with exponential backoff
          setTimeout(() => {
            this.queuedOperations.unshift(operation);
          }, 5000);
          break; // Stop processing on first failure
        }
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Retry an operation with exponential backoff
   */
  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    maxDelay: number = 10000,
    backoffFactor: number = 2
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries) {
          break; // Don't retry on last attempt
        }

        // Don't retry on certain errors
        if (this.isNonRetryableError(lastError)) {
          throw lastError;
        }

        // Calculate delay with jitter
        const delay = Math.min(
          baseDelay * Math.pow(backoffFactor, attempt),
          maxDelay
        );
        const jitter = Math.random() * 0.1 * delay; // Add up to 10% jitter
        const finalDelay = delay + jitter;

        console.warn(
          `⚠️ Operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${Math.round(finalDelay)}ms:`,
          lastError.message
        );

        await new Promise((resolve) => setTimeout(resolve, finalDelay));
      }
    }

    throw lastError!;
  }

  /**
   * Check if an error should not be retried
   */
  private static isNonRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();

    // Authentication errors
    if (
      message.includes("unauthorized") ||
      message.includes("forbidden") ||
      message.includes("invalid credentials")
    ) {
      return true;
    }

    // Validation errors
    if (
      message.includes("validation") ||
      message.includes("constraint") ||
      message.includes("invalid input")
    ) {
      return true;
    }

    // Not found errors (for specific resources)
    if (message.includes("not found") && !message.includes("network")) {
      return true;
    }

    return false;
  }

  /**
   * Create a debounced version of a function for network requests
   */
  static debounceNetworkRequest<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    delay: number = 300
  ): T {
    let timeoutId: NodeJS.Timeout | null = null;
    let pendingPromise: Promise<any> | null = null;

    return ((...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      return new Promise((resolve, reject) => {
        timeoutId = setTimeout(async () => {
          try {
            if (!pendingPromise) {
              pendingPromise = fn(...args);
            }
            const result = await pendingPromise;
            pendingPromise = null;
            resolve(result);
          } catch (error) {
            pendingPromise = null;
            reject(error);
          }
        }, delay);
      });
    }) as T;
  }

  /**
   * Get network quality information
   */
  static getNetworkInfo(): {
    online: boolean;
    effectiveType?: string;
    downlink?: number;
    saveData?: boolean;
  } {
    if (typeof navigator === "undefined") {
      return { online: true };
    }

    const connection = (navigator as any).connection;
    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      saveData: connection?.saveData,
    };
  }

  /**
   * Check if the current network conditions are suitable for heavy operations
   */
  static isNetworkSuitableForHeavyOperations(): boolean {
    const info = this.getNetworkInfo();

    if (!info.online) return false;
    if (info.saveData) return false;
    if (info.downlink && info.downlink < 2) return false; // Less than 2 Mbps
    if (info.effectiveType && ["slow-2g", "2g"].includes(info.effectiveType))
      return false;

    return true;
  }
}
