/**
 * Professional Pixi.js v8 Application Engine
 *
 * Modern, bullet-proof diagram rendering engine with advanced features:
 * - WebGL capability detection and fallbacks
 * - Real-time performance monitoring
 * - Advanced error recovery
 * - Professional rendering pipeline
 * - Multi-touch gesture support
 */

import { Application, Container, type Renderer } from "pixi.js";
import { Camera } from "./Camera";
import { type FieldDimensions } from "./CoordinateSystem";
import { detectWebGLCapabilities } from "./WebGLCapabilities";
import { PerformanceMonitor } from "./PerformanceMonitor";
import { LayerManager } from "./LayerManager";
import { InteractionManager } from "./InteractionManager";
import { CoordinateSystem } from "./CoordinateSystem";
import { PixiInstanceManager } from "./PixiInstanceManager";
import type { FieldLayer } from "../layers/FieldLayer";
import type { PlayersLayer } from "../layers/PlayersLayer";
import type { RoutesLayer } from "../layers/RoutesLayer";
import type { SpacingIndicatorLayer } from "../layers/SpacingIndicatorLayer";

export interface ProfessionalEngineOptions {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  fieldDimensions: FieldDimensions;
  backgroundColor?: number;
  powerPreference?: 'default' | 'high-performance' | 'low-power';
  antialias?: boolean;
  resolution?: number;
  autoDensity?: boolean;
  transparent?: boolean;
  preserveDrawingBuffer?: boolean;
  failIfMajorPerformanceCaveat?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableAdvancedInteractions?: boolean;
  maxFPS?: number;
  minFPS?: number;
}

export interface EngineCapabilities {
  webgl2: boolean;
  webgl1: boolean;
  instancing: boolean;
  floatTextures: boolean;
  anisotropy: boolean;
  compressedTextures: boolean;
  vertexArrayObjects: boolean;
  maxTextureSize: number;
  maxViewportDims: [number, number];
}

export class ProfessionalPixiEngine {
  public app!: Application;
  public renderer!: Renderer;
  public stage!: Container;
  public camera!: Camera;
  public layers!: LayerManager;
  public performance!: PerformanceMonitor;
  public interactions!: InteractionManager;
  public coordinates!: CoordinateSystem;

  // Layer references (compatible with existing DiagramEditor API)
  public fieldLayer: FieldLayer | null = null;
  public playersLayer: PlayersLayer | null = null;
  public routesLayer: RoutesLayer | null = null;
  public spacingIndicatorLayer: SpacingIndicatorLayer | null = null;

  private capabilities!: EngineCapabilities;
  private isDestroyed = false;
  private options: ProfessionalEngineOptions;

  constructor(options: ProfessionalEngineOptions) {
    this.options = options;
  }

  async initialize(): Promise<void> {
    try {
      // Detect WebGL capabilities first
      const webglCaps = detectWebGLCapabilities();
      this.capabilities = {
        webgl2: webglCaps.version === 2,
        webgl1: webglCaps.version >= 1,
        instancing: webglCaps.features.instancing,
        floatTextures: webglCaps.features.floatTextures,
        anisotropy: webglCaps.features.anisotropy,
        compressedTextures: webglCaps.features.compressedTextures,
        vertexArrayObjects: webglCaps.features.vertexArrayObjects,
        maxTextureSize: webglCaps.limits.maxTextureSize,
        maxViewportDims: webglCaps.limits.maxViewportDims,
      };

      if (!webglCaps.supported) {
        throw new Error('WebGL is not supported on this device');
      }

      // Create the application with advanced options
      this.app = await this.createApplication();

      // Initialize core systems
      this.renderer = this.app.renderer;
      this.stage = this.app.stage;
      this.coordinates = new CoordinateSystem(this.options.fieldDimensions);
      this.camera = new Camera(this.stage, this.options.fieldDimensions);
      this.layers = new LayerManager(this.stage);
      this.performance = new PerformanceMonitor(this.app, {
        enableMonitoring: this.options.enablePerformanceMonitoring ?? true,
        maxFPS: this.options.maxFPS ?? 60,
        minFPS: this.options.minFPS ?? 15,
      });
      this.interactions = new InteractionManager(this.app, {
        enableAdvancedGestures: this.options.enableAdvancedInteractions ?? true,
      });

      // Setup the rendering pipeline
      this.setupRenderingPipeline();

      // Start the engine
      this.start();

    } catch (error) {
      console.error('Failed to initialize ProfessionalPixiEngine:', error);
      throw error;
    }
  }

