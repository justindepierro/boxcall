/**
 * Save Conflict Types
 *
 * Defines conflict detection and resolution types for the Universal Save System.
 * Used when concurrent edits happen to the same entity.
 */

/**
 * Conflict error thrown when version mismatch detected
 */
export class VersionConflictError extends Error {
  constructor(
    public entityType: string,
    public entityId: string,
    public yourVersion: number,
    public currentVersion: number,
    public yourData: Record<string, unknown>,
    public currentData: Record<string, unknown>
  ) {
    super(`Version conflict detected for ${entityType} ${entityId}`);
    this.name = "VersionConflictError";
  }
}

/**
 * Conflict resolution strategy
 */
export type ConflictResolutionStrategy =
  | "keep-mine" // Overwrite with local changes
  | "use-theirs" // Discard local changes, use server version
  | "merge"; // Attempt to merge non-conflicting fields

/**
 * Field-level conflict
 */
export interface FieldConflict {
  field: string;
  yourValue: unknown;
  theirValue: unknown;
  canAutoMerge: boolean; // TRUE if values are identical
}

/**
 * Conflict resolution context
 */
export interface ConflictResolution<T = Record<string, unknown>> {
  entityType: "play" | "formation" | "team" | "personnel" | "other";
  entityId: string;
  yourVersion: number;
  currentVersion: number;
  yourData: T;
  currentData: T;
  conflicts: FieldConflict[];
  onResolve: (strategy: ConflictResolutionStrategy, mergedData?: T) => void;
  onCancel: () => void;
}

/**
 * Versionable entity (optimistic locking)
 */
export interface VersionedEntity {
  id: string;
  version: number;
  updated_at: Date | string;
}

/**
 * Helper to detect conflicts between two versions
 */
export function detectConflicts<T extends Record<string, unknown>>(
  yours: T,
  theirs: T,
  excludeFields: string[] = ["id", "version", "created_at", "updated_at"]
): FieldConflict[] {
  const conflicts: FieldConflict[] = [];

  // Get all unique keys from both objects
  const allKeys = new Set([...Object.keys(yours), ...Object.keys(theirs)]);

  for (const key of allKeys) {
    // Skip excluded fields
    if (excludeFields.includes(key)) continue;

    const yourValue = yours[key];
    const theirValue = theirs[key];

    // Only add if values differ
    if (JSON.stringify(yourValue) !== JSON.stringify(theirValue)) {
      conflicts.push({
        field: key,
        yourValue,
        theirValue,
        canAutoMerge: false, // Could add smart merge logic here
      });
    }
  }

  return conflicts;
}

/**
 * Helper to merge data based on strategy
 */
export function mergeConflictData<T extends Record<string, unknown>>(
  strategy: ConflictResolutionStrategy,
  yours: T,
  theirs: T
): T {
  switch (strategy) {
    case "keep-mine":
      return { ...yours };
    case "use-theirs":
      return { ...theirs };
    case "merge":
      // Simple merge: your changes win for conflicts, but include new theirs fields
      return { ...theirs, ...yours };
  }
}
