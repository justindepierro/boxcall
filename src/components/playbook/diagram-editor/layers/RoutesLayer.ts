/**
 * RoutesLayer - Manages route rendering on the field
 *
 * Responsibilities:
 * - Render routes as paths between waypoints
 * - Color-code routes by type (primary/hot/check)
 * - Handle route selection and highlighting
 * - Respond to click events on routes
 */

import { Container, Graphics, FederatedPointerEvent } from "pixi.js";
import type { Route, RouteType } from "../types/DiagramTypes";
import type { CoordinateSystem } from "../core/CoordinateSystem";

export interface RoutesLayerEvents {
  onRouteSelected?: (routeId: string | null) => void;
  onRouteClicked?: (routeId: string) => void;
}

/**
 * Route colors by type (professional playbook standards)
 */
const ROUTE_COLORS: Record<RouteType, { color: number; alpha: number }> = {
  primary: { color: 0x10b981, alpha: 1.0 }, // jade-500 - Main read
  hot: { color: 0xf97316, alpha: 1.0 }, // orange-500 - Hot route
  check: { color: 0xa3a3a3, alpha: 0.8 }, // neutral-400 - Check-down
};

const ROUTE_LINE_WIDTH = 2; // Base line width in pixels
const ROUTE_SELECTED_WIDTH = 4; // Width when selected
const ROUTE_HOVER_WIDTH = 3; // Width when hovering

/**
 * Route line styles
 */
const ROUTE_STYLES: Record<RouteType, "solid" | "dashed" | "dotted"> = {
  primary: "solid", // Solid line
  hot: "dashed", // Dashed line
  check: "dotted", // Dotted line
};

export class RoutesLayer extends Container {
  private coords: CoordinateSystem;
  private routeGraphics: Map<string, Graphics> = new Map();
  private selectedRouteId: string | null = null;
  private hoveredRouteId: string | null = null;

  // Drawing state for route creation
  private isDrawing: boolean = false;
  private drawingRouteId: string | null = null;
  private drawingGraphics: Graphics | null = null;
  private tempWaypoints: Array<{ x: number; y: number }> = [];

  // Waypoint editing state
  private editingRouteId: string | null = null;
  private editingWaypointIndex: number | null = null;
  private isDraggingWaypoint: boolean = false;

  // Event callbacks
  private events: RoutesLayerEvents;

  constructor(coords: CoordinateSystem, events: RoutesLayerEvents = {}) {
    super();
    this.coords = coords;
    this.events = events;

    // Make layer interactive for route selection
    this.eventMode = "static";
  }

  /**
   * Add or update a route
   */
  addRoute(route: Route): void {
    // Remove existing graphics if updating
    if (this.routeGraphics.has(route.id)) {
      this.removeRoute(route.id);
    }

    // Create graphics object for this route
    const graphics = new Graphics();
    graphics.eventMode = "static";
    graphics.cursor = "pointer";

    // Store route ID for event handlers
    (graphics as any).routeId = route.id;

    // Setup event handlers
    this.setupRouteEvents(graphics, route.id);

    // Draw the route
    this.drawRoute(graphics, route, false, false);

    // Add to container and map
    this.addChild(graphics);
    this.routeGraphics.set(route.id, graphics);
  }

  /**
   * Update an existing route
   */
  updateRoute(route: Route): void {
    const graphics = this.routeGraphics.get(route.id);
    if (!graphics) {
      console.warn(`Route ${route.id} not found for update`);
      return;
    }

    // Redraw the route with current selection/hover state
    const isSelected = this.selectedRouteId === route.id;
    const isHovered = this.hoveredRouteId === route.id;
    this.drawRoute(graphics, route, isSelected, isHovered);
  }

  /**
   * Remove a route
   */
  removeRoute(routeId: string): void {
    const graphics = this.routeGraphics.get(routeId);
    if (graphics) {
      this.removeChild(graphics);
      graphics.destroy();
      this.routeGraphics.delete(routeId);

      // Clear selection if this route was selected
      if (this.selectedRouteId === routeId) {
        this.selectedRouteId = null;
      }
    }
  }

