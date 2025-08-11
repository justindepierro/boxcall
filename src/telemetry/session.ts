// Simple session id helper; persists per tab via sessionStorage, falls back to random.
let cached: string | null = null;

function generate() {
  return (
    "sess_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
  );
}

export function getSessionId(): string {
  if (cached) return cached;
  try {
    if (typeof sessionStorage !== "undefined") {
      const existing = sessionStorage.getItem("bc_session_id");
      if (existing) {
        cached = existing;
        return cached;
      }
      cached = generate();
      sessionStorage.setItem("bc_session_id", cached);
      return cached;
    }
  } catch {
    // ignore
  }
  cached = generate();
  return cached;
}
