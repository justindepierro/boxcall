/**
 * PlayerCard Component
 *
 * Individual player card with:
 * - Selection checkbox
 * - Player name and badges (jersey, position, grade)
 * - Stats (height, weight)
 * - Status toggle
 * - Edit button
 * - Click-through navigation
 *
 * Optimized with React.memo to prevent unnecessary re-renders
 */

import React from "react";
import { Card, Button } from "../../../components/ui";
import { Icon } from "../../../components/ui/Icon/Icon";
import { Typography } from "../../../components/design-system";
import type { RosterPlayerView } from "../../../services/rosterService";

export interface PlayerCardProps {
  player: RosterPlayerView;
  isSelected: boolean;
  onToggleSelection: (playerId: string) => void;
  onEdit: (player: RosterPlayerView) => void;
  onToggleStatus: (player: RosterPlayerView, e: React.MouseEvent) => void;
  onNavigate: (playerId: string) => void;
}

export const PlayerCard = React.memo<PlayerCardProps>(
  ({
    player,
    isSelected,
    onToggleSelection,
    onEdit,
    onToggleStatus,
    onNavigate,
  }) => {
    // Performance monitoring in development
    if (import.meta.env.DEV) {
      console.log(
        `PlayerCard rendered: ${player.first_name} ${player.last_name}`
      );
    }

    return (
      <Card
        onClick={() => onNavigate(player.id)}
        className={`p-spacing-md transition-all duration-300 cursor-pointer ${
          isSelected
            ? "ring-2 ring-cyan-400 bg-cyan-50/30 shadow-lg shadow-cyan-500/10"
            : "hover:shadow-lg hover:shadow-jade-500/5"
        }`}
      >
        <div className="flex items-start justify-between mb-spacing-md">
          <div className="flex items-center gap-spacing-sm">
            {/* Selection Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelection(player.id);
              }}
              className="w-5 h-5 rounded border text-jade-600 focus:ring-2 focus:ring-jade-500 cursor-pointer transition-all"
              aria-label={`Select ${player.first_name} ${player.last_name}`}
            />
            <div>
              <Typography variant="headline-sm" className="font-semibold mb-1">
                {player.first_name}
                {player.nickname && (
                  <span className="italic text-pink-600 dark:text-pink-400">
                    {" "}"{player.nickname}"
                  </span>
                )}{" "}
                {player.last_name}
              </Typography>
              {/* Badges Row */}
              <div className="flex gap-2 flex-wrap">
                {/* Jersey Number Badge - Jade gradient (primary brand) */}
                {player.jersey_number && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-jade-600 to-jade-700 text-white shadow-sm">
                    #{player.jersey_number}
                  </span>
                )}
                {/* Position Badges - Blue gradient (information) */}
                {player.position &&
                  player.position
                    .split(",")
                    .filter(Boolean)
                    .map((pos) => (
                      <span
                        key={pos}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-400/30 shadow-sm"
                      >
                        {pos.trim()}
                      </span>
                    ))}
                {/* Grade Level Badge - Purple gradient (progression) */}
                {player.grade_level && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white border border-purple-400/30 shadow-sm">
                    {player.grade_level}
                  </span>
                )}
                {/* Invitation Status Badge */}
                {player.invitation_status === "pending" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white border border-warning/30 shadow-sm">
                    Invited
                  </span>
                )}
                {player.invitation_status === "accepted" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white border border-success/30 shadow-sm">
                    ✓ Accepted
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-spacing-xs">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(player);
              }}
              aria-label="Edit player"
              className="hover:bg-jade-50 hover:text-jade-700 transition-colors"
            >
              <Icon name="edit" className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-spacing-xs text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Height:</span>
            <span className="font-medium">
              {player.height_inches
                ? `${Math.floor(player.height_inches / 12)}'${
                    player.height_inches % 12
                  }"`
                : "Not set"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Weight:</span>
            <span className="font-medium">
              {player.weight_lbs ? `${player.weight_lbs} lbs` : "Not set"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Status:</span>
            <button
              onClick={(e) => onToggleStatus(player, e)}
              className={`capitalize px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm ${
                player.is_active
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 hover:shadow-md"
                  : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-md"
              }`}
              role="switch"
              aria-checked={player.is_active ?? false}
              aria-label={`Toggle status for ${player.first_name} ${player.last_name}. Currently ${
                player.is_active ? "active" : "inactive"
              }`}
            >
              {player.is_active ? "Active" : "Inactive"}
            </button>
          </div>
        </div>
      </Card>
    );
  },
  // Custom comparison function for optimization
  (prevProps, nextProps) => {
    // Only re-render if these specific properties change
    return (
      prevProps.player.id === nextProps.player.id &&
      prevProps.player.is_active === nextProps.player.is_active &&
      prevProps.player.first_name === nextProps.player.first_name &&
      prevProps.player.last_name === nextProps.player.last_name &&
      prevProps.player.position === nextProps.player.position &&
      prevProps.player.jersey_number === nextProps.player.jersey_number &&
      prevProps.player.grade_level === nextProps.player.grade_level &&
      prevProps.player.height_inches === nextProps.player.height_inches &&
      prevProps.player.weight_lbs === nextProps.player.weight_lbs &&
      prevProps.isSelected === nextProps.isSelected
    );
  }
);

PlayerCard.displayName = "PlayerCard";
