/**
 * Conflict Detection Utility
 *
 * Helpers for detecting and handling version conflicts in save operations.
 */

import {
  VersionConflictError,
  detectConflicts,
  type ConflictResolution,
} from "../types/saveConflict";
import type { Play } from "../types/play";
import type { Formation } from "../types/formation";

/**
 * Check if an error is a version conflict error
 */
export function isVersionConflict(
  error: unknown
): error is VersionConflictError {
  return error instanceof VersionConflictError;
}

/**
 * Detect conflicts in a Play update
 */
export function detectPlayConflicts(
  yourPlay: Partial<Play> & { id: string; version?: number },
  serverPlay: Play,
  onResolve: (
    strategy: Parameters<ConflictResolution["onResolve"]>[0],
    mergedData?: Play
  ) => void,
  onCancel: ConflictResolution["onCancel"]
): ConflictResolution<Record<string, unknown>> {
  const conflicts = detectConflicts(
    yourPlay as unknown as Record<string, unknown>,
    serverPlay as unknown as Record<string, unknown>
  );

  return {
    entityType: "play",
    entityId: yourPlay.id,
    yourVersion: yourPlay.version ?? 1,
    currentVersion: serverPlay.version ?? 1,
    yourData: yourPlay as unknown as Record<string, unknown>,
    currentData: serverPlay as unknown as Record<string, unknown>,
    conflicts,
    onResolve: onResolve as ConflictResolution["onResolve"],
    onCancel,
  };
}

/**
 * Detect conflicts in a Formation update
 */
export function detectFormationConflicts(
  yourFormation: Partial<Formation> & { id: string; version?: number },
  serverFormation: Formation,
  onResolve: (
    strategy: Parameters<ConflictResolution["onResolve"]>[0],
    mergedData?: Formation
  ) => void,
  onCancel: ConflictResolution["onCancel"]
): ConflictResolution<Record<string, unknown>> {
  const conflicts = detectConflicts(
    yourFormation as unknown as Record<string, unknown>,
    serverFormation as unknown as Record<string, unknown>
  );

  return {
    entityType: "formation",
    entityId: yourFormation.id,
    yourVersion: yourFormation.version ?? 1,
    currentVersion: serverFormation.version ?? 1,
    yourData: yourFormation as unknown as Record<string, unknown>,
    currentData: serverFormation as unknown as Record<string, unknown>,
    conflicts,
    onResolve: onResolve as ConflictResolution["onResolve"],
    onCancel,
  };
}

/**
 * Helper to throw version conflict errors from API responses
 *
 * Usage:
 * ```typescript
 * const { data, error } = await supabase
 *   .from('plays')
 *   .update(updates)
 *   .eq('id', playId)
 *   .eq('version', currentVersion)
 *   .select()
 *   .single();
 *
 * if (error || !data) {
 *   // Fetch current version to detect conflict
 *   const { data: current } = await supabase
 *     .from('plays')
 *     .select()
 *     .eq('id', playId)
 *     .single();
 *
 *   if (current && current.version !== currentVersion) {
 *     throw createVersionConflictError('play', playId, updates, current);
 *   }
 * }
 * ```
 */
export function createVersionConflictError<T extends { version?: number }>(
  entityType: string,
  entityId: string,
  yourData: T,
  serverData: T
): VersionConflictError {
  return new VersionConflictError(
    entityType,
    entityId,
    yourData.version ?? 1,
    serverData.version ?? 1,
    yourData as Record<string, unknown>,
    serverData as Record<string, unknown>
  );
}
