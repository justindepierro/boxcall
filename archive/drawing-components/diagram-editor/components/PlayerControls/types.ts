/**
 * PlayerControls Types
 * Shared types and interfaces for the PlayerControls component system
 */

import type { DiagramPixiApp } from "../../core/PixiApp";

/**
 * Props for the main PlayerControls component
 */
export interface PlayerControlsProps {
  app: DiagramPixiApp | null;
  externalAlignment?: "left" | "middle" | "right";
}

/**
 * Alignment types for formations
 */
export type Alignment = "left" | "middle" | "right";

/**
 * Formation types for offense
 */
export type OffenseFormationType =
  | "spread2x2"
  | "spread3x1Right"
  | "spread3x1Left";

/**
 * Formation types for defense
 */
export type DefenseFormationType = "nickel425";

/**
 * Receiver positioning data
 */
export interface ReceiverPositions {
  leftOutside: number;
  leftSlot: number;
  rightSlot: number;
  rightOutside: number;
}

/**
 * 3x1 receiver positioning data
 */
export interface ReceiverPositions3x1 {
  left1?: number;
  left2?: number;
  left3?: number;
  single: number;
  right3?: number;
  right2?: number;
  right1?: number;
}

/**
 * Pending action for confirmation dialog
 */
export type PendingFormationAction = (() => void) | null;
