/**
 * DownDistanceTracker Component
 * Track and update game situation (down, distance, yard line, quarter)
 */

import React from "react";
import type { GameSituation, HashMark } from "../../types/session";
import { Typography } from "../design-system";
import { Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";

interface DownDistanceTrackerProps {
  situation: GameSituation;
  onUpdate: (updates: Partial<GameSituation>) => void;
  onFirstDown: () => void;
  onNextQuarter: () => void;
  disabled?: boolean;
  className?: string;
}

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
  disabled = false,
  className = "",
}) => {
  const fieldZone =
    situation.yardLine >= 95
      ? "Goal Line"
      : situation.yardLine >= 80
        ? "Red Zone"
        : situation.yardLine >= 50
          ? "Opp Territory"
          : "Own Territory";

  const fieldZoneColor =
    situation.yardLine >= 95
      ? "text-error"
      : situation.yardLine >= 80
        ? "text-warning"
        : situation.yardLine >= 50
          ? "text-success"
          : "text-primary";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Situation Display */}
      <div className="bg-secondary border-2 border-primary rounded-lg p-4">
        <Typography variant="body-xs" className="text-muted mb-1">
          Current Situation
        </Typography>
        <Typography variant="headline-lg" className="font-mono">
          {situation.down}
          <sup className="text-sm">
            {situation.down === 1
              ? "st"
              : situation.down === 2
                ? "nd"
                : situation.down === 3
                  ? "rd"
                  : "th"}
          </sup>{" "}
          & {situation.distance} at{" "}
          {situation.yardLine < 50
            ? `OWN ${situation.yardLine}`
            : situation.yardLine === 50
              ? "MIDFIELD"
              : `OPP ${100 - situation.yardLine}`}
        </Typography>
        <Typography variant="body-sm" className={fieldZoneColor}>
          {fieldZone} ·{" "}
          {situation.hashMark.charAt(0).toUpperCase() +
            situation.hashMark.slice(1)}{" "}
          Hash
        </Typography>
      </div>

      {/* Quarter & Time */}
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

      {/* Down & Distance */}
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

      {/* Yard Line Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Typography variant="body-sm" className="text-secondary">
            Yard Line
          </Typography>
          <Typography variant="body-sm" className="font-mono font-medium">
            {situation.yardLine < 50
              ? `OWN ${situation.yardLine}`
              : situation.yardLine === 50
                ? "50"
                : `OPP ${100 - situation.yardLine}`}
          </Typography>
        </div>
        <div className="relative">
          <input
            type="range"
            value={situation.yardLine}
            onChange={(e) => onUpdate({ yardLine: parseInt(e.target.value) })}
            min={0}
            max={100}
            step={1}
            disabled={disabled}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            style={{
              background: `linear-gradient(to right, 
                var(--color-primary) 0%, 
                var(--color-primary) ${situation.yardLine}%, 
                var(--color-bg-secondary) ${situation.yardLine}%, 
                var(--color-bg-secondary) 100%)`,
            }}
          />
          {/* Field markers */}
          <div className="flex justify-between mt-1 text-xs text-muted font-mono">
            <span>G</span>
            <span>25</span>
            <span>50</span>
            <span>25</span>
            <span>G</span>
          </div>
        </div>
      </div>

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
      <div className="bg-secondary rounded-lg p-3">
        <div className="flex items-center justify-between">
          <Typography variant="body-xs" className="text-muted">
            Field Zone
          </Typography>
          <Typography
            variant="body-sm"
            className={`font-medium ${fieldZoneColor}`}
          >
            {fieldZone}
          </Typography>
        </div>
        <div className="mt-2 h-1 rounded-full bg-primary overflow-hidden">
          <div
            className={`h-full transition-all ${
              situation.yardLine >= 95
                ? "bg-error"
                : situation.yardLine >= 80
                  ? "bg-warning"
                  : situation.yardLine >= 50
                    ? "bg-success"
                    : "bg-primary"
            }`}
            style={{ width: `${situation.yardLine}%` }}
          />
        </div>
      </div>
    </div>
  );
};
