/**
 * DuplicatePlayWarning Component
 *
 * Shows a warning banner when the user is about to create a duplicate play
 */

import React from "react";
import { Icon } from "../../../ui/Icon/Icon";
import { Typography } from "../../../design-system/Typography";
import type { Play } from "../../../../types/play";

interface DuplicatePlayWarningProps {
  matchingPlays: Play[];
  onViewPlay?: (play: Play) => void;
}

export const DuplicatePlayWarning: React.FC<DuplicatePlayWarningProps> = ({
  matchingPlays,
  onViewPlay,
}) => {
  if (matchingPlays.length === 0) return null;

  return (
    <div className="bg-warning-bg border border-warning-border rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <Icon
          name="alert-triangle"
          className="text-warning-600 flex-shrink-0 mt-0.5"
          size={20}
        />
        <div className="flex-1 min-w-0">
          <Typography
            variant="body-sm"
            className="font-semibold text-warning-text mb-1"
          >
            Duplicate Play Detected
          </Typography>
          <Typography
            variant="body-xs"
            className="text-warning-text-secondary mb-2"
          >
            {matchingPlays.length === 1
              ? "A play with this name and formation already exists:"
              : `${matchingPlays.length} plays with this name and formation already exist:`}
          </Typography>

          <div className="space-y-1.5">
            {matchingPlays.slice(0, 3).map((play) => (
              <div
                key={play.id}
                className="flex items-center gap-2 bg-white rounded px-2 py-1.5 text-sm"
              >
                <Icon
                  name="book"
                  size={14}
                  className="text-warning-600 flex-shrink-0"
                />
                <Typography
                  variant="body-xs"
                  className="text-primary flex-1 min-w-0 truncate"
                >
                  <span className="font-medium">{play.play_name}</span>
                  {" • "}
                  <span className="text-muted">{play.formation}</span>
                  {play.p_type && (
                    <>
                      {" • "}
                      <span className="text-muted">{play.p_type}</span>
                    </>
                  )}
                </Typography>
                {onViewPlay && (
                  <button
                    type="button"
                    onClick={() => onViewPlay(play)}
                    className="text-xs text-warning-text hover:text-warning-text-dark font-medium flex-shrink-0"
                  >
                    View
                  </button>
                )}
              </div>
            ))}

            {matchingPlays.length > 3 && (
              <Typography
                variant="body-xs"
                className="text-warning-text italic pl-2"
              >
                + {matchingPlays.length - 3} more
              </Typography>
            )}
          </div>

          <Typography
            variant="body-xs"
            className="text-warning-text mt-2 italic"
          >
            💡 Tip: Consider using a different name or variation (e.g., "Power O
            vs Cover 2")
          </Typography>
        </div>
      </div>
    </div>
  );
};
