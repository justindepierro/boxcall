import { onCLS, onLCP, onINP, onFCP, onTTFB } from "web-vitals";

import { telemetry } from "./dispatcher";
import { getSessionId } from "./session";

interface VitalsMetric {
  name: string;
  value: number;
  rating?: string;
  id: string;
}

// 10% sampling by default to reduce volume
const SAMPLE_RATE = Number(import.meta.env?.VITE_VITALS_SAMPLE_RATE ?? 0.1);
const shouldSample = () => Math.random() < SAMPLE_RATE;

function send(metric: VitalsMetric) {
  if (!shouldSample()) return;
  telemetry.enqueue({
    type: `vital:${metric.name.toLowerCase()}`,
    data: {
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      url: typeof location !== "undefined" ? location.pathname : undefined,
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
// console.warn("Web Vitals init failed", e);
  }
}