  /**
   * Clear all routes
   */
  clearRoutes(): void {
    this.routeGraphics.forEach((graphics) => {
      this.removeChild(graphics);
      graphics.destroy();
    });
    this.routeGraphics.clear();
    this.selectedRouteId = null;
    this.hoveredRouteId = null;
  }

  /**
   * Select a route
   */
  selectRoute(routeId: string | null): void {
    const previousId = this.selectedRouteId;
    this.selectedRouteId = routeId;

    // Redraw affected routes
    if (previousId) {
      const route = this.getRouteData(previousId);
      if (route) {
        this.updateRoute(route);
      }
    }

    if (routeId) {
      const route = this.getRouteData(routeId);
      if (route) {
        this.updateRoute(route);
      }
    }
  }

  /**
   * Draw a route path
   */
  private drawRoute(
    graphics: Graphics,
    route: Route,
    isSelected: boolean,
    isHovered: boolean
  ): void {
    graphics.clear();

    // Get route styling
    const { color, alpha } = ROUTE_COLORS[route.type];
    const style = ROUTE_STYLES[route.type];

    // Determine line width
    let lineWidth = ROUTE_LINE_WIDTH;
    if (isSelected) {
      lineWidth = ROUTE_SELECTED_WIDTH;
    } else if (isHovered) {
      lineWidth = ROUTE_HOVER_WIDTH;
    }

    // Set line style (width, color, alpha)
    graphics.lineStyle(lineWidth, color, alpha);

    // Draw path through waypoints
    if (route.waypoints.length < 2) {
      console.warn(`Route ${route.id} has < 2 waypoints, skipping render`);
      return;
    }

    // Start at first waypoint
    const startPixel = this.coords.yardsToPixels({
      x: route.waypoints[0].x,
      y: route.waypoints[0].y,
    });
    graphics.moveTo(startPixel.x, startPixel.y);

    // Draw lines to remaining waypoints
    for (let i = 1; i < route.waypoints.length; i++) {
      const pixel = this.coords.yardsToPixels({
        x: route.waypoints[i].x,
        y: route.waypoints[i].y,
      });

      // Apply line style (solid/dashed/dotted)
      if (style === "dashed") {
        // Dashed line: alternate between drawing and skipping
        this.drawDashedLine(
          graphics,
          route.waypoints[i - 1],
          route.waypoints[i],
          10,
          5
        );
      } else if (style === "dotted") {
        // Dotted line: short dashes
        this.drawDashedLine(
          graphics,
          route.waypoints[i - 1],
          route.waypoints[i],
          3,
          3
        );
      } else {
        // Solid line
        graphics.lineTo(pixel.x, pixel.y);
      }
    }

    // Draw arrowhead at end (shows direction)
    if (route.waypoints.length >= 2) {
      this.drawArrowhead(
        graphics,
        route.waypoints[route.waypoints.length - 2],
        route.waypoints[route.waypoints.length - 1],
        color
      );
    }

    // Draw waypoint circles (for editing)
    if (isSelected) {
      route.waypoints.forEach((waypoint) => {
        const pixel = this.coords.yardsToPixels({
          x: waypoint.x,
          y: waypoint.y,
        });
        graphics.beginFill(0xffffff, 0.8);
        graphics.lineStyle(2, color, 1.0);
        graphics.drawCircle(pixel.x, pixel.y, 6);
        graphics.endFill();
      });
    }
  }

