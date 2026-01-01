import { createContext, useEffect, useState, type ReactNode } from "react";

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

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const value: OfflineContextType = {
    isOnline,
    syncQueueStatus: { pending: 0, failed: 0 },
    isUpdateAvailable: false,
    skipWaiting: async () => {},
  };

  return (
    <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
  );
}
