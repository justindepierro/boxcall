/**
 * SituationFilter Component
 * Filter game plan plays by current down/distance/field position
 * Now with AI-powered confidence scoring + detailed breakdowns (Phase 12.2)
 */

import React, { useEffect, useState } from "react";
import { Typography } from "../design-system";
import { Icon } from "../ui/Icon/Icon";
import type { GameSituation } from "../../types/session";
import type { GamePlanPlay } from "../../services/gamePlanService";
import {
  PlayConfidenceService,
  type ConfidenceScore,
} from "../../services/playConfidenceService";
import { TeamSituationDefinitionsService } from "../../services/teamSituationDefinitionsService";
import type { SituationDefinitions } from "../../types/situationDefinitions";
import {
  bucketDistance,
  bucketFieldZone,
  getDistanceColorByDistance,
  getFieldZoneColorByYardLine,
} from "../../utils/situationBucketing";
import { Badge } from "../ui/Badge";
import { ConfidenceBreakdown } from "./ConfidenceBreakdown";
import { StreakIndicator } from "./StreakIndicator";
import { logError } from "../../utils/logger";

/** Get ordinal suffix for down number (1st, 2nd, 3rd, 4th) */
function getOrdinalSuffix(down: number): string {
  if (down === 1) return "st";
  if (down === 2) return "nd";
  if (down === 3) return "rd";
  return "th";
}

/** Get distance and field zone labels */
function getSituationLabels(
  situation: GameSituation,
  teamDefs: Partial<SituationDefinitions> | null | undefined
) {
  const distanceCategory = bucketDistance(teamDefs, situation.distance);
  const fieldZone = bucketFieldZone(teamDefs, situation.yardLine);
  return { distanceCategory, fieldZone };
}

/** Get confidence score color classes */
function getConfidenceColor(score: number, type: "bg" | "text" = "bg"): string {
  if (score >= 70) return type === "bg" ? "bg-success" : "text-success";
  if (score >= 40) return type === "bg" ? "bg-warning" : "text-warning";
  return type === "bg" ? "bg-error" : "text-error";
}

/** Get recommendation badge color */
function getRecommendationColor(recommendation: string): string {
  if (recommendation === "high") return "bg-success/20 text-success";
  if (recommendation === "medium") return "bg-warning/20 text-warning";
  return "bg-error/20 text-error";
}

interface SituationFilterProps {
  situation: GameSituation;
  allPlays: GamePlanPlay[];
  filteredPlays: GamePlanPlay[];
  selectedPlay: GamePlanPlay | null;
  onSelectPlay: (play: GamePlanPlay) => void;
  teamId: string;
  teamDefs?: SituationDefinitions | null;
  disabled?: boolean;
  className?: string;
}

interface FilterSummaryProps {
  situation: GameSituation;
  teamDefs: Partial<SituationDefinitions> | null | undefined;
}

/** Filter summary badge display */
const FilterSummary: React.FC<FilterSummaryProps> = ({
  situation,
  teamDefs,
}) => {
  const { distanceCategory, fieldZone } = getSituationLabels(
    situation,
    teamDefs
  );
  const distanceColor = getDistanceColorByDistance(
    teamDefs,
    situation.distance
  );
  const fieldZoneColor = getFieldZoneColorByYardLine(
    teamDefs,
    situation.yardLine
  );

  return (
    <div className="bg-primary/10 border border-primary rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Icon name="filter" size="md" className="text-primary mt-0.5" />
        <div className="flex-1">
          <Typography variant="body-md" className="font-medium mb-2">
            Situational Filter Active
          </Typography>
          <div className="flex flex-wrap gap-2">
            <Badge variant="neutral" size="sm">
              {situation.down}
              {getOrdinalSuffix(situation.down)} Down
            </Badge>
            <Badge variant="neutral" scheme={distanceColor} size="sm">
              {distanceCategory} ({situation.distance} yds)
            </Badge>
            <Badge variant="neutral" scheme={fieldZoneColor} size="sm">
              {fieldZone}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PlayConfidenceDisplayProps {
  confidence: ConfidenceScore;
  loading: boolean;
  onShowDetails: () => void;
}

/** Confidence score display with progress bar */
const PlayConfidenceDisplay: React.FC<PlayConfidenceDisplayProps> = ({
  confidence,
  loading,
  onShowDetails,
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onShowDetails();
      }}
      className="mt-3 pt-3 border-t border-border w-full text-left hover:bg-primary/50 rounded-lg -mx-2 px-2 py-2 transition-colors group"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <Typography variant="body-xs" className="text-muted">
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
            className={`px-1.5 py-0.5 rounded text-xs font-medium ${getRecommendationColor(confidence.recommendation)}`}
          >
            {confidence.recommendation.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="w-full bg-secondary rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${getConfidenceColor(confidence.overallScore)}`}
          style={{ width: `${confidence.overallScore}%` }}
        />
      </div>
      {!loading && confidence.executionCount > 0 && (
        <Typography variant="body-xs" className="text-muted mt-1">
          Based on {confidence.executionCount} execution
          {confidence.executionCount !== 1 ? "s" : ""} • Click for details
        </Typography>
      )}
    </button>
  );
};

interface PlayCardProps {
  play: GamePlanPlay;
  isSelected: boolean;
  confidence: ConfidenceScore | undefined;
  disabled: boolean;
  loading: boolean;
  onSelectPlay: (play: GamePlanPlay) => void;
  onShowConfidenceDetails: (
    confidence: ConfidenceScore,
    playName: string
  ) => void;
}

function getPlayCardName(play: GamePlanPlay): string {
  const playDetails = play.play;
  return playDetails?.play_name || playDetails?.formation || "Unknown Play";
}

function getPlayCardClassName(params: {
  isSelected: boolean;
  disabled: boolean;
}): string {
  const { isSelected, disabled } = params;

  const selectionClass = isSelected
    ? "border-primary bg-primary/10 shadow-md"
    : "border-border hover:border-primary/50 hover:bg-secondary";

  const disabledClass = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return `
        w-full text-left p-4 rounded-lg border-2 transition-all
        ${selectionClass}
        ${disabledClass}
      `;
}

const PlayMetaBadges: React.FC<{ play: GamePlanPlay["play"] }> = ({ play }) => {
  if (!play) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {play.formation && (
        <span className="px-2 py-0.5 bg-secondary border border-border rounded text-xs">
          {play.formation}
        </span>
      )}
      {play.personnel && (
        <span className="px-2 py-0.5 bg-secondary border border-border rounded text-xs">
          {play.personnel}
        </span>
      )}
      {play.p_type && (
        <span className="px-2 py-0.5 bg-success/10 text-success border border-success/30 rounded text-xs font-medium">
          {play.p_type}
        </span>
      )}
    </div>
  );
};

