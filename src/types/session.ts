/**
 * BoxCall Live Session Types
 * Stage 3: Practice & Game Session Tracking
 */

import type { Play } from "./play";
import type { Formation } from "./formation";

// ================================================
// ENUMS & CONSTANTS
// ================================================

export type SessionType = "practice" | "game";
export type SessionMode = "live" | "retroactive";
export type ExecutionResult = "success" | "failure" | "neutral" | "skipped";
export type HashMark = "left" | "middle" | "right";
export type OpponentCoverage =
  | "Cover 0"
  | "Cover 1"
  | "Cover 2"
  | "Cover 3"
  | "Cover 4"
  | "Cover 6"
  | "Man"
  | "Zone"
  | "Blitz"
  | "Unknown";

// ================================================
// GAME SITUATION
// ================================================

export interface GameSituation {
  quarter: number; // 1-4
  timeRemaining: string; // "15:00"
  down: number; // 1-4
  distance: number; // yards to first down
  yardLine: number; // 0-100
  hashMark: HashMark; // left/middle/right
  opponentCoverage?: OpponentCoverage; // Phase 13.2: What defense are they in?
}

// ================================================
// BASE SESSION INTERFACE
// ================================================

export interface BaseSession {
  id: string;
  teamId: string;
  sessionMode: SessionMode;
  startedAt: Date;
  endedAt?: Date;
  notes?: string;
  weather?: string;
  fieldConditions?: string;
  recordedBy?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ================================================
// PRACTICE SESSION
// ================================================

export interface PracticeSession extends BaseSession {
  type: "practice";
  practiceScriptId?: string;
  sessionDate: Date;

  // Stats
  totalPlays: number;
  totalReps: number;
  completedReps: number;
  successfulReps: number;
  failedReps: number;
  neutralReps: number;
  successRate: number; // 0-100
  durationMinutes?: number;

  // Optional: Loaded script data (from join)
  practiceScript?: {
    id: string;
    title: string;
    description?: string;
    plays: Array<{
      id: string;
      playId: string;
      play: Play;
      repetitions: number;
      order: number;
      notes?: string;
      // Phase 3: Include diagram data for live session display
      diagramData?: {
        id: string;
        type: "play" | "formation" | "template";
        pixiData: any; // DiagramDocument
        metadata: any;
      };
    }>;
  };
}

// ================================================
// GAME SESSION
// ================================================

export interface GameSession extends BaseSession {
  type: "game";
  gamePlanId?: string;
  gameDate: Date;
  opponent: string;
  isHomeGame: boolean;

  // Score
  teamScore?: number;
  opponentScore?: number;

  // Stats
  totalPlays: number;
  successfulPlays: number;
  failedPlays: number;
  neutralPlays: number;
  successRate: number; // 0-100
  totalYards: number;
  totalTouchdowns: number;
  totalTurnovers: number;

  // Optional: Loaded game plan data (from join)
  gamePlan?: {
    id: string;
    name: string;
    opponent: string;
    gameDate?: string;
    gameLocation?: string;
    situations: Array<{
      id: string;
      situationType: string;
      plays: Array<{
        id: string;
        playId: string;
        playName: string;
        priority: number;
      }>;
    }>;
  };
}

// ================================================
// UNIFIED SESSION TYPE
// ================================================

export type Session = PracticeSession | GameSession;

// ================================================
// PLAY EXECUTION
// ================================================

export interface PlayExecution {
  id: string;

  // Session reference (one will be set)
  practiceSessionId?: string;
  gameSessionId?: string;

  // Play reference
  playId: string;
  formationId?: string;

  // Diagram data reference (Phase 3: Live Session Integration)
  diagramData?: {
    id: string;
    type: "play" | "formation" | "template";
    version: number;
  };

  // Route-level execution tracking (Phase 3)
  routeExecutions?: Array<{
    routeId: string;
    result: ExecutionResult;
    notes?: string;
    executedAt: Date;
  }>;

  // Result
  result: ExecutionResult;
  yardsGained?: number; // Required for game, optional for practice

  // Game context (only for game sessions)
  quarter?: number; // 1-4
  timeRemaining?: string; // "8:42"
  down?: number; // 1-4
  distance?: number; // yards to first down
  yardLine?: number; // 0-100 (0 = own goal, 50 = midfield, 100 = opponent goal)
  hashMark?: HashMark;
  opponentCoverage?: OpponentCoverage; // Phase 13.2: Defensive coverage faced

  // Practice context (only for practice sessions)
  repNumber?: number; // Which rep in sequence (1-10)

  // Play outcome details
  wasTouchdown: boolean;
  wasTurnover: boolean;
  wasPenalty: boolean;
  penaltyYards?: number;

  // Notes
  notes?: string;
  quickTags?: string[]; // e.g., ['good_timing', 'missed_block', 'great_throw']

  // Confidence tracking (Phase 11)
  confidenceBefore?: number; // 0-100
  confidenceAfter?: number; // 0-100

