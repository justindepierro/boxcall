/**
 * Unified Diagram Data Models
 *
 * Single source of truth for all diagram/play data across BoxCall.
 * Consolidates planning and execution phases for Brian Billick methodology.
 */

import type { DiagramDocument, DiagramMetadata } from "./DiagramTypes";
import type { GameSituation, ExecutionResult } from "../../../../types/session";

// ================================================
// UNIFIED DIAGRAM DATA
// ================================================

/**
 * Unified diagram data - single source of truth for all diagram types
 */
export interface UnifiedDiagramData {
  id: string;
  type: 'play' | 'formation' | 'template';
  name: string;

  // Core diagram data (Pixi.js format)
  pixiData: DiagramDocument;

  // Metadata
  metadata: DiagramMetadata;

  // Execution history (links planning to execution)
  executionHistory?: LiveSessionData[];

  // Analytics & insights
  analytics?: DiagramAnalytics;

  // Version control
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// ================================================
// EXECUTION INTEGRATION
// ================================================

/**
 * Live session execution data for a specific diagram
 */
export interface LiveSessionData {
  sessionId: string;
  sessionType: 'practice' | 'game';
  executedAt: Date;

  // Game situation (for game sessions)
  gameSituation?: GameSituation;

  // Execution results
  routeExecutions: RouteExecution[];
  overallResult: ExecutionResult;

  // Performance metrics
  yardsGained?: number;
  timeToExecute?: number; // seconds
  notes?: string;
}

/**
 * Individual route execution within a play
 */
export interface RouteExecution {
  routeId: string;
  playerId: string;
  result: ExecutionResult;
  yardsGained?: number;
  wasTarget?: boolean; // Was this the primary target?
  notes?: string;
}

// ================================================
// ANALYTICS & INSIGHTS
// ================================================

/**
 * Analytics data for diagram performance
 */
export interface DiagramAnalytics {
  totalExecutions: number;
  successRate: number; // 0-100
  averageYards: number;

  // Route performance
  routeAnalytics: RouteAnalytics[];

  // Situational performance
  situationalPerformance: SituationalPerformance[];

  // Trends over time
  performanceTrend: PerformanceDataPoint[];
}

/**
 * Analytics for individual routes
 */
export interface RouteAnalytics {
  routeId: string;
  routeLabel?: string;
  totalExecutions: number;
  successRate: number;
  averageYards: number;
  targetRate: number; // How often this route was targeted
}

/**
 * Performance by game situation
 */
export interface SituationalPerformance {
  situationType: string; // "1st & 10", "3rd & Short", etc.
  executions: number;
  successRate: number;
  averageYards: number;
}

/**
 * Performance data point for trending
 */
export interface PerformanceDataPoint {
  date: Date;
  executions: number;
  successRate: number;
  averageYards: number;
}

// ================================================
// COMPONENT INTERFACES
// ================================================

/**
 * Base interface for all diagram components
 */
export interface DiagramComponent {
  data: UnifiedDiagramData;
  mode: 'edit' | 'view' | 'live' | 'analytics';
  onChange?: (data: UnifiedDiagramData) => void;
  interactive?: boolean;
  showAnalytics?: boolean;
}

/**
 * Props for diagram canvas components
 */
export interface DiagramCanvasProps extends DiagramComponent {
  width?: number;
  height?: number;
  backgroundColor?: number;
  showControls?: boolean;
  onReady?: () => void;
}

/**
 * Props for mini diagram displays (thumbnails, live sessions)
 */
export interface MiniDiagramProps {
  data: UnifiedDiagramData;
  size?: 'small' | 'medium' | 'large';
  highlightExecuted?: boolean;
  executedRoutes?: string[];
  showAnalytics?: boolean;
}

// ================================================
// LEGACY COMPATIBILITY
// ================================================

/**
 * Legacy diagram document (for migration)
 * @deprecated Use UnifiedDiagramData instead
 */
export interface LegacyDiagramDocument extends DiagramDocument {
  // Additional fields that were scattered across interfaces
  executionHistory?: LiveSessionData[];
  analytics?: DiagramAnalytics;
}

// ================================================
// UTILITY TYPES
// ================================================

/**
 * Diagram creation modes
 */
export type DiagramMode =
  | 'play'           // Full play creation/editing
  | 'formation'      // Formation creation/editing
  | 'quick-play'     // Simplified play creation
  | 'template'       // Template creation
  | 'live-session'   // Live execution mode
  | 'analytics'      // Analytics overlay mode;

/**
 * Diagram display contexts
 */
export type DiagramContext =
  | 'editor'         // Main diagram editor
  | 'viewer'         // Read-only viewer
  | 'thumbnail'      // Small preview
  | 'live-session'   // Live execution display
  | 'analytics'      // Analytics dashboard
  | 'print'          // Print/export format;

/**
 * Export types for diagrams
 */
export type DiagramExportFormat =
  | 'png'
  | 'svg'
  | 'pdf'
  | 'json'
  | 'gif';