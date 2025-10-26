/**
 * Performance Monitor for Pixi.js Applications
 *
 * Real-time performance tracking with alerts and optimization suggestions
 */

import type { Application } from "pixi.js";

export interface PerformanceMetrics {
  fps: number;
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  frameTime: number;
  memoryUsage?: number;
  drawCalls: number;
  triangles: number;
  textures: number;
}

export interface PerformanceOptions {
  enableMonitoring: boolean;
  maxFPS: number;
  minFPS: number;
  alertThreshold: number; // FPS threshold for alerts
  historySize: number; // Number of frames to keep in history
}

export class PerformanceMonitor {
  private app: Application;
  private options: PerformanceOptions;
  private metrics: PerformanceMetrics;
  private fpsHistory: number[] = [];
  private frameTimeHistory: number[] = [];
  private isMonitoring = false;
  private lastFrameTime = 0;
  private frameCount = 0;

  constructor(app: Application, options: Partial<PerformanceOptions> = {}) {
    this.app = app;
    this.options = {
      enableMonitoring: true,
      maxFPS: 60,
      minFPS: 15,
      alertThreshold: 30,
      historySize: 60, // 1 second at 60fps
      ...options,
    };

    this.metrics = {
      fps: 0,
      averageFPS: 0,
      minFPS: Infinity,
      maxFPS: 0,
      frameTime: 0,
      drawCalls: 0,
      triangles: 0,
      textures: 0,
    };
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (!this.options.enableMonitoring || this.isMonitoring) return;

    this.isMonitoring = true;
    this.app.ticker.add(this.updateMetrics.bind(this));
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    this.app.ticker.remove(this.updateMetrics.bind(this));
  }

  /**
   * Update performance metrics (called every frame)
   */
  private updateMetrics = (): void => {
    if (!this.isMonitoring) return;

    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Calculate FPS
    const fps = Math.round(1000 / deltaTime);
    this.metrics.fps = Math.min(fps, this.options.maxFPS);

    // Update FPS history
    this.fpsHistory.push(this.metrics.fps);
    if (this.fpsHistory.length > this.options.historySize) {
      this.fpsHistory.shift();
    }

    // Update frame time history
    this.frameTimeHistory.push(deltaTime);
    if (this.frameTimeHistory.length > this.options.historySize) {
      this.frameTimeHistory.shift();
    }

    // Calculate averages and extremes
    if (this.fpsHistory.length > 0) {
      this.metrics.averageFPS = Math.round(
        this.fpsHistory.reduce((sum, sumFps) => sum + sumFps, 0) / this.fpsHistory.length
      );
      this.metrics.minFPS = Math.min(...this.fpsHistory);
      this.metrics.maxFPS = Math.max(...this.fpsHistory);
    }

    // Calculate average frame time
    if (this.frameTimeHistory.length > 0) {
      this.metrics.frameTime = this.frameTimeHistory.reduce((sum, time) => sum + time, 0) / this.frameTimeHistory.length;
    }

    // Update renderer stats if available
    this.updateRendererStats();

    // Check memory usage if available
    this.updateMemoryStats();

    this.frameCount++;
  };

  /**
   * Update renderer-specific statistics
   */
  private updateRendererStats(): void {
    // For now, we'll track basic metrics
    // Advanced renderer stats would require Pixi.js internal API access
    // which may change between versions
    this.metrics.drawCalls = 0; // Placeholder
    this.metrics.triangles = 0; // Placeholder
    this.metrics.textures = 0; // Placeholder
  }

  /**
   * Update memory usage statistics
   */
  private updateMemoryStats(): void {
    // Check if performance.memory is available (Chrome/Edge)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize;
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance health status
   */
  getHealthStatus(): {
    status: 'excellent' | 'good' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check FPS
    if (this.metrics.averageFPS < this.options.alertThreshold) {
      issues.push(`Low average FPS: ${this.metrics.averageFPS}`);
      recommendations.push('Consider reducing visual complexity');
      recommendations.push('Enable performance mode if available');
    }

    if (this.metrics.minFPS < this.options.minFPS) {
      issues.push(`FPS drops below minimum: ${this.metrics.minFPS}`);
      recommendations.push('Check for memory leaks');
      recommendations.push('Reduce texture sizes');
    }

    // Check frame time
    if (this.metrics.frameTime > 1000 / this.options.minFPS) {
      issues.push(`High frame time: ${this.metrics.frameTime.toFixed(2)}ms`);
      recommendations.push('Optimize rendering pipeline');
    }

    // Check memory
    if (this.metrics.memoryUsage && this.metrics.memoryUsage > 200 * 1024 * 1024) { // 200MB
      issues.push(`High memory usage: ${(this.metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB`);
      recommendations.push('Clear unused textures');
      recommendations.push('Implement texture atlas');
    }

    // Determine status
    let status: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';

    if (issues.length > 2) {
      status = 'critical';
    } else if (issues.length > 0) {
      status = 'warning';
    } else if (this.metrics.averageFPS >= this.options.maxFPS * 0.9) {
      status = 'excellent';
    } else {
      status = 'good';
    }

    return { status, issues, recommendations };
  }

  /**
   * Log performance statistics to console
   */
  logStats(): void {
    const metrics = this.getMetrics();
    const health = this.getHealthStatus();

    console.group('📊 Pixi.js Performance Monitor');
    console.log('Current FPS:', metrics.fps);
    console.log('Average FPS:', metrics.averageFPS);
    console.log('FPS Range:', `${metrics.minFPS} - ${metrics.maxFPS}`);
    console.log('Frame Time:', `${metrics.frameTime.toFixed(2)}ms`);
    console.log('Draw Calls:', metrics.drawCalls);
    console.log('Triangles:', metrics.triangles);
    console.log('Textures:', metrics.textures);

    if (metrics.memoryUsage) {
      console.log('Memory Usage:', `${(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB`);
    }

    console.log('Health Status:', health.status.toUpperCase());
    if (health.issues.length > 0) {
      console.warn('Issues:', health.issues);
      console.info('Recommendations:', health.recommendations);
    }

    console.groupEnd();
  }

  /**
   * Reset performance statistics
   */
  reset(): void {
    this.fpsHistory = [];
    this.frameTimeHistory = [];
    this.frameCount = 0;
    this.metrics = {
      fps: 0,
      averageFPS: 0,
      minFPS: Infinity,
      maxFPS: 0,
      frameTime: 0,
      drawCalls: 0,
      triangles: 0,
      textures: 0,
    };
  }
}