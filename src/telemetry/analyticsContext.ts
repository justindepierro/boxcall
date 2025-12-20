import { createContext, useContext } from "react";

export interface AnalyticsContextType {
  initialized: boolean;
  error: string | null;
}

export const AnalyticsContext = createContext<AnalyticsContextType>({
  initialized: false,
  error: null,
});

export function useAnalyticsContext() {
  return useContext(AnalyticsContext);
}
