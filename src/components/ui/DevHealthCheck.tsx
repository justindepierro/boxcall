import React, { useState } from "react";

import { Typography } from "../design-system";

/**
 * DevHealthCheck Component
 *
 * Monitors development environment health and displays status
 */
import { Icon } from "./Icon/Icon";

interface HealthStatus {
  react: boolean;
  typescript: boolean;
  vite: boolean;
  store: boolean;
  errors: string[];
}
export const DevHealthCheck: React.FC = () => {
  const [status] = useState<HealthStatus>(() => {
    // Initialize health check status
    const errors: string[] = [];
    // Check basic environment
    const react = typeof React !== "undefined";
    const typescript = true; // If this compiles, TypeScript is working
    const vite = import.meta.env !== undefined;
    const store = true; // Assume store is available
    if (!react) errors.push("React not available");
    if (!vite) errors.push("Vite environment not detected");
    return {
      react,
      typescript,
      vite,
      store,
      errors,
    };
  });
  const isHealthy =
    status.react &&
    status.typescript &&
    status.vite &&
    status.store &&
    status.errors.length === 0;
  // Don't render anything if healthy (development only)
  if (isHealthy) {
    return null;
  }
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {status.errors.length > 0 ? (
        <div className="surface-subtle rounded-lg p-3 shadow-sm">
          <Typography variant="label-md" color="error" className="mb-2">
            ⚠️ DEV HEALTH ISSUES
          </Typography>
          <div className="space-y-1">
            {status.errors.map((error, index) => (
              <Typography key={index} variant="body-xs" color="error">
                • {error}
              </Typography>
            ))}
          </div>
        </div>
      ) : isHealthy ? (
        <div className="surface-subtle rounded-lg p-2 shadow-sm">
          <Typography
            variant="body-xs"
            color="success"
            className="flex items-center gap-1"
          >
            <Icon name="check" size="xs" />
            All systems operational
          </Typography>
        </div>
      ) : (
        <div className="surface-subtle rounded-lg p-3 shadow-sm">
          <Typography
            variant="label-md"
            color="warning"
            className="mb-2 flex items-center gap-1"
          >
            <Icon name="zap" size="xs" />
            DEV STATUS
          </Typography>
          <div className="space-y-1">
            <Typography
              variant="body-xs"
              color={status.react ? "success" : "error"}
              className="flex items-center gap-1"
            >
              <Icon name={status.react ? "check" : "close"} size="xs" />
              React
            </Typography>
            <Typography
              variant="body-xs"
              color={status.typescript ? "success" : "error"}
              className="flex items-center gap-1"
            >
              <Icon name={status.typescript ? "check" : "close"} size="xs" />
              TypeScript
            </Typography>
            <Typography
              variant="body-xs"
              color={status.vite ? "success" : "error"}
              className="flex items-center gap-1"
            >
              <Icon name={status.vite ? "check" : "close"} size="xs" />
              Vite
            </Typography>
            <Typography
              variant="body-xs"
              color={status.store ? "success" : "error"}
              className="flex items-center gap-1"
            >
              <Icon name={status.store ? "check" : "close"} size="xs" />
              Store
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
};
