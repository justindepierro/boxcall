/**
 * Web Worker Manager
 *
 * Manages Web Workers for offloading heavy computations from the main thread.
 * Provides a clean API for route calculations and collision detection.
 */

import type {
  RouteCalculationRequest,
  RouteCalculationResponse,
  CollisionDetectionRequest,
  CollisionDetectionResponse,
  WorkerRequest,
  WorkerResponse,
} from "./workers/workerTypes";

export class WebWorkerManager {
  private worker: Worker | null = null;
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (error: any) => void;
      timeout: NodeJS.Timeout;
    }
  >();

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker(): void {
    try {
      // Create worker from the routeWorker.ts file
      // Note: Vite will handle bundling this properly
      this.worker = new Worker(new URL("./routeWorker.ts", import.meta.url), {
        type: "module",
      });

      this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        this.handleWorkerResponse(e.data);
      };

      this.worker.onerror = (error) => {
        console.error("Web Worker error:", error);
        // Fallback to main thread processing if worker fails
        this.worker = null;
      };
    } catch (error) {
      console.warn(
        "Web Workers not supported, falling back to main thread:",
        error
      );
    }
  }

  private handleWorkerResponse(response: WorkerResponse): void {
    const pending = this.pendingRequests.get(response.id);
    if (!pending) return;

    clearTimeout(pending.timeout);
    this.pendingRequests.delete(response.id);

    if (response.type === "ERROR") {
      pending.reject(new Error((response as any).error));
    } else {
      pending.resolve(response);
    }
  }

  private sendRequest<T extends WorkerResponse>(
    request: WorkerRequest,
    timeoutMs = 5000
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (!this.worker) {
        // Fallback to main thread if worker not available
        reject(new Error("Web Worker not available"));
        return;
      }

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(request.id);
        reject(new Error("Worker request timeout"));
      }, timeoutMs);

      this.pendingRequests.set(request.id, { resolve, reject, timeout });
      this.worker.postMessage(request);
    });
  }

  /**
   * Calculate a route between two points, avoiding obstacles
   */
  async calculateRoute(
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number },
    obstacles: Array<{ x: number; y: number; radius: number }> = [],
    fieldBounds: { width: number; height: number },
    options?: RouteCalculationRequest["options"]
  ): Promise<Array<{ x: number; y: number }>> {
    const requestId = `route_${Date.now()}_${Math.random()}`;

    const request: RouteCalculationRequest = {
      type: "CALCULATE_ROUTE",
      id: requestId,
      startPoint,
      endPoint,
      obstacles,
      fieldBounds,
      options,
    };

    try {
      const response =
        await this.sendRequest<RouteCalculationResponse>(request);
      return response.route;
    } catch (error) {
      // Fallback to simple direct route calculation
      console.warn("Worker route calculation failed, using fallback:", error);
      return this.fallbackRouteCalculation(startPoint, endPoint);
    }
  }

  /**
   * Detect collisions between players and routes
   */
  async detectCollisions(
    players: Array<{ id: string; x: number; y: number; radius: number }>,
    routes: Array<{ id: string; points: Array<{ x: number; y: number }> }> = []
  ): Promise<
    Array<{
      type: "player-player" | "player-route" | "route-route";
      elements: string[];
      position?: { x: number; y: number };
    }>
  > {
    const requestId = `collision_${Date.now()}_${Math.random()}`;

    const request: CollisionDetectionRequest = {
      type: "DETECT_COLLISIONS",
      id: requestId,
      players,
      routes,
    };

    try {
      const response =
        await this.sendRequest<CollisionDetectionResponse>(request);
      return response.collisions;
    } catch (error) {
      // Fallback to simple collision detection
      console.warn("Worker collision detection failed, using fallback:", error);
      return this.fallbackCollisionDetection(players, routes);
    }
  }

  /**
   * Fallback route calculation for when Web Worker is unavailable
   */
  private fallbackRouteCalculation(
    start: { x: number; y: number },
    end: { x: number; y: number }
  ): Array<{ x: number; y: number }> {
    // Simple direct route
    return [start, end];
  }

  /**
   * Fallback collision detection for when Web Worker is unavailable
   */
  private fallbackCollisionDetection(
    players: Array<{ id: string; x: number; y: number; radius: number }>,
    routes: Array<{ id: string; points: Array<{ x: number; y: number }> }>
  ): Array<{
    type: "player-player" | "player-route" | "route-route";
    elements: string[];
    position?: { x: number; y: number };
  }> {
    const collisions: Array<{
      type: "player-player" | "player-route" | "route-route";
      elements: string[];
      position?: { x: number; y: number };
    }> = [];

    // Simple player-to-player collision detection
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const p1 = players[i];
        const p2 = players[j];
        const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

        if (distance < p1.radius + p2.radius) {
          collisions.push({
            type: "player-player",
            elements: [p1.id, p2.id],
            position: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 },
          });
        }
      }
    }

    return collisions;
  }

  /**
   * Terminate the worker and clean up resources
   */
  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    // Clear all pending requests
    for (const [id, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(new Error("Worker destroyed"));
    }
    this.pendingRequests.clear();
  }
}

// Singleton instance
let workerManagerInstance: WebWorkerManager | null = null;

export const getWorkerManager = (): WebWorkerManager => {
  if (!workerManagerInstance) {
    workerManagerInstance = new WebWorkerManager();
  }
  return workerManagerInstance;
};

export const destroyWorkerManager = (): void => {
  if (workerManagerInstance) {
    workerManagerInstance.destroy();
    workerManagerInstance = null;
  }
};
