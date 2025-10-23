import { createContext, useEffect, useState, type ReactNode } from "react";
import {
  offlineDataManager,
  serviceWorkerManager,
} from "../services/offlineDataManager";

interface OfflineContextType {
  isOnline: boolean;
  syncQueueStatus: { pending: number; failed: number };
  isUpdateAvailable: boolean;
  skipWaiting: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

export { OfflineContext };

interface OfflineProviderProps {
  children: ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueueStatus, setSyncQueueStatus] = useState({
    pending: 0,
    failed: 0,
  });
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    // Set up network listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set up service worker update listener
    const checkForUpdates = () => {
      setIsUpdateAvailable(serviceWorkerManager.isUpdateAvailable());
    };

    // Check for updates periodically
    const updateInterval = setInterval(checkForUpdates, 60000); // Check every minute

    // Initial check
    checkForUpdates();

    // Update sync queue status periodically
    const updateSyncStatus = () => {
      setSyncQueueStatus(offlineDataManager.getSyncQueueStatus());
    };

    const syncInterval = setInterval(updateSyncStatus, 5000); // Update every 5 seconds

    // Initial status
    updateSyncStatus();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(updateInterval);
      clearInterval(syncInterval);
    };
  }, []);

  const skipWaiting = async () => {
    await serviceWorkerManager.skipWaiting();
  };

  const value: OfflineContextType = {
    isOnline,
    syncQueueStatus,
    isUpdateAvailable,
    skipWaiting,
  };

  return (
    <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
  );
}
