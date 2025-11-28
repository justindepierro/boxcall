/**
 * useOnlineStatus Hook
 *
 * Detects online/offline status for showing connection indicators
 * and managing offline functionality
 */

import { useState, useEffect } from "react";

/**
 * Hook to detect network online/offline status
 *
 * @returns Object with online status and transition state
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { isOnline, isTransitioning } = useOnlineStatus();
 *
 *   return (
 *     <div>
 *       {!isOnline && <OfflineBanner />}
 *       {isTransitioning && <p>Reconnecting...</p>}
 *     </div>
 *   );
 * };
 * ```
 */
export function useOnlineStatus(): {
  isOnline: boolean;
  isTransitioning: boolean;
} {
  const [isOnline, setIsOnline] = useState(() => {
    // Initialize based on current status
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  });

  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsTransitioning(true);
      setIsOnline(true);

      // Clear transitioning state after 2 seconds
      setTimeout(() => setIsTransitioning(false), 2000);
    };

    const handleOffline = () => {
      setIsTransitioning(false);
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, isTransitioning };
}
