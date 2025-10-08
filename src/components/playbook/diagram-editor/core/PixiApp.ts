/**
 * Main Pixi Application for Football Diagram Editor
 * 
 * This is the core rendering engine that manages all layers and interactions.
 * Uses Pixi.js for hardware-accelerated WebGL rendering.
 */

import { Application, Container } from 'pixi.js';
import { Camera, type CameraConfig } from './Camera';
import { CoordinateSystem, type FieldDimensions } from './CoordinateSystem';
import type { FieldLayer } from '../layers/FieldLayer';
import type { PlayersLayer } from '../layers/PlayersLayer';
import { validateCanvas, validateDimension, validateFieldDimensions } from '../utils/validation';
import { FPSMonitor } from '../utils/performance';

export interface PixiAppConfig {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  fieldDimensions: FieldDimensions;
  backgroundColor?: number;
  resolution?: number;
  cameraConfig?: CameraConfig; // Optional camera configuration
}

export class DiagramPixiApp {
  public app: Application;
  public stage: Container;
  public camera: Camera;
  public coordinates: CoordinateSystem;
  
  // Layer references (actual layer instances, not empty containers)
  public fieldLayer: FieldLayer | null = null;
  public playersLayer: PlayersLayer | null = null;
  // Future layers can be added as needed
  
  private isDestroyed: boolean = false;
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  // Performance monitoring (development only)
  private fpsMonitor: FPSMonitor | null = null;

  constructor(config: PixiAppConfig) {
    // Validate canvas element
    validateCanvas(config.canvas);

    // Validate dimensions
    validateDimension(config.width, 'Canvas width', { min: 100, max: 10000 });
    validateDimension(config.height, 'Canvas height', { min: 100, max: 10000 });

    // Validate field dimensions
    validateFieldDimensions(config.fieldDimensions.width, config.fieldDimensions.height);

    // Create Pixi application
    this.app = new Application();
    
    // Initialize coordinate system
    this.coordinates = new CoordinateSystem(config.fieldDimensions);
    
    // Initialize app (async, store promise for awaiting)
    this.initPromise = this.initializeApp(config);
    
    // Create main stage container (this gets transformed by Camera)
    this.stage = new Container();
    this.stage.label = 'CameraStage';
    this.stage.eventMode = 'static'; // Enable interaction on stage
    
    // Create camera controller with optional config
    this.camera = new Camera(this.stage, config.fieldDimensions, config.cameraConfig);

    // Initialize FPS monitor in development
    if (import.meta.env.DEV) {
      this.fpsMonitor = new FPSMonitor();
    }
  }

