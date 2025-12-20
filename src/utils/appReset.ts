import { debug } from "./logger";

export const APP_RESET_EVENT = "boxcall:app-reset" as const;

export function requestAppReset(reason?: string) {
  if (typeof window === "undefined") return;
  try {
    debug("[appReset] requested", { reason });
  } catch {
    // ignore logging failures
  }
  window.dispatchEvent(
    new CustomEvent(APP_RESET_EVENT, { detail: { reason } })
  );
}