  /**
   * Draw a dashed line between two waypoints
   */
  private drawDashedLine(
    graphics: Graphics,
    start: { x: number; y: number },
    end: { x: number; y: number },
    dashLength: number,
    gapLength: number
  ): void {
    const startPixel = this.coords.yardsToPixels({ x: start.x, y: start.y });
    const endPixel = this.coords.yardsToPixels({ x: end.x, y: end.y });

    const dx = endPixel.x - startPixel.x;
    const dy = endPixel.y - startPixel.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(distance / (dashLength + gapLength));

    const stepX = dx / distance;
    const stepY = dy / distance;

    let currentX = startPixel.x;
    let currentY = startPixel.y;

    for (let i = 0; i < steps; i++) {
      // Draw dash
      graphics.moveTo(currentX, currentY);
      currentX += stepX * dashLength;
      currentY += stepY * dashLength;
      graphics.lineTo(currentX, currentY);

      // Skip gap
      currentX += stepX * gapLength;
      currentY += stepY * gapLength;
    }

    // Draw final segment if needed
    if (currentX < endPixel.x || currentY < endPixel.y) {
      graphics.lineTo(endPixel.x, endPixel.y);
    }
  }

  /**
   * Draw arrowhead at end of route
   */
  private drawArrowhead(
    graphics: Graphics,
    penultimate: { x: number; y: number },
    end: { x: number; y: number },
    color: number
  ): void {
    const penPixel = this.coords.yardsToPixels({
      x: penultimate.x,
      y: penultimate.y,
    });
    const endPixel = this.coords.yardsToPixels({ x: end.x, y: end.y });

    // Calculate angle
    const dx = endPixel.x - penPixel.x;
    const dy = endPixel.y - penPixel.y;
    const angle = Math.atan2(dy, dx);

    // Arrowhead size
    const arrowSize = 12;
    const arrowAngle = Math.PI / 6; // 30 degrees

    // Draw filled triangle arrowhead
    graphics.beginFill(color, 1.0);
    graphics.moveTo(endPixel.x, endPixel.y);

    const leftX = endPixel.x - arrowSize * Math.cos(angle - arrowAngle);
    const leftY = endPixel.y - arrowSize * Math.sin(angle - arrowAngle);
    graphics.lineTo(leftX, leftY);

    const rightX = endPixel.x - arrowSize * Math.cos(angle + arrowAngle);
    const rightY = endPixel.y - arrowSize * Math.sin(angle + arrowAngle);
    graphics.lineTo(rightX, rightY);

    graphics.closePath();
    graphics.endFill();
  }

  /**
   * Setup event handlers for route graphics
   */
  private setupRouteEvents(graphics: Graphics, routeId: string): void {
    // Click to select
    graphics.on("pointerdown", (event: FederatedPointerEvent) => {
      event.stopPropagation();
      this.selectRoute(routeId);
      this.events.onRouteSelected?.(routeId);
      this.events.onRouteClicked?.(routeId);
    });

    // Hover effects
    graphics.on("pointerenter", () => {
      this.hoveredRouteId = routeId;
      const route = this.getRouteData(routeId);
      if (route) {
        this.updateRoute(route);
      }
    });

    graphics.on("pointerleave", () => {
      if (this.hoveredRouteId === routeId) {
        this.hoveredRouteId = null;
        const route = this.getRouteData(routeId);
        if (route) {
          this.updateRoute(route);
        }
      }
    });
  }

  /**
   * Get route data (placeholder - will be replaced with store access)
   */
  private getRouteData(routeId: string): Route | null {
    // TODO: Access from Zustand store
    // For now, we'll store route data on the graphics object
    const graphics = this.routeGraphics.get(routeId);
    return graphics ? (graphics as any).routeData : null;
  }

  /**
   * Store route data on graphics (temporary until store integration)
   */
  setRouteData(routeId: string, route: Route): void {
    const graphics = this.routeGraphics.get(routeId);
    if (graphics) {
      (graphics as any).routeData = route;
    }
  }

  /**
   * Get all route IDs
   */
  getRouteIds(): string[] {
    return Array.from(this.routeGraphics.keys());
  }

  /**
   * Start drawing a new route from a player
   */
  startDrawingRoute(
    _playerId: string,
    startX: number,
    startY: number,
    routeId: string
  ): void {
    if (this.isDrawing) {
      console.warn("Already drawing a route, finish current one first");
      return;
    }

    this.isDrawing = true;
    this.drawingRouteId = routeId;
    this.tempWaypoints = [{ x: startX, y: startY }];

    // Create temporary graphics for drawing preview
    this.drawingGraphics = new Graphics();
    this.addChild(this.drawingGraphics);
  }

