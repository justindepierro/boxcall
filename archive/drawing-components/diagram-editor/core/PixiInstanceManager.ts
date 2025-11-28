/**
 * Shared Pixi.js Instance Manager
 *
 * Manages shared Pixi.js applications to reduce memory usage and initialization overhead.
 * Provides a pool of reusable Pixi applications that can be shared across diagram components.
 */

import { Application, type Renderer } from "pixi.js";
import type { ProfessionalEngineOptions } from "./ProfessionalPixiEngine";

interface SharedApplication {
  app: Application;
  renderer: Renderer;
  canvas: HTMLCanvasElement;
  refCount: number;
  lastUsed: number;
  options: ProfessionalEngineOptions;
}

export class PixiInstanceManager {
  private static instance: PixiInstanceManager;
  private applications: Map<string, SharedApplication> = new Map();
  private readonly MAX_INSTANCES = 3; // Limit concurrent instances
  private readonly CLEANUP_INTERVAL = 30000; // 30 seconds
  private readonly MAX_IDLE_TIME = 60000; // 1 minute

  private constructor() {
    // Start cleanup interval
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }

  static getInstance(): PixiInstanceManager {
    if (!PixiInstanceManager.instance) {
      PixiInstanceManager.instance = new PixiInstanceManager();
    }
    return PixiInstanceManager.instance;
  }

  /**
   * Get or create a shared Pixi application
   */
  async getApplication(options: ProfessionalEngineOptions): Promise<{
    app: Application;
    renderer: Renderer;
    canvas: HTMLCanvasElement;
    isNew: boolean;
  }> {
    const key = this.generateKey(options);

    // Check if we have an existing application
    const existing = this.applications.get(key);
    if (existing) {
      existing.refCount++;
      existing.lastUsed = Date.now();
      return {
        app: existing.app,
        renderer: existing.renderer,
        canvas: existing.canvas,
        isNew: false,
      };
    }

    // Check if we're at the limit
    if (this.applications.size >= this.MAX_INSTANCES) {
      // Remove least recently used
      this.evictLRU();
    }

    // Create new application using PixiJS v8 API
    const app = new Application();

    // Initialize with options
    await app.init({
      width: options.width,
      height: options.height,
      backgroundColor: options.backgroundColor || 0xffffff,
      powerPreference: (options.powerPreference as any) || "high-performance",
      antialias: options.antialias ?? true,
      resolution: options.resolution || window.devicePixelRatio || 1,
      autoDensity: options.autoDensity ?? true,
      preserveDrawingBuffer: options.preserveDrawingBuffer ?? false,
      failIfMajorPerformanceCaveat:
        options.failIfMajorPerformanceCaveat ?? false,
    });

    // Get the canvas from the app (PixiJS v8 uses app.canvas instead of app.view)
    const canvas = app.canvas;

    const sharedApp: SharedApplication = {
      app,
      renderer: app.renderer,
      canvas,
      refCount: 1,
      lastUsed: Date.now(),
      options,
    };

    this.applications.set(key, sharedApp);

    return {
      app: sharedApp.app,
      renderer: sharedApp.renderer,
      canvas: sharedApp.canvas,
      isNew: true,
    };
  }

  /**
   * Release a shared application
   */
  releaseApplication(options: ProfessionalEngineOptions): void {
    const key = this.generateKey(options);
    const app = this.applications.get(key);

    if (app) {
      app.refCount--;
      if (app.refCount <= 0) {
        // Mark for cleanup instead of immediate destruction
        app.lastUsed = Date.now() - this.MAX_IDLE_TIME + 1000; // Mark as ready for cleanup soon
      }
    }
  }

  /**
   * Generate a unique key for application options
   */
  private generateKey(options: ProfessionalEngineOptions): string {
    return `${options.width}x${options.height}_${options.backgroundColor || 0}_${options.powerPreference || "default"}_${options.antialias ? "antialiased" : "no-antialias"}`;
  }

  /**
   * Remove least recently used application
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, app] of this.applications) {
      if (app.refCount === 0 && app.lastUsed < oldestTime) {
        oldestTime = app.lastUsed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const app = this.applications.get(oldestKey)!;
      app.app.destroy(true);
      this.applications.delete(oldestKey);
    }
  }

  /**
   * Cleanup idle applications
   */
  private cleanup(): void {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [key, app] of this.applications) {
      if (app.refCount === 0 && now - app.lastUsed > this.MAX_IDLE_TIME) {
        toRemove.push(key);
      }
    }

    for (const key of toRemove) {
      const app = this.applications.get(key)!;
      app.app.destroy(true);
      this.applications.delete(key);
    }
  }

  /**
   * Get current instance count for debugging
   */
  getInstanceCount(): number {
    return this.applications.size;
  }

  /**
   * Get total reference count
   */
  getTotalRefCount(): number {
    let total = 0;
    for (const app of this.applications.values()) {
      total += app.refCount;
    }
    return total;
  }
}
