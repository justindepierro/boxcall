import React from "react";
import { Icon } from "../../../ui/Icon/Icon";
import { Typography } from "../../../design-system/Typography";

// Import team player type (you may need to adjust this path)
interface TeamPlayer {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number?: number;
  position?: string;
  is_active?: boolean;
}

interface KeyPlayerSelectorProps {
  selectedPlayerIds: string[];
  teamPlayers: TeamPlayer[];
  onAdd: (playerId: string) => void;
  onRemove: (playerId: string) => void;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * KeyPlayerSelector Component
 *
 * Allows selection of key players from team roster.
 * Links plays to specific roster players via UUID references.
 *
 * Features:
 * - Dropdown from team_players roster
 * - Shows player name + jersey number + position
 * - Profile badges for selected players
 * - Live roster data
 * - Prevents duplicate selections
 * - Filters out inactive players
 *
 * @example
 * <KeyPlayerSelector
 *   selectedPlayerIds={formData.key_players || []}
 *   teamPlayers={rosterData || []}
 *   onAdd={(playerId) => setFormData({ ...formData, key_players: [...(formData.key_players || []), playerId] })}
 *   onRemove={(playerId) => setFormData({ ...formData, key_players: formData.key_players?.filter(id => id !== playerId) })}
 * />
 */
export const KeyPlayerSelector: React.FC<KeyPlayerSelectorProps> = ({
  selectedPlayerIds,
  teamPlayers,
  onAdd,
  onRemove,
  label = "Key Players",
  helperText,
  disabled = false,
  loading = false,
}) => {
  const selectedPlayers = teamPlayers.filter((p) =>
    selectedPlayerIds.includes(p.id)
  );

  const availablePlayers = teamPlayers.filter(
    (p) => !selectedPlayerIds.includes(p.id) && p.is_active !== false
  );

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPlayerId = e.target.value;
    if (selectedPlayerId) {
      onAdd(selectedPlayerId);
      e.target.value = ""; // Reset dropdown
    }
  };

  const formatPlayerName = (player: TeamPlayer) => {
    let name = `${player.first_name} ${player.last_name}`;
    if (player.jersey_number) {
      name += ` #${player.jersey_number}`;
    }
    if (player.position) {
      name += ` - ${player.position}`;
    }
    return name;
  };

  const noPlayers = teamPlayers.length === 0;

  return (
    <div className="space-y-spacing-xs">
      {/* Label */}
      <Typography variant="label-md" className="block text-secondary">
        <Icon name="user-plus" className="h-4 w-4 mr-spacing-xs inline" />
        {label}
        {selectedPlayers.length > 0 && (
          <Typography
            variant="caption"
            as="span"
            color="muted"
            className="ml-spacing-xs"
          >
            ({selectedPlayers.length} selected)
          </Typography>
        )}
      </Typography>

      {/* Helper text */}
      {helperText && (
        <Typography variant="caption" color="muted">
          {helperText}
        </Typography>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="p-spacing-sm bg-surface-secondary rounded-md border border-border">
          <Typography variant="body-sm" color="muted" className="italic">
            <Icon
              name="refresh-cw"
              className="h-4 w-4 mr-spacing-xs inline animate-spin"
            />
            Loading roster...
          </Typography>
        </div>
      ) : noPlayers ? (
        /* No players warning */
        <div className="p-spacing-sm bg-surface-secondary rounded-md border border-border">
          <Typography variant="body-sm" color="muted" className="italic">
            <Icon name="info" className="h-4 w-4 mr-spacing-xs inline" />
            No players found in roster
          </Typography>
        </div>
      ) : (
        <>
          {/* Player dropdown */}
          <select
            onChange={handleSelectChange}
            disabled={disabled || availablePlayers.length === 0}
            className="w-full px-spacing-sm py-spacing-xs border border-border rounded-md
                       focus:ring-2 focus:ring-primary-default focus:border-transparent
                       disabled:bg-surface-muted disabled:cursor-not-allowed text-sm"
            aria-label="Select key player"
          >
            <option value="">
              {availablePlayers.length === 0
                ? "All players selected"
                : "Select player..."}
            </option>
            {availablePlayers.map((player) => (
              <option key={player.id} value={player.id}>
                {formatPlayerName(player)}
              </option>
            ))}
          </select>

          {/* Selected players (profile cards) */}
          {selectedPlayers.length > 0 && (
            <div className="space-y-spacing-xs mt-spacing-sm">
              {selectedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between px-spacing-sm py-spacing-xs 
                             bg-surface-secondary rounded-md border border-border
                             hover:bg-surface-tertiary transition-colors"
                >
                  <div className="flex items-center gap-spacing-sm">
                    {/* Jersey number badge */}
                    <div
                      className="w-8 h-8 rounded-full bg-primary-default text-white 
                                    flex items-center justify-center font-bold text-sm shrink-0"
                    >
                      {player.jersey_number || "?"}
                    </div>

                    {/* Player info */}
                    <div className="flex flex-col">
                      <Typography variant="body-sm" className="font-medium">
                        {player.first_name} {player.last_name}
                      </Typography>
                      {player.position && (
                        <Typography variant="caption" color="muted">
                          {player.position}
                        </Typography>
                      )}
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => onRemove(player.id)}
                    disabled={disabled}
                    className="text-muted hover:text-danger-default focus:outline-none 
                               focus:ring-2 focus:ring-danger-default rounded p-1
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-colors"
                    aria-label={`Remove ${player.first_name} ${player.last_name}`}
                  >
                    <Icon name="close" className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
