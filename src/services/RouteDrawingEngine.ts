/**
 * Route Drawing Engine
 *
 * Handles route creation, editing, and visualization with NFL-standard styling
 * Supports drag-to-draw, color coding, snap-to-grid, and distance markers
 */

import type { FieldPosition, RouteType } from '../types/field';
import type { Route } from '../types/diagram';

// Local types
interface IDiagramCanvas {
  addRoute(route: Route): string;
  updateRoute(id: string, updates: Partial<Route>): void;
  removeRoute(id: string): void;
  selectRoute(id: string | null): void;
  onRouteDraw(callback: (route: Omit<Route, 'id'>) => void): void;
}

interface FormationPlayer {
  id: string;
  fieldPosition: FieldPosition;
}

// ============================================================================
// ROUTE DRAWING ENGINE
// ============================================================================

/** Route drawing and management system */
export class RouteDrawingEngine {
  private canvas: IDiagramCanvas | null;
  private routes: Map<string, Route> = new Map();
  private players: Map<string, FormationPlayer> = new Map();

  // Drawing state
  private isDrawing: boolean = false;
  private currentRoute: Partial<Route> | null = null;
  private drawingPlayerId: string | null = null;

  // Configuration
  private snapToGrid: boolean = true;
  private gridSize: number = 1; // yards

  // Callbacks
  private onRouteComplete?: (route: Route) => void;
  private onRouteUpdate?: (routeId: string, route: Route) => void;

  constructor(canvas?: IDiagramCanvas) {
    this.canvas = canvas || null;
    if (this.canvas) {
      this.setupCanvasCallbacks();
    }
  }

  /** Set canvas reference (for delayed initialization) */
  setCanvas(canvas: IDiagramCanvas): void {
    this.canvas = canvas;
    this.setupCanvasCallbacks();
  }

  // ============================================================================
  // ROUTE CRUD OPERATIONS
  // ============================================================================

  /** Add a route to the canvas */
  addRoute(route: Route): string {
    this.routes.set(route.id, route);
    if (!this.canvas) return route.id;
    return this.canvas.addRoute(route);
  }

  /** Update an existing route */
  updateRoute(id: string, updates: Partial<Route>): void {
    const existing = this.routes.get(id);
    if (!existing) return;

    const updated = { ...existing, ...updates };
    this.routes.set(id, updated);
    if (this.canvas) {
      this.canvas.updateRoute(id, updates);
    }

    this.onRouteUpdate?.(id, updated);
  }

  /** Remove a route */
  removeRoute(id: string): void {
    this.routes.delete(id);
    if (this.canvas) {
      this.canvas.removeRoute(id);
    }
  }

  /** Get route by ID */
  getRoute(id: string): Route | undefined {
    return this.routes.get(id);
  }

  /** Get all routes */
  getAllRoutes(): Route[] {
    return Array.from(this.routes.values());
  }

  /** Clear all routes */
  clearRoutes(): void {
    for (const id of this.routes.keys()) {
      if (this.canvas) {
        this.canvas.removeRoute(id);
      }
    }
    this.routes.clear();
  }

  // ============================================================================
  // DRAWING OPERATIONS
  // ============================================================================

  /** Start drawing a route from a player */
  startRouteDrawing(playerId: string, routeType: RouteType = 'primary'): void {
    const player = this.players.get(playerId);
    if (!player) return;

    this.isDrawing = true;
    this.drawingPlayerId = playerId;
    this.currentRoute = {
      playerId,
      type: routeType,
      path: [player.fieldPosition], // Start at player position
      name: this.getDefaultRouteName(routeType),
      depth: 0,
    };

    // Select the route for visual feedback
    if (this.canvas) {
      this.canvas.selectRoute(null); // Clear selection
    }
  }

  /** Add a point to the current route */
  addRoutePoint(position: FieldPosition): void {
    if (!this.isDrawing || !this.currentRoute) return;

    const snappedPosition = this.snapToGrid ? this.snapPosition(position) : position;
    this.currentRoute.path!.push(snappedPosition);

    // Update depth based on distance from start
    const startPos = this.currentRoute.path![0];
    this.currentRoute.depth = this.calculateDepth(startPos, snappedPosition);

    // Provide live feedback during drawing
    this.updateLiveRoute();
  }

