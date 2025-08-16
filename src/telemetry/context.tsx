import React, { createContext, useContext, useEffect, useMemo } from "react";

/* eslint-disable react-refresh/only-export-components */
import { telemetry, TelemetryDispatcher } from "./dispatcher";

interface TelemetryContextValue {
  dispatcher: TelemetryDispatcher;
  track: (type: string, data?: Record<string, unknown>) => void;
}

const TelemetryContext = createContext<TelemetryContextValue | null>(null);

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatcher = useMemo(() => telemetry, []);

  useEffect(() => {
    const beforeUnload = () => dispatcher.shutdown();
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dispatcher]);

  const value: TelemetryContextValue = {
    dispatcher,
    track: (type, data) => dispatcher.enqueue({ type, data }),
  };

  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  );
};

export function useTelemetry() {
  const ctx = useContext(TelemetryContext);
  if (!ctx)
    throw new Error("useTelemetry must be used within TelemetryProvider");
  return ctx;
}
/* eslint-enable react-refresh/only-export-components */
