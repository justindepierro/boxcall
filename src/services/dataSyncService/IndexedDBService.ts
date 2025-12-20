/**
 * IndexedDB Service - Local storage management
 *
 * Handles all IndexedDB operations for caching and offline support
 */

import type { CachedData } from "./types";
import { debug, warn } from "../../utils/logger";

export class IndexedDBService {
  private static db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB for local caching
   */
  static async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("BoxCallCache", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains("cache")) {
          db.createObjectStore("cache", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("backups")) {
          db.createObjectStore("backups", { keyPath: "key" });
        }
      };
    });
  }

  /**
   * Save data to IndexedDB cache store
   */
  static async save(key: string, data: CachedData): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(["cache"], "readwrite");
    const store = transaction.objectStore("cache");

    await store.put({ key, ...data });
  }

  /**
   * Get data from IndexedDB cache store
   */
  static async get(key: string): Promise<CachedData | null> {
    if (!this.db) return null;

    const transaction = this.db.transaction(["cache"], "readonly");
    const store = transaction.objectStore("cache");

    return new Promise((resolve) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const { key: _, ...data } = result;
          resolve(data as CachedData);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  }

  /**
   * Save backup payload to IndexedDB backups store
   */
  static async saveBackup(key: string, data: CachedData): Promise<void> {
    if (!this.db) return;
    const tx = this.db.transaction(["backups"], "readwrite");
    const store = tx.objectStore("backups");
    await store.put({ key, ...data });
  }

  /**
   * List all backup keys in ascending order
   */
  static async listBackupKeys(): Promise<string[]> {
    if (!this.db) return [];
    const tx = this.db.transaction(["backups"], "readonly");
    const store = tx.objectStore("backups");
    return new Promise((resolve) => {
      const keys: string[] = [];
      const req = store.openCursor();
      req.onsuccess = () => {
        const cursor = req.result as IDBCursorWithValue | null;
        if (cursor) {
          const value = cursor.value as { key: string };
          if (value && value.key) keys.push(value.key);
          cursor.continue();
        } else {
          resolve(keys.sort());
        }
      };
      req.onerror = () => resolve([]);
    });
  }

  /**
   * Delete a specific backup
   */
  static async deleteBackup(key: string): Promise<void> {
    if (!this.db) return;
    const tx = this.db.transaction(["backups"], "readwrite");
    const store = tx.objectStore("backups");
    await store.delete(key);
  }

  /**
   * Cleanup old backups, keeping only the most recent
   */
  static async cleanupOldBackups(keepCount: number): Promise<void> {
    try {
      const keys = await this.listBackupKeys();
      if (keys.length <= keepCount) return;
      const toDelete = keys.slice(0, Math.max(0, keys.length - keepCount));
      await Promise.all(toDelete.map((k) => this.deleteBackup(k)));
      debug(`Cleaned up old backups, kept ${keepCount}`);
    } catch (e) {
      warn("Failed to cleanup backups", e);
    }
  }

  /**
   * Close the database connection
   */
  static close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