  // Timestamps
  executedAt: Date;

  // Metadata
  teamId: string;
  recordedBy?: string;
  recordedMode: SessionMode;
  createdAt: Date;

  // Optional: Joined play data
  play?: Play;
  formation?: Formation;
}

// ================================================
// CREATE/UPDATE PAYLOADS
// ================================================

export interface CreatePracticeSessionData {
  teamId: string;
  practiceScriptId?: string;
  sessionMode: SessionMode;
  sessionDate: Date;
  startedAt?: Date;
  notes?: string;
  weather?: string;
  fieldConditions?: string;
}

export interface CreateGameSessionData {
  teamId: string;
  gamePlanId?: string;
  sessionMode: SessionMode;
  gameDate: Date;
  opponent: string;
  isHomeGame: boolean;
  startedAt?: Date;
  notes?: string;
  weather?: string;
  fieldConditions?: string;
}

export interface UpdateSessionData {
  endedAt?: Date;
  notes?: string;
  weather?: string;
  fieldConditions?: string;
  isArchived?: boolean;
  // Game-specific
  teamScore?: number;
  opponentScore?: number;
}

export interface CreatePlayExecutionData {
  // Session reference (one required)
  practiceSessionId?: string;
  gameSessionId?: string;

  // Play reference
  playId: string;
  formationId?: string;

  // Result
  result: ExecutionResult;
  yardsGained?: number;

  // Game context
  quarter?: number;
  timeRemaining?: string;
  down?: number;
  distance?: number;
  yardLine?: number;
  hashMark?: HashMark;
  opponentCoverage?: OpponentCoverage; // Phase 13.2

  // Practice context
  repNumber?: number;

  // Outcome details
  wasTouchdown?: boolean;
  wasTurnover?: boolean;
  wasPenalty?: boolean;
  penaltyYards?: number;

  // Notes
  notes?: string;
  quickTags?: string[];

  // Metadata
  teamId: string;
  recordedMode: SessionMode;
  executedAt?: Date;
}

// ================================================
// SESSION STATE (for UI)
// ================================================

export interface SessionState {
  // Session metadata
  sessionId?: string;
  sessionType?: SessionType;
  sessionMode: SessionMode;
  isActive: boolean;
  isPaused: boolean;

  // Loaded content
  practiceScript?: PracticeSession["practiceScript"];
  gamePlan?: GameSession["gamePlan"];

  // Current execution context
  currentPlayIndex: number;
  currentRepNumber: number;

  // Game-specific state
  currentQuarter?: number;
  currentDown?: number;
  currentDistance?: number;
  currentYardLine?: number;
  currentHashMark?: HashMark;

  // Execution history (in-memory for current session)
  executions: PlayExecution[];

  // Stats (calculated from executions)
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  neutralExecutions: number;
  skippedExecutions: number;
  successRate: number;

  // Timestamps
  startedAt?: Date;
  lastSavedAt?: Date;
}

// ================================================
// OFFLINE QUEUE
// ================================================

export interface OfflineExecution {
  id: string; // Temporary UUID for tracking
  execution: CreatePlayExecutionData;
  timestamp: Date;
  synced: boolean;
  syncError?: string;
}

export interface OfflineQueue {
  executions: OfflineExecution[];
  lastSyncAttempt?: Date;
  pendingCount: number;
}

// ================================================
// SESSION FILTERS & QUERIES
// ================================================

export interface SessionFilters {
  teamId?: string;
  sessionType?: SessionType;
  sessionMode?: SessionMode;
  startDate?: Date;
  endDate?: Date;
  isArchived?: boolean;
  limit?: number;
  offset?: number;
}

export interface ExecutionFilters {
  playId?: string;
  formationId?: string;
  result?: ExecutionResult;
  sessionId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// ================================================
// ANALYTICS TYPES (Phase 11)
// ================================================

export interface ExecutionStats {
  playId: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  neutralExecutions: number;
  successRate: number;
  avgYardsGained?: number;
  touchdowns: number;
  turnovers: number;
  lastExecuted?: Date;
  recentTrend?: "hot" | "cold" | "stable";
}

export interface SituationalStats {
  playId: string;
  situationType: string; // e.g., "third_and_short", "red_zone"
  totalExecutions: number;
  successRate: number;
  avgYardsGained?: number;
  sampleSize: number;
}

// ================================================
// TYPE GUARDS
// ================================================

export function isPracticeSession(
  session: Session
): session is PracticeSession {
  return session.type === "practice";
}

export function isGameSession(session: Session): session is GameSession {
  return session.type === "game";
}

export function isPracticeExecution(
  execution: PlayExecution
): execution is PlayExecution & {
  practiceSessionId: string;
  repNumber: number;
} {
  return execution.practiceSessionId !== undefined;
}

export function isGameExecution(
  execution: PlayExecution
): execution is PlayExecution & {
  gameSessionId: string;
  quarter: number;
  down: number;
  distance: number;
} {
  return execution.gameSessionId !== undefined;
}
