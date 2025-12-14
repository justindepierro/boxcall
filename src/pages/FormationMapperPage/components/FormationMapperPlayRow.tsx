import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../../../components/ui/Button/Button";
import { Typography } from "../../../components/design-system/Typography";
import { Icon } from "../../../components/ui/Icon";
import { SelectionCheckbox } from "../../../components/ui/SelectionCheckbox/SelectionCheckbox";
import type { Play } from "../../../types/play";
import type { FormationSuggestion } from "../hooks/useFormationSuggestions";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import { cn } from "../../../lib/utils/cn";

interface FormationMapperPlayRowProps {
  play: Play;
  isSelected: boolean;
  suggestions: FormationSuggestion[];
  formationsLoading: boolean;
  assigning: boolean;
  onSelectPlay: (playId: string, isSelected: boolean) => void;
  onSuggestionAssign: (play: Play, suggestion: FormationSuggestion) => void;
  onAssignClick: (play: Play) => void;
  onCreateNewClick: (play: Play) => void;
}

export const FormationMapperPlayRow: React.FC<FormationMapperPlayRowProps> = ({
  play,
  isSelected,
  suggestions,
  formationsLoading,
  assigning,
  onSelectPlay,
  onSuggestionAssign,
  onAssignClick,
  onCreateNewClick,
}) => {
  const updatedAt = play.updated_at
    ? formatDistanceToNow(new Date(play.updated_at), { addSuffix: true })
    : "unknown";

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-secondary/70 p-4 transition-shadow",
        isSelected && "border-brand-jade shadow-lg shadow-brand-jade/20"
      )}
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-start">
        <div className="min-w-0 flex flex-col gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <SelectionCheckbox
              isSelected={isSelected}
              onChange={(selected) => onSelectPlay(play.id, selected)}
              label={`Select ${play.play_name || "play"}`}
              disabled={assigning}
            />
            <div className="min-w-0">
              <Typography
                variant="body-md"
                className="font-semibold truncate"
              >
                {play.play_name || "Untitled Play"}
              </Typography>
              <Typography variant="caption" className="text-muted">
                Updated {updatedAt}
              </Typography>
              <SuggestionsDisplay
                suggestions={suggestions}
                formationsLoading={formationsLoading}
                assigning={assigning}
                play={play}
                onSuggestionAssign={onSuggestionAssign}
              />
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <Typography variant="caption" className="text-muted uppercase">
            Formation String
          </Typography>
          <Typography variant="body-sm" className="text-primary break-words">
            {play.formation || "—"}
          </Typography>
        </div>
        <div className="space-y-1">
          <Typography variant="caption" className="text-muted uppercase">
            Personnel
          </Typography>
          <Typography variant="body-sm" className="text-primary">
            {play.personnel || "—"}
          </Typography>
        </div>
        <div className="flex justify-end gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            disabled={assigning}
            onClick={() => {
              triggerHapticFeedback("light");
              onAssignClick(play);
            }}
          >
            Assign formation
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={assigning}
            onClick={() => {
              triggerHapticFeedback("light");
              onCreateNewClick(play);
            }}
          >
            Create new
          </Button>
        </div>
      </div>
    </div>
  );
};

interface SuggestionsDisplayProps {
  suggestions: FormationSuggestion[];
  formationsLoading: boolean;
  assigning: boolean;
  play: Play;
  onSuggestionAssign: (play: Play, suggestion: FormationSuggestion) => void;
}

const SuggestionsDisplay: React.FC<SuggestionsDisplayProps> = ({
  suggestions,
  formationsLoading,
  assigning,
  play,
  onSuggestionAssign,
}) => {
  if (formationsLoading && suggestions.length === 0) {
    return (
      <Typography variant="caption" className="text-secondary mt-2">
        Loading suggestions…
      </Typography>
    );
  }

  if (suggestions.length > 0) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={`${play.id}-${suggestion.formation.id}`}
            variant="secondary"
            size="xs"
            disabled={assigning}
            onClick={() => onSuggestionAssign(play, suggestion)}
            className="flex items-center gap-2 max-w-xs"
            title={suggestion.reasons.join(", ") || undefined}
          >
            <Icon name="sparkles" className="h-3 w-3 text-success-500" />
            <span className="truncate">{suggestion.formation.name}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Typography variant="caption" className="text-secondary mt-2">
      No smart suggestions yet — assign manually to train the mapper.
    </Typography>
  );
};

FormationMapperPlayRow.displayName = "FormationMapperPlayRow";
