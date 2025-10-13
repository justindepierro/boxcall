/**
 * IndexedDB utility for persisting save queue operations
 * Allows queue to survive page refreshes and offline periods
 *
 * @version 3.1.0
 * @date October 13, 2025
 */

const DB_NAME = "BoxCallSaveQueue";
const DB_VERSION = 1;
const STORE_NAME = "saveOperations";

export interface PersistedSaveOperation {
  id: string;
  entityType: "play" | "formation" | "team" | "personnel" | "other";
  entityId: string;
  operationData: Record<string, unknown>; // Serializable data for reconstruction
  retries: number;
  maxRetries: number;
  timestamp: number;
  description?: string;
}

/**
 * Initialize IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });

        // Create indexes for efficient querying
        objectStore.createIndex("entityType", "entityType", { unique: false });
        objectStore.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
}

/**
 * Save operation to IndexedDB
 */
export async function persistOperation(
  operation: PersistedSaveOperation
): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.put(operation);

      request.onsuccess = () => {
        console.log(`[SaveQueueDB] Persisted operation: ${operation.id}`);
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to persist operation: ${operation.id}`));
      };
    });
  } catch (error) {
    console.error("[SaveQueueDB] Error persisting operation:", error);
    throw error;
  }
}

/**
 * Load all operations from IndexedDB
 */
export async function loadOperations(): Promise<PersistedSaveOperation[]> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        const operations = request.result as PersistedSaveOperation[];
        console.log(
          `[SaveQueueDB] Loaded ${operations.length} operations from IndexedDB`
        );
        resolve(operations);
      };

      request.onerror = () => {
        reject(new Error("Failed to load operations from IndexedDB"));
      };
    });
  } catch (error) {
    console.error("[SaveQueueDB] Error loading operations:", error);
    return []; // Return empty array on error
  }
}

/**
 * Remove operation from IndexedDB
 */
export async function removeOperation(operationId: string): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(operationId);

      request.onsuccess = () => {
        console.log(`[SaveQueueDB] Removed operation: ${operationId}`);
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to remove operation: ${operationId}`));
      };
    });
  } catch (error) {
    console.error("[SaveQueueDB] Error removing operation:", error);
    throw error;
  }
}

/**
 * Clear all operations from IndexedDB
 */
export async function clearAllOperations(): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();

      request.onsuccess = () => {
        console.log("[SaveQueueDB] Cleared all operations");
        resolve();
      };

      request.onerror = () => {
        reject(new Error("Failed to clear operations"));
      };
    });
  } catch (error) {
    console.error("[SaveQueueDB] Error clearing operations:", error);
    throw error;
  }
}

/**
 * Get count of persisted operations
 */
export async function getOperationCount(): Promise<number> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error("Failed to count operations"));
      };
    });
  } catch (error) {
    console.error("[SaveQueueDB] Error counting operations:", error);
    return 0;
  }
}

/**
 * Update retry count for an operation
 */
export async function updateRetryCount(
  operationId: string,
  retries: number
): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const getRequest = store.get(operationId);

      getRequest.onsuccess = () => {
        const operation = getRequest.result;
        if (operation) {
          operation.retries = retries;
          const updateRequest = store.put(operation);

          updateRequest.onsuccess = () => {
            resolve();
          };

          updateRequest.onerror = () => {
            reject(new Error(`Failed to update retry count: ${operationId}`));
          };
        } else {
          reject(new Error(`Operation not found: ${operationId}`));
        }
      };

      getRequest.onerror = () => {
        reject(new Error(`Failed to get operation: ${operationId}`));
      };
    });
  } catch (error) {
    console.error("[SaveQueueDB] Error updating retry count:", error);
    throw error;
  }
}
