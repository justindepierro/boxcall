import { telemetry } from "../../telemetry/dispatcher";
import {
  ACTIVATION_FLAG_SET_EVENT,
  type ActivationFlagId,
  dispatchWindowAppEvent,
} from "../../utils/appEvents";
import {
  readLocalJson,
  storageKeys,
  writeLocalJson,
} from "../../utils/storage";

interface ActivationFlags {
  startedAt?: number;
  first_play?: boolean;
  first_practice?: boolean;
  first_script_export?: boolean;
}

function loadFlags(): ActivationFlags {
  try {
    const parsed = readLocalJson<ActivationFlags>(
      storageKeys.activation.flags,
      {
        clearOnParseError: true,
      }
    );
    if (parsed) return parsed;
  } catch {
    /* ignore */
  }
  return { startedAt: Date.now() };
}
function saveFlags(f: ActivationFlags) {
  try {
    writeLocalJson(storageKeys.activation.flags, f);
  } catch {
    /* ignore */
  }
}

function markFlag(
  flag: ActivationFlagId,
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
  (flags as Record<string, unknown>)[flag as string] = true;
  saveFlags(flags);
  try {
    dispatchWindowAppEvent(ACTIVATION_FLAG_SET_EVENT, { id: flag });
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
