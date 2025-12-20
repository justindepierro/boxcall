/**
 * DataSyncService - Main orchestrator for data synchronization
 *
 * Provides bulletproof data management with:
 * - Sub-100ms response times through smart caching
 * - Automatic local backups every 5 minutes
 * - Offline-first architecture
 * - Real-time sync across devices
 * - Zero data loss tolerance
 *
 * This is the main entry point that coordinates all sync services.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Play } from "../../types/play";
import type { SyncMetrics } from "./types";

// Import all service modules
import { IndexedDBService } from "./IndexedDBService";
import { CacheService } from "./CacheService";
import { PlaysQueryService } from "./PlaysQueryService";
import { BulkOperationsService } from "./BulkOperationsService";
import { BackupService } from "./BackupService";
import { RealtimeSyncService } from "./RealtimeSyncService";
import { debug } from "../../utils/logger";

export class DataSyncServiceOrchestrator {
  private static supabase: SupabaseClient | null = null;
  private static initialized = false;

  /**
   * Initialize the data sync service
   */
  static async initialize(): Promise<void> {
    if (this.initialized) return;

    // Initialize Supabase - Use existing client
    if (!this.supabase) {
      const { supabase: existingClient } = await import("../../lib/supabase");
      this.supabase = existingClient;
    }

    // Initialize all sub-services
    await IndexedDBService.initialize();
    BackupService.initialize(this.supabase);
    RealtimeSyncService.initialize(this.supabase);

    // Start automatic backup system
    BackupService.startAutomaticBackups();

    // Setup real-time subscriptions
    RealtimeSyncService.setupRealtimeSync(() => BackupService.triggerBackup());

    this.initialized = true;

    debug("[DataSyncService] Initialized");
  }

  /**
   * Ensure service is initialized before operations
   */
  private static async ensureInitialized(): Promise<void> {
    if (!this.initialized || !this.supabase) {
      debug("[DataSyncService] Not initialized; initializing now...");
      await this.initialize();
    }
  }

  // ============================================================================
  // QUERY OPERATIONS - Delegated to PlaysQueryService
  // ============================================================================

  /**
   * Get plays with 3-layer caching for sub-100ms response
   */
  static async getPlays(playbookId: string, useCache = true): Promise<Play[]> {
    await this.ensureInitialized();
    return PlaysQueryService.getPlays(this.supabase!, playbookId, useCache);
  }

  /**
   * Update play with optimistic UI updates
   */
  static async updatePlay(
    playId: string,
    updates: Partial<Play>
  ): Promise<void> {
    await this.ensureInitialized();
    return PlaysQueryService.updatePlay(playId, updates, () =>
      BackupService.triggerBackup()
    );
  }

  /**
   * Create play with optimistic creation
   */
  static async createPlay(
    play: Omit<Play, "id" | "created_at" | "updated_at">
  ): Promise<Play> {
    await this.ensureInitialized();
    return PlaysQueryService.createPlay(play, () =>
      BackupService.triggerBackup()
    );
  }

  // ============================================================================
  // BULK OPERATIONS - Delegated to BulkOperationsService
  // ============================================================================

  /**
   * Bulk create plays from CSV import
   */
  static async bulkCreatePlays(
    playbookId: string,
    plays: Omit<Play, "id" | "created_at" | "updated_at" | "created_by">[]
  ): Promise<{
    success: boolean;
    created: Play[];
    errors: string[];
    totalProcessed: number;
  }> {
    await this.ensureInitialized();
    return BulkOperationsService.bulkCreatePlays(playbookId, plays);
  }

  /**
   * Import plays from CSV content
   */
  static async importFromCSV(
    playbookId: string,
    csvContent: string
  ): Promise<{
    success: boolean;
    totalRows: number;
    importedPlays: number;
    errors: string[];
    created: Play[];
  }> {
    await this.ensureInitialized();
    return BulkOperationsService.importFromCSV(playbookId, csvContent);
  }

  // ============================================================================
  // BACKUP OPERATIONS - Delegated to BackupService
  // ============================================================================

  /**
   * Export comprehensive backup as downloadable files
   */
  static async exportComprehensiveBackup(teamId: string): Promise<void> {
    await this.ensureInitialized();
    return BackupService.exportComprehensiveBackup(teamId);
  }

  // ============================================================================
  // METRICS & UTILITIES
  // ============================================================================

  /**
   * Get performance metrics
   */
  static getMetrics(): SyncMetrics {
    return CacheService.getMetrics();
  }

  /**
   * Cleanup service
   */
  static cleanup(): void {
    BackupService.stopAutomaticBackups();
    IndexedDBService.close();
    CacheService.clear();
    this.initialized = false;
    debug("[DataSyncService] Cleaned up");
  }
}
