import { useEffect, useMemo, useState } from "react";

type ConnectionType =
  | "bluetooth"
  | "cellular"
  | "ethernet"
  | "none"
  | "wifi"
  | "wimax"
  | "other"
  | "unknown";

type NetworkStatus = {
  isOnline: boolean;
  connectionType: ConnectionType;
  isSlowConnection: boolean;
};

function readConnectionInfo(): {
  connectionType: ConnectionType;
  isSlowConnection: boolean;
} {
  if (typeof navigator === "undefined") {
    return { connectionType: "unknown", isSlowConnection: false };
  }

  const anyNavigator = navigator as Navigator & {
    connection?: {
      type?: string;
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
      addEventListener?: (event: string, handler: () => void) => void;
      removeEventListener?: (event: string, handler: () => void) => void;
    };
  };

  const connection = anyNavigator.connection;
  const rawType = (connection?.type || connection?.effectiveType || "")
    .toString()
    .toLowerCase();

  const connectionType: ConnectionType = (() => {
    if (!rawType) return "unknown";
    if (rawType === "wifi") return "wifi";
    if (rawType === "ethernet") return "ethernet";
    if (
      rawType === "cellular" ||
      rawType.includes("3g") ||
      rawType.includes("4g") ||
      rawType.includes("5g")
    ) {
      return "cellular";
    }
    if (rawType === "none" || rawType === "offline") return "none";
    return "other";
  })();

  const effectiveType = (connection?.effectiveType || "")
    .toString()
    .toLowerCase();
  const downlink =
    typeof connection?.downlink === "number" ? connection.downlink : undefined;
  const rtt = typeof connection?.rtt === "number" ? connection.rtt : undefined;
  const saveData = Boolean(connection?.saveData);

  const isSlowConnection =
    saveData ||
    effectiveType === "slow-2g" ||
    effectiveType === "2g" ||
    (typeof downlink === "number" && downlink > 0 && downlink < 1.25) ||
    (typeof rtt === "number" && rtt > 700);

  return { connectionType, isSlowConnection };
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === "undefined") return true;
    return typeof navigator.onLine === "boolean" ? navigator.onLine : true;
  });
  const [connectionTick, setConnectionTick] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const anyNavigator = navigator as Navigator & {
      connection?: {
        addEventListener?: (event: string, handler: () => void) => void;
        removeEventListener?: (event: string, handler: () => void) => void;
      };
    };
    const connection = anyNavigator.connection;

    const handleConnectionChange = () => setConnectionTick((n) => n + 1);
    connection?.addEventListener?.("change", handleConnectionChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      connection?.removeEventListener?.("change", handleConnectionChange);
    };
  }, []);

  const connectionInfo = useMemo(() => {
    void connectionTick;
    return readConnectionInfo();
  }, [connectionTick]);

  return {
    isOnline,
    connectionType: connectionInfo.connectionType,
    isSlowConnection: connectionInfo.isSlowConnection,
  };
}
