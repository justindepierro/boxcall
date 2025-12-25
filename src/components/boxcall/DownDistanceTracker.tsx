/**
 * DownDistanceTracker Component
 * Track and update game situation (down, distance, yard line, quarter)
 */

import React, { useEffect, useState } from "react";
import type { GameSituation, HashMark } from "../../types/session";
import { Typography } from "../design-system";
import { Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";
import {
  bucketDistance,
  bucketFieldZone,
  getDistanceColorByDistance,
  getFieldZoneColorByYardLine,
} from "../../utils/situationBucketing";
import type { SituationDefinitions } from "../../types/situationDefinitions";
import { TeamSituationDefinitionsService } from "../../services/teamSituationDefinitionsService";
import { yardLineToBallOn } from "../../utils/ballOn";
import { Badge } from "../ui/Badge";

interface DownDistanceTrackerProps {
  situation: GameSituation;
  onUpdate: (updates: Partial<GameSituation>) => void;
  onFirstDown: () => void;
  onNextQuarter: () => void;
  teamId?: string;
  teamDefs?: SituationDefinitions | null;
  disabled?: boolean;
  className?: string;
}

// Helper utilities
const getOrdinalSuffix = (down: number) => {
  if (down === 1) return "st";
  if (down === 2) return "nd";
  if (down === 3) return "rd";
  return "th";
};

const getFieldZoneLabel = (
  teamDefs: Partial<SituationDefinitions> | null | undefined,
  yardLine: number
) => bucketFieldZone(teamDefs, yardLine);

// Current situation display
const SituationDisplay: React.FC<{
  situation: GameSituation;
  teamDefs: Partial<SituationDefinitions> | null | undefined;
}> = ({ situation, teamDefs }) => {
  const fieldZoneLabel = getFieldZoneLabel(teamDefs, situation.yardLine);
  const fieldZoneColor = getFieldZoneColorByYardLine(
    teamDefs,
    situation.yardLine
  );
  const distanceLabel = bucketDistance(teamDefs, situation.distance);
  const distanceColor = getDistanceColorByDistance(
    teamDefs,
    situation.distance
  );

  return (
    <div className="bg-secondary border-2 border-primary rounded-lg p-4">
      <Typography variant="body-xs" className="text-muted mb-1">
        Current Situation
      </Typography>
      <Typography variant="headline-lg" className="font-mono">
        {situation.down}
        <sup className="text-sm">{getOrdinalSuffix(situation.down)}</sup> &{" "}
        {situation.distance} at {yardLineToBallOn(situation.yardLine)}
      </Typography>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge variant="neutral" scheme={fieldZoneColor} size="sm">
          {fieldZoneLabel}
        </Badge>
        <Badge variant="neutral" scheme={distanceColor} size="sm">
          {distanceLabel}
        </Badge>
        <Badge variant="neutral" size="sm">
          {situation.hashMark.charAt(0).toUpperCase() +
            situation.hashMark.slice(1)}{" "}
          Hash
        </Badge>
      </div>
    </div>
  );
};

// Quarter and time controls
const QuarterTimeControls: React.FC<{
  situation: GameSituation;
  onUpdate: (updates: Partial<GameSituation>) => void;
  disabled: boolean;
}> = ({ situation, onUpdate, disabled }) => (
  <div className="grid grid-cols-2 gap-3">
    <div>
      <label className="block mb-2">
        <Typography variant="body-sm" className="text-secondary">
          Quarter
        </Typography>
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((q) => (
          <Button
            key={q}
            variant={situation.quarter === q ? "primary" : "secondary"}
            size="sm"
            onClick={() => onUpdate({ quarter: q })}
            disabled={disabled}
            className="flex-1"
          >
            {q}
          </Button>
        ))}
      </div>
    </div>

    <div>
      <label className="block mb-2">
        <Typography variant="body-sm" className="text-secondary">
          Time Remaining
        </Typography>
      </label>
      <input
        type="text"
        value={situation.timeRemaining}
        onChange={(e) => onUpdate({ timeRemaining: e.target.value })}
        placeholder="15:00"
        disabled={disabled}
        className="w-full px-3 py-2 border border-border rounded-lg bg-primary text-primary font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      />
    </div>
  </div>
);

// Down and distance controls
const DownDistanceControls: React.FC<{
  situation: GameSituation;
  onUpdate: (updates: Partial<GameSituation>) => void;
  disabled: boolean;
}> = ({ situation, onUpdate, disabled }) => (
  <div className="grid grid-cols-2 gap-3">
    <div>
      <label className="block mb-2">
        <Typography variant="body-sm" className="text-secondary">
          Down
        </Typography>
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((d) => (
          <Button
            key={d}
            variant={situation.down === d ? "primary" : "secondary"}
            size="md"
            onClick={() => onUpdate({ down: d })}
            disabled={disabled}
            className="flex-1"
          >
            {d}
          </Button>
        ))}
      </div>
    </div>

    <div>
      <label className="block mb-2">
        <Typography variant="body-sm" className="text-secondary">
          Distance (yards)
        </Typography>
      </label>
      <input
        type="number"
        value={situation.distance}
        onChange={(e) =>
          onUpdate({ distance: Math.max(1, parseInt(e.target.value) || 1) })
        }
        min={1}
        max={99}
        disabled={disabled}
        className="w-full px-3 py-2 border border-border rounded-lg bg-primary text-primary font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      />
    </div>
  </div>
);

