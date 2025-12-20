/**
 * Confetti helpers: daily gating and keys
 */
import {
  readLocalString,
  storageKeys,
  writeLocalString,
} from "../../utils/storage";

function getTodayKey(suffix: string): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return storageKeys.confetti.todayKey(suffix, `${y}-${m}-${day}`);
}

export function hasShownToday(suffix = "play_save"): boolean {
  try {
    return readLocalString(getTodayKey(suffix)) === "1";
  } catch {
    return true; // if storage unavailable, suppress
  }
}

export function markShownToday(suffix = "play_save"): void {
  try {
    writeLocalString(getTodayKey(suffix), "1");
  } catch {
    // ignore
  }
}
