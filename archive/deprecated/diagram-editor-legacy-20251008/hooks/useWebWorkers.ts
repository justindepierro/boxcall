/**
 * useWebWorkers Hook
 *
 * React hook for using Web Workers in React components.
 * Provides easy access to route calculations and collision detection.
 */

import { useCallback, useRef, useEffect } from 'react';
import { getWorkerManager, destroyWorkerManager } from '../components/WebWorkerManager';

export interface UseWebWorkersReturn {
  calculateRoute: (
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number },
    obstacles?: Array<{ x: number; y: number; radius: number }>,
    fieldBounds?: { width: number; height: number },
    options?: {
      maxSegments?: number;
      smoothness?: number;
      avoidObstacles?: boolean;
    }
  ) => Promise<Array<{ x: number; y: number }>>;

  detectCollisions: (
    players: Array<{ id: string; x: number; y: number; radius: number }>,
    routes?: Array<{ id: string; points: Array<{ x: number; y: number }> }>
  ) => Promise<Array<{
    type: 'player-player' | 'player-route' | 'route-route';
    elements: string[];
    position?: { x: number; y: number };
  }>>;

  isWorkerAvailable: boolean;
}

export const useWebWorkers = (): UseWebWorkersReturn => {
  const workerManagerRef = useRef<ReturnType<typeof getWorkerManager> | null>(null);

  // Initialize worker manager on mount
  useEffect(() => {
    workerManagerRef.current = getWorkerManager();

    // Cleanup on unmount
    return () => {
      if (workerManagerRef.current) {
        destroyWorkerManager();
        workerManagerRef.current = null;
      }
    };
  }, []);

  const calculateRoute = useCallback(async (
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number },
    obstacles: Array<{ x: number; y: number; radius: number }> = [],
    fieldBounds: { width: number; height: number } = { width: 53.333, height: 35 },
    options?: {
      maxSegments?: number;
      smoothness?: number;
      avoidObstacles?: boolean;
    }
  ): Promise<Array<{ x: number; y: number }>> => {
    if (!workerManagerRef.current) {
      // Fallback to direct calculation
      return [startPoint, endPoint];
    }

    return workerManagerRef.current.calculateRoute(
      startPoint,
      endPoint,
      obstacles,
      fieldBounds,
      options
    );
  }, []);

  const detectCollisions = useCallback(async (
    players: Array<{ id: string; x: number; y: number; radius: number }>,
    routes: Array<{ id: string; points: Array<{ x: number; y: number }> }> = []
  ): Promise<Array<{
    type: 'player-player' | 'player-route' | 'route-route';
    elements: string[];
    position?: { x: number; y: number };
  }>> => {
    if (!workerManagerRef.current) {
      // Fallback to simple collision detection
      const collisions: Array<{
        type: 'player-player' | 'player-route' | 'route-route';
        elements: string[];
        position?: { x: number; y: number };
      }> = [];

      // Simple player-to-player collision detection
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

      return collisions;
    }

    return workerManagerRef.current.detectCollisions(players, routes);
  }, []);

  const isWorkerAvailable = workerManagerRef.current !== null;

  return {
    calculateRoute,
    detectCollisions,
    isWorkerAvailable
  };
};