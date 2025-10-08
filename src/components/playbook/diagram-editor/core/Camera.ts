/**
 * Camera Controller for Pixi Diagram
 * 
 * Handles zoom and pan transforms using Pixi's Container transform system.
 * No manual coordinate conversion needed - Pixi does it automatically!
 */

import { Container } from 'pixi.js';
import type { FieldDimensions } from './CoordinateSystem';
import { validateZoom, validateDimension, clamp } from '../utils/validation';

export interface CameraState {
  x: number;      // Pan offset in pixels
  y: number;      // Pan offset in pixels
  zoom: number;   // Zoom level (1.0 = 100%)
}

export interface CameraConfig {
  minZoom?: number;      // Minimum zoom level (default: 0.5)
  maxZoom?: number;      // Maximum zoom level (default: 3.0)
  smoothFactor?: number; // Interpolation speed 0-1 (default: 0.2, set to 1.0 for instant)
}

export class Camera {
  private stage: Container;
  private fieldDimensions: FieldDimensions;
  private viewportWidth: number = 0;
  private viewportHeight: number = 0;
  
  // Zoom constraints
  private minZoom: number;
  private maxZoom: number;
  
  // Smooth zoom/pan
  private targetZoom: number = 1.0;
  private targetX: number = 0;
  private targetY: number = 0;
  private smoothFactor: number;

  constructor(stage: Container, fieldDimensions: FieldDimensions, config: CameraConfig = {}) {
    this.stage = stage;
    this.fieldDimensions = fieldDimensions;
    
    // Apply configuration with defaults
    this.minZoom = config.minZoom ?? 0.5;
    this.maxZoom = config.maxZoom ?? 3.0;
    this.smoothFactor = config.smoothFactor ?? 0.2;
    
    // Center field immediately at (0,0) - will adjust when viewport size is known
    this.centerOnField();
  }

  /**
   * Get current camera state
   */
  getState(): CameraState {
    return {
      x: this.stage.x,
      y: this.stage.y,
      zoom: this.stage.scale.x, // Assuming uniform scale
    };
  }

  /**
   * Set camera state directly (instant)
   */
  setState(state: Partial<CameraState>): void {
    if (state.x !== undefined) {
      this.stage.x = state.x;
      this.targetX = state.x;
    }
    if (state.y !== undefined) {
      this.stage.y = state.y;
      this.targetY = state.y;
    }
    if (state.zoom !== undefined) {
      const clampedZoom = this.clampZoom(state.zoom);
      this.stage.scale.set(clampedZoom);
      this.targetZoom = clampedZoom;
    }
  }

  /**
   * Zoom in by one level (smooth)
   */
  zoomIn(): void {
    const levels = [0.5, 0.75, 1.0, 1.5, 2.0, 3.0];
    const currentZoom = this.stage.scale.x;
    const currentIndex = levels.findIndex(level => level >= currentZoom);
    const nextIndex = Math.min(levels.length - 1, currentIndex + 1);
    this.targetZoom = levels[nextIndex];
  }

  /**
   * Zoom out by one level (smooth)
   */
  zoomOut(): void {
    const levels = [0.5, 0.75, 1.0, 1.5, 2.0, 3.0];
    const currentZoom = this.stage.scale.x;
    // Find the last level that is <= currentZoom
    let currentIndex = -1;
    for (let i = levels.length - 1; i >= 0; i--) {
      if (levels[i] <= currentZoom) {
        currentIndex = i;
        break;
      }
    }
    const nextIndex = Math.max(0, currentIndex - 1);
    this.targetZoom = levels[nextIndex];
  }

  /**
   * Reset to default view (smooth)
   */
  reset(): void {
    this.targetZoom = 1.0;
    this.centerOnField();
  }

  /**
   * Get current zoom level
   */
  getZoom(): number {
    return this.stage.scale.x;
  }

  /**
   * Set zoom level directly (for gesture handling)
   */
  setZoom(zoom: number): void {
    // Validate zoom level
    validateZoom(zoom, { min: this.minZoom, max: this.maxZoom });
    const clampedZoom = this.clampZoom(zoom);
    this.targetZoom = clampedZoom;
    this.stage.scale.set(clampedZoom);
  }

  /**
   * Pan by delta pixels (smooth)
   */
  pan(deltaX: number, deltaY: number): void {
    this.targetX += deltaX;
    this.targetY += deltaY;
  }

