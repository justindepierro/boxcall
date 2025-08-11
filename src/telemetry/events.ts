// Centralized telemetry event type constants.
export const TelemetryEventTypes = {
  PlayCreate: "play.create",
  PlayUpdate: "play.update",
  PlayDiagramUpdated: "play.diagram_updated",
  PlayDuplicate: "play.duplicate",
  FilterApply: "filter.apply",
  ViewSavedApply: "view.saved_apply",
  ErrorBoundary: "error.boundary",
  VitalCLS: "vital:CLS",
  VitalINP: "vital:INP",
  VitalFCP: "vital:FCP",
  VitalLCP: "vital:LCP",
  VitalTTFB: "vital:TTFB",
} as const;

export type TelemetryEventType =
  (typeof TelemetryEventTypes)[keyof typeof TelemetryEventTypes];
