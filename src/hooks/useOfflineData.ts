/**
 * Offline-aware hooks for seamless online/offline experience
 * Part of Phase 3B: Offline Architecture
 */
import { useState, useEffect, useCallback } from "react";

import {
  offlineDataManager,
  type OfflineData,
} from "../services/offlineDataManager";

import { useNetworkStatus } from "./useNetworkStatus";

// Hook for offline-first data fetching
export const useOfflineData = <T>(
  type: OfflineData["type"],
  id?: string,
  fetchOnline?: () => Promise<T[]>
) => {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOfflineData, setIsOfflineData] = useState(false);
  const [dataAge, setDataAge] = useState<number | null>(null);
  const { isOnline } = useNetworkStatus();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch online data first if available and online
      if (isOnline && fetchOnline) {
        try {
          const onlineData = await fetchOnline();
          setData(onlineData);
          setIsOfflineData(false);
          setDataAge(null);

          // Cache the fresh data offline
          if (onlineData.length > 0) {
            await Promise.all(
              onlineData.map((item, index) =>
                offlineDataManager.storeOfflineData(
                  type,
                  id || `${index}`,
                  item
                )
              )
            );
          }

          setIsLoading(false);
          return;
        } catch (onlineError) {
          console.log(
            "Online fetch failed, falling back to offline data:",
            onlineError
          );
        }
      }

      // Fallback to offline data
      const offlineData = await offlineDataManager.getOfflineData(type, id);
      if (offlineData.length > 0) {
        const extractedData = offlineData.map((item) => item.data as T);
        setData(extractedData);
        setIsOfflineData(true);

        // Set data age for freshness indicators
        const age = await offlineDataManager.getDataAge(type, id || "");
        setDataAge(age);
      } else {
        setData([]);
        setIsOfflineData(false);
        setDataAge(null);
      }
    } catch (err) {
      setError(err as Error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [type, id, fetchOnline, isOnline]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    isOfflineData,
    dataAge,
    refresh,
    isOnline,
  };
};

// Hook for offline-first data mutations
export const useOfflineMutation = <T>(
  type: OfflineData["type"],
  resource: string
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline } = useNetworkStatus();

  const mutate = useCallback(
    async (
      action: "create" | "update" | "delete",
      data: T,
      onlineAction?: () => Promise<T>
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        if (isOnline && onlineAction) {
          // Try online action first
          try {
            const result = await onlineAction();
            setIsLoading(false);
            return result;
          } catch (onlineError) {
            console.log("Online action failed, queuing for sync:", onlineError);
          }
        }

        // Queue action for offline sync
        await offlineDataManager.queueSyncAction(action, resource, data);

        // Store locally for immediate UI update
        if (action !== "delete") {
          await offlineDataManager.storeOfflineData(type, resource, data);
        }

        setIsLoading(false);
        return data;
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        throw err;
      }
    },
    [type, resource, isOnline]
  );

  return { mutate, isLoading, error };
};

// Hook for sync queue status
export const useSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState({ pending: 0, failed: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    const updateSyncStatus = () => {
      const status = offlineDataManager.getSyncQueueStatus();
      setSyncStatus(status);
    };

    // Update immediately
    updateSyncStatus();

    // Update periodically
    const interval = setInterval(updateSyncStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const refresh = useCallback(async () => {
    if (!isOnline) return;

    setIsRefreshing(true);
    // Trigger a sync process (this would be implemented in the offline manager)
    setTimeout(() => {
      setIsRefreshing(false);
      const status = offlineDataManager.getSyncQueueStatus();
      setSyncStatus(status);
    }, 1000);
  }, [isOnline]);

  return {
    ...syncStatus,
    isRefreshing,
    refresh,
    isOnline,
    hasPendingChanges: syncStatus.pending > 0,
  };
};

// Hook for data freshness indicators
export const useDataFreshness = (type: OfflineData["type"], id: string) => {
  const [freshness, setFreshness] = useState<{
    age: number | null;
    isFresh: boolean;
    isStale: boolean;
    isVeryStale: boolean;
    lastSync: string | null;
  }>({
    age: null,
    isFresh: true,
    isStale: false,
    isVeryStale: false,
    lastSync: null,
  });

  useEffect(() => {
    const updateFreshness = async () => {
      const age = await offlineDataManager.getDataAge(type, id);

      if (age === null) {
        setFreshness({
          age: null,
          isFresh: true,
          isStale: false,
          isVeryStale: false,
          lastSync: null,
        });
        return;
      }

      const minutes = Math.floor(age / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      let lastSync: string;
      if (days > 0) {
        lastSync = `${days} day${days > 1 ? "s" : ""} ago`;
      } else if (hours > 0) {
        lastSync = `${hours} hour${hours > 1 ? "s" : ""} ago`;
      } else if (minutes > 0) {
        lastSync = `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
      } else {
        lastSync = "Just now";
      }

      setFreshness({
        age,
        isFresh: age < 5 * 60 * 1000, // Fresh if less than 5 minutes
        isStale: age >= 5 * 60 * 1000 && age < 60 * 60 * 1000, // Stale if 5 minutes to 1 hour
        isVeryStale: age >= 60 * 60 * 1000, // Very stale if over 1 hour
        lastSync,
      });
    };

    updateFreshness();
    const interval = setInterval(updateFreshness, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [type, id]);

  return freshness;
};

// Hook for offline availability check
export const useOfflineAvailability = (
  type: OfflineData["type"],
  id: string
) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAvailability = async () => {
      setIsChecking(true);
      const available = await offlineDataManager.isAvailableOffline(type, id);
      setIsAvailable(available);
      setIsChecking(false);
    };

    checkAvailability();
  }, [type, id]);

  return { isAvailable, isChecking };
};
