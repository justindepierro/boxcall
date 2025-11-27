/**
 * SituationFilter Component
 * Filter game plan plays by current down/distance/field position
 * Now with AI-powered confidence scoring + detailed breakdowns (Phase 12.2)
 */

import React, { useEffect, useState } from "react";
import { Typography } from "../design-system";
import { Icon } from "../ui/Icon/Icon";
import type { GameSituation } from "../../types/session";
import type { Play } from "../../types/database";
import {
  PlayConfidenceService,
  type ConfidenceScore,
} from "../../services/playConfidenceService";
import { ConfidenceBreakdown } from "./ConfidenceBreakdown";
import { StreakIndicator } from "./StreakIndicator";

interface SituationFilterProps {
  situation: GameSituation;
  allPlays: Play[];
  filteredPlays: Play[];
  selectedPlay: Play | null;
  onSelectPlay: (play: Play) => void;
  teamId: string;
  disabled?: boolean;
  className?: string;
}

/**
 * SituationFilter - Displays plays filtered by Billick situations
 *
 * Filters by:
 * - Down (1st, 2nd, 3rd, 4th)
 * - Distance (short: 1-3, medium: 4-7, long: 8+)
 * - Field zone (own, midfield, red zone, goal line)
 */
export const SituationFilter: React.FC<SituationFilterProps> = ({
  situation,
  allPlays,
  filteredPlays,
  selectedPlay,
  onSelectPlay,
  teamId,
  disabled = false,
  className = "",
}) => {
  const [confidenceScores, setConfidenceScores] = useState<
    Map<string, ConfidenceScore>
  >(new Map());
  const [loading, setLoading] = useState(false);
  const [selectedConfidence, setSelectedConfidence] = useState<{
    confidence: ConfidenceScore;
    playName: string;
  } | null>(null); // Phase 12.2: for breakdown modal

  // Fetch confidence scores for filtered plays
  useEffect(() => {
    const fetchConfidence = async () => {
      if (filteredPlays.length === 0) return;

      setLoading(true);
      try {
        const playIds = filteredPlays.map((p) => p.id);
        const scores = await PlayConfidenceService.getBatchConfidence(
          playIds,
          teamId,
          situation
        );
        setConfidenceScores(scores);
      } catch (error) {
        console.error("Error fetching confidence scores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfidence();
  }, [filteredPlays, teamId, situation]);

  // Sort plays by confidence score (highest first)
  const sortedPlays = [...filteredPlays].sort((a, b) => {
    const scoreA = confidenceScores.get(a.id)?.overallScore || 50;
    const scoreB = confidenceScores.get(b.id)?.overallScore || 50;
    return scoreB - scoreA;
  });

  const distanceCategory =
    situation.distance <= 3
      ? "Short"
      : situation.distance <= 7
        ? "Medium"
        : "Long";

  const fieldZone =
    situation.yardLine >= 95
      ? "Goal Line"
      : situation.yardLine >= 80
        ? "Red Zone"
        : situation.yardLine >= 50
          ? "Midfield/Opp"
          : "Own Territory";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Summary */}
      <div className="bg-primary/10 border border-primary rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="filter" size="md" className="text-primary mt-0.5" />
          <div className="flex-1">
            <Typography variant="body-md" className="font-medium mb-2">
              Situational Filter Active
            </Typography>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-primary border border-border rounded text-xs font-medium">
                {situation.down}
                {situation.down === 1
                  ? "st"
                  : situation.down === 2
                    ? "nd"
                    : situation.down === 3
                      ? "rd"
                      : "th"}{" "}
                Down
              </span>
              <span className="px-2 py-1 bg-primary border border-border rounded text-xs font-medium">
                {distanceCategory} ({situation.distance} yds)
              </span>
              <span className="px-2 py-1 bg-primary border border-border rounded text-xs font-medium">
                {fieldZone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Play Count */}
      <div className="flex items-center justify-between">
        <Typography variant="body-md" className="font-medium">
          Recommended Plays
        </Typography>
        <Typography variant="body-sm" className="text-muted">
          {filteredPlays.length} of {allPlays.length} plays
        </Typography>
      </div>

      {/* Filtered Plays List */}
      {sortedPlays.length === 0 ? (
        <div className="text-center py-8 bg-secondary rounded-lg border-2 border-dashed border-border">
          <Icon
            name="alert-circle"
            size="lg"
            className="mb-3 text-muted"
          />
          <Typography variant="body-md" className="mb-2">
            No plays match this situation
          </Typography>
          <Typography variant="body-sm" color="muted">
            Try adding more plays to your game plan or adjust the filters
          </Typography>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sortedPlays.map((play) => {
            const isSelected = selectedPlay?.id === play.id;
            const confidence = confidenceScores.get(play.id);

            return (
              <button
                key={play.id}
                onClick={() => onSelectPlay(play)}
                disabled={disabled}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all
                  ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border hover:border-primary/50 hover:bg-secondary"
                  }
                  ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <Typography
                      variant="body-md"
                      className={`font-medium ${isSelected ? "text-primary" : ""}`}
                    >
                      {(play as any).play_name ||
                        play.formation ||
                        "Unknown Play"}
                    </Typography>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {play.formation && (
                        <span className="px-2 py-0.5 bg-secondary border border-border rounded text-xs">
                          {play.formation}
                        </span>
                      )}
                      {(play as any).personnel && (
                        <span className="px-2 py-0.5 bg-secondary border border-border rounded text-xs">
                          {(play as any).personnel}
                        </span>
                      )}
                      {play.play_type && (
                        <span className="px-2 py-0.5 bg-success/10 text-success border border-success/30 rounded text-xs font-medium">
                          {play.play_type}
                        </span>
                      )}
                    </div>

                    {/* Notes field - handle type mismatch with database */}
                    {(play as any).notes && (
                      <Typography
                        variant="body-xs"
                        color="muted"
                        className="mt-2"
                      >
                        {(play as any).notes}
                      </Typography>
                    )}
                  </div>

                  {isSelected && (
                    <Icon
                      name="check-circle"
                      size="md"
                      className="text-primary flex-shrink-0"
                    />
                  )}
                </div>

                {/* AI Confidence Score (Phase 11 feature, Phase 12.2: clickable) */}
                {confidence && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Don't select the play
                      setSelectedConfidence({
                        confidence,
                        playName:
                          (play as any).play_name ||
                          play.formation ||
                          "Unknown Play",
                      });
                    }}
                    className="mt-3 pt-3 border-t border-border w-full text-left hover:bg-primary/50 rounded-lg -mx-2 px-2 py-2 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <Typography
                          variant="body-xs"
                          className="text-muted"
                        >
                          AI Confidence
                        </Typography>
                        <Icon
                          name="info"
                          size="sm"
                          className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Typography variant="body-xs" className="font-medium">
                          {confidence.overallScore}%
                        </Typography>
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            confidence.recommendation === "high"
                              ? "bg-success/20 text-success"
                              : confidence.recommendation === "medium"
                                ? "bg-warning/20 text-warning"
                                : "bg-error/20 text-error"
                          }`}
                        >
                          {confidence.recommendation.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          confidence.overallScore >= 70
                            ? "bg-success"
                            : confidence.overallScore >= 40
                              ? "bg-warning"
                              : "bg-error"
                        }`}
                        style={{ width: `${confidence.overallScore}%` }}
                      />
                    </div>
                    {!loading && confidence.executionCount > 0 && (
                      <Typography
                        variant="body-xs"
                        className="text-muted mt-1"
                      >
                        Based on {confidence.executionCount} execution
                        {confidence.executionCount !== 1 ? "s" : ""} • Click for
                        details
                      </Typography>
                    )}
                  </button>
                )}

                {/* Streak Indicator (Phase 12.3) */}
                {confidence?.streak && (
                  <div className="mt-2">
                    <StreakIndicator
                      current={confidence.streak.current}
                      isHot={confidence.streak.isHot}
                      isCold={confidence.streak.isCold}
                      last5Results={confidence.streak.last5Results}
                      compact
                    />
                  </div>
                )}

                {/* Practice Flag (Phase 12.4) */}
                {confidence?.practiceToGame?.needsMorePractice && (
                  <div className="mt-2 flex items-center gap-1">
                    <Icon name="target" size="sm" className="text-warning" />
                    <Typography
                      variant="body-xs"
                      className="text-warning font-medium"
                    >
                      Needs more practice
                    </Typography>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Filter Tips */}
      <div className="bg-secondary border border-border rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Icon name="lightbulb" size="sm" className="text-warning mt-0.5" />
          <Typography variant="body-xs" className="text-secondary">
            <strong>Tip:</strong> Plays are filtered using Billick Situations
            (down, distance, field zone). Adjust filters in your game plan if
            needed.
          </Typography>
        </div>
      </div>

      {/* Confidence Breakdown Modal (Phase 12.2) */}
      {selectedConfidence && (
        <ConfidenceBreakdown
          confidence={selectedConfidence.confidence}
          playName={selectedConfidence.playName}
          onClose={() => setSelectedConfidence(null)}
        />
      )}
    </div>
  );
};
