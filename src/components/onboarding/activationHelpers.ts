import { telemetry } from "../../telemetry/dispatcher";

const LS_KEY = "bc_activation_flags";
interface ActivationFlags { first_play?: boolean; startedAt?: number; }
function loadFlags(): ActivationFlags {
  try { const raw = localStorage.getItem(LS_KEY); if (raw) return JSON.parse(raw); } catch { /* ignore */ }
  return { startedAt: Date.now() };
}
function saveFlags(f: ActivationFlags) { try { localStorage.setItem(LS_KEY, JSON.stringify(f)); } catch { /* ignore */ } }
export function markFirstPlayCreated(playId?: string) {
  const flags = loadFlags();
  if (!flags.first_play) {
    const signupTs = flags.startedAt || Date.now();
    telemetry.enqueue({ type: 'activation:first_play', data: { playId, timeFromSignupMs: Date.now() - signupTs } });
    flags.first_play = true;
    saveFlags(flags);
  }
}