  private async createApplication(): Promise<Application> {
    const instanceManager = PixiInstanceManager.getInstance();
    const { app, canvas } = await instanceManager.getApplication(this.options);

    // Replace the canvas in the DOM if needed
    if (this.options.canvas.parentElement) {
      this.options.canvas.parentElement.replaceChild(canvas, this.options.canvas);
    }

    return app;
  }

  private setupRenderingPipeline(): void {
    // Configure renderer settings
    this.app.ticker.maxFPS = this.options.maxFPS ?? 60;
    this.app.ticker.minFPS = this.options.minFPS ?? 15;

    this.camera.setViewportSize(this.options.width, this.options.height);
  }

  private start(): void {
    // Start the ticker
    this.app.ticker.add((ticker) => this.update(ticker.deltaMS / 1000));

    // Start performance monitoring
    this.performance.startMonitoring();

    // Initialize interactions
    this.interactions.initialize();
  }

  private update(deltaTime: number): void {
    // Update camera
    this.camera.update();

    // Update interactions
    this.interactions.update(deltaTime);

    // Check for performance issues
    const health = this.performance.getHealthStatus();
    if (health.status === 'critical') {
      this.handlePerformanceIssue();
    }
  }

  private handlePerformanceIssue(): void {
    // Reduce quality settings to maintain performance
    if (this.app.ticker.maxFPS > 30) {
      this.app.ticker.maxFPS = 30;
    }

    // Could disable advanced features here if needed
    // For now, just log the issue
    console.warn('Performance issue detected - reducing FPS cap to 30');
  }

  public resize(width: number, height: number): void {
    if (this.isDestroyed) return;

    this.app.renderer.resize(width, height);
    this.camera.setViewportSize(width, height);
  }

  public destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    // Stop monitoring
    this.performance.stopMonitoring();

    // Clean up interactions
    this.interactions.destroy();

    // Release the shared application instead of destroying it
    const instanceManager = PixiInstanceManager.getInstance();
    instanceManager.releaseApplication(this.options);
  }

  public getCapabilities(): EngineCapabilities {
    return { ...this.capabilities };
  }

  public getPerformanceStats() {
    return this.performance.getMetrics();
  }

  public getFieldLayer(): FieldLayer | null {
    return this.fieldLayer;
  }

  public setFieldLayer(layer: FieldLayer): void {
    this.fieldLayer = layer;
  }

  public setPlayersLayer(layer: PlayersLayer): void {
    this.playersLayer = layer;
  }

  public setRoutesLayer(layer: RoutesLayer): void {
    this.routesLayer = layer;
  }

  public setSpacingIndicatorLayer(layer: SpacingIndicatorLayer): void {
    this.spacingIndicatorLayer = layer;
  }

  public screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    // Convert screen coordinates to world coordinates using Pixi's built-in transform
    const worldPoint = this.stage.toLocal({ x: screenX, y: screenY });
    return { x: worldPoint.x, y: worldPoint.y };
  }

  public worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    // Convert world coordinates to screen coordinates using Pixi's built-in transform
    const screenPoint = this.stage.toGlobal({ x: worldX, y: worldY });
    return { x: screenPoint.x, y: screenPoint.y };
  }

  public isHealthy(): boolean {
    return this.performance.getHealthStatus().status !== 'critical' && !this.isDestroyed;
  }
}