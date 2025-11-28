/**
 * Advanced Interaction Manager for Pixi.js
 *
 * Handles multi-touch gestures, accessibility, and advanced interaction patterns
 */

import type { Application } from "pixi.js";
import { triggerHapticFeedback } from "../../../../lib/hapticFeedback";

export interface InteractionOptions {
  enableAdvancedGestures: boolean;
  enableAccessibility: boolean;
  gestureThreshold: number;
  multiTouchEnabled: boolean;
}

export interface GestureEvent {
  type: "pinch" | "rotate" | "pan" | "tap" | "doubleTap" | "longPress";
  center: { x: number; y: number };
  scale?: number;
  rotation?: number;
  delta?: { x: number; y: number };
  velocity?: { x: number; y: number };
}

export class InteractionManager {
  private app: Application;
  private options: InteractionOptions;
  private touchPoints: Map<number, TouchPoint> = new Map();
  private isInitialized = false;

  // Gesture recognition
  private pinchStartDistance = 0;
  private pinchStartRotation = 0;
  private panStartPoint = { x: 0, y: 0 };
  private lastTapTime = 0;
  private tapCount = 0;

  constructor(app: Application, options: Partial<InteractionOptions> = {}) {
    this.app = app;
    this.options = {
      enableAdvancedGestures: true,
      enableAccessibility: true,
      gestureThreshold: 10,
      multiTouchEnabled: true,
      ...options,
    };
  }

  /**
   * Initialize interaction handling
   */
  initialize(): void {
    if (this.isInitialized) return;

    this.setupTouchEvents();
    this.setupMouseEvents();
    this.setupKeyboardEvents();
    this.setupAccessibility();

    this.isInitialized = true;
  }

  /**
   * Setup touch event handling with mobile optimizations
   */
  private setupTouchEvents(): void {
    const canvas = this.app.canvas;

    if (!this.options.multiTouchEnabled) return;

    // Prevent default touch behaviors that interfere with diagram editing
    canvas.style.touchAction = "none"; // Prevent scrolling, zooming
    canvas.style.userSelect = "none"; // Prevent text selection
    (canvas.style as any).webkitUserSelect = "none"; // Safari
    (canvas.style as any).webkitTouchCallout = "none"; // iOS callouts
    (canvas.style as any).webkitTapHighlightColor = "transparent"; // Remove tap highlights

    canvas.addEventListener("touchstart", this.handleTouchStart.bind(this), {
      passive: false,
    });
    canvas.addEventListener("touchmove", this.handleTouchMove.bind(this), {
      passive: false,
    });
    canvas.addEventListener("touchend", this.handleTouchEnd.bind(this), {
      passive: false,
    });
    canvas.addEventListener("touchcancel", this.handleTouchCancel.bind(this), {
      passive: false,
    });

    // Add mobile-specific gesture prevention
    this.preventMobileGestures(canvas);
  }

