import { onCLS, onLCP, onINP, onFCP, onTTFB } from "web-vitals";
import { telemetry } from "./dispatcher";
import { getSessionId } from "./session";

interface VitalsMetric {
  name: string;
  value: number;
  rating?: string;
  id: string;
}

function send(metric: VitalsMetric) {
  telemetry.enqueue({
    type: `vital:${metric.name.toLowerCase()}`,
    data: {
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
    },
    context: { session_id: getSessionId() },
  });
}

export function initWebVitals() {
  if (typeof window === "undefined") return;
  try {
    onCLS(send);
    onTTFB(send);
    onLCP(send);
    onINP(send);
    onFCP(send);
  } catch (e) {
    console.warn("Web Vitals init failed", e);
  }
}
