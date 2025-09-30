/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
} from "react";
import { useToast } from "../hooks/useToast";

interface UndoItem<T> {
  id: string;
  payload: T;
  apply: (payload: T) => Promise<void> | void; // action executed (e.g., delete) already performed
  restore: (payload: T) => Promise<void> | void; // how to undo
  expiresAt: number;
  label: string;
  timeoutId?: ReturnType<typeof setTimeout>; // for cleanup
}

interface UndoQueueContextValue {
  pushUndo: <T>(
    item: Omit<UndoItem<T>, "id" | "expiresAt"> & { ttlMs?: number }
  ) => void;
}

const UndoQueueContext = createContext<UndoQueueContextValue | null>(null);

export const UndoQueueProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { addToast } = useToast();
  const queueRef = useRef<UndoItem<unknown>[]>([]);
  const [, forceRender] = useState(0); // minimal state to trigger cleanup scheduling

  const cleanup = useCallback(() => {
    const now = Date.now();
    const before = queueRef.current.length;
    queueRef.current = queueRef.current.filter((i) => i.expiresAt > now);
    if (queueRef.current.length !== before) forceRender((x) => x + 1);
  }, []);

  // Periodic cleanup (lightweight)
  React.useEffect(() => {
    const id = setInterval(cleanup, 5000);
    return () => clearInterval(id);
  }, [cleanup]);

  const pushUndo = useCallback(
    <T,>(item: Omit<UndoItem<T>, "id" | "expiresAt"> & { ttlMs?: number }) => {
      const id = `undo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const ttl = item.ttlMs ?? 7000;
      const undoItem: UndoItem<T> = {
        id,
        expiresAt: Date.now() + ttl,
        ...item,
      };
      // Push with unknown to satisfy generic store while retaining type safety at usage sites
      queueRef.current.push(undoItem as unknown as UndoItem<unknown>);
      // Show toast with undo action
      addToast({
        type: "info",
        message: item.label,
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              await item.restore(item.payload);
            } finally {
              // remove item from queue
              queueRef.current = queueRef.current.filter((q) => q.id !== id);
              forceRender((x) => x + 1);
            }
          },
        },
        duration: ttl,
      });

      // Auto-expire removal with cleanup tracking
      const timeoutId = setTimeout(() => {
        queueRef.current = queueRef.current.filter((q) => q.id !== id);
        forceRender((x) => x + 1);
      }, ttl + 250);

      // Store timeout for potential cleanup
      queueRef.current[queueRef.current.length - 1].timeoutId = timeoutId;
    },
    [addToast]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all pending timeouts to prevent memory leaks
      queueRef.current.forEach((item) => {
        if (item.timeoutId) {
          clearTimeout(item.timeoutId);
        }
      });
      queueRef.current = [];
    };
  }, []);

  return (
    <UndoQueueContext.Provider value={{ pushUndo }}>
      {children}
    </UndoQueueContext.Provider>
  );
};

export const useUndoQueue = () => {
  const ctx = useContext(UndoQueueContext);
  if (!ctx)
    throw new Error("useUndoQueue must be used within UndoQueueProvider");
  return ctx;
};
