/**
 * PreferencesSection Component
 *
 * Displays editable play preferences (down, distance, hash, coverage, front).
 * Uses autocomplete with existing database values for text fields.
 */

import React from "react";
import { Typography } from "../../../../design-system/Typography";
import Icon from "../../../../ui/Icon/Icon";
import { InlineEditField } from "../../../../ui/InlineEditField";
import { DISTANCE_OPTIONS, DOWN_OPTIONS, HASH_OPTIONS } from "../../constants";
import { usePlayFieldSuggestions } from "../../../../../hooks/usePlayFieldSuggestions";
import type { PreferencesSectionProps } from "../types";

function normalizeToAllowedLabel(value: string, allowed: string[]): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const found = allowed.find((a) => a.toLowerCase() === trimmed.toLowerCase());
  return found ?? trimmed;
}

function validateAgainstAllowed(
  value: string,
  allowed: string[]
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const ok = allowed.some((a) => a.toLowerCase() === trimmed.toLowerCase());
  return ok ? null : "Must match a team-defined value.";
}

function mergeAllowed(primary: string[], secondary: string[]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const v of [...primary, ...secondary]) {
    const trimmed = v.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(trimmed);
  }

  return merged;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  optimisticPlay,
  handleInlineSave,
  savingFields,
}) => {
  // Fetch existing values from database for autocomplete suggestions
  const suggestions = usePlayFieldSuggestions();

  const downAllowed = DOWN_OPTIONS.map((o) => o.value);
  const distanceAllowed = DISTANCE_OPTIONS.map((o) => o.value);
  const hashAllowed = HASH_OPTIONS.map((o) => o.value);

  // Prefer team-defined taxonomy, but include existing play values too.
  const fieldPosAllowed = mergeAllowed(
    suggestions.teamFieldPositions,
    suggestions.fieldPositions
  );

  const situationAllowed = mergeAllowed(
    suggestions.teamSituations,
    suggestions.situations
  );

  return (
    <div className="bg-subtle rounded-lg p-sm">
      <Typography
        variant="label-lg"
        as="h4"
        className="text-primary flex items-center mb-sm"
      >
        <Icon name="settings" className="h-4 w-4 mr-xs" /> Preferences
      </Typography>
      <dl className="space-y-sm text-sm">
        <div className="flex items-center gap-sm">
          <dt className="text-primary font-medium flex-shrink-0 w-16 sm:w-20 text-xs">
            Down
          </dt>
          <dd className="flex-1">
            <InlineEditField
              value={optimisticPlay.pref_down || ""}
              onSave={(value) => handleInlineSave("pref_down", value)}
              placeholder="Preferred down (e.g., 1st, 2nd, 3rd)"
              suggestions={downAllowed}
              enableSuggestions={true}
              normalizeValue={(v) => normalizeToAllowedLabel(v, downAllowed)}
              validation={(v) =>
                validateAgainstAllowed(v, downAllowed) ||
                (v.trim() && !/^\d/.test(v.trim())
                  ? "Use 1st/2nd/3rd/4th"
                  : null)
              }
              isSaving={savingFields.has("pref_down")}
            />
          </dd>
        </div>
        <div className="flex items-center gap-sm">
          <dt className="text-primary font-medium flex-shrink-0 w-16 sm:w-20 text-xs">
            Distance
          </dt>
          <dd className="flex-1">
            <InlineEditField
              value={optimisticPlay.pref_dis || ""}
              onSave={(value) => handleInlineSave("pref_dis", value)}
              placeholder="Preferred distance (e.g., Short, Medium, Long)"
              suggestions={distanceAllowed}
              enableSuggestions={true}
              normalizeValue={(v) =>
                normalizeToAllowedLabel(v, distanceAllowed)
              }
              validation={(v) => validateAgainstAllowed(v, distanceAllowed)}
              isSaving={savingFields.has("pref_dis")}
            />
          </dd>
        </div>
        <div className="flex items-center gap-sm">
          <dt className="text-primary font-medium flex-shrink-0 w-16 sm:w-20 text-xs">
            Hash
          </dt>
          <dd className="flex-1">
            <InlineEditField
              value={optimisticPlay.pref_hash || ""}
              onSave={(value) => handleInlineSave("pref_hash", value)}
              placeholder="Preferred hash (e.g., Left, Right, Middle)"
              suggestions={hashAllowed}
              enableSuggestions={true}
              normalizeValue={(v) => normalizeToAllowedLabel(v, hashAllowed)}
              validation={(v) => validateAgainstAllowed(v, hashAllowed)}
              isSaving={savingFields.has("pref_hash")}
            />
          </dd>
        </div>
        <div className="flex items-center gap-sm">
          <dt className="text-primary font-medium flex-shrink-0 w-16 sm:w-20 text-xs">
            Coverage
          </dt>
          <dd className="flex-1">
            <InlineEditField
              value={optimisticPlay.pref_cov || ""}
              onSave={(value) => handleInlineSave("pref_cov", value)}
              placeholder="Preferred coverage"
              suggestions={suggestions.coverages}
              enableSuggestions={true}
              isSaving={savingFields.has("pref_cov")}
            />
          </dd>
        </div>
        <div className="flex items-center gap-sm">
          <dt className="text-primary font-medium flex-shrink-0 w-16 sm:w-20 text-xs">
            Front
          </dt>
          <dd className="flex-1">
            <InlineEditField
              value={optimisticPlay.pref_front || ""}
              onSave={(value) => handleInlineSave("pref_front", value)}
              placeholder="Preferred defensive front"
              suggestions={suggestions.fronts}
              enableSuggestions={true}
              isSaving={savingFields.has("pref_front")}
            />
          </dd>
        </div>
        <div className="flex items-center gap-sm">
          <dt className="text-primary font-medium flex-shrink-0 w-16 sm:w-20 text-xs">
            Field Pos
          </dt>
          <dd className="flex-1">
            <InlineEditField
              value={optimisticPlay.pref_field_pos || ""}
              onSave={(value) => handleInlineSave("pref_field_pos", value)}
              placeholder="Field position (Red Zone, Goal Line, etc.)"
              suggestions={fieldPosAllowed}
              enableSuggestions={true}
              normalizeValue={(v) =>
                normalizeToAllowedLabel(v, fieldPosAllowed)
              }
              // Don't hard-block custom labels; suggest canonical values instead.
              validation={() => null}
              isSaving={savingFields.has("pref_field_pos")}
            />
          </dd>
        </div>
        <div className="flex items-center gap-sm">
          <dt className="text-primary font-medium flex-shrink-0 w-16 sm:w-20 text-xs">
            Situation
          </dt>
          <dd className="flex-1">
            <InlineEditField
              value={optimisticPlay.pref_situation || ""}
              onSave={(value) => handleInlineSave("pref_situation", value)}
              placeholder="Custom situation (2-Minute, Backed Up, etc.)"
              suggestions={situationAllowed}
              enableSuggestions={true}
              normalizeValue={(v) =>
                normalizeToAllowedLabel(v, situationAllowed)
              }
              // Don't hard-block custom labels; suggest canonical values instead.
              validation={() => null}
              isSaving={savingFields.has("pref_situation")}
            />
          </dd>
        </div>
      </dl>
    </div>
  );
};
