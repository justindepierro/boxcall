/**
 * Health Check API Page
 * Provides JSON health status for monitoring systems
 */

import React, { useEffect, useState } from "react";
import { healthCheck, type HealthStatus } from "../../api/health";
import { logError } from "../../utils/logger";

export const HealthCheckPage: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    healthCheck()
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((error) => {
        logError("Health check failed:", error);
        const timestamp = new Date().toISOString();
        setHealth({
          status: "unhealthy",
          version: "unknown",
          uptime: 0,
          timestamp,
          services: {
            database: {
              status: "down",
              responseTime: 0,
              lastChecked: timestamp,
              message: error.message,
            },
            storage: {
              status: "down",
              responseTime: 0,
              lastChecked: timestamp,
              message: error.message,
            },
            auth: {
              status: "down",
              responseTime: 0,
              lastChecked: timestamp,
              message: error.message,
            },
          },
        });
        setLoading(false);
      });
  }, []);

  // Set appropriate status code based on health
  useEffect(() => {
    if (health && document) {
      const statusCode = (() => {
        if (health.status === "healthy") return 200;
        if (health.status === "degraded") return 200;
        return 503;
      })();
      document.title = `Health Check - ${statusCode}`;
    }
  }, [health]);

  if (loading) {
    return (
      <pre className="font-mono p-5">
        {JSON.stringify({ status: "checking" }, null, 2)}
      </pre>
    );
  }

  return <pre className="font-mono p-5">{JSON.stringify(health, null, 2)}</pre>;
};

export default HealthCheckPage;
