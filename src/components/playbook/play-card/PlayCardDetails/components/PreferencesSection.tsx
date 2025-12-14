/**
 * PreferencesSection Component
 *
 * Displays editable play preferences (down, distance, hash, coverage, front).
 */

import React from "react";
import { Typography } from "../../../../design-system/Typography";
import Icon from "../../../../ui/Icon/Icon";
import { InlineEditField } from "../../../../ui/InlineEditField";
import { DISTANCE_OPTIONS, DOWN_OPTIONS, HASH_OPTIONS } from "../../constants";
import type { PreferencesSectionProps } from "../types";

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  optimisticPlay,
  handleInlineSave,
  savingFields,
}) => {
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
              suggestions={DOWN_OPTIONS.map((option) => option.label)}
              enableSuggestions={true}
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
              suggestions={DISTANCE_OPTIONS.map((option) => option.label)}
              enableSuggestions={true}
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
              suggestions={HASH_OPTIONS.map((option) => option.label)}
              enableSuggestions={true}
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
              isSaving={savingFields.has("pref_front")}
            />
          </dd>
        </div>
      </dl>
    </div>
  );
};
