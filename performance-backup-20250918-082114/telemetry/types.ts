export type TelemetryEvent = {
  type: string;
  ts: number;
  data?: Record<string, unknown>;
  context?: Record<string, unknown>;
};

export interface TelemetryContext {
  session_id?: string;
  trace_id?: string;
  user_id?: string;
  [k: string]: unknown;
}
