/**
 * Realtime Sync Service - Real-time synchronization
 *
 * Handles real-time updates from Supabase and cross-device sync
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { CacheService } from "./CacheService";

export class RealtimeSyncService {
  private static supabase: SupabaseClient | null = null;

  /**
   * Initialize realtime sync service
   */
  static initialize(supabase: SupabaseClient): void {
    this.supabase = supabase;
  }

  /**
   * Setup real-time synchronization
   */
  static setupRealtimeSync(onTriggerBackup: () => void): void {
    if (!this.supabase) return;

    // Subscribe to play changes
    this.supabase
      .channel("plays-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "plays" },
        (payload) => {
          this.handleRealtimeUpdate("plays", payload, onTriggerBackup);
        }
      )
      .subscribe();

    // Subscribe to practice script changes
    this.supabase
      .channel("practice-scripts-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "practice_scripts" },
        (payload) => {
          this.handleRealtimeUpdate(
            "practice_scripts",
            payload,
            onTriggerBackup
          );
        }
      )
      .subscribe();

    console.info("✅ Real-time sync enabled");
  }

  /**
   * Handle real-time updates from other devices
   */
  private static handleRealtimeUpdate(
    table: string,
    payload: { eventType: string; new: unknown; old: unknown },
    onTriggerBackup: () => void
  ): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case "INSERT":
        CacheService.addToLocal(table, newRecord);
        this.showSyncNotification(
          `New ${table.slice(0, -1)} added by teammate`
        );
        break;

      case "UPDATE":
        CacheService.updateLocal(
          table,
          (newRecord as Record<string, unknown>).id as string,
          newRecord
        );
        this.showSyncNotification(`${table.slice(0, -1)} updated by teammate`);
        break;

      case "DELETE":
        CacheService.removeFromLocal(
          table,
          (oldRecord as Record<string, unknown>).id as string
        );
        this.showSyncNotification(`${table.slice(0, -1)} deleted by teammate`);
        break;
    }

    // Trigger automatic backup after external changes
    onTriggerBackup();
  }

  /**
   * Show sync notification to user
   */
  private static showSyncNotification(message: string): void {
    // Implementation for showing sync notifications
    console.info(`Sync notification: ${message}`);
  }
}
