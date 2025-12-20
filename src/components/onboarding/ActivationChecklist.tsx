import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "../design-system";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon/Icon";
import { telemetry } from "../../telemetry/dispatcher";
import { useAuth } from "../../app/auth-store";
import { supabase } from "../../lib/supabase";
import {
  ACTIVATION_FLAG_SET_EVENT,
  OPEN_PLAY_BUILDER_EVENT,
  OPEN_PRACTICE_PLANNER_EVENT,
  addWindowAppEventListener,
  dispatchWindowAppEvent,
} from "../../utils/appEvents";
import {
  readLocalJson,
  storageKeys,
  writeLocalJson,
} from "../../utils/storage";

interface ActivationFlags {
  team?: boolean;
  first_play?: boolean;
  first_practice?: boolean; // placeholder
  first_script_export?: boolean; // placeholder
  startedAt?: number; // epoch ms
  completedAt?: number;
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
  const navigate = useNavigate();

  const updateFlag = useCallback(
    (id: keyof ActivationFlags, val: boolean, emitTelemetry = true) => {
      setFlags((prev) => {
        if (prev[id] === val) return prev;
        const next = { ...prev, [id]: val };
        if (emitTelemetry && id !== "startedAt" && id !== "completedAt") {
          telemetry.enqueue({
            type: "activation:checklist_step_complete",
            data: { stepId: id },
          });
        }
        const required: (keyof ActivationFlags)[] = [
          "team",
          "first_play",
          "first_practice",
          "first_script_export",
        ];
        const allDone = required.every((k) => !!next[k]);
        if (allDone && !next.completedAt) {
          next.completedAt = Date.now();
          telemetry.enqueue({
            type: "activation:checklist_completed",
            data: {
              totalMs: next.completedAt - (next.startedAt || Date.now()),
            },
          });
        }
        saveFlags(next);
        return next;
      });
    },
    []
  );

  // Listen for external activation flag events
  useEffect(() => {
    return addWindowAppEventListener(ACTIVATION_FLAG_SET_EVENT, (detail) => {
      if (!detail?.id) return;
      updateFlag(detail.id, true, false); // no duplicate telemetry
    });
  }, [updateFlag]);

  // Initial detection (team membership + placeholder others)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("team_members")
          .select("id", { count: "exact", head: true })
          .eq("user_id", profile.id);
        if (!cancelled) {
          updateFlag("team", !error && data !== null);
        }
      } catch {
        /* ignore */
      }
      if (!cancelled) setLoading(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [profile?.id, updateFlag]);

  const items: ChecklistItem[] = [
    {
      id: "team",
      label: "Create or Join a Team",
      description: "Unlock collaborative features",
      cta: "Create Team",
      action: () => {
        navigate("/create-team");
      },
    },
    {
      id: "first_play",
      label: "Create Your First Play",
      description: "Populate your playbook",
      cta: "New Play",
      action: () => {
        dispatchWindowAppEvent(OPEN_PLAY_BUILDER_EVENT);
      },
    },
    {
      id: "first_practice",
      label: "Schedule First Practice",
      description: "Plan your team session",
      cta: "Schedule",
      action: () => {
        navigate("/calendar");
      },
    },
    {
      id: "first_script_export",
      label: "Export a Practice Script",
      description: "Share plan with staff",
      cta: "Export",
      action: () => {
        dispatchWindowAppEvent(OPEN_PRACTICE_PLANNER_EVENT);
      },
    },
  ];

  if (loading) return null;
  const remaining = items.filter((i) => !flags[i.id]);
  if (!remaining.length) return null; // all done

  return (
    <div className="bg-primary border-muted rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <Typography variant="headline-sm" className="font-medium">
          Getting Started
        </Typography>
        <Typography variant="body-sm" color="muted">
          {items.length - remaining.length}/{items.length} complete
        </Typography>
      </div>
      <ul className="space-y-3">
        {items.map((item) => {
          const done = !!flags[item.id];
          return (
            <li key={item.id} className="flex items-center gap-3">
              <Icon
                name={done ? "check-circle" : "target"}
                size="sm"
                color={done ? "success" : "secondary"}
              />
              <div className="flex-1">
                <Typography
                  variant="body-sm"
                  className={done ? "line-through text-muted" : ""}
                >
                  {item.label}
                </Typography>
                <Typography variant="body-xs" color="muted">
                  {item.description}
                </Typography>
              </div>
              {!done && item.action && (
                <Button size="xs" variant="secondary" onClick={item.action}>
                  {item.cta || "Start"}
                </Button>
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
