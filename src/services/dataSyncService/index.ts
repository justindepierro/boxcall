/**
 * DataSync Service Module
 *
 * Modular data synchronization system split into focused services:
 * - IndexedDBService: Local storage management
 * - CacheService: In-memory caching
 * - PlaysQueryService: Play queries and mutations
 * - BulkOperationsService: Bulk imports and operations
 * - BackupService: Automatic backups and exports
 * - RealtimeSyncService: Real-time synchronization
 * - DataSyncServiceOrchestrator: Main coordinator
 */

// Export types
export type { CachedData, BackupData, SyncMetrics } from "./types";

// Export individual services
export { IndexedDBService } from "./IndexedDBService";
export { CacheService } from "./CacheService";
export { PlaysQueryService } from "./PlaysQueryService";
export { BulkOperationsService } from "./BulkOperationsService";
export { BackupService } from "./BackupService";
export { RealtimeSyncService } from "./RealtimeSyncService";

// Export main orchestrator
export { DataSyncServiceOrchestrator } from "./DataSyncServiceOrchestrator";

// Back-compat alias for existing imports (e.g. `import { DataSyncService } from "@services"`)
export { DataSyncServiceOrchestrator as DataSyncService } from "./DataSyncServiceOrchestrator";
