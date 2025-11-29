/**
 * Library Types
 *
 * Shared types for Formation and Personnel Library systems
 */

/**
 * Library item status
 */
export type LibraryItemStatus = "draft" | "active" | "archived";

/**
 * Sync status for library items
 */
export type SyncStatus = "synced" | "pending" | "error" | "conflict";

/**
 * Confidence level for intelligence-derived data
 */
export type ConfidenceLevel = "high" | "medium" | "low" | "unknown";

/**
 * Analysis result for a single field
 */
export interface FieldAnalysis<T> {
  value: T;
  count: number; // Number of plays with this value
  percentage: number; // Percentage of plays (0-100)
  confidence: ConfidenceLevel;
}

/**
 * Intelligence analysis summary
 */
export interface IntelligenceAnalysis {
  total_plays: number;
  analyzed_at: string; // ISO timestamp
  formation_type?: FieldAnalysis<string>;
  run_strength?: FieldAnalysis<string>;
  pass_strength?: FieldAnalysis<string>;
  personnel?: FieldAnalysis<string>;
  confidence_score: number; // Overall confidence (0-100)
  warnings: string[]; // Inconsistencies found
}

/**
 * Opposite formation detection result
 */
export interface OppositeDetection {
  formation_id: string;
  formation_name: string;
  opposite_id: string;
  opposite_name: string;
  match_confidence: "high" | "medium" | "low";
  match_reason: string; // e.g., "Rip↔Liz pattern", "Left↔Right keywords"
}

/**
 * Sync operation result
 */
export interface SyncResult {
  success: boolean;
  affected_plays: number;
  errors: Array<{ play_id: string; error: string }>;
  warnings: string[];
}

/**
 * Library item with relationship tracking
 */
export interface LibraryItem {
  id: string;
  name: string;
  status: LibraryItemStatus;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Validation error detail
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult<T> {
  success: boolean;
  processed: number;
  succeeded: number;
  failed: number;
  items: Array<{ item: T; success: boolean; error?: string }>;
}

/**
 * Filter options for library queries
 */
export interface LibraryFilterOptions {
  search?: string;
  status?: LibraryItemStatus[];
  min_usage?: number;
  has_opposite?: boolean;
  confidence_min?: number;
  limit?: number;
  offset?: number;
  sort_by?: "name" | "usage" | "created_at" | "confidence";
  sort_order?: "asc" | "desc";
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

/**
 * Paginated library response
 */
export interface PaginatedLibraryResponse<T> {
  items: T[];
  meta: PaginationMeta;
}
