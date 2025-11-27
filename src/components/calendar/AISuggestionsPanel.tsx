import React from "react";

import { Card } from "../ui";
import Icon from "../ui/Icon/Icon";
import { Typography } from "../design-system/Typography";

import type { EventSuggestion } from "./hooks/useAISuggestions";

interface AISuggestionsPanelProps {
  suggestions: EventSuggestion[];
  onApplySuggestion: (suggestion: EventSuggestion) => void;
  className?: string;
}

export const AISuggestionsPanel: React.FC<AISuggestionsPanelProps> = ({
  suggestions,
  onApplySuggestion,
  className,
}) => {
  if (!suggestions.length) return null;

  return (
    <Card className={`calendar-card ${className || ""}`.trim()}>
      <div className="flex items-center gap-2 mb-4">
        <Icon name="lightbulb" size="lg" className="text-warning" />
        <Typography variant="label-lg" className="text-primary">
          Smart Suggestions
        </Typography>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onApply={() => onApplySuggestion(suggestion)}
          />
        ))}
      </div>
    </Card>
  );
};

interface SuggestionCardProps {
  suggestion: EventSuggestion;
  onApply: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onApply,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "practice":
        return "target";
      case "game":
        return "trophy";
      case "meeting":
        return "users";
      default:
        return "calendar";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-success";
    if (confidence >= 0.6) return "text-warning";
    return "text-error";
  };

  return (
    <div className="border border-border rounded-lg p-3 hover:bg-secondary transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon
            name={getTypeIcon(suggestion.type)}
            size="sm"
            className="text-navy-600"
          />
          <Typography
            variant="body-sm"
            className="font-medium text-primary"
          >
            {suggestion.title}
          </Typography>
        </div>
        <div
          className={`font-medium ${getConfidenceColor(suggestion.confidence)}`}
        >
          <Typography variant="caption" as="span">
            {Math.round(suggestion.confidence * 100)}% match
          </Typography>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex items-center gap-1 mb-1">
          <Icon name="calendar" size="xs" />
          <Typography variant="caption" color="muted" as="span">
            {formatDate(suggestion.suggestedDate)} at{" "}
            {formatTime(suggestion.suggestedTime)}
          </Typography>
        </div>
        <div className="flex items-center gap-1">
          <Icon name="clock" size="xs" />
          <Typography variant="caption" color="muted" as="span">
            {suggestion.duration} minutes
          </Typography>
        </div>
      </div>

      <Typography variant="caption" color="muted" className="mb-3">
        {suggestion.reasoning}
      </Typography>

      {suggestion.conflicts.length > 0 && (
        <div className="mb-3">
          <Typography
            variant="caption"
            className="text-error font-medium mb-1"
          >
            ⚠️ Potential conflicts:
          </Typography>
          <ul className="ml-2">
            {suggestion.conflicts.map((conflict, index) => (
              <li key={index}>
                <Typography variant="caption" className="text-error">
                  • {conflict}
                </Typography>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {suggestion.benefits.slice(0, 2).map((benefit, index) => (
            <Typography
              key={index}
              variant="caption"
              className="bg-success/20 text-success px-2 py-1 rounded-lg"
              as="span"
            >
              {benefit}
            </Typography>
          ))}
        </div>

        <button
          onClick={onApply}
          className="bg-navy-600 text-inverse px-3 py-1 rounded-lg hover:bg-navy-700 transition-colors"
        >
          <Typography variant="caption" as="span">
            Apply
          </Typography>
        </button>
      </div>
    </div>
  );
};
