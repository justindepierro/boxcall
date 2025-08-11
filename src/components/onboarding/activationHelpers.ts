import { telemetry } from "../../telemetry/dispatcher";

const LS_KEY = "bc_activation_flags";
interface ActivationFlags {
  startedAt?: number;
  first_play?: boolean;
  first_practice?: boolean;
  first_script_export?: boolean;
}

function loadFlags(): ActivationFlags {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { startedAt: Date.now() };
}
function saveFlags(f: ActivationFlags) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(f));
  } catch {
    /* ignore */
  }
}

function markFlag(
  flag: keyof ActivationFlags,
  telemetryType: string,
  extra?: Record<string, unknown>
) {
  const flags = loadFlags();
  if (flags[flag] === true) return; // already set
  const signupTs = flags.startedAt || Date.now();
  telemetry.enqueue({
    type: telemetryType,
    data: { timeFromSignupMs: Date.now() - signupTs, ...extra },
  });
  // Only assign boolean flags, ignore startedAt which is numeric
  if (flag !== "startedAt") {
    // All non-startedAt flags are boolean
    (flags as Record<string, unknown>)[flag as string] = true;
  }
  saveFlags(flags);
  try {
    window.dispatchEvent(
      new CustomEvent("activation:flag_set", { detail: { id: flag } })
    );
  } catch {
    /* ignore */
  }
}

export function markFirstPlayCreated(playId?: string) {
  markFlag("first_play", "activation:first_play", { playId });
}
export function markFirstPracticeScheduled(scheduleId?: string) {
  markFlag("first_practice", "activation:first_practice", { scheduleId });
}
export function markFirstScriptExport(filename?: string) {
  markFlag("first_script_export", "activation:first_script_export", {
    filename,
  });
}
