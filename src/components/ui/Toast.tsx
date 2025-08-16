import React, { useState, useEffect, useCallback } from "react";

import { ToastContext, type Toast } from "../../contexts/ToastContext";
import { Typography } from "../design-system";

/**
 * Toast Component System
 *
 * Professional toast notifications with animations and auto-dismiss
 */
import { Icon } from "./Icon/Icon";


import { Button } from "./index";

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = {
      ...toast,
      id,
      duration: toast.duration ?? (toast.type === "error" ? 8000 : 4000),
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss
    if (newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string, title?: string) =>
      addToast({ type: "success", message, title }),
    [addToast]
  );

  const error = useCallback(
    (message: string, title?: string) =>
      addToast({ type: "error", message, title }),
    [addToast]
  );

  const warning = useCallback(
    (message: string, title?: string) =>
      addToast({ type: "warning", message, title }),
    [addToast]
  );

  const info = useCallback(
    (message: string, title?: string) =>
      addToast({ type: "info", message, title }),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{
  toasts: Toast[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: Toast;
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entry animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 200);
  };

  const getToastStyles = () => {
    const baseStyles =
      "relative p-4 rounded-lg shadow-lg border transition-all duration-200 ease-in-out transform";
    const animationStyles = isVisible
      ? "translate-x-0 opacity-100 scale-100"
      : "translate-x-full opacity-0 scale-95";

    const typeStyles = {
      success: "surface-subtle border-subtle text-green-800",
      error: "surface-subtle border-subtle text-red-800",
      warning: "surface-subtle border-subtle text-orange-800",
      info: "surface-subtle border-subtle text-blue-800",
    };

    return `${baseStyles} ${animationStyles} ${typeStyles[toast.type]}`;
  };

  const getIconName = () => {
    switch (toast.type) {
      case "success":
        return "check-circle";
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "info":
        return "info";
      default:
        return "info";
    }
  };

  const getIconColor = () => {
    switch (toast.type) {
      case "success":
        return "success";
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "info":
        return "primary";
      default:
        return "primary";
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start">
        <Icon
          name={getIconName()}
          size="md"
          color={getIconColor()}
          className="mr-3 mt-0.5 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          {toast.title && (
            <Typography variant="body-md" className="font-semibold mb-1">
              {toast.title}
            </Typography>
          )}
          <Typography variant="body-sm" className="break-words">
            {toast.message}
          </Typography>
          {toast.action && (
            <Button
              onClick={toast.action.onClick}
              variant="link"
              size="xs"
              className="mt-2 underline hover:no-underline"
            >
              {toast.action.label}
            </Button>
          )}
        </div>
        <Button
          onClick={handleRemove}
          variant="ghost"
          size="xs"
          className="ml-3 flex-shrink-0 p-1 h-auto hover:opacity-70"
          aria-label="Dismiss"
        >
          <Icon name="close" size="sm" />
        </Button>
      </div>
    </div>
  );
};

export { ToastContainer, ToastItem };