// Yard line slider
const YardLineSlider: React.FC<{
  yardLine: number;
  onUpdate: (yardLine: number) => void;
  disabled: boolean;
}> = ({ yardLine, onUpdate, disabled }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <Typography variant="body-sm" className="text-secondary">
        Yard Line
      </Typography>
      <Typography variant="body-sm" className="font-mono font-medium">
        {yardLineToBallOn(yardLine)}
      </Typography>
    </div>
    <div className="relative">
      <input
        type="range"
        value={yardLine}
        onChange={(e) => onUpdate(parseInt(e.target.value))}
        min={0}
        max={100}
        step={1}
        disabled={disabled}
        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        style={{
          background: `linear-gradient(to right, 
                var(--color-primary) 0%, 
                var(--color-primary) ${yardLine}%, 
                var(--color-bg-secondary) ${yardLine}%, 
                var(--color-bg-secondary) 100%)`,
        }}
      />
      <div className="flex justify-between mt-1 text-xs text-muted font-mono">
        <span>G</span>
        <span>25</span>
        <span>50</span>
        <span>25</span>
        <span>G</span>
      </div>
    </div>
  </div>
);

// Field zone indicator
const FieldZoneIndicator: React.FC<{
  yardLine: number;
  teamDefs: Partial<SituationDefinitions> | null | undefined;
}> = ({ yardLine, teamDefs }) => {
  const fieldZone = getFieldZoneLabel(teamDefs, yardLine);
  const color = getFieldZoneColorByYardLine(teamDefs, yardLine);

  return (
    <div className="bg-secondary rounded-lg p-3">
      <div className="flex items-center justify-between">
        <Typography variant="body-xs" className="text-muted">
          Field Zone
        </Typography>
        <Badge variant="neutral" scheme={color} size="sm">
          {fieldZone}
        </Badge>
      </div>
      <div className="mt-2 h-1 rounded-full bg-primary overflow-hidden">
        <div
          className="h-full transition-all bg-primary"
          style={{ width: `${yardLine}%` }}
        />
      </div>
    </div>
  );
};

/**
 * DownDistanceTracker - Game state tracking with auto-advance logic
 *
 * Features:
 * - Quick down/distance inputs
 * - Yard line slider
 * - Hash mark selector
 * - Quarter and time tracking
 * - First down reset button
 */
export const DownDistanceTracker: React.FC<DownDistanceTrackerProps> = ({
  situation,
  onUpdate,
  onFirstDown,
  onNextQuarter,
  teamId,
  teamDefs,
  disabled = false,
  className = "",
}) => {
  const [loadedTeamDefs, setLoadedTeamDefs] =
    useState<SituationDefinitions | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (teamDefs) {
      setLoadedTeamDefs(null);
      return () => {
        isMounted = false;
      };
    }

    const load = async () => {
      if (!teamId) return;
      try {
        const defs = await TeamSituationDefinitionsService.get(teamId);
        if (isMounted) setLoadedTeamDefs(defs);
      } catch {
        if (isMounted) setLoadedTeamDefs(null);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [teamId, teamDefs]);

  const effectiveDefs = teamDefs ?? loadedTeamDefs;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Situation Display */}
      <SituationDisplay situation={situation} teamDefs={effectiveDefs} />

      {/* Quarter & Time */}
      <QuarterTimeControls
        situation={situation}
        onUpdate={onUpdate}
        disabled={disabled}
      />

      {/* Down & Distance */}
      <DownDistanceControls
        situation={situation}
        onUpdate={onUpdate}
        disabled={disabled}
      />

      {/* Yard Line Slider */}
      <YardLineSlider
        yardLine={situation.yardLine}
        onUpdate={(yardLine) => onUpdate({ yardLine })}
        disabled={disabled}
      />

      {/* Hash Mark */}
      <div>
        <label className="block mb-2">
          <Typography variant="body-sm" className="text-secondary">
            Hash Mark
          </Typography>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["left", "middle", "right"] as HashMark[]).map((hash) => (
            <Button
              key={hash}
              variant={situation.hashMark === hash ? "primary" : "secondary"}
              size="sm"
              onClick={() => onUpdate({ hashMark: hash })}
              disabled={disabled}
              className="capitalize"
            >
              {hash}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <Button
          variant="primary"
          size="md"
          onClick={onFirstDown}
          disabled={disabled}
          className="flex-1"
        >
          <Icon name="arrow-right" size="sm" />
          First Down
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={onNextQuarter}
          disabled={disabled || situation.quarter >= 4}
        >
          <Icon name="skip-forward" size="sm" />
          Next Q
        </Button>
      </div>

      {/* Field Zone Indicator */}
      <FieldZoneIndicator
        yardLine={situation.yardLine}
        teamDefs={effectiveDefs}
      />
    </div>
  );
};
