/**
 * Route Calculation Web Worker
 *
 * Handles computationally intensive route calculations off the main thread
 * to prevent UI blocking during complex pathfinding operations.
 */

import type {
  RouteCalculationRequest,
  RouteCalculationResponse,
  CollisionDetectionRequest,
  CollisionDetectionResponse,
  WorkerRequest,
  WorkerResponse
} from './workerTypes';

// A* pathfinding implementation for route calculation
class AStarPathfinder {
  private gridSize = 1; // 1 yard grid resolution

  calculateRoute(
    start: { x: number; y: number },
    end: { x: number; y: number },
    obstacles: Array<{ x: number; y: number; radius: number }>,
    fieldBounds: { width: number; height: number },
    options: RouteCalculationRequest['options'] = {}
  ): Array<{ x: number; y: number }> {
    const { maxSegments = 20, smoothness = 0.5, avoidObstacles = true } = options;

    // Simple direct route for now - can be enhanced with A* later
    const route: Array<{ x: number; y: number }> = [];

    if (!avoidObstacles) {
      // Direct line
      route.push(start);
      route.push(end);
    } else {
      // Simple curved route avoiding obstacles
      route.push(start);

      // Add intermediate points to create a curved path
      const segments = Math.min(maxSegments, 10);
      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const controlX = start.x + (end.x - start.x) * t;
        const controlY = start.y + (end.y - start.y) * t;

        // Add some curvature
        const offset = Math.sin(t * Math.PI) * smoothness * 5;
        const perpX = -(end.y - start.y) / this.distance(start, end) * offset;
        const perpY = (end.x - start.x) / this.distance(start, end) * offset;

        route.push({
          x: controlX + perpX,
          y: controlY + perpY
        });
      }

      route.push(end);
    }

    return route;
  }

  private distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }
}

// Collision detection implementation
class CollisionDetector {
  detectCollisions(
    players: Array<{ id: string; x: number; y: number; radius: number }>,
    routes: Array<{ id: string; points: Array<{ x: number; y: number }> }>
  ): Array<{
    type: 'player-player' | 'player-route' | 'route-route';
    elements: string[];
    position?: { x: number; y: number };
  }> {
    const collisions: Array<{
      type: 'player-player' | 'player-route' | 'route-route';
      elements: string[];
      position?: { x: number; y: number };
    }> = [];

    // Player-to-player collisions
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const p1 = players[i];
        const p2 = players[j];
        const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

        if (distance < (p1.radius + p2.radius)) {
          collisions.push({
            type: 'player-player',
            elements: [p1.id, p2.id],
            position: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
          });
        }
      }
    }

    // Player-to-route collisions
    players.forEach(player => {
      routes.forEach(route => {
        route.points.forEach((point, index) => {
          if (index < route.points.length - 1) {
            const nextPoint = route.points[index + 1];
            const distance = this.pointToLineDistance(
              { x: player.x, y: player.y },
              point,
              nextPoint
            );

            if (distance < player.radius) {
              collisions.push({
                type: 'player-route',
                elements: [player.id, route.id],
                position: point
              });
            }
          }
        });
      });
    });

    return collisions;
  }

  private pointToLineDistance(
    point: { x: number; y: number },
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number }
  ): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;
    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

// Worker message handler
const pathfinder = new AStarPathfinder();
const collisionDetector = new CollisionDetector();

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const request = e.data;

  try {
    switch (request.type) {
      case 'CALCULATE_ROUTE': {
        const route = pathfinder.calculateRoute(
          request.startPoint,
          request.endPoint,
          request.obstacles,
          request.fieldBounds,
          request.options
        );

        const response: RouteCalculationResponse = {
          type: 'ROUTE_CALCULATED',
          id: request.id,
          route,
          success: true
        };

        self.postMessage(response);
        break;
      }

      case 'DETECT_COLLISIONS': {
        const collisions = collisionDetector.detectCollisions(
          request.players,
          request.routes
        );

        const response: CollisionDetectionResponse = {
          type: 'COLLISIONS_DETECTED',
          id: request.id,
          collisions
        };

        self.postMessage(response);
        break;
      }

      default:
        throw new Error(`Unknown request type: ${(request as any).type}`);
    }
  } catch (error) {
    // Send error response
    self.postMessage({
      type: 'ERROR',
      id: request.id || 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Export types for main thread usage
export type { WorkerRequest, WorkerResponse };