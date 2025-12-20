/**
 * Logs icon loading errors for diagnostics and debugging.
 * Can be enhanced to send errors to external monitoring in production.
 */

import { logError } from "../../../utils/logger";

export function logIconError(name: string, error: unknown): void {
  logError(`[IconError] Failed to load icon: ${name}`, error);
}
