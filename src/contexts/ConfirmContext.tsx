/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Button } from "../components/ui/Button/Button";
import { Typography } from "../components/design-system/Typography";

export interface ConfirmOptions {
  title?: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
}

interface InternalRequest {
  id: string;
  options: ConfirmOptions;
  resolve: (v: boolean) => void;
  reject: (reason?: unknown) => void;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [active, setActive] = useState<InternalRequest | null>(null);
  const queueRef = useRef<InternalRequest[]>([]);

  const processNext = useCallback(() => {
    if (active || queueRef.current.length === 0) return;
    const next = queueRef.current.shift() || null;
    setActive(next);
  }, [active]);

  const confirm = useCallback(
    (options: ConfirmOptions) => {
      return new Promise<boolean>((resolve, reject) => {
        const req: InternalRequest = {
          id: `confirm-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          options,
          resolve,
          reject,
        };
        queueRef.current.push(req);
        processNext();
      });
    },
    [processNext]
  );

  const handleClose = (result: boolean) => {
    if (active) {
      active.resolve(result);
      setActive(null);
      setTimeout(processNext, 0);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-text-primary/40"
            aria-hidden="true"
            onClick={() => handleClose(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${active.id}-title`}
            className="relative bg-primary elevation-modal max-w-sm w-full mx-4 rounded-md border-muted p-6 animate-scale-in"
          >
            {active.options.title && (
              <Typography
                id={`${active.id}-title`}
                variant="headline-sm"
                as="h2"
                className="mb-3"
              >
                {active.options.title}
              </Typography>
            )}
            <div className="text-secondary mb-6 text-sm">
              {active.options.message}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleClose(false)}
              >
                {active.options.cancelLabel || "Cancel"}
              </Button>
              <Button
                variant={
                  active.options.tone === "danger" ? "danger" : "primary"
                }
                size="sm"
                autoFocus
                onClick={() => handleClose(true)}
              >
                {active.options.confirmLabel ||
                  (active.options.tone === "danger" ? "Delete" : "Confirm")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx.confirm;
}