  /** Finish drawing the current route */
  finishRouteDrawing(): Route | null {
    if (!this.isDrawing || !this.currentRoute || !this.drawingPlayerId) return null;

    // Ensure minimum route length
    if (this.currentRoute.path!.length < 2) {
      this.cancelRouteDrawing();
      return null;
    }

    // Create the complete route
    const route: Route = {
      id: `route-${Date.now()}`,
      playerId: this.drawingPlayerId,
      type: this.currentRoute.type!,
      path: this.currentRoute.path!,
      name: this.currentRoute.name,
      depth: this.currentRoute.depth,
    };

    // Add to canvas and storage
    this.addRoute(route);

    // Reset drawing state
    this.resetDrawingState();

    // Notify completion
    this.onRouteComplete?.(route);

    return route;
  }

  /** Cancel the current route drawing */
  cancelRouteDrawing(): void {
    this.resetDrawingState();
  }

  /** Update live route preview during drawing */
  private updateLiveRoute(): void {
    if (!this.currentRoute || !this.drawingPlayerId) return;

    // Create a temporary route for preview
    const previewRoute: Route = {
      id: 'preview-route',
      playerId: this.drawingPlayerId,
      type: this.currentRoute.type!,
      path: this.currentRoute.path!,
      name: this.currentRoute.name,
    };

    // Update or add preview route
    if (this.routes.has('preview-route')) {
      this.updateRoute('preview-route', previewRoute);
    } else {
      this.addRoute(previewRoute);
    }
  }

  /** Reset drawing state */
  private resetDrawingState(): void {
    this.isDrawing = false;
    this.currentRoute = null;
    this.drawingPlayerId = null;

    // Remove preview route
    if (this.routes.has('preview-route')) {
      this.removeRoute('preview-route');
    }
  }

  // ============================================================================
  // ROUTE EDITING
  // ============================================================================

  /** Edit an existing route by adding/removing points */
  editRoute(routeId: string, action: 'add' | 'remove' | 'move', pointIndex: number, position?: FieldPosition): void {
    const route = this.routes.get(routeId);
    if (!route) return;

    const newPath = [...route.path];

    switch (action) {
      case 'add':
        if (position && pointIndex >= 0 && pointIndex <= newPath.length) {
          const snappedPos = this.snapToGrid ? this.snapPosition(position) : position;
          newPath.splice(pointIndex, 0, snappedPos);
        }
        break;

      case 'remove':
        if (pointIndex > 0 && pointIndex < newPath.length - 1) { // Don't remove start/end points
          newPath.splice(pointIndex, 1);
        }
        break;

      case 'move':
        if (position && pointIndex >= 0 && pointIndex < newPath.length) {
          const snappedPos = this.snapToGrid ? this.snapPosition(position) : position;
          newPath[pointIndex] = snappedPos;
        }
        break;
    }

    // Update depth
    const depth = this.calculateDepth(newPath[0], newPath[newPath.length - 1]);

    this.updateRoute(routeId, { path: newPath, depth });
  }

