/**
 * Collaboration Context
 * React context for managing collaborative dashboard state
 *
 * Phase 2B Sprint 4: Live Dashboard Sharing
 */

import { createContext } from "react";
import { type UseCollaborationReturn } from "../../hooks/useCollaboration";
import { type ConflictResolution } from "@services/conflictResolution";

interface CollaborationContextValue extends UseCollaborationReturn {
  // Enhanced conflict resolution
  activeConflicts: ConflictResolution[];
  resolveConflictWithStrategy: (conflictId: string, strategy: string) => void;

  // Widget-level permissions
  getWidgetPermissions: (widgetId: string) => {
    canEdit: boolean;
    canMove: boolean;
    canDelete: boolean;
    isLocked: boolean;
    lockedBy?: string;
  };

  // Batch operations
  batchUpdates: (
    updates: Array<{ widgetId: string; data: Record<string, unknown> }>
  ) => void;
}

export const CollaborationContext =
  createContext<CollaborationContextValue | null>(null);

export type { CollaborationContextValue };
