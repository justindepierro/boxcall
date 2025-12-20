/**
 * Offline-First Data Management System for BoxCall
 * Part of Phase 3B: Offline Architecture
 *
 * Provides intelligent caching, offline storage, and sync capabilities
 */
// DISABLED: Service worker temporarily disabled
// import { Workbox } from "workbox-window";
import { debug, warn } from "../utils/logger";

interface OfflineData {
  id: string;
  type: "play" | "team" | "player" | "schedule" | "formation";
  data: unknown;
  timestamp: number;
  version: number;
  syncStatus: "synced" | "pending" | "conflict";
}

interface SyncAction {
  id: string;
  type: "create" | "update" | "delete";
  resource: string;
  data: unknown;
  timestamp: number;
  retryCount: number;
}

class OfflineDataManager {
  private dbName = "boxcall-offline";
  private version = 1;
  private db: IDBDatabase | null = null;
  private syncQueue: SyncAction[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    this.initializeDB();
    this.setupNetworkListeners();
    this.loadSyncQueue();
  }

  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains("offlineData")) {
          const offlineStore = db.createObjectStore("offlineData", {
            keyPath: "id",
          });
          offlineStore.createIndex("type", "type", { unique: false });
          offlineStore.createIndex("timestamp", "timestamp", { unique: false });
        }

        if (!db.objectStoreNames.contains("syncQueue")) {
          const syncStore = db.createObjectStore("syncQueue", {
            keyPath: "id",
          });
          syncStore.createIndex("timestamp", "timestamp", { unique: false });
        }

        if (!db.objectStoreNames.contains("userPreferences")) {
          db.createObjectStore("userPreferences", { keyPath: "key" });
        }
      };
    });
  }

  private setupNetworkListeners(): void {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  private async loadSyncQueue(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(["syncQueue"], "readonly");
    const store = transaction.objectStore("syncQueue");
    const request = store.getAll();

    request.onsuccess = () => {
      this.syncQueue = request.result || [];
    };
  }

  // Store data offline with intelligent caching
  async storeOfflineData(
    type: OfflineData["type"],
    id: string,
    data: unknown
  ): Promise<void> {
    if (!this.db) await this.initializeDB();
    if (!this.db) throw new Error("Database not available");

    const offlineData: OfflineData = {
      id: `${type}-${id}`,
      type,
      data,
      timestamp: Date.now(),
      version: 1,
      syncStatus: this.isOnline ? "synced" : "pending",
    };

    const transaction = this.db.transaction(["offlineData"], "readwrite");
    const store = transaction.objectStore("offlineData");

    return new Promise((resolve, reject) => {
      const request = store.put(offlineData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Retrieve offline data
  async getOfflineData(
    type: OfflineData["type"],
    id?: string
  ): Promise<OfflineData[]> {
    if (!this.db) await this.initializeDB();
    if (!this.db) return [];

    const transaction = this.db.transaction(["offlineData"], "readonly");
    const store = transaction.objectStore("offlineData");

    if (id) {
      const request = store.get(`${type}-${id}`);
      return new Promise((resolve) => {
        request.onsuccess = () => {
          resolve(request.result ? [request.result] : []);
        };
        request.onerror = () => resolve([]);
      });
    }
    const index = store.index("type");
    const request = index.getAll(type);

    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  // Queue action for sync when online
  async queueSyncAction(
    type: SyncAction["type"],
    resource: string,
    data: unknown
  ): Promise<void> {
    const syncAction: SyncAction = {
      id: `${type}-${resource}-${Date.now()}`,
      type,
      resource,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.syncQueue.push(syncAction);

    // Store in IndexedDB
    if (!this.db) await this.initializeDB();
    if (!this.db) return;

    const transaction = this.db.transaction(["syncQueue"], "readwrite");
    const store = transaction.objectStore("syncQueue");

    return new Promise((resolve, reject) => {
      const request = store.put(syncAction);
      request.onsuccess = () => {
        resolve();
        // Try to sync immediately if online
        if (this.isOnline) {
          this.processSyncQueue();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Process sync queue when online
  private async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    const actionsToSync = [...this.syncQueue];

    for (const action of actionsToSync) {
      try {
        await this.syncAction(action);
        await this.removeSyncAction(action.id);
        this.syncQueue = this.syncQueue.filter((a) => a.id !== action.id);
      } catch (err) {
        warn("Sync action failed, will retry:", err);
        action.retryCount++;

        // Remove actions that have failed too many times
        if (action.retryCount >= 3) {
          await this.removeSyncAction(action.id);
          this.syncQueue = this.syncQueue.filter((a) => a.id !== action.id);
        }
      }
    }
  }

  private async syncAction(_action: SyncAction): Promise<void> {
    // This would integrate with your actual API
    // Simulate API call for offline sync
    debug("Simulating sync action - implement actual API integration");

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // In real implementation, make actual API calls here
    // const response = await fetch(`/api/${action.resource}`, {
    //   method: action.type === 'create' ? 'POST' : action.type === 'update' ? 'PUT' : 'DELETE',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(action.data)
    // });
  }

  private async removeSyncAction(actionId: string): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(["syncQueue"], "readwrite");
    const store = transaction.objectStore("syncQueue");

    return new Promise((resolve, reject) => {
      const request = store.delete(actionId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get sync queue status
  getSyncQueueStatus(): { pending: number; failed: number } {
    return {
      pending: this.syncQueue.filter((a) => a.retryCount < 3).length,
      failed: this.syncQueue.filter((a) => a.retryCount >= 3).length,
    };
  }

  // Clear all offline data (for debugging/reset)
  async clearOfflineData(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(
      ["offlineData", "syncQueue"],
      "readwrite"
    );

    const offlineStore = transaction.objectStore("offlineData");
    const syncStore = transaction.objectStore("syncQueue");

    await Promise.all([
      new Promise((resolve) => {
        const request = offlineStore.clear();
        request.onsuccess = () => resolve(undefined);
      }),
      new Promise((resolve) => {
        const request = syncStore.clear();
        request.onsuccess = () => resolve(undefined);
      }),
    ]);

    this.syncQueue = [];
  }

  // Check if specific data is available offline
  async isAvailableOffline(
    type: OfflineData["type"],
    id: string
  ): Promise<boolean> {
    const data = await this.getOfflineData(type, id);
    return data.length > 0;
  }

  // Get data age for freshness indicators
  async getDataAge(
    type: OfflineData["type"],
    id: string
  ): Promise<number | null> {
    const data = await this.getOfflineData(type, id);
    if (data.length === 0) return null;

    return Date.now() - data[0].timestamp;
  }
}

// Service Worker Registration and Management
class ServiceWorkerManager {
  // DISABLED: Service worker temporarily disabled
  // private wb: Workbox | null = null;
  // private updateAvailable = false;

  constructor() {
    // DISABLED: Service worker temporarily disabled
    // if ("serviceWorker" in navigator) {
    //   this.initializeServiceWorker();
    // }
  }

  // DISABLED: Service worker temporarily disabled
  // private initializeServiceWorker(): void {
  //   // DISABLED: Service worker temporarily disabled
  //   // VitePWA plugin will handle service worker registration automatically
  //   // this.wb = new Workbox("/sw.js");
  //   // this.wb.addEventListener("waiting", () => {
  //   //   this.updateAvailable = true;
  //   //   this.showUpdateAvailable();
  //   // });
  //   // this.wb.addEventListener("controlling", () => {
  //   //   window.location.reload();
  //   // });
  //   // this.wb.register();
  // }

  // DISABLED: Service worker methods
  // private showUpdateAvailable(): void {
  //   // Integration with your notification system
  //   // TODO: Remove update log (was previously console logging)
  //   // You could show a notification toast here
  //   // notificationService.show('Update available', 'Reload to get the latest features', 'info');
  // }

  async skipWaiting(): Promise<void> {
    // DISABLED: Service worker temporarily disabled
    // if (this.wb && this.updateAvailable) {
    //   this.wb.messageSkipWaiting();
    // }
  }

  isUpdateAvailable(): boolean {
    return false; // Always return false when service worker is disabled
    // return this.updateAvailable;
  }
}

// Global instances
export const offlineDataManager = new OfflineDataManager();
export const serviceWorkerManager = new ServiceWorkerManager();

// Export types for use in components
export type { OfflineData, SyncAction };
