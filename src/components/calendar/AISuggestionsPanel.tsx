import React from "react";

import { Card } from "../ui";
import Icon from "../ui/Icon/Icon";

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
        <Icon name="lightbulb" size="lg" className="text-amber-600" />
        <span className="Typography typography-label-lg text-text-primary">
          Smart Suggestions
        </span>
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
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon
            name={getTypeIcon(suggestion.type)}
            size="sm"
            className="text-navy-600"
          />
          <span className="font-medium text-sm text-text-primary">
            {suggestion.title}
          </span>
        </div>
        <div
          className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}
        >
          {Math.round(suggestion.confidence * 100)}% match
        </div>
      </div>

      <div className="text-xs text-text-muted mb-2">
        <div className="flex items-center gap-1 mb-1">
          <Icon name="calendar" size="xs" />
          <span>
            {formatDate(suggestion.suggestedDate)} at{" "}
            {formatTime(suggestion.suggestedTime)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Icon name="clock" size="xs" />
          <span>{suggestion.duration} minutes</span>
        </div>
      </div>

      <p className="text-xs text-text-secondary mb-3">{suggestion.reasoning}</p>

      {suggestion.conflicts.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-red-600 font-medium mb-1">
            ⚠️ Potential conflicts:
          </div>
          <ul className="text-xs text-red-600 ml-2">
            {suggestion.conflicts.map((conflict, index) => (
              <li key={index}>• {conflict}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {suggestion.benefits.slice(0, 2).map((benefit, index) => (
            <span
              key={index}
              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
            >
              {benefit}
            </span>
          ))}
        </div>

        <button
          onClick={onApply}
          className="text-xs bg-navy-600 text-white px-3 py-1 rounded hover:bg-navy-700 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
};
