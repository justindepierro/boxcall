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

    // Create Pixi application - v7 uses constructor, not async init()
    this.app = new Application({
      width: config.width,
      height: config.height,
      resolution: config.resolution || window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundColor: config.backgroundColor || 0xF5F7ED,
      antialias: true,
    });

    // Replace the React canvas with Pixi's canvas
    const pixiCanvas = this.app.view as HTMLCanvasElement;
    if (config.canvas.parentElement) {
      config.canvas.parentElement.replaceChild(pixiCanvas, config.canvas);
    }
    
    // Initialize coordinate system
    this.coordinates = new CoordinateSystem(config.fieldDimensions);
    
    // Create main stage container (this gets transformed by Camera)
    this.stage = new Container();
    this.stage.interactive = true; // v7 uses 'interactive' instead of 'eventMode'
    
    // Create camera controller with optional config
    this.camera = new Camera(this.stage, config.fieldDimensions, config.cameraConfig);

    // Initialize FPS monitor in development
    if (import.meta.env.DEV) {
      this.fpsMonitor = new FPSMonitor();
    }

    // Add stage to app
    this.app.stage.addChild(this.stage);
    
    // Set initial viewport size and center field
    this.camera.setViewportSize(config.width, config.height);
    
    // Start render loop
    this.app.ticker.add(this.update.bind(this));
  }

  /**
   * Wait for initialization to complete
   * In v7, initialization is synchronous, so this just returns immediately
   */
  async waitForReady(): Promise<void> {
    // v7 is synchronous, always ready
    return Promise.resolve();
  }

  /**
   * Add the field layer to the stage
   */
  addFieldLayer(layer: FieldLayer): void {
    if (this.fieldLayer) {
      console.warn('⚠️ Field layer already added, removing old one');
      this.stage.removeChild(this.fieldLayer);
    }
    
    this.fieldLayer = layer;
    this.stage.addChild(layer);
  }
  
  /**
   * Get the field layer
   */
  getFieldLayer(): FieldLayer | null {
    return this.fieldLayer;
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
   * Debug coordinate system
   */
  debugCoordinates(testX: number = 100, testY: number = 100): void {
    // Test coordinate conversion
    const worldCoords = this.screenToWorld(testX, testY);
    const backToScreen = this.worldToScreen(worldCoords.x, worldCoords.y);
    
    // Only log if there's a significant error (for debugging)
    const errorX = Math.abs(backToScreen.x - testX);
    const errorY = Math.abs(backToScreen.y - testY);
    if (errorX > 0.1 || errorY > 0.1) {
      console.warn('Coordinate conversion error:', {
        screen: { x: testX, y: testY },
        world: worldCoords,
        backToScreen: backToScreen,
        error: { x: errorX, y: errorY },
      });
    }
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
