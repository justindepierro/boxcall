/**
 * Toast Hooks
 * Separate from components for fast refresh compatibility
 */
import { useContext } from "react";

import { ToastContext, type ToastContextType } from "../contexts/ToastContext";

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
