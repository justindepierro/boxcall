// Simple session id helper; persists per tab via sessionStorage, falls back to random.
import {
  readSessionString,
  storageKeys,
  writeSessionString,
} from "../utils/storage";

let cached: string | null = null;

function generate() {
  return `sess_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function getSessionId(): string {
  if (cached) return cached;
  try {
    const existing = readSessionString(storageKeys.session.id);
    if (existing) {
      cached = existing;
      return cached;
    }

    cached = generate();
    writeSessionString(storageKeys.session.id, cached);
    return cached;
  } catch {
    // ignore
  }
  cached = generate();
  return cached;
}
