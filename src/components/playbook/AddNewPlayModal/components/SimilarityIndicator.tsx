/**
 * SimilarityIndicator Component
 *
 * A glowing indicator button that appears when the Play Similarity Engine
 * detects similar plays. Provides visual feedback and actionable recommendations.
 *
 * Features:
 * - Animated glow effect based on similarity level
 * - Color coding: red (duplicate), amber (warning), blue (info)
 * - Expandable panel with detailed similarity breakdown
 * - Quick actions to differentiate the play
 */

import React, { useState } from "react";
import { Icon } from "../../../ui/Icon/Icon";
import { Typography } from "../../../design-system/Typography";
import { Button } from "../../../ui/Button/Button";
import type {
  PlaySimilarityResult,
  SimilarPlay,
  SimilarityLevel,
  RecommendationAction,
} from "../usePlaySimilarity";

// =============================================================================
// CONFIGURATION
// =============================================================================

const LEVEL_CONFIG: Record<
  SimilarityLevel,
  {
    color: string;
    bgColor: string;
    borderColor: string;
    glowColor: string;
    icon: "alert-octagon" | "alert-triangle" | "info" | "sparkles" | "check";
  }
> = {
  exact_duplicate: {
    color: "text-danger-default",
    bgColor: "bg-danger-subtle",
    borderColor: "border-danger-default",
    glowColor: "shadow-danger-default/50",
    icon: "alert-octagon",
  },
  very_similar: {
    color: "text-warning-default",
    bgColor: "bg-warning-subtle",
    borderColor: "border-warning-default",
    glowColor: "shadow-warning-default/50",
    icon: "alert-triangle",
  },
  similar: {
    color: "text-info-default",
    bgColor: "bg-info-subtle",
    borderColor: "border-info-default",
    glowColor: "shadow-info-default/50",
    icon: "info",
  },
  related: {
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    glowColor: "shadow-primary/30",
    icon: "sparkles",
  },
  unique: {
    color: "text-success-default",
    bgColor: "bg-success-subtle",
    borderColor: "border-success-default",
    glowColor: "shadow-success-default/30",
    icon: "check",
  },
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const SimilarityBar: React.FC<{ similarity: number }> = ({ similarity }) => {
  const getBarColor = () => {
    if (similarity >= 95) return "bg-danger-default";
    if (similarity >= 70) return "bg-warning-default";
    if (similarity >= 50) return "bg-info-default";
    return "bg-primary";
  };

  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 bg-surface-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getBarColor()}`}
          style={{ width: `${similarity}%` }}
        />
      </div>
      <Typography variant="caption" className="text-secondary w-10 text-right">
        {similarity}%
      </Typography>
    </div>
  );
};

const SimilarPlayItem: React.FC<{
  similarPlay: SimilarPlay;
  onViewPlay?: (playId: string) => void;
}> = ({ similarPlay, onViewPlay }) => {
  const { play, similarity } = similarPlay;

  return (
    <div className="p-3 bg-surface-muted rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon name="book" size="sm" className="text-primary flex-shrink-0" />
          <Typography variant="body-sm" className="font-medium truncate">
            {play.play_name}
          </Typography>
        </div>
        <SimilarityBar similarity={similarity} />
      </div>

      <div className="flex flex-wrap gap-1.5 text-xs">
        <span className="px-1.5 py-0.5 bg-surface-elevated rounded text-secondary">
          {play.formation}
        </span>
        {play.personnel && (
          <span className="px-1.5 py-0.5 bg-surface-elevated rounded text-secondary">
            {play.personnel}
          </span>
        )}
        {play.p_type && (
          <span className="px-1.5 py-0.5 bg-surface-elevated rounded text-secondary">
            {play.p_type}
          </span>
        )}
        {play.motion && (
          <span className="px-1.5 py-0.5 bg-primary/10 rounded text-primary">
            Motion: {play.motion}
          </span>
        )}
        {play.shift && (
          <span className="px-1.5 py-0.5 bg-primary/10 rounded text-primary">
            Shift: {play.shift}
          </span>
        )}
      </div>

      {onViewPlay && (
        <button
          type="button"
          onClick={() => onViewPlay(play.id)}
          className="mt-2 text-xs text-primary hover:underline"
        >
          View Play →
        </button>
      )}
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface SimilarityIndicatorProps {
  similarity: PlaySimilarityResult;
  onViewPlay?: (playId: string) => void;
  onAddMotion?: () => void;
  onAddShift?: () => void;
  onChangeFormation?: () => void;
  className?: string;
}

export const SimilarityIndicator: React.FC<SimilarityIndicatorProps> = ({
  similarity,
  onViewPlay,
  onAddMotion,
  onAddShift,
  onChangeFormation,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't render if no similarities detected
  if (!similarity.showIndicator) return null;

  const config = LEVEL_CONFIG[similarity.level];
  const { recommendation, similarPlays, maxSimilarity, level, isExactDuplicate } = similarity;

  const handleAction = (action: RecommendationAction) => {
    switch (action.action) {
      case "view_play":
        if (action.playId && onViewPlay) onViewPlay(action.playId);
        break;
      case "add_motion":
        onAddMotion?.();
        break;
      case "add_shift":
        onAddShift?.();
        break;
      case "change_formation":
        onChangeFormation?.();
        break;
      case "proceed":
        setIsExpanded(false);
        break;
    }
  };

  return (
    <div className={`${className}`}>
      {/* Indicator Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
          ${config.bgColor} ${config.borderColor} ${config.color}
          hover:scale-[1.02] active:scale-[0.98]
          ${level !== "unique" ? "animate-pulse-subtle" : ""}
        `}
        style={{
          boxShadow:
            level === "exact_duplicate" || level === "very_similar"
              ? `0 0 12px var(--color-${level === "exact_duplicate" ? "danger" : "warning"}-500)`
              : undefined,
        }}
      >
        <Icon name={config.icon} size="sm" />
        <Typography variant="caption" className="font-semibold">
          {maxSimilarity}% Match
        </Typography>
        <Icon
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size="sm"
          className="ml-1"
        />

        {/* Glow ring for high similarity */}
        {(level === "exact_duplicate" || level === "very_similar") && (
          <span
            className={`absolute inset-0 rounded-lg animate-ping-slow opacity-30 ${config.bgColor}`}
          />
        )}
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div
          className={`mt-2 rounded-lg border ${config.borderColor} ${config.bgColor} overflow-hidden`}
        >
          {/* Recommendation Header */}
          {recommendation && (
            <div className="p-4 border-b border-inherit">
              <div className="flex items-start gap-3">
                <Icon name={config.icon} className={`${config.color} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <Typography variant="body-sm" className={`font-semibold ${config.color}`}>
                    {recommendation.title}
                  </Typography>
                  <Typography variant="body-xs" className="text-secondary mt-1">
                    {recommendation.message}
                  </Typography>

                  {/* Quick Actions */}
                  {recommendation.actions && recommendation.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {recommendation.actions.map((action: RecommendationAction, idx: number) => (
                        <Button
                          key={idx}
                          type="button"
                          variant={action.action === "proceed" ? "ghost" : "secondary"}
                          size="sm"
                          onClick={() => handleAction(action)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Similar Plays List */}
          {similarPlays.length > 0 && (
            <div className="p-4">
              <Typography variant="caption" className="text-tertiary uppercase tracking-wide mb-3">
                Similar Plays ({similarPlays.length})
              </Typography>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {similarPlays.map((sp: SimilarPlay) => (
                  <SimilarPlayItem
                    key={sp.play.id}
                    similarPlay={sp}
                    onViewPlay={onViewPlay}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Duplicate Warning */}
          {isExactDuplicate && (
            <div className="px-4 py-3 bg-danger-default/10 border-t border-danger-default/30">
              <Typography variant="body-xs" className="text-danger-default flex items-center gap-2">
                <Icon name="alert-octagon" size="sm" />
                This exact combination already exists. Add motion, shift, or direction to differentiate.
              </Typography>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// COMPACT INDICATOR (for inline use)
// =============================================================================

interface CompactSimilarityIndicatorProps {
  similarity: PlaySimilarityResult;
  onClick?: () => void;
}

export const CompactSimilarityIndicator: React.FC<CompactSimilarityIndicatorProps> = ({
  similarity,
  onClick,
}) => {
  if (!similarity.showIndicator) return null;

  const config = LEVEL_CONFIG[similarity.level];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex items-center justify-center w-8 h-8 rounded-full transition-all
        ${config.bgColor} ${config.color}
        hover:scale-110 active:scale-95
        ${similarity.level !== "unique" ? "animate-pulse-subtle" : ""}
      `}
      title={`${similarity.maxSimilarity}% similar to existing plays`}
    >
      <Icon name={config.icon} size="sm" />

      {/* Glow effect */}
      {(similarity.level === "exact_duplicate" || similarity.level === "very_similar") && (
        <span
          className={`absolute inset-0 rounded-full animate-ping-slow opacity-40 ${config.bgColor}`}
        />
      )}
    </button>
  );
};
