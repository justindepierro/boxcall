/**
 * DataSyncService - Performance-optimized Supabase integration
 *
 * ⚠️ DEPRECATED FILE STRUCTURE - This file is kept for backward compatibility
 *
 * The DataSyncService has been split into focused modules in ./dataSyncService/:
 * - IndexedDBService: Local storage management
 * - CacheService: In-memory caching
 * - PlaysQueryService: Play queries and mutations
 * - BulkOperationsService: Bulk imports and operations
 * - BackupService: Automatic backups and exports
 * - RealtimeSyncService: Real-time synchronization
 * - DataSyncServiceOrchestrator: Main coordinator
 *
 * Please update imports to use the new modular structure:
 * ```typescript
 * import { DataSyncServiceOrchestrator as DataSyncService } from './dataSyncService';
 * ```
 */

import { DataSyncServiceOrchestrator } from "./dataSyncService/DataSyncServiceOrchestrator";

// Re-export the orchestrator as DataSyncService for backward compatibility
export { DataSyncServiceOrchestrator as DataSyncService };

// Export types
export type {
  CachedData,
  BackupData,
  SyncMetrics,
} from "./dataSyncService/types";
