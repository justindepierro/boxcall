/**
 * Liveness Check API Page
 * Basic alive check for monitoring
 */

import React, { useEffect, useState } from "react";
import { livenessCheck } from "../../api/health";

export const LivenessCheckPage: React.FC = () => {
  const [liveness, setLiveness] = useState<{
    alive: boolean;
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    const data = livenessCheck();
    setLiveness(data);
  }, []);

  useEffect(() => {
    if (liveness && document) {
      document.title = "Liveness Check - 200";
    }
  }, [liveness]);

  if (!liveness) {
    return (
      <pre className="font-mono p-5">
        {JSON.stringify({ alive: false }, null, 2)}
      </pre>
    );
  }

  return (
    <pre className="font-mono p-5">{JSON.stringify(liveness, null, 2)}</pre>
  );
};

export default LivenessCheckPage;
