// Domain Error Mapper (Step 4 scaffold)
// Central translation of raw exceptions -> structured domain error objects.
// Extend with richer discrimination (HTTP codes, Postgres codes, zod issues) as needed.

export interface DomainErrorInfo {
  code: string; // machine readable stable code
  userMessage: string; // friendly message for toast / UI
  severity: "info" | "warning" | "error";
  retryable: boolean;
  meta?: Record<string, unknown>;
}

// Basic PG code map (extend gradually)
const PG_CODE_MAP: Record<string, DomainErrorInfo> = {
  "23505": {
    code: "play.duplicate",
    userMessage: "A play with that name & formation already exists.",
    severity: "warning",
    retryable: false,
  },
};

export function mapError(err: unknown): DomainErrorInfo {
  if (err && typeof err === "object") {
    const anyErr = err as { code?: string; message?: string };
    if (anyErr.code && PG_CODE_MAP[anyErr.code]) {
      return PG_CODE_MAP[anyErr.code];
    }
  }
  return {
    code: "unknown",
    userMessage: "Something went wrong. Please try again.",
    severity: "error",
    retryable: true,
  };
}
