/**
 * PlayerInfoSection Component
 *
 * Shows player-specific information (jersey, positions, height, weight)
 */

import { Hash } from "lucide-react";
import { Typography } from "../../../design-system/Typography";
import type { PlayerInfo } from "../types";

interface PlayerInfoSectionProps {
  playerInfo: PlayerInfo;
}

export function PlayerInfoSection({ playerInfo }: PlayerInfoSectionProps) {
  return (
    <div className="p-3 bg-secondary rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Hash className="w-4 h-4 text-blue-500" />
        <Typography
          variant="body-sm"
          className="font-semibold text-primary"
        >
          Player Information
        </Typography>
      </div>
      <div className="space-y-2">
        {playerInfo.jersey_number && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Jersey:</span>
            <span className="text-sm font-medium text-primary">
              #{playerInfo.jersey_number}
            </span>
          </div>
        )}
        {playerInfo.positions && playerInfo.positions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Positions:</span>
            <div className="flex gap-1 flex-wrap">
              {playerInfo.positions.map((pos) => (
                <span
                  key={pos}
                  className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full"
                >
                  {pos}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-4">
          {playerInfo.height_inches && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Height:</span>
              <span className="text-sm text-primary">
                {Math.floor(playerInfo.height_inches / 12)}'
                {playerInfo.height_inches % 12}"
              </span>
            </div>
          )}
          {playerInfo.weight_lbs && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Weight:</span>
              <span className="text-sm text-primary">
                {playerInfo.weight_lbs} lbs
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
