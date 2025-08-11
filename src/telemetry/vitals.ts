import { telemetry } from "./dispatcher";

export function trackVital(
  name: string,
  value: number,
  data?: Record<string, unknown>
) {
  telemetry.enqueue({ type: `vital:${name}`, data: { value, ...data } });
}
