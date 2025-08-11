import React, { useEffect, useState, useCallback } from "react";
import { Typography } from "../design-system";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon/Icon";
import { telemetry } from "../../telemetry/dispatcher";
import { useAuth } from "../../app/auth-store";
import { supabase } from "../../lib/supabase";

interface ActivationFlags {
  team?: boolean;
  first_play?: boolean;
  first_practice?: boolean; // placeholder
  first_script_export?: boolean; // placeholder
  startedAt?: number; // epoch ms
  completedAt?: number;
}

const LS_KEY = "bc_activation_flags";

function loadFlags(): ActivationFlags {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {/* ignore */}
  return { startedAt: Date.now() };
}

function saveFlags(f: ActivationFlags) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(f)); } catch {/* ignore */}
}

interface ChecklistItem {
  id: keyof ActivationFlags;
  label: string;
  description: string;
  action?: () => void;
  cta?: string;
}

export const ActivationChecklist: React.FC = () => {
  const { profile } = useAuth();
  const [flags, setFlags] = useState<ActivationFlags>(() => loadFlags());
  const [loading, setLoading] = useState(true);

  const updateFlag = useCallback((id: keyof ActivationFlags, val: boolean, emitTelemetry = true) => {
    setFlags(prev => {
      if (prev[id] === val) return prev;
      const next = { ...prev, [id]: val };
      if (emitTelemetry && id !== 'startedAt' && id !== 'completedAt') {
        telemetry.enqueue({ type: "activation:checklist_step_complete", data: { stepId: id } });
      }
      const required: (keyof ActivationFlags)[] = ['team','first_play','first_practice','first_script_export'];
      const allDone = required.every(k => !!next[k]);
      if (allDone && !next.completedAt) {
        next.completedAt = Date.now();
        telemetry.enqueue({ type: "activation:checklist_completed", data: { totalMs: next.completedAt - (next.startedAt || Date.now()) } });
      }
      saveFlags(next);
      return next;
    });
  }, []);

  // Listen for external activation flag events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id?: keyof ActivationFlags } | undefined;
      if (detail?.id) {
        updateFlag(detail.id, true, false); // no duplicate telemetry
      }
    };
    window.addEventListener('activation:flag_set', handler);
    return () => window.removeEventListener('activation:flag_set', handler);
  }, [updateFlag]);

  // Initial detection (team membership + placeholder others)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!profile?.id) { setLoading(false); return; }
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', profile.id);
        if (!cancelled) {
          updateFlag('team', !error && data !== null);
        }
      } catch {/* ignore */}
      if (!cancelled) setLoading(false);
    };
    run();
    return () => { cancelled = true; };
  }, [profile?.id, updateFlag]);

  const items: ChecklistItem[] = [
    { id: 'team', label: 'Create or Join a Team', description: 'Unlock collaborative features', cta: 'Create Team', action: () => { window.location.href = '/create-team'; } },
    { id: 'first_play', label: 'Create Your First Play', description: 'Populate your playbook', cta: 'New Play', action: () => { window.dispatchEvent(new CustomEvent('open-play-builder')); } },
    { id: 'first_practice', label: 'Schedule First Practice', description: 'Plan your team session', cta: 'Schedule', action: () => { window.location.href = '/calendar'; } },
    { id: 'first_script_export', label: 'Export a Practice Script', description: 'Share plan with staff', cta: 'Export', action: () => { window.dispatchEvent(new CustomEvent('open-practice-planner')); } },
  ];

  if (loading) return null;
  const remaining = items.filter(i => !flags[i.id]);
  if (!remaining.length) return null; // all done

  return (
    <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-md p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <Typography variant="headline-sm" className="font-medium">Getting Started</Typography>
        <Typography variant="body-sm" color="muted">{items.length - remaining.length}/{items.length} complete</Typography>
      </div>
      <ul className="space-y-3">
        {items.map(item => {
          const done = !!flags[item.id];
          return (
            <li key={item.id} className="flex items-center gap-3">
              <Icon name={done ? 'check-circle' : 'target'} size="sm" color={done ? 'success' : 'secondary'} />
              <div className="flex-1">
                <Typography variant="body-sm" className={done ? 'line-through text-text-muted' : ''}>{item.label}</Typography>
                <Typography variant="body-xs" color="muted">{item.description}</Typography>
              </div>
              {!done && item.action && (
                <Button size="xs" variant="secondary" onClick={item.action}>{item.cta || 'Start'}</Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// External API: mark first play done (called after successful creation)
// markFirstPlayCreated moved to separate helper to preserve fast refresh contract
