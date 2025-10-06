/**
 * Readiness Check API Page
 * Quick health check for load balancers
 */

import React, { useEffect, useState } from "react";
import { readinessCheck, type ReadinessCheck } from "../../api/health";

export const ReadinessCheckPage: React.FC = () => {
  const [readiness, setReadiness] = useState<ReadinessCheck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    readinessCheck()
      .then((data) => {
        setReadiness(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Readiness check failed:", error);
        setReadiness({
          ready: false,
          timestamp: new Date().toISOString(),
          checks: {
            database: false,
            requiredServices: false,
          },
        });
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (readiness && document) {
      const statusCode = readiness.ready ? 200 : 503;
      document.title = `Readiness Check - ${statusCode}`;
    }
  }, [readiness]);

  if (loading) {
    return (
      <pre className="font-mono p-5">
        {JSON.stringify({ status: "checking" }, null, 2)}
      </pre>
    );
  }

  return (
    <pre className="font-mono p-5">
      {JSON.stringify(readiness, null, 2)}
    </pre>
  );
};

export default ReadinessCheckPage;