  /**
   * Add a waypoint to the route being drawn
   */
  addWaypoint(x: number, y: number): void {
    if (!this.isDrawing) return;

    this.tempWaypoints.push({ x, y });
    this.updateDrawingPreview();
  }

  /**
   * Update the drawing preview with current waypoints
   */
  private updateDrawingPreview(): void {
    if (!this.drawingGraphics || this.tempWaypoints.length < 1) return;

    this.drawingGraphics.clear();

    // Draw preview line (jade color, semi-transparent)
    this.drawingGraphics.lineStyle(3, 0x10b981, 0.6);

    // Start at first waypoint
    const startPixel = this.coords.yardsToPixels({
      x: this.tempWaypoints[0].x,
      y: this.tempWaypoints[0].y,
    });
    this.drawingGraphics.moveTo(startPixel.x, startPixel.y);

    // Draw lines to remaining waypoints
    for (let i = 1; i < this.tempWaypoints.length; i++) {
      const pixel = this.coords.yardsToPixels({
        x: this.tempWaypoints[i].x,
        y: this.tempWaypoints[i].y,
      });
      this.drawingGraphics.lineTo(pixel.x, pixel.y);
    }

    // Draw waypoint circles
    this.tempWaypoints.forEach((waypoint, index) => {
      const pixel = this.coords.yardsToPixels({
        x: waypoint.x,
        y: waypoint.y,
      });

      // First waypoint = larger circle
      const radius = index === 0 ? 8 : 6;
      this.drawingGraphics!.beginFill(0x10b981, index === 0 ? 0.8 : 0.6);
      this.drawingGraphics!.drawCircle(pixel.x, pixel.y, radius);
      this.drawingGraphics!.endFill();
    });
  }

  /**
   * Update the preview to show cursor position (rubber band effect)
   */
  updateDrawingCursor(cursorX: number, cursorY: number): void {
    if (!this.isDrawing || !this.drawingGraphics) return;

    this.updateDrawingPreview();

    // Draw rubber band line from last waypoint to cursor
    if (this.tempWaypoints.length > 0) {
      const lastWaypoint = this.tempWaypoints[this.tempWaypoints.length - 1];
      const lastPixel = this.coords.yardsToPixels({
        x: lastWaypoint.x,
        y: lastWaypoint.y,
      });
      const cursorPixel = this.coords.yardsToPixels({ x: cursorX, y: cursorY });

      this.drawingGraphics.lineStyle(2, 0x10b981, 0.4);
      this.drawingGraphics.moveTo(lastPixel.x, lastPixel.y);
      this.drawingGraphics.lineTo(cursorPixel.x, cursorPixel.y);
    }
  }

  /**
   * Finish drawing and return the complete route data
   */
  finishDrawingRoute(): {
    routeId: string;
    waypoints: Array<{ x: number; y: number }>;
  } | null {
    if (!this.isDrawing || !this.drawingRouteId) return null;

    // Need at least 2 waypoints for a valid route
    if (this.tempWaypoints.length < 2) {
      console.warn("Route needs at least 2 waypoints");
      this.cancelDrawingRoute();
      return null;
    }

    const result = {
      routeId: this.drawingRouteId,
      waypoints: [...this.tempWaypoints],
    };

    // Cleanup drawing state
    if (this.drawingGraphics) {
      this.removeChild(this.drawingGraphics);
      this.drawingGraphics.destroy();
      this.drawingGraphics = null;
    }

    this.isDrawing = false;
    this.drawingRouteId = null;
    this.tempWaypoints = [];

    return result;
  }

  /**
   * Cancel drawing in progress
   */
  cancelDrawingRoute(): void {
    if (this.drawingGraphics) {
      this.removeChild(this.drawingGraphics);
      this.drawingGraphics.destroy();
      this.drawingGraphics = null;
    }

    this.isDrawing = false;
    this.drawingRouteId = null;
    this.tempWaypoints = [];
  }