  /** Change route type (primary, hot, check) */
  changeRouteType(routeId: string, newType: RouteType): void {
    const route = this.routes.get(routeId);
    if (!route) return;

    this.updateRoute(routeId, {
      type: newType,
      name: this.getDefaultRouteName(newType)
    });
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /** Snap position to grid */
  private snapPosition(position: FieldPosition): FieldPosition {
    return {
      x: Math.round(position.x / this.gridSize) * this.gridSize,
      y: Math.round(position.y / this.gridSize) * this.gridSize,
    };
  }

  /** Calculate route depth (distance from line of scrimmage) */
  private calculateDepth(startPos: FieldPosition, endPos: FieldPosition): number {
    // Depth is typically measured from the line of scrimmage
    // For simplicity, we'll use the maximum Y distance
    return Math.abs(endPos.y - startPos.y);
  }

  /** Get default route name based on type */
  private getDefaultRouteName(type: RouteType): string {
    switch (type) {
      case 'primary': return 'Route';
      case 'hot': return 'Hot Route';
      case 'check': return 'Check Route';
      default: return 'Route';
    }
  }

  /** Setup canvas event callbacks */
  private setupCanvasCallbacks(): void {
    if (!this.canvas) return;
    this.canvas.onRouteDraw((_route) => {
      // Handle route drawing completion from canvas
      if (this.isDrawing) {
        this.finishRouteDrawing();
      }
    });
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  /** Enable/disable snap to grid */
  setSnapToGrid(enabled: boolean): void {
    this.snapToGrid = enabled;
  }

  /** Set grid size in yards */
  setGridSize(size: number): void {
    this.gridSize = size;
  }

  /** Update player positions (for route validation) */
  updatePlayers(players: FormationPlayer[]): void {
    this.players.clear();
    players.forEach(player => {
      this.players.set(player.id, player);
    });
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  /** Validate route structure */
  validateRoute(route: Route): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Must have at least 2 points
    if (route.path.length < 2) {
      errors.push('Route must have at least 2 points');
    }

    // Must start at a player position
    const player = this.players.get(route.playerId);
    if (!player) {
      errors.push('Route must be assigned to a valid player');
    } else {
      const startDistance = this.getDistance(route.path[0], player.fieldPosition);
      if (startDistance > 0.1) { // Small tolerance for floating point
        errors.push('Route must start at player position');
      }
    }

    // Check for reasonable route length
    const totalLength = this.calculateRouteLength(route);
    if (totalLength > 50) { // Max 50 yards
      errors.push('Route is too long (max 50 yards)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /** Calculate total route length */
  private calculateRouteLength(route: Route): number {
    let totalLength = 0;
    for (let i = 1; i < route.path.length; i++) {
      totalLength += this.getDistance(route.path[i - 1], route.path[i]);
    }
    return totalLength;
  }

  /** Calculate distance between two points */
  private getDistance(pos1: FieldPosition, pos2: FieldPosition): number {
    return Math.sqrt(
      Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
    );
  }

  // ============================================================================
  // CALLBACKS
  // ============================================================================

  onRouteCompleted(callback: (route: Route) => void): void {
    this.onRouteComplete = callback;
  }

  onRouteUpdated(callback: (routeId: string, route: Route) => void): void {
    this.onRouteUpdate = callback;
  }
}

// ============================================================================
// ROUTE TEMPLATES & PRESETS
// ============================================================================

/** Common NFL route patterns */
export const ROUTE_TEMPLATES = {
  // Vertical routes
  slant: {
    name: 'Slant',
    path: (startY: number) => [
      { x: 0, y: startY },
      { x: 3, y: startY + 5 },
      { x: 8, y: startY + 8 },
    ]
  },

  post: {
    name: 'Post',
    path: (startY: number) => [
      { x: 0, y: startY },
      { x: 5, y: startY + 10 },
      { x: 15, y: startY + 20 },
    ]
  },

  go: {
    name: 'Go/Fly',
    path: (startY: number) => [
      { x: 0, y: startY },
      { x: 0, y: startY + 25 }, // Straight downfield
    ]
  },

  // Horizontal routes
  out: {
    name: 'Out',
    path: (startY: number) => [
      { x: 0, y: startY },
      { x: 10, y: startY },
      { x: 15, y: startY },
    ]
  },

  curl: {
    name: 'Curl',
    path: (startY: number) => [
      { x: 0, y: startY },
      { x: 8, y: startY + 3 },
      { x: 8, y: startY + 3 }, // Break point
    ]
  },

  // Intermediate routes
  dig: {
    name: 'Dig',
    path: (startY: number) => [
      { x: 0, y: startY },
      { x: 5, y: startY + 8 },
      { x: 12, y: startY + 12 },
    ]
  },

  comeback: {
    name: 'Comeback',
    path: (startY: number) => [
      { x: 0, y: startY },
      { x: 12, y: startY + 15 },
      { x: 8, y: startY + 15 }, // Come back to QB
    ]
  }
} as const;

/** Create route from template */
export function createRouteFromTemplate(
  templateKey: keyof typeof ROUTE_TEMPLATES,
  playerId: string,
  startPosition: FieldPosition,
  routeType: RouteType = 'primary'
): Omit<Route, 'id'> {
  const template = ROUTE_TEMPLATES[templateKey];
  const path = template.path(startPosition.y).map(point => ({
    x: startPosition.x + point.x,
    y: point.y
  }));

  return {
    playerId,
    type: routeType,
    path,
    name: template.name,
    depth: Math.max(...path.map(p => p.y - startPosition.y)),
  };
}