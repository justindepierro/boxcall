import { onCLS, onLCP, onINP, onFCP, onTTFB } from "web-vitals";

import { telemetry } from "./dispatcher";
import { getSessionId } from "./session";
import { warn } from "../utils/logger";

interface VitalsMetric {
  name: string;
  value: number;
  rating?: string;
  id: string;
}

export type WebVitalsName = "CLS" | "LCP" | "INP" | "FCP" | "TTFB";

export interface VitalsSnapshotEntry {
  name: WebVitalsName;
  value: number;
  rating?: string;
  id: string;
  timestamp: number;
}

export type VitalsSnapshot = Partial<Record<WebVitalsName, VitalsSnapshotEntry>>;

// 10% sampling by default to reduce volume
const SAMPLE_RATE = Number(import.meta.env?.VITE_VITALS_SAMPLE_RATE ?? 0.1);
const shouldSample = () => Math.random() < SAMPLE_RATE;

let didInit = false;
let latestVitals: VitalsSnapshot = {};

function setWindowVitalsValue(name: WebVitalsName, value: number) {
  const win = window as any;
  win.webVitals = win.webVitals ?? {};
  switch (name) {
    case "LCP":
      win.webVitals.lcp = value;
      break;
    case "CLS":
      win.webVitals.cls = value;
      break;
    case "INP":
      win.webVitals.inp = value;
      // Back-compat: legacy code reads FID.
      win.webVitals.fid = value;
      break;
    case "FCP":
      win.webVitals.fcp = value;
      break;
    case "TTFB":
      win.webVitals.ttfb = value;
      break;
    default:
      break;
  }
}

function capture(metric: VitalsMetric) {
  const name = metric.name as WebVitalsName;
  const entry: VitalsSnapshotEntry = {
    name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    timestamp: Date.now(),
  };

  latestVitals = { ...latestVitals, [name]: entry };
  setWindowVitalsValue(name, metric.value);
}

function enqueueTelemetry(metric: VitalsMetric) {
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

export function getVitalsSnapshot(): VitalsSnapshot {
  return { ...latestVitals };
}

export function initWebVitals(options?: { enableTelemetry?: boolean }) {
  if (typeof window === "undefined") return;
  if (didInit) return;
  didInit = true;

  const enableTelemetry = options?.enableTelemetry ?? import.meta.env.PROD;

  try {
    const handler = (metric: VitalsMetric) => {
      capture(metric);
      if (enableTelemetry) enqueueTelemetry(metric);
    };

    onCLS(handler);
    onTTFB(handler);
    onLCP(handler);
    onINP(handler);
    onFCP(handler);
  } catch (e) {
    warn("Web Vitals init failed", e);
  }
}
