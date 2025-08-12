// Centralized telemetry event type constants.
export const TelemetryEventTypes = {
  PlayCreate: "play.create",
  PlayUpdate: "play.update",
  PlayDiagramUpdated: "play.diagram_updated",
  PlayDuplicate: "play.duplicate",
  FilterApply: "filter.apply",
  UIAction: "ui.action",
  ViewSavedApply: "view.saved_apply",
  ViewSavedServerCreate: "view.saved_server_create",
  ViewSavedServerApply: "view.saved_server_apply",
  ViewSavedServerRename: "view.saved_server_rename",
  ViewSavedServerDelete: "view.saved_server_delete",
  ViewSavedServerImport: "view.saved_server_import",
  ErrorBoundary: "error.boundary",
  VitalCLS: "vital:CLS",
  VitalINP: "vital:INP",
  VitalFCP: "vital:FCP",
  VitalLCP: "vital:LCP",
  VitalTTFB: "vital:TTFB",
} as const;

export type TelemetryEventType =
  (typeof TelemetryEventTypes)[keyof typeof TelemetryEventTypes];