  /**
   * Pan instantly (for dragging)
   */
  panInstant(deltaX: number, deltaY: number): void {
    this.stage.x += deltaX;
    this.stage.y += deltaY;
    this.targetX = this.stage.x;
    this.targetY = this.stage.y;
  }

  /**
   * Zoom to a specific point (keeps that point under cursor)
   */
  zoomToPoint(worldX: number, worldY: number, zoomDelta: number): void {
    const oldZoom = this.stage.scale.x;
    const newZoom = this.clampZoom(oldZoom + zoomDelta);
    
    // Calculate how much the world point moves in screen space
    const dx = worldX * (newZoom - oldZoom);
    const dy = worldY * (newZoom - oldZoom);
    
    this.targetZoom = newZoom;
    this.targetX -= dx;
    this.targetY -= dy;
  }

  /**
   * Center camera on field
   */
  centerOnField(): void {
    // Center based on current viewport (will be updated by setViewportSize)
    if (this.viewportWidth > 0 && this.viewportHeight > 0) {
      const fieldWidthPixels = this.fieldDimensions.width * this.fieldDimensions.pixelsPerYard;
      const fieldHeightPixels = this.fieldDimensions.height * this.fieldDimensions.pixelsPerYard;
      
      const newX = (this.viewportWidth - fieldWidthPixels) / 2;
      const newY = (this.viewportHeight - fieldHeightPixels) / 2;
      
      // Set both target AND current position immediately (no smooth interpolation on first center)
      this.targetX = newX;
      this.targetY = newY;
      this.stage.x = newX;
      this.stage.y = newY;
      
      console.log('📍 Field centered at:', { x: newX, y: newY });
    } else {
      // Fallback to origin if viewport not set yet
      this.targetX = 0;
      this.targetY = 0;
      this.stage.x = 0;
      this.stage.y = 0;
    }
  }

  /**
   * Set viewport size (should be called on resize)
   */
  setViewportSize(width: number, height: number): void {
    // Validate viewport dimensions
    validateDimension(width, 'Viewport width', { min: 100, max: 10000 });
    validateDimension(height, 'Viewport height', { min: 100, max: 10000 });
    
    this.viewportWidth = width;
    this.viewportHeight = height;
    
    // Always re-center when viewport size changes
    this.centerOnField();
    
    console.log('📷 Camera viewport set:', {
      viewport: { width, height },
      fieldPixels: {
        width: this.fieldDimensions.width * this.fieldDimensions.pixelsPerYard,
        height: this.fieldDimensions.height * this.fieldDimensions.pixelsPerYard,
      },
      position: { x: this.targetX, y: this.targetY },
      zoom: this.targetZoom,
    });
  }

  /**
   * Center camera on a specific point in yards
   */
  centerOnPoint(yardX: number, yardY: number, viewportWidth: number, viewportHeight: number): void {
    const pixelX = yardX * this.fieldDimensions.pixelsPerYard;
    const pixelY = yardY * this.fieldDimensions.pixelsPerYard;
    
    this.targetX = (viewportWidth / 2) - (pixelX * this.stage.scale.x);
    this.targetY = (viewportHeight / 2) - (pixelY * this.stage.scale.x);
  }

  /**
   * Update camera (call every frame for smooth interpolation)
   */
  update(): void {
    // Smooth zoom
    const currentZoom = this.stage.scale.x;
    const newZoom = currentZoom + (this.targetZoom - currentZoom) * this.smoothFactor;
    this.stage.scale.set(newZoom);

    // Smooth pan
    this.stage.x += (this.targetX - this.stage.x) * this.smoothFactor;
    this.stage.y += (this.targetY - this.stage.y) * this.smoothFactor;
  }

  /**
   * Clamp zoom to valid range
   */
  private clampZoom(zoom: number): number {
    return clamp(zoom, this.minZoom, this.maxZoom);
  }

  /**
   * Set zoom limits
   */
  setZoomLimits(min: number, max: number): void {
    this.minZoom = min;
    this.maxZoom = max;
    this.targetZoom = this.clampZoom(this.targetZoom);
  }

  /**
   * Set smooth factor (0 = instant, 1 = very slow)
   */
  setSmoothFactor(factor: number): void {
    this.smoothFactor = Math.max(0, Math.min(1, factor));
  }
}
