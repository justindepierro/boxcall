/**
 * Web Worker Types
 *
 * Shared type definitions for Web Worker communication
 */

export interface RouteCalculationRequest {
  type: 'CALCULATE_ROUTE';
  id: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  obstacles: Array<{ x: number; y: number; radius: number }>;
  fieldBounds: { width: number; height: number };
  options?: {
    maxSegments?: number;
    smoothness?: number;
    avoidObstacles?: boolean;
  };
}

export interface RouteCalculationResponse {
  type: 'ROUTE_CALCULATED';
  id: string;
  route: Array<{ x: number; y: number }>;
  success: boolean;
  error?: string;
}

export interface CollisionDetectionRequest {
  type: 'DETECT_COLLISIONS';
  id: string;
  players: Array<{ id: string; x: number; y: number; radius: number }>;
  routes: Array<{ id: string; points: Array<{ x: number; y: number }> }>;
}

export interface CollisionDetectionResponse {
  type: 'COLLISIONS_DETECTED';
  id: string;
  collisions: Array<{
    type: 'player-player' | 'player-route' | 'route-route';
    elements: string[];
    position?: { x: number; y: number };
  }>;
}

export interface WorkerErrorResponse {
  type: 'ERROR';
  id: string;
  error: string;
}

export type WorkerRequest = RouteCalculationRequest | CollisionDetectionRequest;
export type WorkerResponse = RouteCalculationResponse | CollisionDetectionResponse | WorkerErrorResponse;