  /**
   * Wait for initialization to complete
   * Call this before using the app!
   */
  async waitForReady(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  /**
   * Initialize Pixi application (async)
   */
  private async initializeApp(config: PixiAppConfig): Promise<void> {
    try {
      console.log('🎨 Initializing Pixi application...');
      console.log('Canvas:', config.canvas);
      console.log('Dimensions:', config.width, 'x', config.height);
      
      await this.app.init({
        canvas: config.canvas,
        width: config.width,
        height: config.height,
        resolution: config.resolution || window.devicePixelRatio || 1,
        autoDensity: true,
        backgroundColor: config.backgroundColor || 0xF5F7ED, // Light greenish
        antialias: true,
        eventMode: 'static', // Enable interaction
        preference: 'webgpu', // Try WebGPU first to avoid WebGL shader issues
        hello: false, // Disable Pixi banner
      });

      console.log('✅ Pixi app initialized');
      console.log('Renderer type:', this.app.renderer.type);

      // Add stage to app
      this.app.stage.addChild(this.stage);
      
      // Set initial viewport size and center field
      this.camera.setViewportSize(config.width, config.height);
      
      // Start render loop
      this.app.ticker.add(this.update.bind(this));
      
      // Mark as initialized
      this.isInitialized = true;
      
      console.log('✅ Pixi application ready');
    } catch (error) {
      console.error('❌ Failed to initialize Pixi app:', error);
      throw error;
    }
  }

  /**
   * Main update loop (called every frame)
   */
  private update(): void {
    if (this.isDestroyed) return;
    
    // Track FPS in development
    if (this.fpsMonitor) {
      this.fpsMonitor.tick();
    }

    // Update camera (smooth zoom/pan)
    this.camera.update();
    
    // Layers can add their own update logic here
    // For now, just camera updates
  }

  /**
   * Resize the application
   */
  resize(width: number, height: number): void {
    this.app.renderer.resize(width, height);
    this.camera.setViewportSize(width, height);
  }

  /**
   * Convert screen coordinates to world coordinates (yards)
   */
  screenToWorld(screenX: number, screenY: number) {
    // Pixi automatically handles the inverse transform!
    const point = this.stage.toLocal({ x: screenX, y: screenY });
    return this.coordinates.pixelsToYards(point);
  }

  /**
   * Convert world coordinates (yards) to screen coordinates
   */
  worldToScreen(worldX: number, worldY: number) {
    const pixels = this.coordinates.yardsToPixels({ x: worldX, y: worldY });
    return this.stage.toGlobal(pixels);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.isDestroyed = true;
    
    // Stop ticker if it exists
    if (this.app?.ticker) {
      this.app.ticker.stop();
    }
    
    // Destroy all layers if they exist
    if (this.fieldLayer) {
      this.fieldLayer.destroy({ children: true });
    }
    if (this.playersLayer) {
      this.playersLayer.destroy();
    }
    // Future layers will be destroyed here as they're added
    
    if (this.stage) {
      this.stage.destroy({ children: true });
    }
    
    // Destroy app if it exists
    if (this.app) {
      this.app.destroy(true, { children: true });
    }
  }

  /**
   * Get current FPS for debugging
   */
  getFPS(): number {
    return this.app?.ticker?.FPS ?? 0;
  }

  /**
   * Get detailed FPS statistics (development only)
   */
  getFPSStats() {
    return this.fpsMonitor?.getStats() ?? null;
  }

  /**
   * Log FPS statistics to console (development only)
   */
  logFPSStats(): void {
    if (this.fpsMonitor) {
      this.fpsMonitor.logStats();
    }
  }

  /**
   * Debug: Log complete coordinate system state
   */
  debugCoordinates(testX: number = 400, testY: number = 300): void {
    console.group('🔍 Pixi Coordinate System Debug');
    
    // Canvas info
    const canvas = this.app.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    console.log('Canvas:', {
      cssSize: { width: rect.width, height: rect.height },
      bufferSize: { width: canvas.width, height: canvas.height },
      devicePixelRatio: window.devicePixelRatio,
      resolution: this.app.renderer.resolution,
    });
    
    // Camera state
    const cameraState = this.camera.getState();
    console.log('Camera:', cameraState);
    
    // Stage transform
    console.log('Stage:', {
      position: { x: this.stage.x, y: this.stage.y },
      scale: { x: this.stage.scale.x, y: this.stage.scale.y },
      pivot: { x: this.stage.pivot.x, y: this.stage.pivot.y },
      label: this.stage.label,
    });
    
    // Layer hierarchy
    console.log('Layers:', {
      fieldLayer: this.fieldLayer?.label || 'not added',
      playersLayer: this.playersLayer?.label || 'not added',
    });
    
    // Test coordinate conversion
    const worldCoords = this.screenToWorld(testX, testY);
    const backToScreen = this.worldToScreen(worldCoords.x, worldCoords.y);
    console.log('Test Conversion:', {
      screen: { x: testX, y: testY },
      world: worldCoords,
      backToScreen: backToScreen,
      error: { 
        x: Math.abs(backToScreen.x - testX),
        y: Math.abs(backToScreen.y - testY),
      },
    });
    
    console.groupEnd();
  }

  /**
   * Take screenshot of current view
   */
  async screenshot(): Promise<string> {
    const extract = await this.app.renderer.extract;
    const image = await extract.image(this.app.stage);
    return image.src;
  }
}
