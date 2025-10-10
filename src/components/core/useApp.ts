/**
 * App Provider Hook
 *
 * Hook for consuming the unified App context
 */

import { useContext } from "react";
import { AppContext } from "./AppProvider";

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