const PlayConfidenceExtras: React.FC<{ confidence: ConfidenceScore }> = ({
  confidence,
}) => {
  return (
    <>
      {confidence.streak && (
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

      {confidence.practiceToGame?.needsMorePractice && (
        <div className="mt-2 flex items-center gap-1">
          <Icon name="target" size="sm" className="text-warning" />
          <Typography variant="body-xs" className="text-warning font-medium">
            Needs more practice
          </Typography>
        </div>
      )}
    </>
  );
};

/** Individual play card with confidence scoring */
const PlayCard: React.FC<PlayCardProps> = ({
  play,
  isSelected,
  confidence,
  disabled,
  loading,
  onSelectPlay,
  onShowConfidenceDetails,
}) => {
  const playDetails = play.play;
  const playName = getPlayCardName(play);

  return (
    <button
      onClick={() => onSelectPlay(play)}
      disabled={disabled}
      className={getPlayCardClassName({ isSelected, disabled })}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <Typography
            variant="body-md"
            className={`font-medium ${isSelected ? "text-primary" : ""}`}
          >
            {playName}
          </Typography>

          <PlayMetaBadges play={playDetails} />

          {play.notes && (
            <Typography variant="body-xs" color="muted" className="mt-2">
              {play.notes}
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

      {confidence && (
        <PlayConfidenceDisplay
          confidence={confidence}
          loading={loading}
          onShowDetails={() => onShowConfidenceDetails(confidence, playName)}
        />
      )}

      {confidence && <PlayConfidenceExtras confidence={confidence} />}
    </button>
  );
};

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
  teamDefs: teamDefsOverride,
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

  const [loadedTeamDefs, setLoadedTeamDefs] =
    useState<SituationDefinitions | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadTeamDefs = async () => {
      try {
        if (teamDefsOverride) {
          if (isMounted) setLoadedTeamDefs(null);
          return;
        }

        const defs = await TeamSituationDefinitionsService.get(teamId);
        if (isMounted) setLoadedTeamDefs(defs);
      } catch (error) {
        logError("Error fetching situation definitions:", error);
        if (isMounted) setLoadedTeamDefs(null);
      }
    };

    loadTeamDefs();
    return () => {
      isMounted = false;
    };
  }, [teamId, teamDefsOverride]);

  const effectiveTeamDefs = teamDefsOverride ?? loadedTeamDefs;

  // Fetch confidence scores for filtered plays
  useEffect(() => {
    const fetchConfidence = async () => {
      if (filteredPlays.length === 0) return;

      setLoading(true);
      try {
        const playIds = filteredPlays.map((p) => p.playId);
        const scores = await PlayConfidenceService.getBatchConfidence(
          playIds,
          teamId,
          situation
        );
        setConfidenceScores(scores);
      } catch (error) {
        logError("Error fetching confidence scores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfidence();
  }, [filteredPlays, teamId, situation]);

  // Sort plays by confidence score (highest first)
  const sortedPlays = [...filteredPlays].sort((a, b) => {
    const scoreA = confidenceScores.get(a.playId)?.overallScore || 50;
    const scoreB = confidenceScores.get(b.playId)?.overallScore || 50;
    return scoreB - scoreA;
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Summary */}
      <FilterSummary situation={situation} teamDefs={effectiveTeamDefs} />

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
          <Icon name="alert-circle" size="lg" className="mb-3 text-muted" />
          <Typography variant="body-md" className="mb-2">
            No plays match this situation
          </Typography>
          <Typography variant="body-sm" color="muted">
            Try adding more plays to your game plan or adjust the filters
          </Typography>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sortedPlays.map((play) => (
            <PlayCard
              key={play.id}
              play={play}
              isSelected={selectedPlay?.id === play.id}
              confidence={confidenceScores.get(play.playId)}
              disabled={disabled}
              loading={loading}
              onSelectPlay={onSelectPlay}
              onShowConfidenceDetails={(confidence, playName) => {
                setSelectedConfidence({ confidence, playName });
              }}
            />
          ))}
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
