/**
 * Performance monitoring utilities
 *
 * Provides FPS tracking and performance metrics for development and debugging.
 */

export interface FPSStats {
  current: number;
  average: number;
  min: number;
  max: number;
}

/**
 * FPS Monitor - tracks frames per second
 */
export class FPSMonitor {
  private frames: number[] = [];
  private lastTime: number = performance.now();
  private frameCount: number = 0;
  private readonly maxSamples: number = 60; // Track last 60 frames

  /**
   * Call this every frame (in render loop)
   */
  tick(): void {
    const now = performance.now();
    const delta = now - this.lastTime;

    if (delta > 0) {
      const fps = 1000 / delta;
      this.frames.push(fps);

      // Keep only last N samples
      if (this.frames.length > this.maxSamples) {
        this.frames.shift();
      }
    }

    this.lastTime = now;
    this.frameCount++;
  }

  /**
   * Get current FPS statistics
   */
  getStats(): FPSStats {
    if (this.frames.length === 0) {
      return { current: 0, average: 0, min: 0, max: 0 };
    }

    const current = this.frames[this.frames.length - 1] || 0;
    const sum = this.frames.reduce((a, b) => a + b, 0);
    const average = sum / this.frames.length;
    const min = Math.min(...this.frames);
    const max = Math.max(...this.frames);

    return {
      current: Math.round(current),
      average: Math.round(average),
      min: Math.round(min),
      max: Math.round(max),
    };
  }

  /**
   * Get total frame count
   */
  getFrameCount(): number {
    return this.frameCount;
  }

  /**
   * Reset all statistics
   */
  reset(): void {
    this.frames = [];
    this.lastTime = performance.now();
    this.frameCount = 0;
  }

  /**
   * Log stats to console (for development)
   */
  logStats(): void {
    const stats = this.getStats();
    console.log("📊 FPS Stats:", {
      current: `${stats.current} fps`,
      average: `${stats.average} fps`,
      min: `${stats.min} fps`,
      max: `${stats.max} fps`,
      totalFrames: this.frameCount,
    });
  }
}

/**
 * Performance logger for timing operations
 */
export class PerformanceLogger {
  private timers: Map<string, number> = new Map();

  /**
   * Start timing an operation
   */
  start(label: string): void {
    this.timers.set(label, performance.now());
  }

  /**
   * End timing and log result
   */
  end(label: string, logToConsole: boolean = true): number {
    const startTime = this.timers.get(label);
    if (startTime === undefined) {
      console.warn(`⚠️ No start time found for "${label}"`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);

    if (logToConsole) {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Time an async function
   */
  async timeAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  /**
   * Time a synchronous function
   */
  time<T>(label: string, fn: () => T): T {
    this.start(label);
    try {
      const result = fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }
}

/**
 * Global performance logger instance
 */
export const perfLogger = new PerformanceLogger();
