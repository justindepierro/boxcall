/**
 * Confetti helpers: daily gating and keys
 */
const KEY_PREFIX = "bc_confetti_";

function getTodayKey(suffix: string): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${KEY_PREFIX}${suffix}_${y}-${m}-${day}`;
}

export function hasShownToday(suffix = "play_save"): boolean {
  try {
    return localStorage.getItem(getTodayKey(suffix)) === "1";
  } catch {
    return true; // if storage unavailable, suppress
  }
}

export function markShownToday(suffix = "play_save"): void {
  try {
    localStorage.setItem(getTodayKey(suffix), "1");
  } catch {
    // ignore
  }
}