  /**
   * Check if currently drawing a route
   */
  getIsDrawing(): boolean {
    return this.isDrawing;
  }

  // ============================================
  // WAYPOINT EDITING METHODS
  // ============================================

  /**
   * Find waypoint at screen coordinates
   * Returns { routeId, waypointIndex } if found, null otherwise
   */
  findWaypointAt(
    screenX: number,
    screenY: number,
    routes: Route[]
  ): { routeId: string; waypointIndex: number } | null {
    const CLICK_TOLERANCE = 12; // Pixels - slightly larger than waypoint radius for easier clicking

    // Check each route's waypoints
    for (const route of routes) {
      for (let i = 0; i < route.waypoints.length; i++) {
        const waypoint = route.waypoints[i];
        const waypointScreenPos = this.coords.yardsToPixels({
          x: waypoint.x,
          y: waypoint.y,
        });

        const dx = screenX - waypointScreenPos.x;
        const dy = screenY - waypointScreenPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= CLICK_TOLERANCE) {
          return { routeId: route.id, waypointIndex: i };
        }
      }
    }

    return null;
  }

  /**
   * Start editing a waypoint
   */
  startEditingWaypoint(routeId: string, waypointIndex: number): void {
    this.editingRouteId = routeId;
    this.editingWaypointIndex = waypointIndex;
    this.isDraggingWaypoint = true;
  }

  /**
   * Update waypoint position during drag
   * Returns the updated route or null
   */
  updateWaypointPosition(
    screenX: number,
    screenY: number,
    routes: Route[]
  ): Route | null {
    if (
      !this.isDraggingWaypoint ||
      this.editingRouteId === null ||
      this.editingWaypointIndex === null
    ) {
      return null;
    }

    // Find the route being edited
    const route = routes.find((r) => r.id === this.editingRouteId);
    if (!route) return null;

    // Convert screen coords (pixels) to yards
    const yardPos = this.coords.pixelsToYards({ x: screenX, y: screenY });

    // Create updated waypoints array
    const updatedWaypoints = [...route.waypoints];
    updatedWaypoints[this.editingWaypointIndex] = {
      x: yardPos.x,
      y: yardPos.y,
    };

    // Calculate updated distance
    let totalDistance = 0;
    for (let i = 0; i < updatedWaypoints.length - 1; i++) {
      const dx = updatedWaypoints[i + 1].x - updatedWaypoints[i].x;
      const dy = updatedWaypoints[i + 1].y - updatedWaypoints[i].y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
    }

    // Return updated route
    return {
      ...route,
      waypoints: updatedWaypoints,
      distance: Math.round(totalDistance),
    };
  }

  /**
   * Finish editing waypoint (on mouse up)
   */
  finishEditingWaypoint(): {
    routeId: string;
    waypointIndex: number;
  } | null {
    if (
      !this.isDraggingWaypoint ||
      this.editingRouteId === null ||
      this.editingWaypointIndex === null
    ) {
      return null;
    }

    const result = {
      routeId: this.editingRouteId,
      waypointIndex: this.editingWaypointIndex,
    };

    // Reset editing state
    this.editingRouteId = null;
    this.editingWaypointIndex = null;
    this.isDraggingWaypoint = false;

    return result;
  }

  /**
   * Cancel waypoint editing
   */
  cancelEditingWaypoint(): void {
    this.editingRouteId = null;
    this.editingWaypointIndex = null;
    this.isDraggingWaypoint = false;
  }

  /**
   * Check if currently editing a waypoint
   */
  getIsEditingWaypoint(): boolean {
    return this.isDraggingWaypoint;
  }

  /**
   * Get current editing state
   */
  getEditingState(): {
    routeId: string | null;
    waypointIndex: number | null;
    isDragging: boolean;
  } {
    return {
      routeId: this.editingRouteId,
      waypointIndex: this.editingWaypointIndex,
      isDragging: this.isDraggingWaypoint,
    };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.cancelDrawingRoute();
    this.cancelEditingWaypoint();
    this.clearRoutes();
    super.destroy();
  }
}
