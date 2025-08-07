/**
 * Offline detection and network status hook for mobile-first experience
 * Part of Phase 3B: Offline Architecture
 */
import { useState, useEffect, useCallback } from "react";

interface NetworkConnection {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
}

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSlowConnection: false,
  });

  const updateNetworkStatus = useCallback(() => {
    const connection = (navigator as NavigatorWithConnection)?.connection;

    setNetworkStatus((prev) => ({
      ...prev,
      isOnline: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      isSlowConnection: connection
        ? connection.effectiveType === "slow-2g" ||
          connection.effectiveType === "2g" ||
          (connection.downlink !== undefined && connection.downlink < 0.5)
        : false,
    }));
  }, []);

  useEffect(() => {
    // Initial network status
    updateNetworkStatus();

    // Listen for network changes
    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();
    const handleConnectionChange = () => updateNetworkStatus();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Listen for connection changes (modern browsers)
    const connection = (navigator as NavigatorWithConnection)?.connection;
    if (connection) {
      connection.addEventListener("change", handleConnectionChange);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);

      if (connection) {
        connection.removeEventListener("change", handleConnectionChange);
      }
    };
  }, [updateNetworkStatus]);

  return networkStatus;
};

// Hook specifically for handling offline states in components
export const useOfflineHandler = () => {
  const networkStatus = useNetworkStatus();
  const [offlineQueue, setOfflineQueue] = useState<
    Array<() => Promise<unknown>>
  >([]);

  const executeWhenOnline = useCallback(
    (fn: () => Promise<unknown>) => {
      if (networkStatus.isOnline) {
        return fn();
      } else {
        return new Promise((resolve, reject) => {
          setOfflineQueue((prev) => [
            ...prev,
            async () => {
              try {
                const result = await fn();
                resolve(result);
                return result;
              } catch (error) {
                reject(error);
                throw error;
              }
            },
          ]);
        });
      }
    },
    [networkStatus.isOnline]
  );

  // Execute queued actions when coming back online
  useEffect(() => {
    if (networkStatus.isOnline && offlineQueue.length > 0) {
      const executeQueue = async () => {
        const currentQueue = [...offlineQueue];
        setOfflineQueue([]);

        for (const fn of currentQueue) {
          try {
            await fn();
          } catch (error) {
            console.error("Error executing queued offline action:", error);
          }
        }
      };

      executeQueue();
    }
  }, [networkStatus.isOnline, offlineQueue]);

  return {
    ...networkStatus,
    executeWhenOnline,
    queuedActionsCount: offlineQueue.length,
  };
};
