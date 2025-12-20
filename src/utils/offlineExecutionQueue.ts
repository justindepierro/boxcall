/**
 * Offline Execution Queue
 * Handles localStorage persistence and sync for offline play execution tracking
 */

// TODO: Fix types when integrating Stage 3 (Session Management)

import type { CreatePlayExecutionData } from "../types/session";
import { ExecutionTrackingService } from "../services/executionTrackingService";
import { debug, logError } from "./logger";

const QUEUE_STORAGE_KEY = "boxcall_offline_executions";
const MAX_QUEUE_SIZE = 100;

// Simplified queue item for tests
interface QueueItem {
  id: string;
  data: CreatePlayExecutionData;
  timestamp: number;
  synced: boolean;
  error?: string;
}

export class OfflineExecutionQueue {
  /**
   * Add execution to offline queue
   */
  static add(execution: CreatePlayExecutionData): void {
    if (!this.hasLocalStorage()) return;

    const queue = this.getAll();

    const item: QueueItem = {
      id: crypto.randomUUID(),
      data: execution,
      timestamp: Date.now(),
      synced: false,
    };

    queue.push(item);

    // Respect max queue size, but keep unsynced items
    if (queue.length > MAX_QUEUE_SIZE) {
      const unsynced = queue.filter((e) => !e.synced);
      const availableSpace = Math.max(0, MAX_QUEUE_SIZE - unsynced.length);
      const synced = queue
        .filter((e) => e.synced)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, availableSpace);
      this.saveQueue([...unsynced, ...synced]);
    } else {
      this.saveQueue(queue);
    }
  }

  /**
   * Check if localStorage is available
   */
  private static hasLocalStorage(): boolean {
    try {
      return typeof localStorage !== "undefined" && localStorage !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get all executions from queue
   */
  static getAll(): QueueItem[] {
    if (!this.hasLocalStorage()) return [];

    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);

      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      // Corrupted localStorage is a recoverable scenario; clear the bad value
      // to avoid repeated parse failures.
      debug(
        "[OfflineExecutionQueue] Failed to parse offline queue; clearing",
        err
      );
      try {
        localStorage.removeItem(QUEUE_STORAGE_KEY);
      } catch {
        // Ignore secondary failures (e.g., storage access blocked)
      }
      return [];
    }
  }

  /**
   * Save queue to localStorage
   */
  private static saveQueue(queue: QueueItem[]): void {
    if (!this.hasLocalStorage()) return;

    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (err) {
      logError("Failed to save queue to localStorage:", err);
    }
  }

  /**
   * Mark execution as synced
   */
  static markSynced(id: string): void {
    const queue = this.getAll();
    const index = queue.findIndex((e) => e.id === id);
    if (index !== -1) {
      queue[index].synced = true;
      delete queue[index].error;
    }
    this.saveQueue(queue);
  }

  /**
   * Mark execution as failed with error
   */
  static markFailed(id: string, error: string): void {
    const queue = this.getAll();
    const index = queue.findIndex((e) => e.id === id);
    if (index !== -1) {
      queue[index].synced = false;
      queue[index].error = error;
    }
    this.saveQueue(queue);
  }

  /**
   * Get only unsynced executions
   */
  static getUnsynced(): QueueItem[] {
    return this.getAll().filter((e) => !e.synced);
  }

  /**
   * Remove specific execution by ID
   */
  static remove(id: string): void {
    const queue = this.getAll();
    this.saveQueue(queue.filter((e) => e.id !== id));
  }

  /**
   * Clear all executions
   */
  static clearAll(): void {
    if (!this.hasLocalStorage()) return;

    try {
      localStorage.removeItem(QUEUE_STORAGE_KEY);
    } catch (err) {
      logError("Failed to clear queue from localStorage:", err);
    }
  }

  /**
   * Check if online
   */
  static isOnline(): boolean {
    return typeof navigator !== "undefined" && navigator.onLine;
  }

  /**
   * Clear synced items older than threshold (in milliseconds)
   */
  static clearSynced(thresholdMs: number): void {
    const queue = this.getAll();
    const threshold = Date.now() - thresholdMs;

    this.saveQueue(queue.filter((e) => !e.synced || e.timestamp > threshold));
  }

  /**
   * Sync pending executions to database
   * Returns number of successfully synced executions
   */
  static async syncQueue(): Promise<number> {
    const queue = this.getAll();
    const pending = queue.filter((e) => !e.synced);

    if (pending.length === 0) {
      return 0;
    }

    // Check if online
    if (!navigator.onLine) {
      debug("Offline - skipping sync");
      return 0;
    }

    let syncedCount = 0;

    // Sync each execution individually
    for (const item of pending) {
      try {
        await ExecutionTrackingService.logExecution(item.data);
        this.markSynced(item.id);
        syncedCount++;
      } catch (err) {
        logError(`Failed to sync execution ${item.id}:`, err);
        this.markFailed(
          item.id,
          err instanceof Error ? err.message : "Unknown error"
        );
      }
    }

    return syncedCount;
  }

  /**
   * Get pending execution count
   */
  static getPendingCount(): number {
    return this.getUnsynced().length;
  }

  /**
   * Retry failed syncs
   */
  static async retryFailedSync(): Promise<number> {
    const queue = this.getAll();
    const failed = queue.filter((e) => !e.synced && e.error);

    if (failed.length === 0) {
      return 0;
    }

    debug(`Retrying ${failed.length} failed syncs...`);

    // Clear errors and retry
    for (const exec of failed) {
      const index = queue.findIndex((e) => e.id === exec.id);
      if (index !== -1) {
        delete queue[index].error;
      }
    }

    this.saveQueue(queue);

    return await this.syncQueue();
  }
}