  /**
   * Prevent mobile browser gestures that interfere with diagram editing
   */
  private preventMobileGestures(canvas: HTMLCanvasElement): void {
    // Prevent context menu on long press
    canvas.addEventListener("contextmenu", (e) => e.preventDefault(), {
      passive: false,
    });

    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    canvas.addEventListener(
      "touchend",
      (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      },
      { passive: false }
    );

    // Prevent pull-to-refresh on iOS
    let startY = 0;
    canvas.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 1) {
          startY = e.touches[0].clientY;
        }
      },
      { passive: true }
    );

    canvas.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length === 1) {
          const currentY = e.touches[0].clientY;
          const diffY = startY - currentY;

          // If scrolling up and at the top, or scrolling down and at the bottom
          if (
            (diffY > 0 && window.scrollY <= 0) ||
            (diffY < 0 &&
              window.innerHeight + window.scrollY >= document.body.scrollHeight)
          ) {
            e.preventDefault();
          }
        }
      },
      { passive: false }
    );
  }

  /**
   * Setup mouse event handling
   */
  private setupMouseEvents(): void {
    const canvas = this.app.canvas;

    canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
    canvas.addEventListener("wheel", this.handleWheel.bind(this), {
      passive: false,
    });
  }

  /**
   * Setup keyboard event handling
   */
  private setupKeyboardEvents(): void {
    const canvas = this.app.canvas;

    canvas.addEventListener("keydown", this.handleKeyDown.bind(this));
    canvas.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  /**
   * Setup accessibility features
   */
  private setupAccessibility(): void {
    if (!this.options.enableAccessibility) return;

    const canvas = this.app.view as HTMLCanvasElement;

    // Add ARIA labels and roles
    canvas.setAttribute("role", "application");
    canvas.setAttribute("aria-label", "Football diagram editor");
    canvas.setAttribute("tabindex", "0");

    // Focus management
    canvas.addEventListener("focus", this.handleFocus.bind(this));
    canvas.addEventListener("blur", this.handleBlur.bind(this));
  }

  // Touch event handlers

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();

    const touches = event.touches;

    // Track touch points
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      this.touchPoints.set(touch.identifier, {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
      });
    }

    // Initialize gesture recognition
    if (touches.length === 2) {
      this.initializePinchGesture(touches[0], touches[1]);
    } else if (touches.length === 1) {
      this.panStartPoint = { x: touches[0].clientX, y: touches[0].clientY };
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();

    const touches = event.touches;

    if (touches.length === 2 && this.options.enableAdvancedGestures) {
      this.handlePinchGesture(touches[0], touches[1]);
    } else if (touches.length === 1) {
      this.handlePanGesture(touches[0]);
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();

    const touches = event.changedTouches;

    // Remove ended touches
    for (let i = 0; i < touches.length; i++) {
      this.touchPoints.delete(touches[i].identifier);
    }

    // Check for tap gestures
    if (this.touchPoints.size === 0) {
      this.checkForTapGestures();
    }
  }

  private handleTouchCancel(event: TouchEvent): void {
    event.preventDefault();

    // Clear all touch points on cancel
    this.touchPoints.clear();
  }

  // Gesture recognition

  private initializePinchGesture(touch1: Touch, touch2: Touch): void {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    this.pinchStartDistance = Math.sqrt(dx * dx + dy * dy);
    this.pinchStartRotation = Math.atan2(dy, dx);
  }

  private handlePinchGesture(touch1: Touch, touch2: Touch): void {
    const centerX = (touch1.clientX + touch2.clientX) / 2;
    const centerY = (touch1.clientY + touch2.clientY) / 2;

    // Calculate scale
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const scale = distance / this.pinchStartDistance;

    // Calculate rotation
    const rotation = Math.atan2(dy, dx) - this.pinchStartRotation;

    // Haptic feedback for pinch gestures
    if (Math.abs(scale - 1) > 0.1) {
      triggerHapticFeedback("light");
    }

    this.emitGestureEvent({
      type: "pinch",
      center: { x: centerX, y: centerY },
      scale,
      rotation,
    });
  }

  private handlePanGesture(touch: Touch): void {
    const deltaX = touch.clientX - this.panStartPoint.x;
    const deltaY = touch.clientY - this.panStartPoint.y;

    if (
      Math.abs(deltaX) > this.options.gestureThreshold ||
      Math.abs(deltaY) > this.options.gestureThreshold
    ) {
      this.emitGestureEvent({
        type: "pan",
        center: { x: touch.clientX, y: touch.clientY },
        delta: { x: deltaX, y: deltaY },
      });
    }
  }

  private checkForTapGestures(): void {
    const now = Date.now();
    const timeSinceLastTap = now - this.lastTapTime;

    if (timeSinceLastTap < 300) {
      // Double tap threshold
      this.tapCount++;
      if (this.tapCount === 2) {
        triggerHapticFeedback("light");
        this.emitGestureEvent({
          type: "doubleTap",
          center: this.panStartPoint,
        });
        this.tapCount = 0;
      }
    } else {
      this.tapCount = 1;
      // Single tap - delay to check for double tap
      setTimeout(() => {
        if (this.tapCount === 1) {
          triggerHapticFeedback("light");
          this.emitGestureEvent({
            type: "tap",
            center: this.panStartPoint,
          });
          this.tapCount = 0;
        }
      }, 300);
    }

    this.lastTapTime = now;
  }

  private handleMouseDown(_event: MouseEvent): void {
    // Handle mouse interactions
  }

  private handleMouseMove(_event: MouseEvent): void {
    // Handle mouse movements
  }

  private handleMouseUp(_event: MouseEvent): void {
    // Handle mouse releases
  }

  private handleWheel(event: WheelEvent): void {
    event.preventDefault();
    // Handle zoom gestures
  }

  // Keyboard event handlers

  private handleKeyDown(_event: KeyboardEvent): void {
    // Handle keyboard shortcuts
  }

  private handleKeyUp(_event: KeyboardEvent): void {
    // Handle keyboard releases
  }

  // Accessibility handlers

  private handleFocus(_event: FocusEvent): void {
    // Handle focus for accessibility
  }

  private handleBlur(_event: FocusEvent): void {
    // Handle blur for accessibility
  }

  // Event emission

  private emitGestureEvent(event: GestureEvent): void {
    // Emit custom event on canvas
    const canvas = this.app.canvas;
    const customEvent = new CustomEvent("gesture", {
      detail: event,
      bubbles: true,
    });
    canvas.dispatchEvent(customEvent);
  }

  /**
   * Update interaction manager (called every frame)
   */
  update(_deltaTime: number): void {
    // Update gesture recognition
    // Check for long press, etc.
  }

  /**
   * Handle resize events
   */
  onResize(_width: number, _height: number): void {
    // Update interaction bounds if needed
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    const canvas = this.app.canvas;

    // Remove all event listeners
    canvas.removeEventListener("touchstart", this.handleTouchStart.bind(this));
    canvas.removeEventListener("touchmove", this.handleTouchMove.bind(this));
    canvas.removeEventListener("touchend", this.handleTouchEnd.bind(this));
    canvas.removeEventListener(
      "touchcancel",
      this.handleTouchCancel.bind(this)
    );

    canvas.removeEventListener("mousedown", this.handleMouseDown.bind(this));
    canvas.removeEventListener("mousemove", this.handleMouseMove.bind(this));
    canvas.removeEventListener("mouseup", this.handleMouseUp.bind(this));
    canvas.removeEventListener("wheel", this.handleWheel.bind(this));

    canvas.removeEventListener("keydown", this.handleKeyDown.bind(this));
    canvas.removeEventListener("keyup", this.handleKeyUp.bind(this));

    canvas.removeEventListener("focus", this.handleFocus.bind(this));
    canvas.removeEventListener("blur", this.handleBlur.bind(this));

    this.touchPoints.clear();
    this.isInitialized = false;
  }
}

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  startTime: number;
}
