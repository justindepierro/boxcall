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
}
const reportVital = (vital: VitalsData) => {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("Core Web Vital:", {
      name: vital.name,
      value: vital.value,
      threshold: vital.threshold,
      delta: vital.value - vital.threshold,
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
