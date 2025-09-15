import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
// Core Web Vitals thresholds
const THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint
  INP: 200, // Interaction to Next Paint (replaces FID)
  CLS: 0.1, // Cumulative Layout Shift
  FCP: 1800, // First Contentful Paint
  TTFB: 800, // Time to First Byte
};
interface VitalsData {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  threshold: number;
  timestamp: number;
}
declare global {
  interface Window {
    __WEB_VITALS__?: VitalsData[];
  }
}
const pushGlobal = (vital: VitalsData) => {
  if (!window.__WEB_VITALS__) window.__WEB_VITALS__ = [];
  window.__WEB_VITALS__ = [
    ...window.__WEB_VITALS__.filter((v) => v.name !== vital.name),
    vital,
  ];
  window.dispatchEvent(new CustomEvent("web-vitals", { detail: vital }));
};

const reportVital = (vital: Omit<VitalsData, "timestamp">) => {
  const withTime: VitalsData = { ...vital, timestamp: performance.now() };
  pushGlobal(withTime);
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
  console.info("Core Web Vital:", {
      name: withTime.name,
      value: withTime.value,
      threshold: withTime.threshold,
      delta: withTime.value - withTime.threshold,
    });
  }
  // Send to analytics in production
  if (process.env.NODE_ENV === "production") {
    // TODO: Integrate with your analytics service
    // analytics.track('Core Web Vital', vital);
  }
};
export const initWebVitals = () => {
  onLCP((metric) =>
    reportVital({
      name: "LCP",
      value: metric.value,
      rating: metric.rating,
      threshold: THRESHOLDS.LCP,
    })
  );
  onINP((metric) =>
    reportVital({
      name: "INP",
      value: metric.value,
      rating: metric.rating,
      threshold: THRESHOLDS.INP,
    })
  );
  onCLS((metric) =>
    reportVital({
      name: "CLS",
      value: metric.value,
      rating: metric.rating,
      threshold: THRESHOLDS.CLS,
    })
  );
  onFCP((metric) =>
    reportVital({
      name: "FCP",
      value: metric.value,
      rating: metric.rating,
      threshold: THRESHOLDS.FCP,
    })
  );
  onTTFB((metric) =>
    reportVital({
      name: "TTFB",
      value: metric.value,
      rating: metric.rating,
      threshold: THRESHOLDS.TTFB,
    })
  );
};
