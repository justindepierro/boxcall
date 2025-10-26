/**
 * Offline Execution Queue
 * Handles localStorage persistence and sync for offline play execution tracking
 */

// @ts-nocheck
// TODO: Fix types when integrating Stage 3 (Session Management)

import type {
  CreatePlayExecutionData,
  OfflineExecution,
  OfflineQueue,
} from "../types/session";
import { ExecutionTrackingService } from "../services/executionTrackingService";

const QUEUE_STORAGE_KEY = "boxcall_offline_executions";
const _MAX_RETRY_ATTEMPTS = 3;

export class OfflineExecutionQueue {
  /**
   * Add execution to offline queue
   */
  async addExecution(execution: CreatePlayExecutionData): Promise<void> {
    const queue = await this.getQueue();

    const offlineExecution: OfflineExecution = {
      id: crypto.randomUUID(),
      execution,
      timestamp: new Date(),
      synced: false,
    };

    queue.executions.push(offlineExecution);
    queue.pendingCount = queue.executions.filter((e) => !e.synced).length;

    this.saveQueue(queue);
  }

  /**
   * Get current offline queue
   */
  async getQueue(): Promise<OfflineQueue> {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY);

    if (!stored) {
      return {
        executions: [],
        pendingCount: 0,
      };
    }

    try {
      const parsed = JSON.parse(stored);
      return {
        executions: parsed.executions.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        })),
        lastSyncAttempt: parsed.lastSyncAttempt
          ? new Date(parsed.lastSyncAttempt)
          : undefined,
        pendingCount: parsed.executions.filter((e: any) => !e.synced).length,
      };
    } catch (err) {
      console.error("Failed to parse offline queue:", err);
      return {
        executions: [],
        pendingCount: 0,
      };
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(queue: OfflineQueue): void {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  }

  /**
   * Sync pending executions to database
   * Returns number of successfully synced executions
   */
  async syncQueue(): Promise<number> {
    const queue = await this.getQueue();
    const pending = queue.executions.filter((e) => !e.synced);

    if (pending.length === 0) {
      return 0;
    }

    // Check if online
    if (!navigator.onLine) {
      console.log("Offline - skipping sync");
      return 0;
    }

    queue.lastSyncAttempt = new Date();
    let syncedCount = 0;

    // Sync each execution individually
    for (const offlineExec of pending) {
      try {
        await ExecutionTrackingService.logExecution(offlineExec.execution);

        // Mark as synced
        const index = queue.executions.findIndex(
          (e) => e.id === offlineExec.id
        );
        if (index !== -1) {
          queue.executions[index].synced = true;
        }

        syncedCount++;
      } catch (err) {
        console.error(`Failed to sync execution ${offlineExec.id}:`, err);

        // Store error for debugging
        const index = queue.executions.findIndex(
          (e) => e.id === offlineExec.id
        );
        if (index !== -1) {
          queue.executions[index].syncError =
            err instanceof Error ? err.message : "Unknown error";
        }
      }
    }

    // Update pending count
    queue.pendingCount = queue.executions.filter((e) => !e.synced).length;

    // Save updated queue
    this.saveQueue(queue);

    // Clean up old synced executions (keep last 100)
    await this.cleanupQueue();

    return syncedCount;
  }

  /**
   * Clean up old synced executions
   */
  async cleanupQueue(): Promise<void> {
    const queue = await this.getQueue();

    // Keep all unsynced + last 100 synced
    const unsynced = queue.executions.filter((e) => !e.synced);
    const synced = queue.executions
      .filter((e) => e.synced)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 100);

    queue.executions = [...unsynced, ...synced];
    queue.pendingCount = unsynced.length;

    this.saveQueue(queue);
  }

  /**
   * Clear entire queue (use with caution!)
   */
  async clearQueue(): Promise<void> {
    localStorage.removeItem(QUEUE_STORAGE_KEY);
  }

  /**
   * Get pending execution count
   */
  async getPendingCount(): Promise<number> {
    const queue = await this.getQueue();
    return queue.pendingCount;
  }

  /**
   * Retry failed syncs
   */
  async retryFailedSync(): Promise<number> {
    const queue = await this.getQueue();
    const failed = queue.executions.filter((e) => !e.synced && e.syncError);

    if (failed.length === 0) {
      return 0;
    }

    console.log(`Retrying ${failed.length} failed syncs...`);

    // Clear errors and retry
    for (const exec of failed) {
      const index = queue.executions.findIndex((e) => e.id === exec.id);
      if (index !== -1) {
        delete queue.executions[index].syncError;
      }
    }

    this.saveQueue(queue);

    return await this.syncQueue();
  }
}
